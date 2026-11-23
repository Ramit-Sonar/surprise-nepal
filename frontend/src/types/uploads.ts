import type { ActorReference, UploadId } from "./identifiers"

export type UploadPurpose = "customer_avatar" | "shop_logo" | "product_image" | "payment_proof" | "payment_qr"

/**
 * Metadata returned after a server-authorized object-storage upload.
 * Backend-facing records use this instead of Base64/data URLs.
 */
export interface UploadReference {
  readonly id: UploadId
  /** Server-assigned owner; upload IDs must be authorized before attachment. */
  readonly owner: ActorReference
  readonly url: string
  readonly purpose: UploadPurpose
  readonly fileName: string
  readonly contentType: string
  readonly byteSize: number
  readonly width?: number
  readonly height?: number
  readonly createdAt: string
}

/** Command for requesting an upload slot; ownership comes from the session. */
export interface CreateUploadCommand {
  purpose: UploadPurpose
  fileName: string
  contentType: string
  byteSize: number
}

export interface CreateUploadResponse {
  upload: UploadReference
  uploadUrl: string
  expiresAt: string
}
