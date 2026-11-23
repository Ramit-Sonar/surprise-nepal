import { formatPrice } from "../../../utils/format"
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  User,
  MessageSquare,
  Check,
  ShieldCheck,
  ShieldX,
  Clock,
  Image as ImageIcon,
  Gift,
  AlertTriangle,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import ConfirmDialog from "../../../components/ui/ConfirmDialog"
import OrderTimeline from "./OrderTimeline"
import EmptyState from "../../../components/ui/EmptyState"
import { useAppActions } from "../../../context/useApp"
import { useOrdersState } from "../hooks/useOrdersState"
import type {
  PaymentReviewSubmission,
  PaymentStatus,
} from "../../payments/types"
import type { OrderStatus } from "../types"
import { getShops } from "../../shops/services/shopService"
import { groupOrderItemsByShop } from "../services/orderService"
import { getOptimizedImageUrl } from "../../../utils/image"

const AdminOrderMap = lazy(
  () => import("../../../components/maps/AdminOrderMap"),
)

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: null,
  preparing: null,
  ready: "collected",
  collected: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
  cancelled: null,
}

const STATUS_ACTIONS: Partial<Record<OrderStatus, string>> = {
  pending: "Confirm Order",
  ready: "Mark as Collected",
  collected: "Start Delivery",
  out_for_delivery: "Mark as Delivered",
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { orders } = useOrdersState()
  const { showToast, reviewPayment, confirmCODOrder, updateOrderStatus } =
    useAppActions()
  const navigate = useNavigate()
  const [order, setOrder] = useState(() => orders.find((o) => o.id === id))
  const [updating, setUpdating] = useState(false)
  const [paymentUpdating, setPaymentUpdating] = useState(false)
  const [screenshotExpanded, setScreenshotExpanded] = useState<number | null>(
    null,
  )
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: "danger" | "warning" | "success" | "info"
    icon?: ReactNode
    onConfirm: () => void
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    variant: "danger",
    onConfirm: () => {},
  })

  useEffect(() => {
    setOrder(orders.find((currentOrder) => currentOrder.id === id))
  }, [id, orders])

  if (!order) {
    return (
      <AdminLayout
        breadcrumb={[
          { label: "Orders", to: "/admin/orders" },
          { label: "Not Found" },
        ]}
      >
        <EmptyState
          icon={<Package size={32} />}
          title="Order not found"
          action={{
            label: "Back to Orders",
            onClick: () => navigate("/admin/orders"),
          }}
        />
      </AdminLayout>
    )
  }

  const handleUpdateStatus = async () => {
    if (updating) return
    const nextStatus = NEXT_STATUS[order.status]
    if (!nextStatus) return
    setUpdating(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const updated = updateOrderStatus(order.id, nextStatus)
      showToast(
        updated
          ? nextStatus === "collected"
            ? "Order marked as collected"
            : `Order status updated to ${nextStatus.replace(/_/g, " ")}`
          : "Order changed elsewhere. The latest status has been kept.",
        updated ? "success" : "warning",
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (updating) return
    setUpdating(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      const updated = updateOrderStatus(order.id, "cancelled")
      showToast(
        updated
          ? "Order cancelled"
          : "Order changed elsewhere and could not be cancelled.",
        "warning",
      )
    } finally {
      setUpdating(false)
    }
  }

  const runPaymentAction = async (
    status: PaymentReviewSubmission["decision"],
  ) => {
    if (paymentUpdating) return
    setConfirmDialog((d) => ({ ...d, open: false }))
    setPaymentUpdating(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      const result = await reviewPayment({
        orderId: order.id,
        decision: status,
      })
      showToast(
        result.ok
          ? status === "verified"
            ? "Payment verified — order confirmed"
            : "Payment rejected"
          : `${result.message} The latest status has been kept.`,
        result.ok ? (status === "verified" ? "success" : "warning") : "error",
      )
    } finally {
      setPaymentUpdating(false)
    }
  }

  const handlePaymentAction = (status: PaymentReviewSubmission["decision"]) => {
    if (status === "verified") {
      setConfirmDialog({
        open: true,
        title: "Verify Payment",
        description:
          "This will mark the payment as verified and automatically confirm the order. This action cannot be undone.",
        confirmLabel: "Yes, Verify Payment",
        variant: "success",
        icon: <ShieldCheck size={26} />,
        onConfirm: () => runPaymentAction("verified"),
      })
    } else {
      setConfirmDialog({
        open: true,
        title: "Reject Payment",
        description:
          "The customer's payment screenshot will be marked as rejected. They will need to re-submit a new screenshot.",
        confirmLabel: "Reject Payment",
        variant: "danger",
        icon: <ShieldX size={26} />,
        onConfirm: () => runPaymentAction("rejected"),
      })
    }
  }

  const handleConfirmCOD = () => {
    setConfirmDialog({
      open: true,
      title: "Confirm COD Order",
      description:
        "This will confirm the order and move it to the next stage. The customer will be notified that their order is confirmed.",
      confirmLabel: "Yes, Confirm Order",
      variant: "success",
      icon: <Check size={26} />,
      onConfirm: async () => {
        if (paymentUpdating) return
        setConfirmDialog((d) => ({ ...d, open: false }))
        setPaymentUpdating(true)
        try {
          await new Promise((r) => setTimeout(r, 700))
          const result = await confirmCODOrder(order.id)
          showToast(
            result.ok ? "Order confirmed" : result.message,
            result.ok ? "success" : "error",
          )
        } finally {
          setPaymentUpdating(false)
        }
      },
    })
  }

  const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, {
    label: string
    color: string
    bg: string
  }> = {
    pending: {
      label: "Payment Pending",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    screenshot_submitted: {
      label: "Screenshot Submitted",
      color: "text-amber-700",
      bg: "bg-amber-50 border border-amber-200",
    },
    verified: {
      label: "Payment Verified",
      color: "text-success",
      bg: "bg-success/10 border border-success/20",
    },
    rejected: {
      label: "Payment Rejected",
      color: "text-error",
      bg: "bg-error/10 border border-error/20",
    },
  }

  // QR orders: status can only advance after payment is verified.
  // COD orders: after admin confirms (which sets status to 'confirmed'), then advance normally.
  const isQRUnverified =
    order.paymentMethod !== "Cash on Delivery" &&
    order.paymentStatus !== "verified"
  const nextAction =
    order.status === "pending" || isQRUnverified
      ? null
      : STATUS_ACTIONS[order.status]
  const timeLabel = {
    morning: "Morning (9 AM – 12 PM)",
    afternoon: "Afternoon (12–5 PM)",
    evening: "Evening (5–8 PM)",
  }[order.deliveryTime]
  const shopGroups = groupOrderItemsByShop(order)
  const shops = getShops()

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Orders", to: "/admin/orders" },
        { label: order.id },
      ]}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            className="hidden lg:inline-flex"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/orders")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Orders
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">{order.id}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed{" "}
              {new Date(order.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div className="flex flex-wrap gap-2">
            {nextAction && (
              <Button
                size="sm"
                loading={updating}
                onClick={handleUpdateStatus}
                leftIcon={<Check size={15} />}
              >
                {nextAction}
              </Button>
            )}
            {!["out_for_delivery", "delivered", "cancelled"].includes(
              order.status,
            ) && (
              <Button
                size="sm"
                variant="danger"
                onClick={handleCancel}
                disabled={updating}
              >
                Cancel
              </Button>
            )}
          </div>
          {/* Show why advance is blocked for QR orders */}
          {isQRUnverified && order.status !== "pending" && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <Clock size={11} /> Verify payment to advance status
            </p>
          )}
          {isQRUnverified &&
            order.status === "pending" &&
            order.paymentScreenshots?.length > 0 && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Clock size={11} /> Verify payment screenshot to confirm order
              </p>
            )}
          {order.status === "confirmed" && (
            <p className="text-xs text-muted-foreground font-medium">
              Waiting for the shop to start preparing
            </p>
          )}
          {order.status === "preparing" && (
            <p className="text-xs text-warning font-medium">
              The shop is preparing this gift
            </p>
          )}
          {order.status === "ready" && (
            <p className="text-xs text-success font-medium">
              Gift Prepared — Ready for Pickup
            </p>
          )}
        </div>
      </div>

      {/* Surprise gift alert */}
      {order.mode === "surprise" ? (
        <div className="mb-5 flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Gift size={18} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-purple-800 text-sm">
              Surprise Gift — Handle with care
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              Do <strong>not</strong> contact or reveal any delivery details to
              the recipient (<strong>{order.recipient.name}</strong>). This gift
              was sent as a surprise by{" "}
              <strong>{order.recipient.senderName || "the customer"}</strong>.
              Coordinate delivery discreetly.
            </p>
          </div>
          <div className="flex-shrink-0">
            <AlertTriangle size={16} className="text-purple-400" />
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 bg-muted/60 border border-border rounded-2xl px-5 py-3">
          <User size={16} className="text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Self Order</span> —
            Customer ordered this gift for themselves. Normal delivery applies.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: timeline + gift */}
        <div className="lg:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-5">
              Order Timeline
            </h2>
            <OrderTimeline
              currentStatus={order.status}
              includeCollection
              timestamps={order.statusTimestamps}
              paymentMethod={order.paymentMethod}
            />
          </div>

          {/* Shop preparation and pickup */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package size={18} className="text-primary" /> Shop Preparation &
              Pickup
            </h2>
            <div className="space-y-4">
              {shopGroups.map((group) => {
                const shop = shops.find((item) => item.id === group.shopId)
                const statuses = group.items.map(
                  (item) => item.fulfillmentStatus ?? "confirmed",
                )
                const portionStatus =
                  order.status === "pending" || order.status === "cancelled"
                    ? order.status
                    : statuses.every((status) => status === "collected")
                      ? "collected"
                      : statuses.every(
                            (status) =>
                              status === "ready" || status === "collected",
                          )
                        ? "ready"
                        : statuses.some(
                              (status) =>
                                status === "preparing" || status === "ready",
                            )
                          ? "preparing"
                          : "confirmed"
                const collectedAt = group.items
                  .map((item) => item.collectedAt)
                  .filter(Boolean)
                  .sort()
                  .at(-1)
                const groupAmount = group.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                )
                return (
                  <div
                    key={group.shopId}
                    className="rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{group.shopName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin size={12} /> Pickup:{" "}
                          {shop?.address ?? "Address unavailable"}
                        </p>
                      </div>
                      <OrderStatusBadge status={portionStatus} />
                    </div>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.gift.id}
                          className="flex items-center gap-3 rounded-xl bg-card p-2.5"
                        >
                          <img
                            src={getOptimizedImageUrl(item.gift.image, 80)}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {item.gift.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-1">
                        <span className="text-muted-foreground">
                          Shop portion
                        </span>
                        <span className="font-bold">
                          {formatPrice(groupAmount)}
                        </span>
                      </div>
                    </div>
                    {portionStatus === "confirmed" && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Waiting for this shop to start preparing.
                      </p>
                    )}
                    {portionStatus === "preparing" && (
                      <p className="text-xs text-warning mt-3">
                        This shop is preparing its items.
                      </p>
                    )}
                    {portionStatus === "ready" && (
                      <p className="text-xs text-violet-700 mt-3">
                        Ready. Collection becomes available when every shop is
                        ready.
                      </p>
                    )}
                    {portionStatus === "collected" && collectedAt && (
                      <p className="text-xs text-success mt-3">
                        Collected {new Date(collectedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Message — only for surprise orders */}
          {order.mode === "surprise" && order.recipient.message && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" /> Gift
                Message
              </h2>
              <p className="text-sm text-muted-foreground italic">
                "{order.recipient.message}"
              </p>
              {order.recipient.senderName && (
                <p className="text-sm text-muted-foreground mt-2">
                  — {order.recipient.senderName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="space-y-5">
          {/* Recipient / Sender */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={16} className="text-primary" />
              {order.mode === "surprise" ? "People Involved" : "Recipient"}
            </h2>
            {order.mode === "surprise" && order.recipient.senderName && (
              <div className="mb-3 pb-3 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Sender (Customer)
                </p>
                <p className="font-semibold text-foreground">
                  {order.recipient.senderName}
                </p>
                {order.recipient.senderPhone && (
                  <a
                    href={`tel:${order.recipient.senderPhone}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {order.recipient.senderPhone}
                  </a>
                )}
              </div>
            )}
            <div>
              {order.mode === "surprise" && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Recipient (Do not contact)
                </p>
              )}
              <p className="font-semibold text-foreground">
                {order.recipient.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.recipient.phone}
              </p>
              {order.mode === "surprise" && (
                <p className="text-[10px] text-purple-600 font-medium mt-1 flex items-center gap-1">
                  <Gift size={9} /> Surprise — keep delivery confidential
                </p>
              )}
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Google Map — delivery location */}
            {order.location.coordinates ? (
              <Suspense
                fallback={<div className="h-[260px] bg-muted animate-pulse" />}
              >
                <AdminOrderMap location={order.location} />
              </Suspense>
            ) : (
              <div
                className="flex items-center justify-center bg-muted"
                style={{ height: 120 }}
              >
                <div className="text-center">
                  <MapPin
                    size={20}
                    className="text-muted-foreground mx-auto mb-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    No map coordinates
                  </p>
                </div>
              </div>
            )}
            <div className="p-5">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Delivery Details
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-0.5">
                    Address
                  </p>
                  <p className="text-foreground">{order.location.address}</p>
                  <p className="text-muted-foreground">{order.location.city}</p>
                </div>
                <div className="border-t border-border pt-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-0.5">
                    Date & Time
                  </p>
                  <p className="text-foreground font-medium">
                    {new Date(
                      order.deliveryDate + "T00:00:00",
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-muted-foreground">{timeLabel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Verification */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <CreditCard size={16} className="text-primary" /> Payment
              Verification
            </h2>

            {/* Amount */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>- {formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span>Amount Due</span>
                <span className="text-primary text-base">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Payment status badge */}
            {(() => {
              const cfg =
                PAYMENT_STATUS_CONFIG[order.paymentStatus ?? "pending"]
              return (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${cfg.bg} ${cfg.color}`}
                >
                  {order.paymentStatus === "verified" && (
                    <ShieldCheck size={15} />
                  )}
                  {order.paymentStatus === "rejected" && <ShieldX size={15} />}
                  {order.paymentStatus === "screenshot_submitted" && (
                    <Clock size={15} />
                  )}
                  {(!order.paymentStatus ||
                    order.paymentStatus === "pending") && <Clock size={15} />}
                  {cfg.label}
                </div>
              )
            })()}

            {/* Screenshots */}
            {order.paymentScreenshots && order.paymentScreenshots.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Customer Payment Screenshot
                  {order.paymentScreenshots.length > 1 ? "s" : ""}
                </p>
                {order.paymentScreenshots.map((src, i) => (
                  <div key={i} className="space-y-1">
                    {order.paymentScreenshots.length > 1 && (
                      <p className="text-xs text-muted-foreground font-medium">
                        Screenshot {i + 1}
                      </p>
                    )}
                    <div
                      className="relative rounded-xl overflow-hidden border border-border cursor-pointer group"
                      onClick={() => setScreenshotExpanded(i)}
                    >
                      <img
                        src={src}
                        alt={`Payment screenshot ${i + 1}`}
                        className="w-full object-cover max-h-48 group-hover:opacity-90 transition-opacity"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/10">
                        <div className="bg-card rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
                          <ImageIcon size={12} /> View full size
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Uploaded{" "}
                  {new Date(order.updatedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ) : order.paymentMethod !== "Cash on Delivery" ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-xs text-muted-foreground">
                <Clock size={14} className="flex-shrink-0" />
                Waiting for customer to upload payment screenshot.
              </div>
            ) : null}

            {/* COD: confirm button */}
            {order.paymentMethod === "Cash on Delivery" &&
              order.status === "pending" && (
                <button
                  onClick={handleConfirmCOD}
                  disabled={paymentUpdating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Check size={15} />
                  {paymentUpdating ? "Confirming…" : "Confirm COD Order"}
                </button>
              )}

            {/* QR Verify / Reject actions */}
            {order.paymentMethod !== "Cash on Delivery" &&
              order.paymentScreenshots?.length > 0 &&
              order.paymentStatus !== "verified" && (
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handlePaymentAction("verified")}
                    disabled={paymentUpdating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <ShieldCheck size={15} />
                    {paymentUpdating ? "Updating…" : "Mark Payment Verified"}
                  </button>
                  {order.paymentStatus !== "rejected" && (
                    <button
                      onClick={() => handlePaymentAction("rejected")}
                      disabled={paymentUpdating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-error text-error rounded-xl text-sm font-semibold hover:bg-error/5 transition-colors disabled:opacity-50"
                    >
                      <ShieldX size={15} />
                      Reject Payment
                    </button>
                  )}
                </div>
              )}
            {order.paymentStatus === "verified" && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl text-xs text-success font-semibold border border-success/20">
                <ShieldCheck size={14} /> Payment verified by admin
              </div>
            )}
          </div>

          {/* Screenshot lightbox */}
          {screenshotExpanded !== null &&
            order.paymentScreenshots?.[screenshotExpanded] && (
              <div
                className="fixed inset-0 z-[9999] bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setScreenshotExpanded(null)}
              >
                <div
                  className="relative max-w-2xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setScreenshotExpanded(null)}
                    className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1"
                  >
                    Close ✕
                  </button>
                  <img
                    src={order.paymentScreenshots[screenshotExpanded]}
                    alt="Payment screenshot full size"
                    className="w-full rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        icon={confirmDialog.icon}
        loading={paymentUpdating}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((d) => ({ ...d, open: false }))}
      />
    </AdminLayout>
  )
}
