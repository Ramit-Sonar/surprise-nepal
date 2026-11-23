export type CouponDiscountType = "percentage" | "fixed" | "free_delivery"
export type CouponStatus = "active" | "inactive" | "expired" | "scheduled" | "exhausted"

export interface Coupon {
  id: string
  code: string
  description: string
  discountType: CouponDiscountType
  discountValue: number
  minOrderAmount: number
  maxUsageLimit: number
  perCustomerLimit: number
  usageCount: number
  startDate: string
  expiryDate: string
  status: "active" | "inactive"
  publishedOnSite: boolean
  createdAt: string
}

export interface AppliedCoupon {
  coupon: Coupon
  discountAmount: number
  deliveryFree: boolean
}
