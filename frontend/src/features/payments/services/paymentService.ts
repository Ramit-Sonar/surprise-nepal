import { apiClient } from "../../../services/apiClient"
import type {
  PaymentRecord,
  ReviewPaymentCommand,
  SubmitPaymentProofCommand,
} from "../types"
import type { OrderId } from "../../../types/identifiers"

/**
 * Backend-facing payment boundary. The current local checkout flow remains
 * unchanged; these methods are ready for server-backed payment verification.
 */
export const paymentService = {
  getStatus: (orderId: OrderId) =>
    apiClient.get<PaymentRecord>(`/payments/orders/${orderId}`),
  submitProof: (command: SubmitPaymentProofCommand) =>
    apiClient.post<PaymentRecord>("/payments/proofs", command),
  review: (command: ReviewPaymentCommand) =>
    apiClient.post<PaymentRecord>("/payments/reviews", command),
}
