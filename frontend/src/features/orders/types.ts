import type { RecipientInfo } from "../../types/common"
import type {
  AuditMetadata,
  CustomerId,
  OrderId,
  ProductId,
  ShopId,
} from "../../types/identifiers"
import type { UploadReference } from "../../types/uploads"
import type { DeliveryLocation, DeliveryStatus } from "../delivery/types"
import type { PaymentStatus } from "../payments/types"
import type { Gift } from "../products/types"

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "collected" | "out_for_delivery" | "delivered" | "cancelled"

/**
 * Allowed server transitions:
 * pending -> confirmed | cancelled
 * confirmed -> preparing | cancelled
 * preparing -> ready | cancelled
 * ready -> collected | cancelled
 * collected -> out_for_delivery
 * out_for_delivery -> delivered
 * delivered and cancelled are terminal.
 */
export interface OrderStatusTransition<
  From extends OrderStatus = OrderStatus,
  To extends OrderStatus = OrderStatus,
> {
  from: From
  to: To
}

export type AllowedOrderStatusTransition = OrderStatusTransition<"pending", "confirmed" | "cancelled"> | OrderStatusTransition<"confirmed", "preparing" | "cancelled"> | OrderStatusTransition<"preparing", "ready" | "cancelled"> | OrderStatusTransition<"ready", "collected" | "cancelled"> | OrderStatusTransition<"collected", "out_for_delivery"> | OrderStatusTransition<"out_for_delivery", "delivered">

export type OrderItemFulfillmentStatus = "confirmed" | "preparing" | "ready" | "collected"

export interface OrderItem {
  gift: Gift
  quantity: number
  price: number
  shopId?: ShopId
  shopName?: string
  commissionRate?: number
  commissionAmount?: number
  shopPayable?: number
  fulfillmentStatus?: OrderItemFulfillmentStatus
  preparationStartedAt?: string
  readyAt?: string
  collectedAt?: string
}

/**
 * Prototype/UI compatibility model. Backend integrations should consume
 * OrderRecord, whose ownership, statuses, verification, and money are readonly.
 */
export interface Order {
  id: OrderId
  customerId: CustomerId | null
  mode: "self" | "surprise"
  paymentScreenshots: string[]
  paymentStatus: PaymentStatus
  items: OrderItem[]
  recipient: RecipientInfo
  location: DeliveryLocation
  deliveryDate: string
  deliveryTime: "morning" | "afternoon" | "evening"
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
  statusTimestamps?: Partial<Record<OrderStatus, string>>
  inventoryReservedAt?: string
  inventoryRestoredAt?: string
  refundStatus?: "none" | "pending" | "refunded"
  couponId?: string
  notes?: string
}

export interface OrderFinancials {
  readonly subtotal: number
  readonly deliveryFee: number
  readonly discount: number
  readonly total: number
}

export interface OrderItemRecord {
  readonly productId: ProductId
  readonly shopId: ShopId
  readonly productName: string
  readonly productImage?: UploadReference
  readonly quantity: number
  /** Server price snapshot at checkout time. */
  readonly unitPrice: number
  readonly commissionRate: number
  readonly commissionAmount: number
  readonly shopPayable: number
  readonly fulfillmentStatus: OrderItemFulfillmentStatus
}

/**
 * Private authoritative order returned only after customer ownership, shop
 * scope, or admin authorization has been checked by the server.
 */
export interface OrderRecord extends AuditMetadata {
  readonly id: OrderId
  readonly customerId: CustomerId | null
  readonly ownership: "customer" | "guest"
  readonly mode: "self" | "surprise"
  readonly items: readonly OrderItemRecord[]
  readonly recipient: RecipientInfo
  readonly location: DeliveryLocation
  readonly deliveryDate: string
  readonly deliveryTime: "morning" | "afternoon" | "evening"
  readonly deliveryStatus: DeliveryStatus
  readonly status: OrderStatus
  readonly paymentMethod: string
  readonly paymentStatus: PaymentStatus
  readonly paymentProofs: readonly UploadReference[]
  readonly financials: OrderFinancials
  readonly statusTimestamps: Partial<Record<OrderStatus, string>>
  readonly refundStatus: "none" | "pending" | "refunded"
  readonly couponId?: string
  readonly notes?: string
}

/**
 * Returned once after guest checkout. The server stores only a token hash.
 * The raw token must never be placed in an order URL or included in OrderRecord.
 */
export interface GuestOrderAccessGrant {
  readonly orderId: OrderId
  readonly trackingToken: string
  readonly expiresAt: string
}

export interface TrackGuestOrderCommand {
  orderId: OrderId
  trackingToken: string
}

/**
 * Deliberately excludes recipient, address, phone, payment proof, and financial
 * data. Full details require an authenticated ownership check.
 */
export interface GuestOrderTrackingResponse {
  readonly orderId: OrderId
  readonly status: OrderStatus
  readonly deliveryStatus: DeliveryStatus
  readonly deliveryDate: string
  readonly deliveryTime: "morning" | "afternoon" | "evening"
  readonly updatedAt: string
}

/** The server authorizes the actor and validates the transition. */
export interface UpdateOrderStatusCommand {
  orderId: OrderId
  status: OrderStatus
}

/** shopId is derived from the authenticated shop session. */
export interface UpdateShopFulfillmentCommand {
  orderId: OrderId
  status: Extract<OrderItemFulfillmentStatus, "preparing" | "ready">
}

export interface OrderAuthoritySuccess {
  ok: true
  order: Order
}

export interface OrderAuthorityFailure {
  ok: false
  message: string
}

export type OrderAuthorityResult = OrderAuthoritySuccess | OrderAuthorityFailure
