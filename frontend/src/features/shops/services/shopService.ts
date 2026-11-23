import type { Shop, ShopStatus } from "../types"

export interface ShopRepository {
  getShops(): Shop[]
  registerShop(input: Omit<Shop, "id" | "status" | "createdAt">): Shop | null
  updateShopStatus(id: string, status: ShopStatus): boolean
  updateShopCommission(id: string, commissionRate: number): void
  updateShop(
    id: string,
    updates: Pick<Shop, "name" | "ownerName" | "email" | "phone" | "address" | "status">,
    expectedUpdatedAt?: string | null,
  ): boolean
  authenticateShop(email: string, password: string): Shop | null
  setShopSession(shopId: string): void
  getCurrentShop(): Shop | null
  clearShopSession(): void
}

let repository: ShopRepository

export function configureShopRepository(nextRepository: ShopRepository) {
  repository = nextRepository
}

export const getShops = () => repository.getShops()
export const registerShop: ShopRepository["registerShop"] = (input) =>
  repository.registerShop(input)
export const updateShopStatus: ShopRepository["updateShopStatus"] = (
  id,
  status,
) => repository.updateShopStatus(id, status)
export const updateShopCommission: ShopRepository["updateShopCommission"] = (
  id,
  rate,
) => repository.updateShopCommission(id, rate)
export const updateShop: ShopRepository["updateShop"] = (...args) =>
  repository.updateShop(...args)
export const authenticateShop: ShopRepository["authenticateShop"] = (
  email,
  password,
) => repository.authenticateShop(email, password)
export const setShopSession = (shopId: string) =>
  repository.setShopSession(shopId)
export const getCurrentShop = () => repository.getCurrentShop()
export const clearShopSession = () => repository.clearShopSession()
