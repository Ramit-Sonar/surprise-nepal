import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Truck,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Tag,
  WalletCards,
  Store,
  ArrowLeft,
} from "lucide-react"
import logo from "../../../assets/logo.webp"
import type { ReactNode } from "react"
import { useAppActions } from "../../../context/useApp"
import { useSessionState } from "../../auth/hooks/useSessionState"
import ToastContainer from "../../../components/ui/Toast"
import { getOptimizedImageUrl } from "../../../utils/image"
import AdminNotifications from "../../notifications/components/AdminNotifications"

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/shops", label: "Shops", icon: Store },
  { to: "/admin/settlements", label: "Settlements", icon: WalletCards },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/delivery", label: "Delivery", icon: Truck },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/settings", label: "Settings", icon: Settings },
]

// Sidebar colour tokens
const SB = {
  bg: "#2a2a2a",
  dark: "#1a1a1a",
  light: "#3a3a3a",
  pillBg: "#2a2a2a",
  iconBg: "#252525",
}

const raisedShadow = `6px 6px 16px ${SB.dark}, -4px -4px 12px ${SB.light}`
const iconShadow = `4px 4px 10px ${SB.dark}, -3px -3px 8px ${SB.light}`
const activeShadow = `6px 6px 20px ${SB.dark}, -2px -2px 8px rgba(255,255,255,0.03), 0 4px 24px rgba(194,0,80,0.45)`
const signOutShadow = `4px 4px 10px ${SB.dark}, -3px -3px 8px ${SB.light}`

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  breadcrumb?: AdminBreadcrumb[]
}

interface AdminBreadcrumb {
  label: string
  to?: string
}

export default function AdminLayout({
  children,
  title,
  breadcrumb,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAppActions()
  const { user } = useSessionState()

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }
  const mobileBackTo = (() => {
    if (/^\/admin\/orders\/[^/]+$/.test(location.pathname))
      return "/admin/orders"
    if (/^\/admin\/shops\/[^/]+$/.test(location.pathname)) return "/admin/shops"
    if (/^\/admin\/products\/[^/]+$/.test(location.pathname))
      return "/admin/products"
    if (
      location.pathname === "/admin/coupons/new" ||
      /^\/admin\/coupons\/[^/]+\/edit$/.test(location.pathname)
    ) {
      return "/admin/coupons"
    }
    return null
  })()

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full min-h-0 overflow-hidden"
      style={{
        background: SB.bg,
        padding: "16px 14px max(16px, env(safe-area-inset-bottom))",
        gap: 0,
      }}
    >
      {/* ── Logo pill ── */}
      <div
        style={{
          background: SB.pillBg,
          boxShadow: raisedShadow,
          borderRadius: 16,
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: SB.iconBg,
            boxShadow: iconShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={logo}
            alt="GiftSurprise"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "#ffffff",
              fontSize: 18,
              lineHeight: 1.2,
            }}
          >
            GiftSurprise
          </p>
          <p
            style={{
              fontSize: 10,
              color: "#6b6b6b",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginTop: 3,
            }}
          >
            Admin Panel
          </p>
        </div>
      </div>

      {/* ── Nav items ── */}
      <nav
        aria-label="Admin navigation"
        className="admin-sidebar-nav"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          padding: "4px 4px 12px",
          margin: "-4px -4px 0",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`admin-nav-item${active ? " admin-nav-active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "7px 10px",
                borderRadius: 14,
                textDecoration: "none",
                transition: "transform 0.15s",
                background: active
                  ? "linear-gradient(135deg, #c2003c 0%, #f0006a 100%)"
                  : SB.pillBg,
                boxShadow: active ? activeShadow : raisedShadow,
              }}
            >
              {/* Icon circle — raised/protruding */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "rgba(255,255,255,0.18)" : SB.iconBg,
                  boxShadow: active ? "none" : iconShadow,
                }}
              >
                <Icon
                  size={18}
                  className="admin-nav-icon"
                  style={{
                    color: active ? "#ffffff" : "#8a8a8a",
                    strokeWidth: 1.7,
                  }}
                />
              </div>
              <span
                className="admin-nav-label"
                style={{
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#ffffff" : "#8a8a8a",
                  letterSpacing: active ? "0.01em" : 0,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── User card ── */}
      <div
        style={{
          background: SB.pillBg,
          boxShadow: raisedShadow,
          borderRadius: 16,
          padding: "12px 12px 10px",
          marginTop: 16,
          flexShrink: 0,
        }}
      >
        {/* Avatar + info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              flexShrink: 0,
              border: "2.5px solid #c2003c",
              overflow: "hidden",
              background: "#3a1a2a",
            }}
          >
            {user?.avatar ? (
              <img
                src={getOptimizedImageUrl(user.avatar, 72)}
                alt=""
                width={36}
                height={36}
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ color: "#c2003c", fontWeight: 700, fontSize: 16 }}
                >
                  A
                </span>
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              {user?.name ?? "Admin"}
            </p>
            <p
              style={{
                color: "#5a5a5a",
                fontSize: 12,
                marginTop: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 0",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            background: SB.iconBg,
            boxShadow: signOutShadow,
            color: "#6b6b6b",
            fontSize: 13,
            fontWeight: 500,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e05a5a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — desktop */}
      <aside
        className="hidden lg:flex flex-col shrink-0"
        style={{ width: 272, background: SB.bg }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{ width: 272, background: SB.bg, overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
          <div className="flex-1 bg-foreground/40 backdrop-blur-sm" />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-16 bg-card border-b border-border/30 flex items-center px-4 sm:px-6 gap-4 shrink-0"
          style={{
            boxShadow: "0 4px 12px var(--nm-dark), 0 -1px 5px var(--nm-light)",
          }}
        >
          {mobileBackTo ? (
            <button
              onClick={() => navigate(mobileBackTo)}
              aria-label="Back to previous admin page"
              className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="flex-1 min-w-0">
            {breadcrumb && breadcrumb.length > 0 ? (
              <div className="flex items-center gap-1.5 text-sm">
                {breadcrumb.map((crumb, i) => (
                  <span key={crumb.label} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground"
                      />
                    )}
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : title ? (
              <h1 className="font-semibold text-foreground text-lg">{title}</h1>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <AdminNotifications />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      <ToastContainer />
    </div>
  )
}
