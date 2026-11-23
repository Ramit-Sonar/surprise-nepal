import type { Gift } from "../../products/types"
import type { Shop } from "../../shops/types"
import type { SettlementStatus, ShopSettlement } from "../../settlements/types"
import type { Order, OrderItem, OrderStatus } from "../types"
import { getProduct } from "../../products/services/productService"

export const DEFAULT_COMMISSION_RATE = 10

export function getOrderItemEconomics(item: OrderItem) {
  const gross = item.price * item.quantity
  const commissionRate = item.commissionRate ?? DEFAULT_COMMISSION_RATE
  const commissionAmount = Math.round((gross * commissionRate) / 100)
  const shopPayable = gross - commissionAmount
  return { gross, commissionRate, commissionAmount, shopPayable }
}

export function normalizeOrderForMarketplace(
  order: Order,
  shops: Shop[],
): Order {
  const items = order.items.map((item) => {
    const currentProduct = getProduct(item.gift.id)
    const shopId = item.shopId ?? item.gift.shopId ?? currentProduct?.shopId
    const shop = shops.find((candidate) => candidate.id === shopId)
    const rate =
      item.commissionRate ?? shop?.commissionRate ?? DEFAULT_COMMISSION_RATE
    const gross = item.price * item.quantity
    const commissionAmount = Math.round((gross * rate) / 100)
    const fallbackStatus = getFallbackFulfillmentStatus(order.status)
    return {
      ...item,
      shopId,
      shopName:
        item.shopName ??
        item.gift.shopName ??
        currentProduct?.shopName ??
        shop?.name ??
        "Surprise Nepal",
      commissionRate: rate,
      commissionAmount,
      shopPayable: gross - commissionAmount,
      fulfillmentStatus: item.fulfillmentStatus ?? fallbackStatus,
    }
  })
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const deliveryFee = Math.max(0, order.deliveryFee)
  const discount = Math.max(0, Math.min(order.discount, subtotal + deliveryFee))
  return {
    ...order,
    items,
    subtotal,
    deliveryFee,
    discount,
    total: subtotal + deliveryFee - discount,
    statusTimestamps: {
      pending: order.createdAt,
      ...order.statusTimestamps,
      ...(order.status !== "pending" && !order.statusTimestamps?.[order.status]
        ? { [order.status]: order.updatedAt }
        : {}),
    },
  }
}

function getFallbackFulfillmentStatus(
  status: Order["status"],
): OrderItem["fulfillmentStatus"] {
  if (status === "preparing") return "preparing"
  if (status === "ready") return "ready"
  if (["collected", "out_for_delivery", "delivered"].includes(status))
    return "collected"
  if (status === "confirmed") return "confirmed"
  return undefined
}

export function deriveOrderStatusFromItems(order: Order): Order["status"] {
  if (order.status === "pending" || order.status === "cancelled")
    return order.status
  if (["out_for_delivery", "delivered"].includes(order.status))
    return order.status
  const statuses = order.items.map(
    (item) => item.fulfillmentStatus ?? "confirmed",
  )
  if (statuses.length > 0 && statuses.every((status) => status === "collected"))
    return "collected"
  if (
    statuses.length > 0 &&
    statuses.every((status) => status === "ready" || status === "collected")
  )
    return "ready"
  if (
    statuses.some(
      (status) =>
        status === "preparing" || status === "ready" || status === "collected",
    )
  )
    return "preparing"
  return "confirmed"
}

export function getShopOrderStatus(order: Order, shopId: string): OrderStatus {
  if (
    ["pending", "cancelled", "out_for_delivery", "delivered"].includes(
      order.status,
    )
  ) {
    return order.status
  }
  const statuses = order.items
    .filter((item) => (item.shopId ?? item.gift.shopId) === shopId)
    .map((item) => item.fulfillmentStatus ?? "confirmed")
  if (statuses.length === 0) return "confirmed"
  if (statuses.every((status) => status === "collected")) return "collected"
  if (statuses.every((status) => status === "ready" || status === "collected"))
    return "ready"
  if (statuses.some((status) => status === "preparing" || status === "ready"))
    return "preparing"
  return "confirmed"
}

export function canAdminTransitionOrder(
  order: Order,
  nextStatus: OrderStatus,
): boolean {
  if (nextStatus === "cancelled") {
    return !["out_for_delivery", "delivered", "cancelled"].includes(
      order.status,
    )
  }
  const allowed: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: "confirmed",
    ready: "collected",
    collected: "out_for_delivery",
    out_for_delivery: "delivered",
  }
  if (allowed[order.status] !== nextStatus) return false
  if (nextStatus === "confirmed") {
    return (
      order.paymentMethod === "Cash on Delivery" ||
      order.paymentStatus === "verified"
    )
  }
  if (nextStatus === "collected") {
    return (
      order.items.length > 0 &&
      order.items.every((item) => item.fulfillmentStatus === "ready")
    )
  }
  return true
}

