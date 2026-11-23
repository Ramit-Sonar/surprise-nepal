import { useEffect } from "react"
import { useAppActions } from "../../../context/useApp"
import { useCartState } from "../../cart/hooks/useCartState"
import { useCheckoutState } from "../../payments/hooks/useCheckoutState"
import { validateCoupon } from "../services/couponService"
import {
  SESSION_KEYS,
  sessionStorageGet,
  sessionStorageRemove,
} from "../../../services/storage"

/**
 * Auto-applies a coupon stored in sessionStorage('pendingCoupon') whenever:
 *  - cart has items
 *  - no coupon is already applied
 *  - the stored code validates against the current cart total
 *
 * The code stays in sessionStorage until it successfully applies or the
 * user completes checkout — so cart-minimum failures don't lose the code.
 * Call clearPendingCoupon() explicitly after a successful order.
 */
export function clearPendingCoupon() {
  sessionStorageRemove(SESSION_KEYS.PENDING_COUPON)
}

export function usePendingCoupon(scope: "cart" | "checkout" = "checkout") {
  const { cart, cartTotal } = useCartState()
  const { checkoutItems, checkoutTotal, appliedCoupon, coupons } =
    useCheckoutState()
  const { applyCoupon, showToast } = useAppActions()
  const items = scope === "cart" ? cart : checkoutItems
  const subtotal = scope === "cart" ? cartTotal : checkoutTotal

  useEffect(() => {
    if (items.length === 0) return
    if (appliedCoupon) return

    const code = sessionStorageGet(SESSION_KEYS.PENDING_COUPON)
    if (!code) return

    const result = validateCoupon(code, coupons, subtotal)
    if (result.valid) {
      applyCoupon(result.applied)
      showToast(
        `🎉 Offer applied! You save ${
          result.applied.deliveryFree
            ? "delivery fee"
            : `रु ${result.applied.discountAmount}`
        }`,
      )
      // Remove only after successful apply — keep it if validation failed
      // (e.g. cart total below minimum) so it retries on next visit
      clearPendingCoupon()
    }
    // Re-run when cart changes (items added/removed) or when coupons load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, subtotal, appliedCoupon])
}
