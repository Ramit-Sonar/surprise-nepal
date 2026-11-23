import { formatPrice } from "../../../utils/format"
import { getImageValidationError } from "../../../utils/format"
import { useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Package,
  MapPin,
  Calendar,
  Gift,
  ArrowLeft,
  Phone,
  Upload,
  AlertCircle,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import OrderTimeline from "./OrderTimeline"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import { useAppActions } from "../../../context/useApp"
import { useOrdersState } from "../hooks/useOrdersState"
import { getOptimizedImageUrl } from "../../../utils/image"
import OrderSupportNotice from "./OrderSupportNotice"

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>()
  const { orders } = useOrdersState()
  const { showToast, submitPaymentProof } = useAppActions()
  const navigate = useNavigate()
  const paymentInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPayment, setUploadingPayment] = useState(false)

  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <CustomerLayout>
        <EmptyState
          icon={<Package size={32} />}
          title="Order not found"
          description="We couldn't locate this order. Check your order ID and try again."
          action={{ label: "My Orders", onClick: () => navigate("/orders") }}
        />
      </CustomerLayout>
    )
  }

  const timeLabel = {
    morning: "Morning (9 AM – 12 PM)",
    afternoon: "Afternoon (12–5 PM)",
    evening: "Evening (5–8 PM)",
  }[order.deliveryTime]
  const handlePaymentResubmission = (file?: File) => {
    if (!file || uploadingPayment) return
    const error = getImageValidationError(file)
    if (error) {
      showToast(error, "error")
      return
    }
    setUploadingPayment(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const screenshot = String(event.target?.result ?? "")
      if (!screenshot) {
        showToast(
          "Unable to read this image. Please try another file.",
          "error",
        )
        setUploadingPayment(false)
        return
      }
      const result = await submitPaymentProof({
        orderId: order.id,
        paymentProofReferences: [screenshot],
      })
      showToast(
        result.ok
          ? "Payment screenshot resubmitted for review"
          : `${result.message} Refresh and try again.`,
        result.ok ? "success" : "error",
      )
      setUploadingPayment(false)
    }
    reader.onerror = () => {
      showToast("Unable to read this image. Please try another file.", "error")
      setUploadingPayment(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/orders")}
          leftIcon={<ArrowLeft size={16} />}
          className="mb-6"
        >
          My Orders
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Order Tracking
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Order #{order.id}
            </p>
          </div>
          <OrderStatusBadge status={order.status} publicView />
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-6">
              Delivery Progress
            </h2>
            <OrderTimeline
              currentStatus={order.status}
              timestamps={order.statusTimestamps}
              paymentMethod={order.paymentMethod}
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-4">
                Gift
              </h3>
              {order.items.map((item) => (
                <div key={item.gift.id} className="flex gap-3">
                  <img
                    src={getOptimizedImageUrl(item.gift.image, 112)}
                    alt={item.gift.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-xl object-cover bg-muted"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {item.gift.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recipient */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">
                Recipient
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Gift size={14} className="text-muted-foreground" />
                <span className="text-foreground">{order.recipient.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  {order.recipient.phone}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">
                Delivery Details
              </h3>
              <div className="flex items-start gap-2 text-sm">
                <MapPin
                  size={14}
                  className="text-muted-foreground mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-foreground">{order.location.address}</p>
                  <p className="text-muted-foreground">{order.location.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Calendar size={14} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-foreground">
                    {new Date(
                      order.deliveryDate + "T00:00:00",
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-muted-foreground text-xs">{timeLabel}</p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-3">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {order.paymentMethod !== "Cash on Delivery" &&
          order.paymentStatus === "rejected" && (
            <div className="mt-6 bg-error/5 border border-error/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle
                  size={18}
                  className="text-error mt-0.5 shrink-0"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Payment screenshot needs attention
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a clear replacement screenshot so Admin can verify
                    and confirm this order.
                  </p>
                </div>
              </div>
              <input
                ref={paymentInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  handlePaymentResubmission(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
              <Button
                size="sm"
                loading={uploadingPayment}
                onClick={() => paymentInputRef.current?.click()}
                leftIcon={<Upload size={15} />}
              >
                {uploadingPayment ? "Uploading..." : "Upload New Screenshot"}
              </Button>
            </div>
          )}

        <div className="mt-6">
          <OrderSupportNotice order={order} />
        </div>
      </div>
    </CustomerLayout>
  )
}