export function canShopTransitionOrder(
  order: Order,
  shopId: string,
  nextStatus: "preparing" | "ready",
): boolean {
  if (!["confirmed", "preparing"].includes(order.status)) return false
  const shopItems = order.items.filter(
    (item) => (item.shopId ?? item.gift.shopId) === shopId,
  )
  if (shopItems.length === 0) return false
  const requiredCurrent = nextStatus === "preparing" ? "confirmed" : "preparing"
  return shopItems.every(
    (item) => (item.fulfillmentStatus ?? "confirmed") === requiredCurrent,
  )
}

export function groupOrderItemsByShop(order: Order) {
  const groups = new Map<string, {
    shopId: string
    shopName: string
    items: OrderItem[]
  }>()
  order.items.forEach((item) => {
    const shopId = item.shopId ?? item.gift.shopId ?? "shop_surprise_nepal"
    const existing = groups.get(shopId)
    if (existing) existing.items.push(item)
    else
      groups.set(shopId, {
        shopId,
        shopName: item.shopName ?? item.gift.shopName ?? "Surprise Nepal",
        items: [item],
      })
  })
  return [...groups.values()]
}

export function getShopMetrics(
  shopId: string,
  orders: Order[],
  products: Gift[],
  from?: Date,
  to?: Date,
) {
  const matchingOrders = orders.filter((order) => {
    const created = new Date(order.createdAt)
    return (
      (!from || created >= from) &&
      (!to || created <= to) &&
      order.items.some((item) => (item.shopId ?? item.gift.shopId) === shopId)
    )
  })
  const eligibleOrders = matchingOrders.filter(
    (order) =>
      order.status === "delivered" && order.refundStatus !== "refunded",
  )
  const eligibleItems = eligibleOrders.flatMap((order) =>
    order.items.filter((item) => (item.shopId ?? item.gift.shopId) === shopId),
  )
  const allItems = matchingOrders.flatMap((order) =>
    order.items.filter((item) => (item.shopId ?? item.gift.shopId) === shopId),
  )
  const grossSales = eligibleItems.reduce(
    (sum, item) => sum + getOrderItemEconomics(item).gross,
    0,
  )
  const commissionAmount = eligibleItems.reduce(
    (sum, item) => sum + getOrderItemEconomics(item).commissionAmount,
    0,
  )
  const shopPayable = eligibleItems.reduce(
    (sum, item) => sum + getOrderItemEconomics(item).shopPayable,
    0,
  )
  return {
    products: products.filter((product) => product.shopId === shopId),
    orders: matchingOrders,
    eligibleOrders,
    items: allItems,
    unitsSold: eligibleItems.reduce((sum, item) => sum + item.quantity, 0),
    grossSales,
    commissionAmount,
    shopPayable,
    lastOrderAt: matchingOrders
      .map((order) => order.createdAt)
      .sort()
      .at(-1),
  }
}

export function getSettlementSnapshot(
  shopId: string,
  period: string,
  orders: Order[],
  previous?: ShopSettlement,
  status: SettlementStatus = previous?.status ?? "pending",
): ShopSettlement {
  if (
    previous &&
    (previous.grossSales > 0 || previous.eligibleOrderIds.length > 0)
  ) {
    return {
      ...previous,
      status,
      ...(status === "paid" && !previous.paidAt
        ? { paidAt: new Date().toISOString() }
        : {}),
    }
  }
  const eligibleOrders = orders.filter(
    (order) =>
      order.status === "delivered" &&
      order.refundStatus !== "refunded" &&
      getOrderSettlementPeriod(order) === period &&
      order.items.some((item) => (item.shopId ?? item.gift.shopId) === shopId),
  )
  const items = eligibleOrders.flatMap((order) =>
    order.items.filter((item) => (item.shopId ?? item.gift.shopId) === shopId),
  )
  const economics = items.map(getOrderItemEconomics)
  const rates = [...new Set(economics.map((item) => item.commissionRate))]
  const grossSales = economics.reduce((sum, item) => sum + item.gross, 0)
  const commissionAmount = economics.reduce(
    (sum, item) => sum + item.commissionAmount,
    0,
  )
  const shopPayable = economics.reduce((sum, item) => sum + item.shopPayable, 0)
  return {
    id: `${shopId}_${period}`,
    shopId,
    period,
    status,
    eligibleOrderIds: [...new Set(eligibleOrders.map((order) => order.id))],
    orderCount: eligibleOrders.length,
    unitsSold: items.reduce((sum, item) => sum + item.quantity, 0),
    grossSales,
    commissionAmount,
    shopPayable,
    commissionRates: rates,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    paidAt: previous?.paidAt,
    paymentReference: previous?.paymentReference,
  }
}

export function getOrderPeriods(orders: Order[]): string[] {
  return [
    ...new Set(
      orders
        .filter(
          (order) =>
            order.status === "delivered" && order.refundStatus !== "refunded",
        )
        .map(getOrderSettlementPeriod),
    ),
  ]
    .sort()
    .reverse()
}

export function getOrderSettlementPeriod(order: Order): string {
  return (order.statusTimestamps?.delivered ?? order.updatedAt).slice(0, 7)
}
