import type { DeliveryLocation } from "../delivery/types"
import type {
  AdminId,
  AuditMetadata,
  CustomerId,
} from "../../types/identifiers"
import type { UploadReference } from "../../types/uploads"

/** Legacy UI session shape. Backend contracts use CustomerRecord/AdminRecord. */
export interface User {
  id: CustomerId | AdminId
  name: string
  email: string
  phone: string
  avatar?: string
  savedAddresses: DeliveryLocation[]
  joinedAt: string
  isAdmin: boolean
}

export interface CustomerRecord extends AuditMetadata {
  readonly id: CustomerId
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly avatar?: UploadReference
  readonly savedAddresses: DeliveryLocation[]
}

export interface AdminRecord extends AuditMetadata {
  readonly id: AdminId
  readonly name: string
  readonly email: string
  readonly active: boolean
}
