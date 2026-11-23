import { formatPrice } from "../../../utils/format"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Package,
  MapPin,
  Calendar,
  Gift,
  ArrowRight,
  CheckCircle,
  Clock,
  QrCode,
  Truck,
  ShieldCheck,
  Bell,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import { useOrdersState } from "../hooks/useOrdersState"
import { getOptimizedImageUrl } from "../../../utils/image"
import OrderSupportNotice from "./OrderSupportNotice"

const CONFETTI_COLORS = ["#C2003C", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"]

function Confetti() {
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: Math.random() * 8 + 6,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute rounded-sm"
          style={{
            left: `${item.left}%`,
            top: "-10px",
            width: item.size,
            height: item.size,
            backgroundColor: item.color,
            animation: `confettiFall 1.5s ease-in ${item.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const { orders } = useOrdersState()
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(true)

  const order = orders.find((o) => o.id === id)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500)
    return () => clearTimeout(t)
  }, [])

  if (!order) {
    return (
      <CustomerLayout>
        <EmptyState
          icon={<Package size={32} />}
          title="Order not found"
          description="We couldn't find this order. It may have already been confirmed."
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

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* Success header */}
        {(() => {
          const isCOD = order.paymentMethod === "Cash on Delivery"
          const isQRPending = !isCOD && order.paymentStatus !== "verified"
          const isConfirmed = order.status === "confirmed"

          // Icon + colour
          const iconBg = isConfirmed
            ? order.mode === "surprise"
              ? "bg-primary shadow-primary/30"
              : "bg-success shadow-success/30"
            : "bg-amber-500 shadow-amber-500/30"
          const IconEl = isConfirmed ? Gift : Clock

          return (
            <div className="relative text-center mb-12">
              {showConfetti && isConfirmed && <Confetti />}
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-celebrationPop ${iconBg}`}
              >
                <IconEl size={36} className="text-white" />
              </div>

              {/* Title */}
              {isConfirmed && order.mode === "surprise" && (
                <>
                  <h1
                    className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Surprise is on its way!
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Your surprise gift is heading to{" "}
                    <strong>{order.recipient.name}</strong>. They have no idea —
                    keep the secret!
                  </p>
                </>
              )}
              {isConfirmed && order.mode === "self" && (
                <>
                  <h1
                    className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Your order is confirmed!
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Great choice! Your gift will be delivered to you as
                    scheduled.
                  </p>
                </>
              )}
              {!isConfirmed && isQRPending && (
                <>
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Order Placed Successfully
                  </h1>
                  <p className="text-muted-foreground">
                    Your payment screenshot is submitted and under review.
                  </p>
                </>
              )}
              {!isConfirmed && isCOD && (
                <>
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Order Placed Successfully
                  </h1>
                  <p className="text-muted-foreground">
                    Your Cash on Delivery order has been received and is
                    awaiting confirmation.
                  </p>
                </>
              )}

              {/* Status pill — confirmed */}
              {isConfirmed && (
                <div className="inline-flex items-center gap-2 mt-4 rounded-full px-4 py-1.5 text-sm font-medium bg-success/10 text-success">
                  <CheckCircle size={15} />
                  Order Confirmed
                </div>
              )}

              {/* Order ID + status — pending states */}
              {!isConfirmed && (
                <div className="mt-5 inline-flex flex-col items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isCOD
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <Clock size={11} />
                    {isCOD
                      ? "Pending Confirmation"
                      : "Awaiting Payment Verification"}
                  </span>
                  <p className="text-xs text-muted-foreground font-mono tracking-wide">
                    Order #{order.id}
                  </p>
                </div>
              )}

              {/* QR pending — next steps */}
              {!isConfirmed && isQRPending && (
                <div className="mt-6 max-w-sm mx-auto bg-card rounded-2xl border border-border overflow-hidden text-left">
                  <div className="px-5 py-3.5 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">
                      What happens next?
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      {
                        Icon: QrCode,
                        color: "text-amber-500",
                        bg: "bg-amber-50",
                        step: "1",
                        title: "Payment review",
                        desc: "Our team verifies your screenshot — usually within a few minutes.",
                      },
                      {
                        Icon: ShieldCheck,
                        color: "text-success",
                        bg: "bg-success/10",
                        step: "2",
                        title: "Order confirmed",
                        desc: 'You\'ll see "Order Confirmed" in your timeline once verified.',
                      },
                      {
                        Icon: Truck,
                        color: "text-primary",
                        bg: "bg-primary-light",
                        step: "3",
                        title: "Gift dispatched",
                        desc: "Your gift is packed and handed to our delivery team.",
                      },
                    ].map(({ Icon, color, bg, step, title, desc }) => (
                      <div
                        key={step}
                        className="flex items-start gap-3 px-5 py-4"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
                        >
                          <Icon size={15} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/40 flex-shrink-0 mt-0.5">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COD pending — next steps */}
              {!isConfirmed && isCOD && (
                <div className="mt-6 max-w-sm mx-auto bg-card rounded-2xl border border-border overflow-hidden text-left">
                  <div className="px-5 py-3.5 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">
                      What happens next?
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      {
                        Icon: Bell,
                        color: "text-blue-500",
                        bg: "bg-blue-50",
                        step: "1",
                        title: "Order review",
                        desc: "Our team confirms your order details before dispatch.",
                      },
                      {
                        Icon: Truck,
                        color: "text-primary",
                        bg: "bg-primary-light",
                        step: "2",
                        title: "Gift dispatched",
                        desc: "Your gift is packed and on its way to the delivery address.",
                      },
                      {
                        Icon: ShieldCheck,
                        color: "text-success",
                        bg: "bg-success/10",
                        step: "3",
                        title: "Pay on delivery",
                        desc: `Pay ${formatPrice(order.total)} in cash when your gift arrives. No advance needed.`,
                      },
                    ].map(({ Icon, color, bg, step, title, desc }) => (
                      <div
                        key={step}
                        className="flex items-start gap-3 px-5 py-4"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
                        >
                          <Icon size={15} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/40 flex-shrink-0 mt-0.5">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Order card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          {/* Items */}
          <div className="p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
              {order.mode === "surprise"
                ? "Gift you're sending"
                : "What you ordered"}
            </h2>
            {order.items.map((item) => (
              <div key={item.gift.id} className="flex gap-4">
                <img
                  src={getOptimizedImageUrl(item.gift.image, 128)}
                  alt={item.gift.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-xl object-cover bg-muted"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {item.gift.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-sm text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="border-t border-border grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Gift size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {order.mode === "surprise"
                    ? "Surprise Recipient"
                    : "Delivering To"}
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {order.recipient.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.recipient.phone}
              </p>
              {order.mode === "surprise" && order.recipient.senderName && (
                <p className="text-xs text-muted-foreground mt-1">
                  From:{" "}
                  <span className="font-medium">
                    {order.recipient.senderName}
                  </span>
                </p>
              )}
              {order.recipient.message && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  "{order.recipient.message}"
                </p>
              )}
            </div>
            <div className="p-5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Delivery Location
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {order.location.city}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.location.address}
              </p>
            </div>
            <div className="p-5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Delivery Date
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { weekday: "long", month: "long", day: "numeric" },
                )}
              </p>
              <p className="text-sm text-muted-foreground">{timeLabel}</p>
            </div>
            <div className="p-5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Package size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Order Status
                </span>
              </div>
              <OrderStatusBadge status={order.status} publicView />
              <p className="text-xs text-muted-foreground mt-1">
                via {order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-border p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Paid</span>
              <span className="text-xl font-bold text-foreground">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <OrderSupportNotice order={order} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <Button
            size="lg"
            fullWidth
            onClick={() => navigate(`/track/${order.id}`)}
            rightIcon={<ArrowRight size={18} />}
          >
            Track Order
          </Button>
          <Button
            size="lg"
            variant="outline"
            fullWidth
            onClick={() => navigate("/gifts")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </CustomerLayout>
  )
}
