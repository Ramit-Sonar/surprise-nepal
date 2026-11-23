import { createContext, useContext } from "react"
import type { AppliedCoupon, Coupon } from "../../coupons/types"
import type { CartItem } from "../../products/types"
import type { CheckoutData } from "../types"

export interface CheckoutStateValue {
  checkoutData: Partial<CheckoutData>
  paymentQR: string | null
  coupons: Coupon[]
  appliedCoupon: AppliedCoupon | null
  checkoutItems: CartItem[]
  checkoutSource: "buy_now" | "cart" | null
  checkoutTotal: number
}

export const CheckoutStateContext = createContext<CheckoutStateValue | null>(
  null,
)

export function useCheckoutState() {
  const value = useContext(CheckoutStateContext)
  if (!value)
    throw new Error("useCheckoutState must be used within AppProvider")
  return value
}
