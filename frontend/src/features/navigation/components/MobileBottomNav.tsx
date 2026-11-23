import { Link, useLocation } from "react-router-dom"
import { Home, Gift, ShoppingCart, Package, User } from "lucide-react"
import { useCartState } from "../../cart/hooks/useCartState"
import { useSessionState } from "../../auth/hooks/useSessionState"

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/gifts", icon: Gift, label: "Shop" },
  { to: "/cart", icon: ShoppingCart, label: "Cart", badge: true },
  { to: "/orders", icon: Package, label: "Orders" },
  { to: "/profile", icon: User, label: "Me" },
] as const

export default function MobileBottomNav() {
  const location = useLocation()
  const { cartCount } = useCartState()
  const { user } = useSessionState()

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)

  const meActive =
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/auth")

  return (
    <nav
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "var(--color-card)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "var(--sab)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          height: 62,
          padding: "6px 8px",
          gap: 4,
        }}
      >
        {NAV_ITEMS.map(({ to, icon: Icon, label, ...rest }) => {
          const badge = "badge" in rest && rest.badge
          const active = label === "Me" ? meActive : isActive(to)

          return (
            <Link
              key={to}
              to={label === "Me" && !user ? "/auth" : to}
              aria-current={active ? "page" : undefined}
              style={{
                flex: 1,
                textDecoration: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  width: "100%",
                  maxWidth: 58,
                  height: 50,
                  borderRadius: 18,
                  transition: "box-shadow 0.2s ease, background 0.2s ease",
                  background: "var(--color-card)",
                  boxShadow: active
                    ? "inset 3px 3px 7px var(--nm-dark), inset -2px -2px 5px var(--nm-light)"
                    : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
              >
                {/* Icon */}
                <div style={{ position: "relative" }}>
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.4 : 1.8}
                    aria-hidden="true"
                    style={{
                      color: active
                        ? "var(--color-primary)"
                        : "var(--color-muted-foreground)",
                      display: "block",
                      transition: "color 0.2s",
                    }}
                  />
                  {badge && cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -8,
                        minWidth: 16,
                        height: 16,
                        background: "var(--color-primary)",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        borderRadius: 99,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        lineHeight: 1,
                      }}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    lineHeight: 1,
                    color: active
                      ? "var(--color-primary)"
                      : "var(--color-muted-foreground)",
                    transition: "color 0.2s",
                    letterSpacing: active ? "0.01em" : 0,
                  }}
                >
                  {label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
