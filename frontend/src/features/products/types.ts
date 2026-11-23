import type {
  AuditMetadata,
  CustomerId,
  ProductId,
  ReviewId,
  ShopId,
  UploadId,
} from "../../types/identifiers"
import type { UploadReference } from "../../types/uploads"

export type ProductStatus = "active" | "draft" | "inactive" | "pending" | "rejected"

/** Prototype/UI product model. API responses should use ProductRecord. */
export interface Gift {
  id: ProductId
  name: string
  shortDescription: string
  description: string
  includes: string[]
  price: number
  discountPrice?: number
  category: string
  occasions: string[]
  rating: number
  reviewCount: number
  /** Prototype display source; backend records use UploadReference. */
  image: string
  /** Prototype display sources; backend records use UploadReference. */
  images: string[]
  /** @deprecated Delivery is configured globally in Admin Settings. */
  deliveryInfo?: string
  /** @deprecated Delivery is configured globally in Admin Settings. */
  availableCities?: string[]
  /** @deprecated Delivery is configured globally in Admin Settings. */
  estimatedDelivery?: string
  inStock: boolean
  stockCount: number
  featured: boolean
  tags: string[]
  createdAt: string
  status: ProductStatus
  shopId?: ShopId
  shopName?: string
  submittedAt?: string
  rejectionReason?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  image: string
  giftCount: number
}

export interface CartItem {
  gift: Gift
  quantity: number
}

export interface Review {
  id: ReviewId
  giftId: ProductId
  userId: CustomerId
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  verified: boolean
  helpful: number
}

/** Authoritative product response. Status, ownership, and prices are server-controlled. */
export interface ProductRecord extends AuditMetadata {
  readonly id: ProductId
  readonly shopId: ShopId
  readonly name: string
  readonly shortDescription: string
  readonly description: string
  readonly includes: string[]
  readonly price: number
  readonly discountPrice?: number
  readonly category: string
  readonly occasions: string[]
  readonly images: UploadReference[]
  readonly inStock: boolean
  readonly stockCount: number
  readonly featured: boolean
  readonly tags: string[]
  readonly status: ProductStatus
  readonly rejectionReason?: string
}

/** Product fields a shop may submit; identity, ownership, and moderation are omitted. */
export interface SaveProductCommand {
  productId?: ProductId
  name: string
  shortDescription: string
  description: string
  includes: string[]
  price: number
  discountPrice?: number
  category: string
  occasions: string[]
  imageUploadIds: UploadId[]
  stockCount: number
  tags: string[]
}

/** The server derives customerId and verified-purchase status from the session/orders. */
export interface CreateReviewCommand {
  productId: ProductId
  rating: number
  comment: string
}

export interface ReviewRecord extends AuditMetadata {
  readonly id: ReviewId
  readonly productId: ProductId
  readonly customerId: CustomerId
  readonly customerName: string
  readonly customerAvatar?: UploadReference
  readonly rating: number
  readonly comment: string
  readonly verifiedPurchase: boolean
  readonly helpfulCount: number
}
