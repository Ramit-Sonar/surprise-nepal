import { Package, CheckCircle, Sparkles, Truck, Gift } from "lucide-react"
import type { OrderStatus } from "../types"

const STEPS: {
  status: OrderStatus
  label: string
  description: string
  icon: typeof Package
}[] = [
  {
    status: "pending",
    label: "Order Placed",
    description: "Your order has been received",
    icon: Package,
  },
  {
    status: "confirmed",
    label: "Order Confirmed",
    description: "We've confirmed your order",
    icon: CheckCircle,
  },
  {
    status: "preparing",
    label: "Gift Prepared",
    description: "Your gift is ready for delivery",
    icon: Sparkles,
  },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your surprise is on the way",
    icon: Truck,
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "The surprise has arrived",
    icon: Gift,
  },
]

const ADMIN_STEPS: {
  status: OrderStatus
  label: string
  description: string
  icon: typeof Package
}[] = [
  {
    status: "pending",
    label: "Order Placed",
    description: "System · Order received",
    icon: Package,
  },
  {
    status: "confirmed",
    label: "Order Confirmed",
    description: "Admin · Order confirmed",
    icon: CheckCircle,
  },
  {
    status: "preparing",
    label: "Preparing",
    description: "Shop · Preparation started",
    icon: Sparkles,
  },
  {
    status: "ready",
    label: "Ready for Pickup",
    description: "Shop · All gifts prepared",
    icon: Sparkles,
  },
  {
    status: "collected",
    label: "Collected",
    description: "Admin · Collected from all shops",
    icon: Package,
  },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    description: "Admin · Delivery started",
    icon: Truck,
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Admin · Delivery completed",
    icon: Gift,
  },
]

function getVisibleStepIndex(
  status: OrderStatus,
  includeCollection: boolean,
): number {
  if (status === "pending") return 0
  if (status === "confirmed") return 1
  if (status === "preparing") return 2
  if (status === "ready") return includeCollection ? 3 : 2
  if (status === "collected") return includeCollection ? 4 : 2
  if (status === "out_for_delivery") return includeCollection ? 5 : 3
  if (status === "delivered") return includeCollection ? 6 : 4
  return -1
}

interface OrderTimelineProps {
  currentStatus: OrderStatus
  timestamps?: Partial<Record<OrderStatus, string>>
  className?: string
  paymentMethod?: string
  includeCollection?: boolean
}

export default function OrderTimeline({
  currentStatus,
  timestamps = {},
  className = "",
  includeCollection = false,
}: OrderTimelineProps) {
  const steps = includeCollection ? ADMIN_STEPS : STEPS
  const currentIndex = getVisibleStepIndex(currentStatus, includeCollection)
  const isCancelled = currentStatus === "cancelled"

  if (isCancelled) {
    return (
      <div className={`flex flex-col items-center gap-3 py-8 ${className}`}>
        <div className="w-14 h-14 rounded-full bg-red-100 text-error flex items-center justify-center">
          <Package size={24} />
        </div>
        <p className="font-semibold text-error">Order Cancelled</p>
        <p className="text-sm text-muted-foreground">
          This order was cancelled
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {steps.map((step, index) => {
        const isCurrent =
          index === currentIndex &&
          !["ready", "collected", "delivered"].includes(currentStatus)
        const isCompleted = index <= currentIndex && !isCurrent
        const timestamp =
          !includeCollection && step.status === "preparing"
            ? (timestamps.ready ?? timestamps.collected ?? timestamps.preparing)
            : timestamps[step.status]
        const Icon = step.icon
        const isCustomerPreparationStep =
          !includeCollection && step.status === "preparing"
        const label =
          isCustomerPreparationStep && currentStatus === "preparing"
            ? "Gift Being Prepared"
            : step.label
        const description =
          isCustomerPreparationStep && currentStatus === "preparing"
            ? "The shop is preparing your gift"
            : step.description

        return (
          <div key={step.status} className="flex gap-4 relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2">
                <div
                  className={`h-full transition-all duration-500 ${
                    index < currentIndex ? "bg-success" : "bg-border"
                  }`}
                />
              </div>
            )}

            {/* Icon */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                isCompleted
                  ? "bg-success text-white"
                  : isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground border-2 border-border"
              }`}
            >
              <Icon size={18} />
              {isCurrent && (
                <span className="absolute inset-0 rounded-full animate-pulse bg-primary/20" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1 min-h-[2.5rem]">
              <div>
                <p
                  className={`font-semibold text-sm ${
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
              {(isCompleted || isCurrent) && timestamp && (
                <p
                  className={`text-xs mt-1 font-medium ${
                    isCompleted ? "text-success" : "text-primary"
                  }`}
                >
                  {new Date(timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
