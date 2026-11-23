import type {
  AuditMetadata,
  CustomerId,
  ShopId,
  UploadId,
} from "../../types/identifiers"
import type { UploadReference } from "../../types/uploads"

export type ShopStatus = "pending" | "approved" | "rejected" | "suspended"

/** Prototype/UI shop model. API responses should use ShopRecord. */
export interface Shop {
  id: ShopId
  name: string
  ownerName: string
  phone: string
  email: string
  address: string
  description?: string
  /** Prototype display source; backend records use UploadReference. */
  logo?: string
  status: ShopStatus
  createdAt: string
  commissionRate?: number
  updatedAt?: string
}

export interface RegisterShopCommand {
  name: string
  ownerName: string
  phone: string
  email: string
  address: string
  description?: string
  logoUploadId?: UploadId
}

/**
 * The owner is the authenticated customer/partner account. Status, commission,
 * and audit actors are assigned by the server.
 */
export interface ShopRecord extends AuditMetadata {
  readonly id: ShopId
  readonly ownerCustomerId: CustomerId
  readonly name: string
  readonly ownerName: string
  readonly phone: string
  readonly email: string
  readonly address: string
  readonly description?: string
  readonly logo?: UploadReference
  readonly status: ShopStatus
  readonly commissionRate: number
}
