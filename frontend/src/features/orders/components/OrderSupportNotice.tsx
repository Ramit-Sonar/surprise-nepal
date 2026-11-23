import { Headphones, ReceiptText, ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { MouseEvent } from "react"
import type { Order } from "../types"
import Button from "../../../components/ui/Button"

function getPolicyMessage(order: Order) {
  if (order.status === "preparing" || order.status === "ready") {
    return "Gift preparation has started, so a full refund may not be available. The refundable amount is reviewed after deducting materials and preparation costs already incurred."
  }
  if (order.status === "collected" || order.status === "out_for_delivery") {
    return "This order has already been dispatched. Cancellation is normally unavailable, but support can review exceptional delivery issues."
  }
  if (order.status === "delivered") {
    return "Delivered orders cannot be cancelled. Contact support promptly if the gift is damaged, incorrect, or has another delivery issue."
  }
  if (order.status === "cancelled") {
    return "This order is cancelled. Support can help you check the refund status and any amount still due."
  }
  return "Contact support as soon as possible. Orders cancelled before gift preparation begins may be eligible for a full refund."
}

export default function OrderSupportNotice({ order }: { order: Order }) {
  const navigate = useNavigate()
  const isPrepaid = order.paymentMethod !== "Cash on Delivery"

  const openSupport = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    navigate(
      `/help?orderId=${encodeURIComponent(order.id)}#cancellation-policy`,
    )
  }

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={19} className="text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">
            Cancellation and refund support
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {getPolicyMessage(order)}
          </p>
          <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
            <ReceiptText
              size={14}
              className="text-warning flex-shrink-0 mt-0.5"
            />
            <p>
              When contacting support, include{" "}
              <span className="font-semibold text-foreground">
                order #{order.id}
              </span>
              {isPrepaid && (
                <>
                  {" "}
                  and the{" "}
                  <span className="font-semibold text-foreground">
                    payment screenshot
                  </span>{" "}
                  used for this order
                </>
              )}
              .
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={openSupport}
            leftIcon={<Headphones size={14} />}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
