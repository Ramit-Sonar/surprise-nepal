import type { CartItem, Category, Gift } from "../types"

export interface ProductStockRequest {
  productId: string
  quantity: number
}

export interface ProductStockReservationSuccess {
  ok: true
  items: CartItem[]
}

export interface ProductStockReservationFailure {
  ok: false
  message: string
}

export type ProductStockReservationResult = ProductStockReservationSuccess | ProductStockReservationFailure

interface ProductMetadata {
  categories: Category[]
  occasions: string[]
}

export interface ProductRepository {
  getProducts(): Gift[]
  getCatalogProducts(): Gift[]
  getProduct(id: string): Gift | undefined
  getShopProducts(shopId: string): Gift[]
  saveProduct(product: Gift, expectedUpdatedAt?: string | null): boolean
  updateProductStatus(
    id: string,
    status: Gift["status"],
    rejectionReason?: string,
    expectedUpdatedAt?: string | null,
  ): boolean
  updateProductFeatured(
    id: string,
    featured: boolean,
    expectedUpdatedAt?: string | null,
  ): boolean
  reserveProductStock(
    items: ProductStockRequest[],
  ): ProductStockReservationResult
  releaseProductStock(items: CartItem[]): void
  deleteProduct(id: string): boolean
  adjustProductStock(id: string, amount: number): Gift | null
}

let repository: ProductRepository

export let categories: Category[] = []
export let OCCASIONS: string[] = []

export function configureProductRepository(
  nextRepository: ProductRepository,
  metadata: ProductMetadata,
) {
  repository = nextRepository
  categories = metadata.categories
  OCCASIONS = metadata.occasions
}

export const getProducts = () => repository.getProducts()
export const getCatalogProducts = () => repository.getCatalogProducts()
export const getProduct = (id: string) => repository.getProduct(id)
export const getShopProducts = (shopId: string) =>
  repository.getShopProducts(shopId)
export const saveProduct = (product: Gift, expectedUpdatedAt?: string | null) =>
  repository.saveProduct(product, expectedUpdatedAt)
export const updateProductStatus: ProductRepository["updateProductStatus"] = (
  ...args
) => repository.updateProductStatus(...args)
export const updateProductFeatured: ProductRepository["updateProductFeatured"] =
  (...args) => repository.updateProductFeatured(...args)
export const reserveProductStock: ProductRepository["reserveProductStock"] = (
  items,
) => repository.reserveProductStock(items)
export const releaseProductStock = (items: CartItem[]) =>
  repository.releaseProductStock(items)
export const deleteProduct = (id: string) => repository.deleteProduct(id)
export const adjustProductStock = (id: string, amount: number) =>
  repository.adjustProductStock(id, amount)
