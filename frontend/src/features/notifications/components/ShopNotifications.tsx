import { useEffect } from "react"
import { Bell, CheckCircle2, Package, ShoppingBag } from "lucide-react"
import ShopLayout from "../../shops/components/ShopLayout"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { getCurrentShop } from "../../shops/services/shopService"
import { getShopNotifications } from "../services/shopNotificationService"
import { getShopOrderStatus } from "../../orders/services/orderService"
import { storageUpdate } from "../../../services/storage"

export default function ShopNotifications() {
  const { orders } = useOrdersState()
  const shop = getCurrentShop()!
  const stored = getShopNotifications(shop.id)
  const orderNotices = orders.flatMap((order) => {
    const items = order.items.filter(
      (item) => (item.shopId ?? item.gift.shopId) === shop.id,
    )
    if (items.length === 0) return []
    const shopStatus = getShopOrderStatus(order, shop.id)
    if (!["confirmed", "collected", "cancelled"].includes(shopStatus)) return []
    const title =
      shopStatus === "confirmed"
        ? "New confirmed order"
        : shopStatus === "collected"
          ? "Order collected"
          : "Order cancelled"
    return [
      {
        id: `order_${order.id}_${shopStatus}`,
        title,
        message: items
          .map((item) => `${item.gift.name} × ${item.quantity}`)
          .join(", "),
        type: "order" as const,
        createdAt:
          shopStatus === "confirmed"
            ? (order.statusTimestamps?.confirmed ?? order.updatedAt)
            : shopStatus === "collected"
              ? (items
                  .map((item) => item.collectedAt)
                  .filter(Boolean)
                  .sort()
                  .at(-1) ?? order.updatedAt)
              : order.updatedAt,
      },
    ]
  })
  const notifications = [...stored, ...orderNotices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const notificationIdKey = notifications
    .map((notification) => notification.id)
    .join("|")

  useEffect(() => {
    storageUpdate<string[]>(
      `giftSurprise_shopNotificationRead_${shop.id}`,
      [],
      (current) => [
        ...new Set([
          ...current,
          ...notifications.map((notification) => notification.id),
        ]),
      ],
    )
    window.dispatchEvent(new Event("shop-notifications-read"))
  }, [notificationIdKey, shop.id])

  return (
    <ShopLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Notifications</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Product reviews and new shop orders.
      </p>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {notifications.map((notification) => {
          const Icon =
            notification.type === "order"
              ? ShoppingBag
              : notification.type === "product"
                ? Package
                : CheckCircle2
          return (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-4 border-b border-border last:border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell size={30} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">All caught up</p>
            <p className="text-sm text-muted-foreground">
              No notifications yet.
            </p>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
