import { useEffect, useState, type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  User,
  WalletCards,
} from "lucide-react"
import logo from "../../../assets/logo.webp"
import { clearShopSession, getCurrentShop } from "../services/shopService"
import { getShopNotifications } from "../../notifications/services/shopNotificationService"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import ToastContainer from "../../../components/ui/Toast"
import { getShopOrderStatus } from "../../orders/services/orderService"
import { getOptimizedImageUrl } from "../../../utils/image"
import { storageGet, subscribeStorage } from "../../../services/storage"

const NAV_ITEMS = [
  { to: "/shop", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/shop/products", label: "Products", icon: Package },
  { to: "/shop/orders", label: "Orders", icon: ShoppingBag },
  { to: "/shop/settlements", label: "Settlements", icon: WalletCards },
  { to: "/shop/profile", label: "Profile", icon: User },
] as const

const MOBILE_NAV_ITEMS = [
  { to: "/shop", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/shop/products", label: "Products", icon: Package },
  { to: "/shop/products/new", label: "Add", icon: Plus },
  { to: "/shop/orders", label: "Orders", icon: ShoppingBag },
  { to: "/shop/settlements", label: "Settlements", icon: WalletCards },
] as const

const SIDEBAR = {
  background: "#2a2a2a",
  dark: "#1a1a1a",
  light: "#3a3a3a",
  iconBackground: "#252525",
}

const raisedShadow = `6px 6px 16px ${SIDEBAR.dark}, -4px -4px 12px ${SIDEBAR.light}`
const iconShadow = `4px 4px 10px ${SIDEBAR.dark}, -3px -3px 8px ${SIDEBAR.light}`
const activeShadow = `6px 6px 20px ${SIDEBAR.dark}, -2px -2px 8px rgba(255,255,255,0.03), 0 4px 24px rgba(194,0,80,0.45)`

export default function ShopLayout({ children }: { children: ReactNode }) {
  const { orders } = useOrdersState()
  const location = useLocation()
  const navigate = useNavigate()
  const shop = getCurrentShop()
  const readStorageKey = `giftSurprise_shopNotificationRead_${shop?.id ?? "guest"}`
  const loadReadIds = () => new Set(storageGet<string[]>(readStorageKey, []))
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds)
  const newOrderCount = orders.filter(
    (order) =>
      order.status !== "cancelled" &&
      order.items.some(
        (item) =>
          (item.shopId ?? item.gift.shopId) === shop?.id &&
          (item.fulfillmentStatus ??
            (order.status === "confirmed" ? "confirmed" : undefined)) ===
            "confirmed",
      ),
  ).length
  const notificationIds = [
    ...(shop
      ? getShopNotifications(shop.id).map((notification) => notification.id)
      : []),
    ...orders.flatMap((order) => {
      if (
        !shop ||
        !order.items.some(
          (item) => (item.shopId ?? item.gift.shopId) === shop.id,
        )
      )
        return []
      const status = getShopOrderStatus(order, shop.id)
      return ["confirmed", "collected", "cancelled"].includes(status)
        ? [`order_${order.id}_${status}`]
        : []
    }),
  ]
  const unreadCount = location.pathname.startsWith("/shop/notifications")
    ? 0
    : notificationIds.filter((id) => !readIds.has(id)).length

  useEffect(() => {
    const refreshReadIds = () => setReadIds(loadReadIds())
    window.addEventListener("shop-notifications-read", refreshReadIds)
    const unsubscribe = subscribeStorage([readStorageKey], refreshReadIds)
    return () => {
      window.removeEventListener("shop-notifications-read", refreshReadIds)
      unsubscribe()
    }
  }, [readStorageKey])
  interface ShopNavigationItem {
    to: string
    exact?: boolean
  }
  const isActive = (item: ShopNavigationItem) =>
    "exact" in item && item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)

  const signOut = () => {
    clearShopSession()
    navigate("/shop/login")
  }

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen lg:overflow-hidden">
      <aside
        className="hidden lg:flex flex-col shrink-0"
        style={{ width: 272, background: SIDEBAR.background }}
      >
        <div className="flex flex-col h-full" style={{ padding: "16px 14px" }}>
          <Link
            to="/shop"
            className="flex items-center"
            style={{
              background: SIDEBAR.background,
              boxShadow: raisedShadow,
              borderRadius: 16,
              padding: "11px 14px",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: SIDEBAR.iconBackground,
                boxShadow: iconShadow,
              }}
            >
              <img
                src={logo}
                alt="Surprise Nepal"
                className="w-7.5 h-7.5 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-white text-lg leading-tight truncate">
                Surprise Nepal
              </p>
              <p className="text-2xs text-[#6b6b6b] uppercase tracking-[0.12em] mt-0.5">
                Shop Portal
              </p>
            </div>
          </Link>

          <nav
            aria-label="Shop navigation"
            className="flex flex-col gap-2.5 flex-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center no-underline transition-transform duration-150 active:scale-[0.98]"
                  style={{
                    gap: 12,
                    padding: "7px 10px",
                    borderRadius: 14,
                    background: active
                      ? "linear-gradient(135deg, #c2003c 0%, #f0006a 100%)"
                      : SIDEBAR.background,
                    boxShadow: active ? activeShadow : raisedShadow,
                  }}
                >
                  <div
                    className="relative flex items-center justify-center shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: active
                        ? "rgba(255,255,255,0.18)"
                        : SIDEBAR.iconBackground,
                      boxShadow: active ? "none" : iconShadow,
                    }}
                  >
                    <Icon
                      size={18}
                      style={{
                        color: active ? "#ffffff" : "#8a8a8a",
                        strokeWidth: 1.7,
                      }}
                    />
                    {item.to === "/shop/orders" && newOrderCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-primary text-white text-2xs font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                        {newOrderCount > 9 ? "9+" : newOrderCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-150 ${
                      active
                        ? "text-white"
                        : "text-[#8a8a8a] group-hover:text-white"
                    }`}
                    style={{
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div
            className="shrink-0"
            style={{
              background: SIDEBAR.background,
              boxShadow: raisedShadow,
              borderRadius: 16,
              padding: "12px 12px 10px",
              marginTop: 16,
            }}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "2.5px solid #c2003c",
                  background: "#3a1a2a",
                }}
              >
                {shop?.logo ? (
                  <img
                    src={getOptimizedImageUrl(shop.logo, 88)}
                    alt=""
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                    decoding="async"
                  />
                ) : (
                  <span className="text-primary font-bold">
                    {shop?.name?.charAt(0) ?? "S"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {shop?.name ?? "Partner Shop"}
                </p>
                <p className="text-[#5a5a5a] text-xs mt-0.5 truncate">
                  {shop?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-0 text-[13px] font-medium text-[#6b6b6b] hover:text-error transition-colors"
              style={{
                background: SIDEBAR.iconBackground,
                boxShadow: iconShadow,
              }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 w-full flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <header
          className="sticky top-0 z-30 h-16 bg-card flex items-center px-4 sm:px-6 transition-all duration-300"
          style={{
            boxShadow: "0 4px 14px var(--nm-dark), 0 -1px 6px var(--nm-light)",
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/shop"
              className="shrink-0 group"
              aria-label="Shop dashboard"
            >
              <img
                src={logo}
                alt="Surprise Nepal"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-base text-foreground truncate leading-tight font-display">
                {shop?.name ?? "Shop Portal"}
              </p>
              <p className="text-2xs sm:text-xs text-muted-foreground leading-tight mt-0.5">
                Partner Shop
              </p>
            </div>
          </div>
          <Link
            to="/shop/profile"
            className="relative ml-auto p-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95 lg:hidden"
            style={{
              boxShadow:
                "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
            }}
            aria-label="Profile"
          >
            <User size={20} />
          </Link>
          <Link
            to="/shop/notifications"
            className="relative ml-3 p-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95 lg:ml-auto"
            style={{
              boxShadow:
                "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
            }}
            aria-label={`Notifications${
              unreadCount > 0 ? ` (${unreadCount} unread)` : ""
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-primary text-white text-2xs font-bold rounded-full flex items-center justify-center leading-none shadow-sm shadow-primary/30">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>

        <main className="w-full min-w-0 flex-1 lg:overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 sm:py-7 pb-24 lg:pb-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <nav
        aria-label="Shop navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40"
        style={{
          background: "var(--color-card)",
          borderTop: "1px solid var(--color-border)",
          paddingBottom: "var(--sab)",
        }}
      >
        <div className="h-15.5 flex items-center justify-around px-2 gap-1">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active =
              item.to === "/shop/products" &&
              location.pathname === "/shop/products/new"
                ? false
                : isActive(item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex-1 min-w-0 flex justify-center no-underline"
              >
                <div
                  className="w-full max-w-14.5 h-12.5 rounded-[18px] flex flex-col items-center justify-center gap-0.75 bg-card transition-all duration-200"
                  style={{
                    boxShadow: active
                      ? "inset 3px 3px 7px var(--nm-dark), inset -2px -2px 5px var(--nm-light)"
                      : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                  }}
                >
                  <span className="relative">
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.4 : 1.8}
                      className={
                        active ? "text-primary" : "text-muted-foreground"
                      }
                    />
                    {item.to === "/shop/orders" && newOrderCount > 0 && (
                      <span className="absolute -top-2 -right-3 min-w-4 h-4 px-1 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm shadow-primary/30">
                        {newOrderCount > 9 ? "9+" : newOrderCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={`truncate max-w-full px-1 text-2xs leading-none ${
                      active
                        ? "text-primary font-bold"
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
      <ToastContainer />
    </div>
  )
}
