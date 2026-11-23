import { useState, type FormEvent } from "react"
import { CheckCircle2, Tag, TicketPercent, XCircle } from "lucide-react"
import Button from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { useAppActions } from "../../../context/useApp"
import { useCheckoutState } from "../hooks/useCheckoutState"
import {
  validateCoupon,
  VALIDATION_MESSAGES,
} from "../../coupons/services/couponService"
import { formatPrice } from "../../../utils/format"

interface PaymentCouponSummaryProps {
  subtotal: number
  deliveryFee: number
  total: number
}

export default function PaymentCouponSummary({
  subtotal,
  deliveryFee,
  total,
}: PaymentCouponSummaryProps) {
  const { coupons, appliedCoupon } = useCheckoutState()
  const { applyCoupon, removeCoupon, showToast } = useAppActions()
  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const [loading, setLoading] = useState(false)
  const applied = appliedCoupon
  const originalTotal = subtotal + deliveryFee

  const handleApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!couponCode.trim() || loading) return

    setCouponError("")
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const result = validateCoupon(couponCode, coupons, subtotal)
    setLoading(false)

    if (!result.valid) {
      setCouponError(VALIDATION_MESSAGES[result.reason])
      return
    }

    applyCoupon(result.applied)
    setCouponCode("")
    showToast(`Coupon "${result.applied.coupon.code}" applied!`)
  }

  const handleRemove = () => {
    removeCoupon()
    setCouponError("")
    showToast("Coupon removed", "info")
  }

  return (
    <div className="rounded-2xl bg-primary-light border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-5 space-y-4">
        {applied ? (
          <div className="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 p-3">
            <CheckCircle2 size={18} className="text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                <span className="font-mono">{applied.coupon.code}</span> applied
              </p>
              <p className="text-xs text-success">
                You save {formatPrice(applied.discountAmount)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-3" noValidate>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl nm-flat flex items-center justify-center shrink-0">
                <TicketPercent size={17} className="text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Have a coupon code?
                </p>
                <p className="text-xs text-muted-foreground">
                  Apply it before payment to see your final savings.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  aria-label="Coupon code"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase())
                    setCouponError("")
                  }}
                  leftIcon={<Tag size={15} />}
                  className="font-mono uppercase"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                loading={loading}
                disabled={!couponCode.trim()}
              >
                Apply
              </Button>
            </div>
          </form>
        )}

        {couponError && (
          <div
            role="alert"
            className="flex items-start gap-2 text-xs text-error"
          >
            <XCircle size={14} className="shrink-0 mt-0.5" />
            <span>{couponError}</span>
          </div>
        )}

        <div className="border-t border-primary/20 pt-4 space-y-2">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Items subtotal</span>
            <span className="font-medium text-foreground">
              {formatPrice(subtotal)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Delivery charge</span>
            {applied?.deliveryFree ? (
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground line-through">
                  {formatPrice(deliveryFee)}
                </span>
                <span className="font-semibold text-success">FREE</span>
              </span>
            ) : (
              <span className="font-medium text-foreground">
                {formatPrice(deliveryFee)}
              </span>
            )}
          </div>
          {applied && (
            <>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Before discount</span>
                <span className="text-muted-foreground line-through">
                  {formatPrice(originalTotal)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-sm text-success">
                <span>Coupon discount</span>
                <span className="font-semibold">
                  − {formatPrice(applied.discountAmount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-primary/10 border-t border-primary/20 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            Total Amount Due
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {formatPrice(total)}
          </p>
        </div>
        {applied && (
          <span className="rounded-full bg-success/10 text-success text-xs font-semibold px-3 py-1.5">
            Saved {formatPrice(applied.discountAmount)}
          </span>
        )}
      </div>
    </div>
  )
}
