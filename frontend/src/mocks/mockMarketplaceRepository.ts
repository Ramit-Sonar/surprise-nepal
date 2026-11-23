import { gifts as seedGifts } from "./mockData"
import type {
  CartItem,
  Gift,
  Shop,
  ShopNotification,
  ShopSettlement,
  ShopStatus,
} from "../types/index"
import {
  STORAGE_KEYS,
  storageGet,
  storageGetFresh,
  storageSet,
  storageRemove,
  storageUpdate,
} from "../services/storage"
import type {
  ProductStockRequest,
  ProductStockReservationResult,
} from "../features/products/services/productService"

const PLATFORM_SHOP_ID = "shop_surprise_nepal"

type LegacyShop = Shop & { password?: string }

function withoutLegacyPassword(shop: LegacyShop): Shop {
  const { password: _password, ...safeShop } = shop
  return safeShop
}

function withoutProductDeliveryFields(gift: Gift): Gift {
  const product = { ...gift }
  delete product.deliveryInfo
  delete product.availableCities
  delete product.estimatedDelivery
  return product
}

const seedShops: Shop[] = [
  {
    id: PLATFORM_SHOP_ID,
    name: "Surprise Nepal Gifts",
    ownerName: "Demo Partner",
    phone: "9800000000",
    email: "partner@surprisenepal.com",
    address: "Thamel, Kathmandu",
    description: "Curated gifts delivered across Nepal.",
    status: "approved",
    createdAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "shop_pending_demo",
    name: "Himalayan Handcrafts",
    ownerName: "Sita Lama",
    phone: "9812345678",
    email: "sita@example.com",
    address: "Lakeside, Pokhara",
    description: "Locally made gift hampers and keepsakes.",
    status: "pending",
    createdAt: "2025-01-12T08:00:00.000Z",
  },
  {
    id: "shop_pending_kathmandu",
    name: "Kathmandu Keepsake Co.",
    ownerName: "Aarati Shrestha",
    phone: "9841456723",
    email: "aarati@ktmkeepsake.example",
    address: "New Road, Kathmandu",
    description: "Personalized keepsakes and celebration gifts.",
    status: "pending",
    createdAt: "2026-09-28T07:45:00.000Z",
  },
  {
    id: "shop_pokhara_bloom",
    name: "Pokhara Bloom & Bake",
    ownerName: "Nabin Gurung",
    phone: "9856023412",
    email: "nabin@pokharabloom.example",
    address: "Lakeside, Pokhara",
    description: "Fresh flowers, cakes, and curated gift boxes.",
    status: "approved",
    createdAt: "2026-04-08T09:15:00.000Z",
  },
  {
    id: "shop_rejected_everest",
    name: "Everest Keepsakes",
    ownerName: "Roshan Rai",
    phone: "9818076543",
    email: "roshan@everestkeepsakes.example",
    address: "Dharan-10, Sunsari",
    description: "Handmade souvenirs and keepsakes.",
    status: "rejected",
    createdAt: "2026-08-19T11:20:00.000Z",
  },
  {
    id: "shop_suspended_lalitpur",
    name: "Lalitpur Gift Studio",
    ownerName: "Mina Maharjan",
    phone: "9803124567",
    email: "mina@lalitpurgift.example",
    address: "Patan Dhoka, Lalitpur",
    description: "Modern gift arrangements and celebration hampers.",
    status: "suspended",
    createdAt: "2026-02-14T06:30:00.000Z",
  },
]

interface DemoProductOwner {
  id: string
  name: string
}

const demoProductOwners: Record<string, DemoProductOwner> = {
  g3: { id: "shop_pokhara_bloom", name: "Pokhara Bloom & Bake" },
  g4: { id: "shop_pokhara_bloom", name: "Pokhara Bloom & Bake" },
  g5: { id: "shop_pokhara_bloom", name: "Pokhara Bloom & Bake" },
  g9: { id: "shop_suspended_lalitpur", name: "Lalitpur Gift Studio" },
  g10: { id: "shop_suspended_lalitpur", name: "Lalitpur Gift Studio" },
}

