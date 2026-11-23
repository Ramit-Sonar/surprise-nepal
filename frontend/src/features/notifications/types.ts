import type { OrderId, ShopId } from "../../types/identifiers"

export interface ShopNotification {
  id: string
  shopId: ShopId
  title: string
  message: string
  type: "product" | "order" | "account"
  createdAt: string
}

export type NotifType = "new_order" | "payment_screenshot" | "payment_rejected" | "low_stock" | "pending_cod" | "ready_pickup"

export interface AdminNotification {
  id: string
  type: NotifType
  title: string
  description: string
  orderId?: OrderId
  createdAt: string
}

export interface NotifSettings {
  new_order: boolean
  payment_screenshot: boolean
  payment_rejected: boolean
  low_stock: boolean
  pending_cod: boolean
  ready_pickup: boolean
}
