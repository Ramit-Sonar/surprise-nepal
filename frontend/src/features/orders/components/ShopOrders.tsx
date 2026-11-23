import { useState } from "react"
import { CheckCircle2, MapPin, Package } from "lucide-react"
import ShopLayout from "../../shops/components/ShopLayout"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import CustomSelect from "../../../components/ui/CustomSelect"
import { useAppActions } from "../../../context/useApp"
import { useOrdersState } from "../hooks/useOrdersState"
import { getCurrentShop } from "../../shops/services/shopService"
import { getShopOrderStatus } from "../services/orderService"
import { getOptimizedImageUrl } from "../../../utils/image"

export default function ShopOrders() {
  const { orders: allOrders } = useOrdersState()
  const { updateShopFulfillment, showToast } = useAppActions()
  const shop = getCurrentShop()!
  const orders = allOrders
    .map((order) => {
      const items = order.items.filter(
        (item) => (item.shopId ?? item.gift.shopId) === shop.id,
      )
      const shopStatus = getShopOrderStatus(order, shop.id)
      return { ...order, items, shopStatus }
    })
    .filter((order) => order.items.length > 0 && order.status !== "pending")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const visibleOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    if (statusFilter === "completed") {
      return order.shopStatus === "collected"
    }
    return order.shopStatus === statusFilter
  })

  const updatePreparation = async (
    orderId: string,
    status: "preparing" | "ready",
  ) => {
    if (updatingOrderId !== null) return
    setUpdatingOrderId(orderId)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const updated = updateShopFulfillment(orderId, shop.id, status)
      showToast(
        updated
          ? status === "preparing"
            ? "Preparation started"
            : "Gift marked as ready for pickup"
          : "Order changed elsewhere. The latest status has been kept.",
        updated ? "success" : "warning",
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <ShopLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Shop Orders</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Only items from your shop are shown.
      </p>
      <div className="w-full sm:w-52 mb-5">
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All order statuses" },
            { value: "confirmed", label: "New / Confirmed" },
            { value: "preparing", label: "Preparing" },
            { value: "ready", label: "Ready for Pickup" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>
      <div className="space-y-3">
        {visibleOrders.map((order) => (
          <article
            key={order.id}
            className="bg-card rounded-2xl border border-border p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  Order #{order.id}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {order.location.city}
                </p>
              </div>
              {order.shopStatus === "collected" ? (
                <OrderStatusBadge status="collected" />
              ) : (
                <OrderStatusBadge status={order.shopStatus} />
              )}
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.gift.id}
                  className="flex items-center gap-3 bg-muted/40 rounded-xl p-2.5"
                >
                  <img
                    src={getOptimizedImageUrl(item.gift.image, 96)}
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.gift.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {order.shopStatus === "confirmed" && (
              <Button
                className="mt-4"
                size="sm"
                fullWidth
                loading={updatingOrderId === order.id}
                disabled={updatingOrderId !== null}
                onClick={() => updatePreparation(order.id, "preparing")}
                leftIcon={<CheckCircle2 size={15} />}
              >
                {updatingOrderId === order.id
                  ? "Updating..."
                  : "Start Preparing"}
              </Button>
            )}
            {order.shopStatus === "preparing" && (
              <Button
                className="mt-4"
                size="sm"
                fullWidth
                loading={updatingOrderId === order.id}
                disabled={updatingOrderId !== null}
                onClick={() => updatePreparation(order.id, "ready")}
                leftIcon={<CheckCircle2 size={15} />}
              >
                {updatingOrderId === order.id ? "Updating..." : "Mark as Ready"}
              </Button>
            )}
            {order.shopStatus === "ready" && (
              <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="text-sm font-semibold text-violet-700">
                  Ready for Pickup
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gift is ready. Surprise Nepal will collect it.
                </p>
              </div>
            )}
            {order.shopStatus === "collected" && (
              <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="text-sm font-semibold text-violet-700">
                  Collected
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gift collected by Surprise Nepal.
                </p>
              </div>
            )}
            {order.shopStatus === "cancelled" && (
              <div className="mt-4 p-3 rounded-xl bg-error/5 border border-error/20">
                <p className="text-sm font-semibold text-error">
                  Order Cancelled
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This order was cancelled by Surprise Nepal. No further
                  preparation is required.
                </p>
              </div>
            )}
          </article>
        ))}
        {visibleOrders.length === 0 && (
          <div className="text-center bg-card rounded-2xl border border-border p-10">
            <Package size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">
              {orders.length === 0
                ? "No orders yet"
                : "No orders with this status"}
            </p>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
