import type { ReactNode } from "react"
import type { OrderStatus, SettlementStatus } from "../../types/index"
import {
  getOrderStatusLabel,
  ORDER_STATUS_CONFIG,
} from "../../config/orderStatus"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "error" | "muted" | "outline"
  size?: "sm" | "md"
  className?: string
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const base = "inline-flex items-center gap-1 font-medium rounded-full"

  const variants = {
    default: "bg-foreground text-background",
    primary: "bg-primary-light text-primary",
    success: "bg-green-100 text-success",
    warning: "bg-amber-100 text-warning",
    error: "bg-red-100 text-error",
    muted: "bg-muted text-muted-foreground",
    outline: "border border-border text-muted-foreground bg-transparent",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  }

  return (
    <span
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export function OrderStatusBadge({
  status,
  publicView = false,
}: {
  status: OrderStatus
  publicView?: boolean
}) {
  const config = ORDER_STATUS_CONFIG[status]
  return (
    <Badge variant="muted" className={config.badgeClassName}>
      {getOrderStatusLabel(status, publicView)}
    </Badge>
  )
}

export function SettlementStatusBadge({
  status,
}: {
  status: SettlementStatus
}) {
  interface SettlementBadgeConfig {
    label: string
    className: string
  }
  const config: Record<SettlementStatus, SettlementBadgeConfig> = {
    pending: {
      label: "Pending",
      className: "bg-muted text-muted-foreground",
    },
    processing: {
      label: "Processing",
      className: "bg-amber-100 text-warning",
    },
    paid: { label: "Paid", className: "bg-green-100 text-success" },
  }
  return (
    <Badge variant="muted" className={config[status].className}>
      {config[status].label}
    </Badge>
  )
}
