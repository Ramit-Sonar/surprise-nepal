import type { OrderStatus } from "../types/index"

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string
  publicLabel?: string
  color: string
  badgeClassName: string
}> = {
  pending: {
    label: "Pending",
    color: "#78716C",
    badgeClassName: "bg-muted text-muted-foreground",
  },
  confirmed: {
    label: "Confirmed",
    color: "#C2003C",
    badgeClassName: "bg-primary-light text-primary",
  },
  preparing: {
    label: "Preparing",
    publicLabel: "Gift Prepared",
    color: "#F59E0B",
    badgeClassName: "bg-amber-100 text-warning",
  },
  ready: {
    label: "Ready for Pickup",
    publicLabel: "Gift Prepared",
    color: "#8B5CF6",
    badgeClassName: "bg-violet-100 text-violet-700",
  },
  collected: {
    label: "Collected",
    publicLabel: "Gift Prepared",
    color: "#7C3AED",
    badgeClassName: "bg-violet-100 text-violet-700",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "#3B82F6",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  delivered: {
    label: "Delivered",
    color: "#059669",
    badgeClassName: "bg-green-100 text-success",
  },
  cancelled: {
    label: "Cancelled",
    color: "#EF4444",
    badgeClassName: "bg-red-100 text-error",
  },
}

/** Single source of truth for map/chart status colours. */
export const ORDER_STATUS_COLOR = Object.fromEntries(
  Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => [
    status,
    config.color,
  ]),
) as Record<OrderStatus, string>

export const getOrderStatusLabel = (status: OrderStatus, publicView = false) =>
  publicView
    ? (ORDER_STATUS_CONFIG[status].publicLabel ??
      ORDER_STATUS_CONFIG[status].label)
    : ORDER_STATUS_CONFIG[status].label