const platformProducts = seedGifts.map((gift) => {
  const owner = demoProductOwners[gift.id] ?? {
    id: PLATFORM_SHOP_ID,
    name: "Surprise Nepal Gifts",
  }
  return {
    ...withoutProductDeliveryFields(gift),
    shopId: owner.id,
    shopName: owner.name,
    submittedAt: gift.createdAt,
  }
})

const reviewDemoProducts: Gift[] = [
  {
    ...platformProducts[1],
    id: "gift_demo_pending",
    name: "Festive Birthday Hamper",
    status: "pending",
    submittedAt: "2025-02-18T09:30:00.000Z",
    rating: 0,
    reviewCount: 0,
  },
  {
    ...platformProducts[4],
    id: "gift_demo_rejected",
    name: "Personalized Memory Keepsake",
    status: "rejected",
    submittedAt: "2025-02-16T11:15:00.000Z",
    rejectionReason:
      "Please add clearer product photos and more detail about what is included.",
    rating: 0,
    reviewCount: 0,
  },
  {
    ...platformProducts[6],
    id: "gift_demo_inactive",
    name: "Classic Celebration Gift Box",
    status: "inactive",
    submittedAt: "2025-02-14T10:00:00.000Z",
    rating: 0,
    reviewCount: 0,
  },
  {
    ...platformProducts[7],
    id: "gift_demo_out_of_stock",
    name: "Seasonal Flower Basket",
    status: "active",
    inStock: false,
    stockCount: 0,
    submittedAt: "2025-02-12T10:00:00.000Z",
    rating: 0,
    reviewCount: 0,
  },
]

const seededProducts = [...platformProducts, ...reviewDemoProducts]

const seedSettlementStatuses: ShopSettlement[] = []

export function getShops(): Shop[] {
  const stored = storageGet<LegacyShop[]>(STORAGE_KEYS.SHOPS, seedShops)
  const saved = stored.map(withoutLegacyPassword)
  if (
    stored.some((shop) =>
      Object.prototype.hasOwnProperty.call(shop, "password"),
    )
  ) {
    storageSet(STORAGE_KEYS.SHOPS, saved)
  }
  const savedIds = new Set(saved.map((shop) => shop.id))
  return [...saved, ...seedShops.filter((shop) => !savedIds.has(shop.id))].map(
    (shop) => ({
      ...shop,
      commissionRate: shop.commissionRate ?? 10,
    }),
  )
}

