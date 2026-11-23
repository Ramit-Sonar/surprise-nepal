import type { RecipientInfo } from "../../types/common"
import type {
  CustomerId,
  OrderId,
  ProductId,
  UploadId,
} from "../../types/identifiers"
import type { UploadReference } from "../../types/uploads"
import type { DeliveryLocation } from "../delivery/types"
import type { GuestOrderAccessGrant, OrderRecord } from "../orders/types"

export interface CheckoutData {
  mode: "self" | "surprise"
  recipient: RecipientInfo
  location: DeliveryLocation
  deliveryDate: string
  deliveryTime: "morning" | "afternoon" | "evening"
  paymentMethod: string
}

export type CheckoutPaymentMethod = "QR Transfer" | "Cash on Delivery"

/**
 * Local prototype submission shape. paymentProofReferences may contain data
 * URLs; backend integrations must use CreateOrderCommand with upload IDs.
 */
export interface CheckoutSubmission {
  mode: "self" | "surprise"
  items: Array<{
    productId: ProductId
    quantity: number
  }>
  recipient: RecipientInfo
  location: DeliveryLocation
  deliveryDate: string
  deliveryTime: "morning" | "afternoon" | "evening"
  paymentMethod: CheckoutPaymentMethod
  paymentProofReferences: string[]
  couponCode?: string
}

export interface PaymentProofSubmission {
  orderId: OrderId
  paymentProofReferences: string[]
}

export interface PaymentReviewSubmission {
  orderId: OrderId
  decision: "verified" | "rejected"
}

export type PaymentStatus = "pending" | "screenshot_submitted" | "verified" | "rejected"

/**
 * Allowed server transitions:
 * pending -> screenshot_submitted
 * screenshot_submitted -> verified | rejected
 * rejected -> screenshot_submitted
 * verified is terminal. COD confirmation is a separate server command.
 */
export interface PaymentStatusTransition<
  From extends PaymentStatus = PaymentStatus,
  To extends PaymentStatus = PaymentStatus,
> {
  from: From
  to: To
}

export type AllowedPaymentStatusTransition = PaymentStatusTransition<"pending", "screenshot_submitted"> | PaymentStatusTransition<"screenshot_submitted", "verified" | "rejected"> | PaymentStatusTransition<"rejected", "screenshot_submitted">

/**
 * Backend checkout command. customerId is intentionally absent: authenticated
 * ownership comes from the session; unauthenticated requests become guest
 * orders and receive a one-time GuestOrderAccessGrant.
 */
export interface CreateOrderCommand {
  mode: "self" | "surprise"
  items: Array<{
    productId: ProductId
    quantity: number
  }>
  recipient: RecipientInfo
  location: DeliveryLocation
  deliveryDate: string
  deliveryTime: "morning" | "afternoon" | "evening"
  paymentMethod: CheckoutPaymentMethod
  paymentProofUploadIds: UploadId[]
  couponCode?: string
}

export interface CreateOrderResponse {
  readonly order: OrderRecord
  readonly guestAccess?: GuestOrderAccessGrant
}

/** Ownership is derived from the customer/guest session, not request data. */
export interface SubmitPaymentProofCommand {
  orderId: OrderId
  uploadIds: UploadId[]
}

/** Reviewer identity and authorization are derived from the admin session. */
export interface ReviewPaymentCommand {
  orderId: OrderId
  decision: "verified" | "rejected"
}

export interface PaymentRecord {
  readonly orderId: OrderId
  readonly customerId: CustomerId | null
  readonly status: PaymentStatus
  readonly proofs: readonly UploadReference[]
  readonly verifiedAt?: string
  readonly updatedAt: string
}
