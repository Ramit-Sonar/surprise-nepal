import { createContext, useContext, type Context } from "react"
import type {
  AppliedCoupon,
  CheckoutData,
  CheckoutSubmission,
  Coupon,
  DeliveryLocation,
  Gift,
  OrderAuthorityResult,
  OrderStatus,
  PaymentProofSubmission,
  PaymentReviewSubmission,
  Review,
  Toast,
} from "../types/index"

export interface AppActionsValue {
  addToCart: (gift: Gift, quantity?: number) => void
  removeFromCart: (giftId: string) => void
  updateCartQuantity: (giftId: string, quantity: number) => void
  clearCart: () => void
  toggleWishlist: (giftId: string) => void
  isInWishlist: (giftId: string) => boolean
  showToast: (message: string, type?: Toast["type"]) => void
  loginCustomer: (email: string, name?: string) => void
  loginAdmin: (email: string, password: string, name?: string) => boolean
  logout: () => void
  setCheckoutData: (data: Partial<CheckoutData>) => void
  clearCheckoutData: () => void
  startBuyNow: (gift: Gift, quantity: number) => void
  startCartCheckout: () => void
  placeOrder: (submission: CheckoutSubmission) => Promise<OrderAuthorityResult>
  addReview: (review: Omit<Review, "id" | "createdAt" | "helpful">) => void
  markReviewHelpful: (reviewId: string) => void
  setMenuOpen: (open: boolean) => void
  setPaymentQR: (qr: string | null) => void
  submitPaymentProof: (
    submission: PaymentProofSubmission,
  ) => Promise<OrderAuthorityResult>
  reviewPayment: (
    submission: PaymentReviewSubmission,
  ) => Promise<OrderAuthorityResult>
  confirmCODOrder: (orderId: string) => Promise<OrderAuthorityResult>
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean
  updateShopFulfillment: (
    orderId: string,
    shopId: string,
    status: "preparing" | "ready",
  ) => boolean
  addAddress: (address: DeliveryLocation) => void
  updateAddress: (index: number, address: DeliveryLocation) => void
  deleteAddress: (index: number) => void
  applyCoupon: (applied: AppliedCoupon) => void
  removeCoupon: () => void
  addCoupon: (coupon: Coupon) => void
  updateCoupon: (coupon: Coupon) => void
  deleteCoupon: (id: string) => void
  toggleCouponStatus: (id: string) => void
}

interface ToastStateValue {
  toasts: Toast[]
}

export const AppActionsContext = createContext<AppActionsValue | null>(null)
export const ToastStateContext = createContext<ToastStateValue | null>(null)

function useRequiredContext<T>(
  context: Context<T | null>,
  hookName: string,
): T {
  const value = useContext(context)
  if (!value) throw new Error(`${hookName} must be used within AppProvider`)
  return value
}

export const useAppActions = () =>
  useRequiredContext(AppActionsContext, "useAppActions")
export const useToastState = () =>
  useRequiredContext(ToastStateContext, "useToastState")