export function registerShop(
  input: Omit<Shop, "id" | "status" | "createdAt">,
): Shop | null {
  const shop: Shop = {
    ...input,
    id: `shop_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  const shops = storageGetFresh(STORAGE_KEYS.SHOPS, seedShops)
  if (!storageSet(STORAGE_KEYS.SHOPS, [shop, ...shops])) return null
  addShopNotification({
    shopId: shop.id,
    title: "Registration submitted",
    message: "Your shop account is waiting for Admin approval.",
    type: "account",
  })
  return shop
}

export function updateShopStatus(id: string, status: ShopStatus): boolean {
  const shops = storageGetFresh(STORAGE_KEYS.SHOPS, seedShops)
  const shop = shops.find((item) => item.id === id)
  if (!shop || shop.status === status) return false
  const saved = storageSet(
    STORAGE_KEYS.SHOPS,
    shops.map((item) =>
      item.id === id
        ? { ...item, status, updatedAt: new Date().toISOString() }
        : item,
    ),
  )
  if (!saved) return false
  addShopNotification({
    shopId: id,
    title: status === "approved" ? "Shop approved" : `Shop ${status}`,
    message:
      status === "approved"
        ? "Your shop is approved. You can now sign in and submit gifts."
        : `Your shop account is now ${status}.`,
    type: "account",
  })
  return true
}

export function updateShopCommission(id: string, commissionRate: number): void {
  const rate = Math.min(100, Math.max(0, commissionRate))
  storageUpdate(STORAGE_KEYS.SHOPS, seedShops, (shops) =>
    shops.map((shop) =>
      shop.id === id
        ? { ...shop, commissionRate: rate, updatedAt: new Date().toISOString() }
        : shop,
    ),
  )
}

export function updateShop(
  id: string,
  updates: Pick<Shop, "name" | "ownerName" | "email" | "phone" | "address" | "status">,
  expectedUpdatedAt?: string | null,
): boolean {
  const shops = storageGetFresh(STORAGE_KEYS.SHOPS, seedShops)
  const previous = shops.find((shop) => shop.id === id)
  if (
    !previous ||
    (expectedUpdatedAt !== undefined &&
      (previous.updatedAt ?? null) !== expectedUpdatedAt)
  )
    return false
  const saved = storageSet(
    STORAGE_KEYS.SHOPS,
    shops.map((shop) =>
      shop.id === id
        ? { ...shop, ...updates, updatedAt: new Date().toISOString() }
        : shop,
    ),
  )
  if (saved && previous && previous.status !== updates.status) {
    addShopNotification({
      shopId: id,
      title:
        updates.status === "approved"
          ? "Shop approved"
          : `Shop ${updates.status}`,
      message:
        updates.status === "approved"
          ? "Your shop is approved. You can now sign in and submit gifts."
          : `Your shop account is now ${updates.status}.`,
      type: "account",
    })
  }
  return saved
}

export function getShopSettlements(): ShopSettlement[] {
  const saved = storageGet<ShopSettlement[]>(STORAGE_KEYS.SHOP_SETTLEMENTS, [])
  const unique = new Map<string, ShopSettlement>()
  ;[...saved, ...seedSettlementStatuses].forEach((settlement) => {
    if (!unique.has(settlement.id)) unique.set(settlement.id, settlement)
  })
  return [...unique.values()]
}

export function syncPendingShopSettlement(settlement: ShopSettlement): boolean {
  const settlements = storageGetFresh<ShopSettlement[]>(
    STORAGE_KEYS.SHOP_SETTLEMENTS,
    [],
  )
  const existing = settlements.find((item) => item.id === settlement.id)
  if (existing && existing.status !== "pending") return false

  if (settlement.grossSales <= 0) {
    if (!existing) return false
    const removed = storageSet(
      STORAGE_KEYS.SHOP_SETTLEMENTS,
      settlements.filter((item) => item.id !== settlement.id),
    )
    if (!removed)
      throw new Error(`Unable to remove pending settlement ${settlement.id}`)
    return true
  }

  const candidate = existing
    ? {
        ...settlement,
        status: "pending" as const,
        createdAt: existing.createdAt,
      }
    : settlement
  if (existing && JSON.stringify(existing) === JSON.stringify(candidate))
    return false
  const saved = storageSet(
    STORAGE_KEYS.SHOP_SETTLEMENTS,
    existing
      ? settlements.map((item) =>
          item.id === settlement.id ? candidate : item,
        )
      : [candidate, ...settlements],
  )
  if (!saved)
    throw new Error(`Unable to persist pending settlement ${settlement.id}`)
  return true
}

export function updateShopSettlementStatus(
  id: string,
  status: ShopSettlement["status"],
  paymentReference?: string,
): boolean {
  const settlements = storageGetFresh<ShopSettlement[]>(
    STORAGE_KEYS.SHOP_SETTLEMENTS,
    [],
  )
  const settlement = settlements.find((item) => item.id === id)
  if (!settlement) return false
  const allowedNext =
    settlement.status === "pending"
      ? "processing"
      : settlement.status === "processing"
        ? "paid"
        : null
  if (allowedNext !== status) return false
  const paidAt =
    status === "paid"
      ? (settlement.paidAt ?? new Date().toISOString())
      : settlement.paidAt
  return storageSet(
    STORAGE_KEYS.SHOP_SETTLEMENTS,
    settlements.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            ...(status === "paid"
              ? {
                  paidAt,
                  paymentReference:
                    paymentReference?.trim() ||
                    item.paymentReference ||
                    `SETTLEMENT-${item.id.toUpperCase()}`,
                }
              : {}),
          }
        : item,
    ),
  )
}

export function authenticateShop(email: string, password: string): Shop | null {
  if (!email.trim() || !password) return null
  const approvedShops = getShops().filter((shop) => shop.status === "approved")
  return (
    approvedShops.find(
      (shop) => shop.email.toLowerCase() === email.trim().toLowerCase(),
    ) ??
    approvedShops[0] ??
    null
  )
}

export function setShopSession(shopId: string): void {
  storageSet(STORAGE_KEYS.SHOP_SESSION, shopId)
}

export function getCurrentShop(): Shop | null {
  const id = storageGet<string | null>(STORAGE_KEYS.SHOP_SESSION, null)
  return id ? (getShops().find((shop) => shop.id === id) ?? null) : null
}

export function clearShopSession(): void {
  storageRemove(STORAGE_KEYS.SHOP_SESSION)
}

export function getProducts(): Gift[] {
  const saved = storageGet<Gift[] | null>(STORAGE_KEYS.PRODUCTS, null)
  if (!saved) return seededProducts

  const normalized = saved.map(withoutProductDeliveryFields)
  const missingDemoProducts = reviewDemoProducts.filter(
    (demoProduct) =>
      !normalized.some((product) => product.id === demoProduct.id),
  )
  const hadProductDeliveryFields = saved.some(
    (product) =>
      product.deliveryInfo !== undefined ||
      product.availableCities !== undefined ||
      product.estimatedDelivery !== undefined,
  )
  if (missingDemoProducts.length === 0 && !hadProductDeliveryFields)
    return normalized

  const products = [...normalized, ...missingDemoProducts]
  return products
}

export function getCatalogProducts(): Gift[] {
  const approvedShopIds = new Set(
    getShops()
      .filter((shop) => shop.status === "approved")
      .map((shop) => shop.id),
  )
  return getProducts().filter(
    (gift) =>
      gift.status === "active" &&
      gift.inStock &&
      gift.shopId !== undefined &&
      approvedShopIds.has(gift.shopId),
  )
}

export function getProduct(id: string): Gift | undefined {
  return getProducts().find((gift) => gift.id === id)
}

export function saveProduct(
  product: Gift,
  expectedUpdatedAt?: string | null,
): boolean {
  const products = storageGetFresh(STORAGE_KEYS.PRODUCTS, seededProducts)
  const existing = products.find((item) => item.id === product.id)
  if (
    existing &&
    expectedUpdatedAt !== undefined &&
    (existing.updatedAt ?? null) !== expectedUpdatedAt
  )
    return false
  const normalizedProduct = withoutProductDeliveryFields({
    ...product,
    updatedAt: new Date().toISOString(),
  })
  return storageSet(
    STORAGE_KEYS.PRODUCTS,
    existing
      ? products.map((item) =>
          item.id === product.id ? normalizedProduct : item,
        )
      : [normalizedProduct, ...products],
  )
}

export function updateProductStatus(
  id: string,
  status: Gift["status"],
  rejectionReason?: string,
  expectedUpdatedAt?: string | null,
): boolean {
  const products = storageGetFresh(STORAGE_KEYS.PRODUCTS, seededProducts)
  const product = products.find((item) => item.id === id)
  if (
    !product ||
    (product.status === status &&
      product.rejectionReason === rejectionReason) ||
    (expectedUpdatedAt !== undefined &&
      (product.updatedAt ?? null) !== expectedUpdatedAt)
  )
    return false
  const updated = storageSet(
    STORAGE_KEYS.PRODUCTS,
    products.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            rejectionReason,
            updatedAt: new Date().toISOString(),
          }
        : item,
    ),
  )
  if (updated && product.shopId) {
    addShopNotification({
      shopId: product.shopId,
      title:
        status === "active"
          ? `${product.name} approved`
          : `${product.name} ${status}`,
      message:
        status === "active"
          ? "Your gift is now published in the Surprise Nepal catalog."
          : rejectionReason || `Your gift status changed to ${status}.`,
      type: "product",
    })
  }
  return updated
}

export function updateProductFeatured(
  id: string,
  featured: boolean,
  expectedUpdatedAt?: string | null,
): boolean {
  const products = storageGetFresh(STORAGE_KEYS.PRODUCTS, seededProducts)
  const product = products.find((item) => item.id === id)
  if (
    !product ||
    product.featured === featured ||
    (expectedUpdatedAt !== undefined &&
      (product.updatedAt ?? null) !== expectedUpdatedAt)
  )
    return false
  return storageSet(
    STORAGE_KEYS.PRODUCTS,
    products.map((item) =>
      item.id === id
        ? { ...item, featured, updatedAt: new Date().toISOString() }
        : item,
    ),
  )
}

export function reserveProductStock(
  items: ProductStockRequest[],
): ProductStockReservationResult {
  const approvedShopIds = new Set(
    getShops()
      .filter((shop) => shop.status === "approved")
      .map((shop) => shop.id),
  )
  const requested = new Map<string, number>()
  items.forEach((item) =>
    requested.set(
      item.productId,
      (requested.get(item.productId) ?? 0) + item.quantity,
    ),
  )
  const products = storageGetFresh(STORAGE_KEYS.PRODUCTS, seededProducts)
  for (const [giftId, quantity] of requested) {
    const product = products.find((item) => item.id === giftId)
    if (
      !product ||
      product.status !== "active" ||
      !product.inStock ||
      !product.shopId ||
      !approvedShopIds.has(product.shopId)
    ) {
      return {
        ok: false,
        message: `${product?.name ?? "A gift"} is no longer available.`,
      }
    }
    if (product.stockCount < quantity) {
      return {
        ok: false,
        message: `Only ${product.stockCount} ${product.name} item${
          product.stockCount === 1 ? "" : "s"
        } remain in stock.`,
      }
    }
  }

  const authoritativeItems = [...requested].map(([giftId, quantity]) => ({
    gift: products.find((product) => product.id === giftId)!,
    quantity,
  }))
  const now = new Date().toISOString()
  const nextProducts = products.map((product) => {
    const quantity = requested.get(product.id)
    if (!quantity) return product
    const stockCount = product.stockCount - quantity
    return { ...product, stockCount, inStock: stockCount > 0, updatedAt: now }
  })
  if (!storageSet(STORAGE_KEYS.PRODUCTS, nextProducts)) {
    return {
      ok: false,
      message: "Inventory could not be reserved. Please try again.",
    }
  }
  return { ok: true, items: authoritativeItems }
}

export function releaseProductStock(items: CartItem[]): void {
  const released = new Map<string, number>()
  items.forEach((item) =>
    released.set(
      item.gift.id,
      (released.get(item.gift.id) ?? 0) + item.quantity,
    ),
  )
  storageUpdate(STORAGE_KEYS.PRODUCTS, seededProducts, (products) =>
    products.map((product) => {
      const quantity = released.get(product.id)
      if (!quantity) return product
      const stockCount = product.stockCount + quantity
      return {
        ...product,
        stockCount,
        inStock: stockCount > 0,
        updatedAt: new Date().toISOString(),
      }
    }),
  )
}

export function deleteProduct(id: string): boolean {
  const products = storageGetFresh(STORAGE_KEYS.PRODUCTS, seededProducts)
  if (!products.some((item) => item.id === id)) return false
  return storageSet(
    STORAGE_KEYS.PRODUCTS,
    products.filter((item) => item.id !== id),
  )
}

export function adjustProductStock(id: string, amount: number): Gift | null {
  const products = storageGetFresh(STORAGE_KEYS.PRODUCTS, seededProducts)
  const product = products.find((item) => item.id === id)
  if (!product) return null
  const stockCount = Math.max(0, product.stockCount + amount)
  const updated = {
    ...product,
    stockCount,
    inStock: stockCount > 0,
    status: stockCount === 0 ? "inactive" as const : product.status,
    updatedAt: new Date().toISOString(),
  }
  return storageSet(
    STORAGE_KEYS.PRODUCTS,
    products.map((item) => (item.id === id ? updated : item)),
  )
    ? updated
    : null
}

export function getShopProducts(shopId: string): Gift[] {
  return getProducts().filter((product) => product.shopId === shopId)
}

export function addShopNotification(
  input: Omit<ShopNotification, "id" | "createdAt">,
): ShopNotification {
  const notification: ShopNotification = {
    ...input,
    id: `shop_notification_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  }
  storageUpdate<ShopNotification[]>(
    STORAGE_KEYS.SHOP_NOTIFICATIONS,
    [],
    (notifications) => [notification, ...notifications],
  )
  return notification
}

export function getShopNotifications(shopId: string): ShopNotification[] {
  return storageGet<ShopNotification[]>(
    STORAGE_KEYS.SHOP_NOTIFICATIONS,
    [],
  ).filter((notification) => notification.shopId === shopId)
}
