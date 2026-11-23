import type { Order } from "../../orders/types"
import { getProducts } from "../../products/services/productService"
import {
  STORAGE_KEYS,
  storageGet,
  storageSet,
  storageUpdate,
} from "../../../services/storage"
import type { AdminNotification, NotifSettings } from "../types"

export type { AdminNotification, NotifSettings, NotifType } from "../types"

export function loadNotifSettings(): NotifSettings {
  return {
    new_order: true,
    payment_screenshot: true,
    payment_rejected: true,
    low_stock: true,
    pending_cod: true,
    ready_pickup: true,
    ...storageGet<Partial<NotifSettings>>(
      STORAGE_KEYS.ADMIN_NOTIFICATION_SETTINGS,
      {},
    ),
  }
}

export function saveNotifSettings(s: NotifSettings) {
  storageSet(STORAGE_KEYS.ADMIN_NOTIFICATION_SETTINGS, s)
}

export function loadReadIds(): Set<string> {
  return new Set(storageGet<string[]>(STORAGE_KEYS.ADMIN_NOTIFICATION_READ, []))
}

export function saveReadIds(ids: Set<string>) {
  storageUpdate<string[]>(
    STORAGE_KEYS.ADMIN_NOTIFICATION_READ,
    [],
    (current) => [...new Set([...current, ...ids])],
  )
}

export function deriveNotifications(orders: Order[]): AdminNotification[] {
  const notifs: AdminNotification[] = []
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000

  for (const order of orders) {
    const age = now - new Date(order.createdAt).getTime()

    // New order (placed in last 24 h, still pending/confirmed)
    if (age < oneDayMs && order.status === "pending") {
      notifs.push({
        id: `new_order_${order.id}`,
        type: "new_order",
        title: "New order received",
        description: `${order.recipient.name} · रु ${order.total.toLocaleString()} · ${order.location.city}`,
        orderId: order.id,
        createdAt: order.createdAt,
      })
    }

    // Payment screenshot waiting for review
    if (
      order.paymentMethod !== "Cash on Delivery" &&
      order.paymentStatus === "screenshot_submitted" &&
      order.paymentScreenshots.length > 0
    ) {
      notifs.push({
        id: `pay_screenshot_${order.id}`,
        type: "payment_screenshot",
        title: "Payment screenshot submitted",
        description: `${order.recipient.name} uploaded proof for order ${order.id}`,
        orderId: order.id,
        createdAt: order.updatedAt,
      })
    }

    // Payment rejected — customer may re-submit
    if (order.paymentStatus === "rejected") {
      notifs.push({
        id: `pay_rejected_${order.id}`,
        type: "payment_rejected",
        title: "Payment rejected",
        description: `${order.recipient.name}'s payment was rejected for order ${order.id}`,
        orderId: order.id,
        createdAt: order.updatedAt,
      })
    }

    // COD pending confirmation
    if (
      order.paymentMethod === "Cash on Delivery" &&
      order.status === "pending"
    ) {
      notifs.push({
        id: `cod_pending_${order.id}`,
        type: "pending_cod",
        title: "COD order awaiting confirmation",
        description: `Confirm ${order.recipient.name}'s order before dispatch`,
        orderId: order.id,
        createdAt: order.createdAt,
      })
    }

    const readyItems = order.items.filter(
      (item) => item.fulfillmentStatus === "ready",
    )
    if (readyItems.length > 0) {
      const readyShops = [
        ...new Set(
          readyItems.map(
            (item) => item.shopName ?? item.gift.shopName ?? "A partner shop",
          ),
        ),
      ]
      notifs.push({
        id: `ready_pickup_${order.id}_${readyShops.slice().sort().join("_")}`,
        type: "ready_pickup",
        title: "Gift ready for pickup",
        description: `${readyShops.join(", ")} prepared ${readyItems.length} item${
          readyItems.length === 1 ? "" : "s"
        } for order ${order.id}.`,
        orderId: order.id,
        createdAt:
          readyItems
            .map((item) => item.readyAt)
            .filter(Boolean)
            .sort()
            .at(-1) ?? order.updatedAt,
      })
    }
  }

  // Low stock alerts from the live product source of truth.
  for (const gift of getProducts()) {
    if (gift.stockCount < 5 && gift.status === "active") {
      notifs.push({
        id: `low_stock_${gift.id}`,
        type: "low_stock",
        title: "Low stock warning",
        description: `"${gift.name}" has only ${gift.stockCount} unit${
          gift.stockCount === 1 ? "" : "s"
        } left`,
        createdAt: new Date(Date.now() - 60000).toISOString(),
      })
    }
  }

  // Sort newest first
  return notifs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
