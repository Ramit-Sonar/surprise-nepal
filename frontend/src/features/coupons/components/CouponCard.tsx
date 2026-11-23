import { useState } from "react"
import {
  Copy,
  Check,
  Tag,
  Clock,
  Zap,
  Gift,
  Truck,
  Percent,
} from "lucide-react"
import type { Coupon } from "../types"
import { getCouponStatus, formatDiscount } from "../services/couponService"
import { formatPrice } from "../../../utils/format"

interface CouponCardProps {
  coupon: Coupon
  onApply?: (code: string) => void
  compact?: boolean
}

const TYPE_CONFIG = {
  percentage: {
    Icon: Percent,
    gradient: "from-primary/15 via-primary/8 to-transparent",
    accent: "bg-primary",
    label: "Discount",
  },
  fixed: {
    Icon: Tag,
    gradient: "from-accent/15 via-accent/8 to-transparent",
    accent: "bg-accent",
    label: "Flat Off",
  },
  free_delivery: {
    Icon: Truck,
    gradient: "from-success/15 via-success/8 to-transparent",
    accent: "bg-success",
    label: "Delivery",
  },
}

const STATUS_INFO = {
  active: {
    label: "Active",
    color: "text-success bg-success/10 border-success/20",
  },
  scheduled: {
    label: "Upcoming",
    color: "text-warning bg-amber-100 border-amber-200",
  },
  expired: {
    label: "Expired",
    color: "text-error bg-error/10 border-error/20",
  },
  exhausted: {
    label: "Used Up",
    color: "text-error bg-error/10 border-error/20",
  },
  inactive: {
    label: "Inactive",
    color: "text-muted-foreground bg-muted border-border",
  },
}

export default function CouponCard({
  coupon,
  onApply,
  compact = false,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false)
  const status = getCouponStatus(coupon)
  const config = TYPE_CONFIG[coupon.discountType]
  const statusInfo = STATUS_INFO[status]
  const isUsable = status === "active"

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleApply = () => {
    if (onApply && isUsable) onApply(coupon.code)
  }

  const daysLeft = (() => {
    const diff = new Date(coupon.expiryDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  })()

  if (compact) {
    return (
      <div
        className={`relative flex items-center gap-3 rounded-2xl p-3 border transition-all ${
          isUsable
            ? "border-primary/20 bg-gradient-to-r from-primary/8 to-transparent hover:border-primary/40"
            : "border-border bg-muted/30 opacity-60"
        }`}
      >
        {/* Left accent strip */}
        <div
          className={`w-1 self-stretch rounded-full flex-shrink-0 ${
            isUsable ? "bg-primary" : "bg-border"
          }`}
        />

        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isUsable ? "bg-primary/10" : "bg-muted"
          }`}
        >
          <config.Icon
            size={15}
            className={isUsable ? "text-primary" : "text-muted-foreground"}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-foreground text-sm">
            {coupon.code}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {coupon.description}
          </p>
        </div>

        {/* Right: value + copy/apply */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-primary">
            {formatDiscount(coupon)}
          </span>
          {onApply && isUsable ? (
            <button
              onClick={handleApply}
              className="text-xs font-semibold text-white bg-primary px-2.5 py-1 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Apply
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check size={13} className="text-success" />
              ) : (
                <Copy size={13} className="text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Full card
  return (
    <div
      className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
        isUsable ? "hover:-translate-y-1 hover:shadow-xl" : "opacity-70"
      }`}
      style={{
        boxShadow: isUsable
          ? "8px 8px 20px var(--nm-dark), -4px -4px 12px var(--nm-light)"
          : "4px 4px 10px var(--nm-dark), -2px -2px 6px var(--nm-light)",
      }}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`}
      />

      {/* Perforated divider decorations (left/right circles) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background -translate-x-2.5 z-10" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background translate-x-2.5 z-10" />

      <div className="relative bg-card">
        {/* Top section */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Type icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--color-background)",
                boxShadow:
                  "5px 5px 12px var(--nm-dark), -3px -3px 8px var(--nm-light)",
              }}
            >
              <config.Icon size={22} className="text-primary" />
            </div>

            {/* Status + expiry */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
              {isUsable && daysLeft > 0 && daysLeft <= 30 && (
                <span className="text-[10px] text-warning flex items-center gap-1">
                  <Clock size={9} /> {daysLeft}d left
                </span>
              )}
              {isUsable && daysLeft > 30 && (
                <span className="text-[10px] text-muted-foreground">
                  Expires {coupon.expiryDate}
                </span>
              )}
            </div>
          </div>

          {/* Discount value — hero */}
          <p
            className="text-3xl font-bold text-foreground mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatDiscount(coupon)}
          </p>
          <p className="text-sm text-muted-foreground leading-snug">
            {coupon.description}
          </p>

          {/* Conditions row */}
          <div className="flex flex-wrap gap-2 mt-3">
            {coupon.minOrderAmount > 0 && (
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Min order {formatPrice(coupon.minOrderAmount)}
              </span>
            )}
            {coupon.maxUsageLimit > 0 && (
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {coupon.maxUsageLimit - coupon.usageCount} uses left
              </span>
            )}
            {coupon.perCustomerLimit > 0 && (
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {coupon.perCustomerLimit}× per customer
              </span>
            )}
          </div>
        </div>

        {/* Dashed divider */}
        <div className="mx-5 border-t-2 border-dashed border-border" />

        {/* Code + action strip */}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          {/* Code pill */}
          <div
            className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--color-background)",
              boxShadow:
                "inset 3px 3px 7px var(--nm-dark), inset -2px -2px 5px var(--nm-light)",
            }}
          >
            <Tag size={13} className="text-primary flex-shrink-0" />
            <span className="font-mono font-bold text-foreground tracking-wider text-sm truncate">
              {coupon.code}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                copied
                  ? "text-success bg-success/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                boxShadow:
                  "3px 3px 8px var(--nm-dark), -2px -2px 6px var(--nm-light)",
              }}
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check size={13} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={13} /> Copy
                </>
              )}
            </button>

            {onApply && isUsable && (
              <button
                onClick={handleApply}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all active:scale-95"
                style={{
                  boxShadow:
                    "4px 4px 10px rgba(140,0,30,0.35), -2px -2px 6px rgba(255,255,255,0.2)",
                }}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
