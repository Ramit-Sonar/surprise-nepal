/**
 * Semantic identifiers used at API boundaries. They remain strings so the
 * current frontend can adopt them without runtime conversion.
 */
export type CustomerId = string
export type AdminId = string
export type ShopId = string
export type ProductId = string
export type OrderId = string
export type ReviewId = string
export type UploadId = string

export interface CustomerActorReference {
  type: "customer"
  id: CustomerId
}

export interface AdminActorReference {
  type: "admin"
  id: AdminId
}

export interface ShopActorReference {
  type: "shop"
  id: ShopId
}

export type ActorReference = CustomerActorReference | AdminActorReference | ShopActorReference

export interface AuditMetadata {
  /** Assigned by the server from the authenticated actor, never request data. */
  readonly createdBy: ActorReference
  /** Assigned by the server from the authenticated actor, never request data. */
  readonly updatedBy: ActorReference
  readonly createdAt: string
  readonly updatedAt: string
}
