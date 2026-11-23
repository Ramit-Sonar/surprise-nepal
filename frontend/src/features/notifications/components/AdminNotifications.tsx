import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  ShoppingBag,
  ShieldCheck,
  ShieldX,
  Package,
  Truck,
  CheckCheck,
  X,
  ChevronRight,
} from "lucide-react"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import {
  deriveNotifications,
  loadNotifSettings,
  loadReadIds,
  saveReadIds,
  type AdminNotification,
  type NotifType,
} from "../services/notificationService"
import { relativeTime } from "../services/notificationService"
import { STORAGE_KEYS, subscribeStorage } from "../../../services/storage"

const TYPE_CONFIG: Record<NotifType, {
  icon: typeof ShoppingBag
  color: string
  bg: string
}> = {
  new_order: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  payment_screenshot: {
    icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  payment_rejected: { icon: ShieldX, color: "text-error", bg: "bg-error/10" },
  low_stock: { icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  pending_cod: { icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  ready_pickup: { icon: Package, color: "text-success", bg: "bg-success/10" },
}

export default function AdminNotifications() {
  const { orders } = useOrdersState()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds())

  // Derive filtered notifications based on saved settings
  const allNotifs: AdminNotification[] = (() => {
    const settings = loadNotifSettings()
    return deriveNotifications(orders).filter((n) => settings[n.type])
  })()

  const unreadCount = allNotifs.filter((n) => !readIds.has(n.id)).length

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      )
        setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  useEffect(
    () =>
      subscribeStorage([STORAGE_KEYS.ADMIN_NOTIFICATION_READ], () =>
        setReadIds(loadReadIds()),
      ),
    [],
  )

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  const markAllRead = useCallback(() => {
    const next = new Set([...readIds, ...allNotifs.map((n) => n.id)])
    setReadIds(next)
    saveReadIds(next)
  }, [readIds, allNotifs])

  const markRead = useCallback(
    (id: string) => {
      const next = new Set([...readIds, id])
      setReadIds(next)
      saveReadIds(next)
    },
    [readIds],
  )

  const handleNotifClick = (notif: AdminNotification) => {
    markRead(notif.id)
    setOpen(false)
    if (notif.orderId) navigate(`/admin/orders/${notif.orderId}`)
  }

  const dismissOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    markRead(id)
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        aria-label={`Notifications${
          unreadCount > 0 ? ` (${unreadCount} unread)` : ""
        }`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl text-muted-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
        style={{
          boxShadow: open
            ? "inset 3px 3px 8px var(--nm-dark), inset -2px -2px 6px var(--nm-light)"
            : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
        }}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl z-[200] overflow-hidden animate-scaleIn origin-top-right"
          style={{
            background: "var(--color-card)",
            boxShadow:
              "12px 12px 28px var(--nm-dark), -6px -6px 16px var(--nm-light)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-foreground" />
              <span className="font-semibold text-foreground text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <CheckCheck size={13} /> All read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
            {allNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Bell size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  All caught up!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No new notifications right now.
                </p>
              </div>
            ) : (
              allNotifs.map((notif, i) => {
                const cfg = TYPE_CONFIG[notif.type]
                const Icon = cfg.icon
                const isRead = readIds.has(notif.id)
                const isLast = i === allNotifs.length - 1
                return (
                  <div
                    key={notif.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotifClick(notif)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleNotifClick(notif)
                    }
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-muted/60 transition-colors group relative cursor-pointer ${
                      !isLast ? "border-b border-border" : ""
                    } ${!isRead ? "bg-primary/[0.03]" : ""}`}
                  >
                    {/* Unread dot */}
                    {!isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}

                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                    >
                      <Icon size={16} className={cfg.color} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          isRead
                            ? "text-muted-foreground"
                            : "text-foreground font-medium"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">
                        {notif.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {relativeTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notif.orderId && (
                        <ChevronRight
                          size={14}
                          className="text-muted-foreground"
                        />
                      )}
                      <button
                        onClick={(e) => dismissOne(e, notif.id)}
                        title="Dismiss"
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => {
                setOpen(false)
                navigate("/admin/settings#notifications")
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Notification settings
            </button>
            {allNotifs.length > 0 && (
              <button
                onClick={() => {
                  setOpen(false)
                  navigate("/admin/orders")
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                View all orders →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
