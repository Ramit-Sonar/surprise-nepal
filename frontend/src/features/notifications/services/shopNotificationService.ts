import type { ShopNotification } from "../types"

export interface ShopNotificationRepository {
  addShopNotification(
    input: Omit<ShopNotification, "id" | "createdAt">,
  ): ShopNotification
  getShopNotifications(shopId: string): ShopNotification[]
}

let repository: ShopNotificationRepository

export function configureShopNotificationRepository(
  nextRepository: ShopNotificationRepository,
) {
  repository = nextRepository
}

export const addShopNotification: ShopNotificationRepository["addShopNotification"] =
  (input) => repository.addShopNotification(input)
export const getShopNotifications = (shopId: string) =>
  repository.getShopNotifications(shopId)
