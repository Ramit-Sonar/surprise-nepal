/** Centralised localStorage key names — prevents silent typos */
export const STORAGE_KEYS = {
  CART: "giftSurprise_cart",
  WISHLIST: "giftSurprise_wishlist",
  USER: "giftSurprise_user",
  ORDERS: "giftSurprise_orders",
  PAYMENT_QR: "giftSurprise_paymentQR",
  TEST_USERS: "giftSurprise_testUsers",
  ADMINS: "giftSurprise_admins",
  SHOPS: "giftSurprise_shops",
  SHOP_SESSION: "giftSurprise_shopSession",
  PRODUCTS: "giftSurprise_products",
  SHOP_NOTIFICATIONS: "giftSurprise_shopNotifications",
  SHOP_SETTLEMENTS: "giftSurprise_shopSettlements",
  DELIVERY_SETTINGS: "giftSurprise_deliverySettings",
  COUPONS: "giftSurprise_coupons",
  ADMIN_INVITES: "giftSurprise_admin_invite_codes",
  ADMIN_NOTIFICATION_SETTINGS: "giftSurprise_notifSettings",
  ADMIN_NOTIFICATION_READ: "giftSurprise_notifRead",
} as const

export const SESSION_KEYS = {
  PENDING_COUPON: "pendingCoupon",
  REDIRECT_AFTER_LOGIN: "redirectAfterLogin",
} as const

const MISSING = Symbol("missing-storage-value")
const cache = new Map<string, unknown | typeof MISSING>()
type StorageListener = (key: string | null) => void
const listeners = new Set<StorageListener>()

function notifyStorageListeners(key: string | null): void {
  listeners.forEach((listener) => listener(key))
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key) cache.delete(event.key)
    else cache.clear()
    notifyStorageListeners(event.key)
  })
}

export function storageGet<T>(key: string, fallback: T): T {
  if (cache.has(key)) {
    const cached = cache.get(key)
    return cached === MISSING ? fallback : cached as T
  }

  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      cache.set(key, MISSING)
      return fallback
    }
    const value = JSON.parse(raw) as T
    cache.set(key, value)
    return value
  } catch {
    return fallback
  }
}

export function storageGetRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    cache.set(key, value)
    notifyStorageListeners(key)
    return true
  } catch {
    return false
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key)
    cache.set(key, MISSING)
    notifyStorageListeners(key)
  } catch {
    // ignore
  }
}

/**
 * Applies a mutation to the latest persisted value instead of a potentially
 * stale component snapshot. The browser storage operation is synchronous, so
 * all writers in this document observe the completed mutation immediately.
 */
export function storageUpdate<T>(
  key: string,
  fallback: T,
  updater: (current: T) => T,
): T {
  cache.delete(key)
  const next = updater(storageGet(key, fallback))
  storageSet(key, next)
  return next
}

export function storageGetFresh<T>(key: string, fallback: T): T {
  cache.delete(key)
  return storageGet(key, fallback)
}

export function subscribeStorage(
  keys: readonly string[] | null,
  listener: StorageListener,
): () => void {
  const keySet = keys ? new Set(keys) : null
  const filteredListener: StorageListener = (key) => {
    if (key === null || keySet === null || keySet.has(key)) listener(key)
  }
  listeners.add(filteredListener)
  return () => listeners.delete(filteredListener)
}

export function sessionStorageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function sessionStorageSet(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function sessionStorageRemove(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Ignore unavailable browser storage.
  }
}
