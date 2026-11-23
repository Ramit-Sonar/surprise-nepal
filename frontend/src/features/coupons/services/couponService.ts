import type { Coupon, AppliedCoupon, CouponStatus } from "../types"

interface ValidCouponResult {
  valid: true
  applied: AppliedCoupon
}

interface InvalidCouponResult {
  valid: false
  reason: "not_found" | "inactive" | "expired" | "not_yet_active" | "usage_limit" | "min_order" | "per_customer_limit"
}

export type CouponValidationResult = ValidCouponResult | InvalidCouponResult

const DELIVERY_FEE = 200

export function getCouponStatus(coupon: Coupon): CouponStatus {
  const now = new Date()
  const start = new Date(coupon.startDate)
  const expiry = new Date(coupon.expiryDate)
  expiry.setHours(23, 59, 59, 999)

  if (coupon.status === "inactive") return "inactive"
  if (now < start) return "scheduled"
  if (now > expiry) return "expired"
  if (coupon.maxUsageLimit > 0 && coupon.usageCount >= coupon.maxUsageLimit)
    return "exhausted"
  return "active"
}

export function validateCoupon(
  code: string,
  coupons: Coupon[],
  subtotal: number,
  customerUsageCount: number = 0,
): CouponValidationResult {
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase().trim(),
  )
  if (!coupon) return { valid: false, reason: "not_found" }

  const status = getCouponStatus(coupon)
  if (status === "inactive") return { valid: false, reason: "inactive" }
  if (status === "expired") return { valid: false, reason: "expired" }
  if (status === "scheduled") return { valid: false, reason: "not_yet_active" }
  if (status === "exhausted") return { valid: false, reason: "usage_limit" }

  if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
    return { valid: false, reason: "min_order" }
  }

  if (
    coupon.perCustomerLimit > 0 &&
    customerUsageCount >= coupon.perCustomerLimit
  ) {
    return { valid: false, reason: "per_customer_limit" }
  }

  const discountAmount = computeDiscount(coupon, subtotal)
  const deliveryFree = coupon.discountType === "free_delivery"

  return {
    valid: true,
    applied: { coupon, discountAmount, deliveryFree },
  }
}

export function computeDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discountType === "free_delivery") return DELIVERY_FEE
  if (coupon.discountType === "fixed")
    return Math.min(coupon.discountValue, subtotal)
  if (coupon.discountType === "percentage") {
    return Math.round((subtotal * coupon.discountValue) / 100)
  }
  return 0
}

export function generateCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("")
}

export function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === "percentage")
    return `${coupon.discountValue}% OFF`
  if (coupon.discountType === "fixed") return `रु ${coupon.discountValue} OFF`
  return "FREE DELIVERY"
}

export const VALIDATION_MESSAGES: Record<string, string> = {
  not_found: "This coupon code does not exist.",
  inactive: "This coupon is currently inactive.",
  expired: "This coupon has expired.",
  not_yet_active: "This coupon is not active yet.",
  usage_limit: "This coupon has reached its usage limit.",
  min_order: "Your order does not meet the minimum amount for this coupon.",
  per_customer_limit:
    "You have already used this coupon the maximum number of times.",
}
