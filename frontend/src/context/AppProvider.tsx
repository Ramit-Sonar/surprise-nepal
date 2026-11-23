import {
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import type {
  AppliedCoupon,
  CartItem,
  CheckoutData,
  CheckoutSubmission,
  Coupon,
  DeliveryLocation,
  Gift,
  Order,
  OrderAuthorityResult,
  OrderStatus,
  PaymentProofSubmission,
  PaymentReviewSubmission,
  PaymentStatus,
  Review,
  Toast,
  User,
} from "../types/index"
import { getBootstrapData } from "./bootstrapData"
import {
  STORAGE_KEYS,
  storageGet,
  storageGetRaw,
  storageGetFresh,
  storageSet,
  storageRemove,
  storageUpdate,
  subscribeStorage,
} from "../services/storage"
import {
  getCatalogProducts,
  releaseProductStock,
  reserveProductStock,
} from "../features/products/services/productService"
import { getShops } from "../features/shops/services/shopService"
import {
  canAdminTransitionOrder,
  canShopTransitionOrder,
  deriveOrderStatusFromItems,
  normalizeOrderForMarketplace,
} from "../features/orders/services/orderService"
import { syncMonthlySettlements } from "../features/settlements/services/settlementService"
import { getDeliverySettings } from "../features/delivery/services/deliveryService"
import { validateCoupon } from "../features/coupons/services/couponService"
import {
  AppActionsContext,
  ToastStateContext,
  type AppActionsValue,
} from "./useApp"
import { SessionStateContext } from "../features/auth/hooks/useSessionState"
import { CartStateContext } from "../features/cart/hooks/useCartState"
import { CheckoutStateContext } from "../features/payments/hooks/useCheckoutState"
import { OrdersStateContext } from "../features/orders/hooks/useOrdersState"

let mockOrders: Order[]
let mockUser: User
let mockReviews: Review[]
let mockCoupons: Coupon[]

interface AppState {
  user: User | null
  cart: CartItem[]
  wishlist: string[]
  toasts: Toast[]
  checkoutData: Partial<CheckoutData>
  orders: Order[]
  reviews: Review[]
  isMenuOpen: boolean
  paymentQR: string | null
  coupons: Coupon[]
  appliedCoupon: AppliedCoupon | null
  checkoutItems: CartItem[]
  checkoutSource: "buy_now" | "cart" | null
}

interface Action<Type extends string> {
  type: Type
}

interface PayloadAction<Type extends string, Payload> extends Action<Type> {
  payload: Payload
}

interface CartPayload {
  gift: Gift
  quantity?: number
}

interface CartQuantityPayload {
  giftId: string
  quantity: number
}

interface BuyNowPayload {
  gift: Gift
  quantity: number
}

interface OrderPaymentPayload {
  orderId: string
  status: PaymentStatus
  screenshots?: string[]
}

interface OrderStatusPayload {
  orderId: string
  status: OrderStatus
}

interface ShopFulfillmentPayload {
  orderId: string
  shopId: string
  status: "preparing" | "ready"
}

interface AddressUpdatePayload {
  index: number
  address: DeliveryLocation
}

type AppAction = PayloadAction<"SET_USER", User | null> | PayloadAction<"ADD_TO_CART", CartPayload> | PayloadAction<"REMOVE_FROM_CART", string> | PayloadAction<"UPDATE_CART_QUANTITY", CartQuantityPayload> | Action<"CLEAR_CART"> | PayloadAction<"TOGGLE_WISHLIST", string> | PayloadAction<"ADD_TOAST", Toast> | PayloadAction<"REMOVE_TOAST", string> | PayloadAction<"SET_CHECKOUT_DATA", Partial<CheckoutData>> | Action<"CLEAR_CHECKOUT_DATA"> | PayloadAction<"START_BUY_NOW", BuyNowPayload> | Action<"START_CART_CHECKOUT"> | PayloadAction<"ADD_ORDER", Order> | PayloadAction<"RECEIVE_AUTHORITATIVE_ORDER", Order> | PayloadAction<"SET_ORDERS", Order[]> | PayloadAction<"SET_COUPONS", Coupon[]> | PayloadAction<"SYNC_CATALOG_ITEMS", Gift[]> | PayloadAction<"ADD_REVIEW", Review> | PayloadAction<"MARK_REVIEW_HELPFUL", string> | PayloadAction<"SET_MENU_OPEN", boolean> | PayloadAction<"SET_PAYMENT_QR", string | null> | PayloadAction<"UPDATE_ORDER_PAYMENT", OrderPaymentPayload> | PayloadAction<"CONFIRM_COD_ORDER", string> | PayloadAction<"UPDATE_ORDER_STATUS", OrderStatusPayload> | PayloadAction<"UPDATE_SHOP_FULFILLMENT", ShopFulfillmentPayload> | PayloadAction<"ADD_ADDRESS", DeliveryLocation> | PayloadAction<"UPDATE_ADDRESS", AddressUpdatePayload> | PayloadAction<"DELETE_ADDRESS", number> | PayloadAction<"APPLY_COUPON", AppliedCoupon> | Action<"REMOVE_COUPON"> | PayloadAction<"ADD_COUPON", Coupon> | PayloadAction<"UPDATE_COUPON", Coupon> | PayloadAction<"DELETE_COUPON", string> | PayloadAction<"TOGGLE_COUPON_STATUS", string>

function createInitialState(): AppState {
  const bootstrapData = getBootstrapData()
  mockOrders = bootstrapData.orders
  mockUser = bootstrapData.user
  mockReviews = bootstrapData.reviews
  mockCoupons = bootstrapData.coupons

  return {
    user: null,
    cart: [],
    wishlist: [],
    toasts: [],
    checkoutData: {},
    orders: mockOrders,
    reviews: mockReviews,
    isMenuOpen: false,
    paymentQR: null,
    coupons: mockCoupons,
    appliedCoupon: null,
    checkoutItems: [],
    checkoutSource: null,
  }
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }

    case "ADD_TO_CART": {
      const { gift, quantity = 1 } = action.payload
      const existing = state.cart.find((item) => item.gift.id === gift.id)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.gift.id === gift.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, gift.stockCount),
                }
              : item,
          ),
        }
      }
      return { ...state, cart: [...state.cart, { gift, quantity }] }
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.gift.id !== action.payload),
      }

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.gift.id === action.payload.giftId
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(action.payload.quantity, item.gift.stockCount),
                ),
              }
            : item,
        ),
      }

    case "CLEAR_CART":
      return { ...state, cart: [] }

    case "TOGGLE_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      }

    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      }

    case "SET_CHECKOUT_DATA":
      return {
        ...state,
        checkoutData: { ...state.checkoutData, ...action.payload },
      }

    case "CLEAR_CHECKOUT_DATA":
      return {
        ...state,
        checkoutData: {},
        checkoutItems: [],
        checkoutSource: null,
      }

    case "START_BUY_NOW":
      return {
        ...state,
        checkoutItems: [
          { gift: action.payload.gift, quantity: action.payload.quantity },
        ],
        checkoutSource: "buy_now",
        checkoutData: {},
        appliedCoupon: null,
      }

    case "START_CART_CHECKOUT":
      return {
        ...state,
        checkoutItems: state.cart.map((item) => ({ ...item })),
        checkoutSource: "cart",
        checkoutData: {},
        appliedCoupon: null,
      }

    case "ADD_ORDER":
      if (state.orders.some((order) => order.id === action.payload.id))
        return state
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        coupons: action.payload.couponId
          ? state.coupons.map((coupon) =>
              coupon.id === action.payload.couponId
                ? { ...coupon, usageCount: coupon.usageCount + 1 }
                : coupon,
            )
          : state.coupons,
      }

    case "RECEIVE_AUTHORITATIVE_ORDER":
      return {
        ...state,
        orders: state.orders.some((order) => order.id === action.payload.id)
          ? state.orders.map((order) =>
              order.id === action.payload.id ? action.payload : order,
            )
          : [action.payload, ...state.orders],
      }

    case "SET_ORDERS":
      return { ...state, orders: action.payload }

    case "SET_COUPONS":
      return { ...state, coupons: action.payload }

    case "SYNC_CATALOG_ITEMS": {
      const catalog = new Map(action.payload.map((gift) => [gift.id, gift]))
      const syncItems = (items: CartItem[]) =>
        items.flatMap((item) => {
          const gift = catalog.get(item.gift.id)
          if (!gift) return []
          return [
            {
              ...item,
              gift,
              quantity: Math.min(item.quantity, gift.stockCount),
            },
          ]
        })
      return {
        ...state,
        cart: syncItems(state.cart),
        checkoutItems: syncItems(state.checkoutItems),
      }
    }

    case "ADD_REVIEW":
      return { ...state, reviews: [action.payload, ...state.reviews] }

    case "MARK_REVIEW_HELPFUL":
      return {
        ...state,
        reviews: state.reviews.map((r) =>
          r.id === action.payload ? { ...r, helpful: r.helpful + 1 } : r,
        ),
      }

    case "SET_MENU_OPEN":
      return { ...state, isMenuOpen: action.payload }

    case "SET_PAYMENT_QR":
      return { ...state, paymentQR: action.payload }

    case "UPDATE_ORDER_PAYMENT":
      return {
        ...state,
        orders: state.orders.map((o) => {
          const canUpdate =
            o.id === action.payload.orderId && o.status === "pending"
          if (!canUpdate) return o
          const now = new Date().toISOString()
          return o.id === action.payload.orderId
            ? {
                ...o,
                paymentStatus: action.payload.status,
                // When payment verified, also confirm the order
                ...(action.payload.status === "verified"
                  ? {
                      status: "confirmed" as const,
                      items: o.items.map((item) => ({
                        ...item,
                        fulfillmentStatus: "confirmed" as const,
                      })),
                      statusTimestamps: {
                        ...o.statusTimestamps,
                        confirmed: now,
                      },
                    }
                  : {}),
                ...(action.payload.screenshots !== undefined
                  ? { paymentScreenshots: action.payload.screenshots }
                  : {}),
                updatedAt: now,
              }
            : o
        }),
      }

    case "CONFIRM_COD_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (
            o.id !== action.payload ||
            !canAdminTransitionOrder(o, "confirmed")
          )
            return o
          const now = new Date().toISOString()
          return {
            ...o,
            status: "confirmed" as const,
            items: o.items.map((item) => ({
              ...item,
              fulfillmentStatus: "confirmed" as const,
            })),
            statusTimestamps: { ...o.statusTimestamps, confirmed: now },
            updatedAt: now,
          }
        }),
      }

    case "UPDATE_ORDER_STATUS": {
      const target = state.orders.find(
        (order) => order.id === action.payload.orderId,
      )
      const validCancellation =
        target &&
        action.payload.status === "cancelled" &&
        canAdminTransitionOrder(target, "cancelled")
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (
            o.id !== action.payload.orderId ||
            !canAdminTransitionOrder(o, action.payload.status)
          )
            return o
          const now = new Date().toISOString()
          return {
            ...o,
            status: action.payload.status,
            items:
              action.payload.status === "collected"
                ? o.items.map((item) => ({
                    ...item,
                    fulfillmentStatus: "collected" as const,
                    collectedAt: now,
                  }))
                : o.items,
            statusTimestamps: {
              ...o.statusTimestamps,
              [action.payload.status]: now,
            },
            ...(action.payload.status === "cancelled" &&
            o.inventoryReservedAt &&
            !o.inventoryRestoredAt
              ? { inventoryRestoredAt: now }
              : {}),
            updatedAt: now,
          }
        }),
        coupons:
          validCancellation && target.couponId
            ? state.coupons.map((coupon) =>
                coupon.id === target.couponId
                  ? {
                      ...coupon,
                      usageCount: Math.max(0, coupon.usageCount - 1),
                    }
                  : coupon,
              )
            : state.coupons,
      }
    }

    case "UPDATE_SHOP_FULFILLMENT":
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== action.payload.orderId) return order
          if (
            !canShopTransitionOrder(
              order,
              action.payload.shopId,
              action.payload.status,
            )
          )
            return order
          const now = new Date().toISOString()
          const items = order.items.map((item) => {
            if ((item.shopId ?? item.gift.shopId) !== action.payload.shopId)
              return item
            return {
              ...item,
              fulfillmentStatus: action.payload.status,
              ...(action.payload.status === "preparing"
                ? { preparationStartedAt: now }
                : {}),
              ...(action.payload.status === "ready" ? { readyAt: now } : {}),
            }
          })
          const updated = { ...order, items, updatedAt: now }
          const status = deriveOrderStatusFromItems(updated)
          return {
            ...updated,
            status,
            statusTimestamps:
              status !== order.status
                ? { ...order.statusTimestamps, [status]: now }
                : order.statusTimestamps,
          }
        }),
      }

    case "ADD_ADDRESS":
      if (!state.user) return state
      return {
        ...state,
        user: {
          ...state.user,
          savedAddresses: [...state.user.savedAddresses, action.payload],
        },
      }

    case "UPDATE_ADDRESS":
      if (!state.user) return state
      return {
        ...state,
        user: {
          ...state.user,
          savedAddresses: state.user.savedAddresses.map((a, i) =>
            i === action.payload.index ? action.payload.address : a,
          ),
        },
      }

    case "DELETE_ADDRESS":
      if (!state.user) return state
      return {
        ...state,
        user: {
          ...state.user,
          savedAddresses: state.user.savedAddresses.filter(
            (_, i) => i !== action.payload,
          ),
        },
      }

    case "APPLY_COUPON":
      return { ...state, appliedCoupon: action.payload }

    case "REMOVE_COUPON":
      return { ...state, appliedCoupon: null }

    case "ADD_COUPON":
      return { ...state, coupons: [action.payload, ...state.coupons] }

    case "UPDATE_COUPON":
      return {
        ...state,
        coupons: state.coupons.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      }

    case "DELETE_COUPON":
      return {
        ...state,
        coupons: state.coupons.filter((c) => c.id !== action.payload),
      }

    case "TOGGLE_COUPON_STATUS":
      return {
        ...state,
        coupons: state.coupons.map((c) =>
          c.id === action.payload
            ? {
                ...c,
                status:
                  c.status === "active"
                    ? "inactive" as const
                    : "active" as const,
              }
            : c,
        ),
      }

    default:
      return state
  }
}

// Pre-seed a "google" test customer into localStorage on first visit
const GOOGLE_TEST_USER: User = {
  id: "test_google",
  name: "Google",
  email: "google@test.com",
  phone: "9800000001",
  savedAddresses: [],
  joinedAt: new Date().toISOString(),
  isAdmin: false,
}

interface SavedAdmin {
  email: string
  name: string
}
const RETIRED_SECTION_DEMO_ORDER_IDS = new Set([
  "ORD-POKHARA-JUL-001",
  "ORD-POKHARA-AUG-001",
  "ORD-POKHARA-SEP-001",
  "ORD-LALITPUR-JUL-001",
  "ORD-LALITPUR-AUG-001",
])

function hydrateOrders(savedOrders: Order[] | null): Order[] {
  const shops = getShops()
  if (!savedOrders)
    return mockOrders.map((order) => normalizeOrderForMarketplace(order, shops))
  const saved = savedOrders
    .filter((order) => !RETIRED_SECTION_DEMO_ORDER_IDS.has(order.id))
    .map((order) => {
      const hydrated = {
        ...order,
        customerId: order.customerId ?? null,
      }
      if (
        hydrated.paymentMethod !== "Cash on Delivery" &&
        hydrated.paymentStatus !== "verified" &&
        hydrated.status !== "pending" &&
        hydrated.status !== "cancelled"
      ) {
        return { ...hydrated, status: "pending" as const }
      }
      return hydrated
    })
  const savedIds = new Set(saved.map((order) => order.id))
  return [
    ...saved,
    ...mockOrders.filter((order) => !savedIds.has(order.id)),
  ].map((order) => normalizeOrderForMarketplace(order, shops))
}

function loadPaymentQR(): string | null {
  const raw = storageGetRaw(STORAGE_KEYS.PAYMENT_QR)
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "string" ? parsed : null
  } catch {
    // Backward compatibility for QR values stored before shared storage syncing.
    return raw
  }
}

function seedTestUser() {
  const existing = storageGet<User[]>(STORAGE_KEYS.TEST_USERS, [])
  if (!existing.find((u) => u.id === GOOGLE_TEST_USER.id)) {
    storageSet(STORAGE_KEYS.TEST_USERS, [...existing, GOOGLE_TEST_USER])
  }
}
seedTestUser()

export function AppProvider({ children }: { children: ReactNode }) {
  const initialState = useMemo(createInitialState, [])
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const savedCart = storageGet<CartItem[] | null>(STORAGE_KEYS.CART, null)
      const savedWishlist = storageGet<string[] | null>(
        STORAGE_KEYS.WISHLIST,
        null,
      )
      const savedUser = storageGet<User | null>(STORAGE_KEYS.USER, null)
      const savedOrders = storageGet<Order[] | null>(STORAGE_KEYS.ORDERS, null)
      const savedQR = loadPaymentQR()
      return {
        ...init,
        cart: savedCart ?? [],
        wishlist: savedWishlist ?? [],
        user: savedUser,
        coupons: storageGet(STORAGE_KEYS.COUPONS, init.coupons).map(
          (coupon) => ({
            ...coupon,
            publishedOnSite: coupon.publishedOnSite ?? false,
          }),
        ),
        orders: hydrateOrders(savedOrders),
        paymentQR: savedQR ?? null,
      }
    } catch {
      return init
    }
  })
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const syncOrders = () => {
      dispatch({
        type: "SET_ORDERS",
        payload: hydrateOrders(
          storageGet<Order[] | null>(STORAGE_KEYS.ORDERS, null),
        ),
      })
    }
    const syncCoupons = () => {
      dispatch({
        type: "SET_COUPONS",
        payload: storageGet(STORAGE_KEYS.COUPONS, mockCoupons),
      })
    }
    const syncCatalogItems = () => {
      dispatch({ type: "SYNC_CATALOG_ITEMS", payload: getCatalogProducts() })
    }
    const syncPaymentQR = () => {
      dispatch({ type: "SET_PAYMENT_QR", payload: loadPaymentQR() })
    }
    return subscribeStorage(
      [
        STORAGE_KEYS.ORDERS,
        STORAGE_KEYS.COUPONS,
        STORAGE_KEYS.PRODUCTS,
        STORAGE_KEYS.SHOPS,
        STORAGE_KEYS.PAYMENT_QR,
      ],
      (key) => {
        if (key === null || key === STORAGE_KEYS.ORDERS) syncOrders()
        if (key === null || key === STORAGE_KEYS.COUPONS) syncCoupons()
        if (
          key === null ||
          key === STORAGE_KEYS.PRODUCTS ||
          key === STORAGE_KEYS.SHOPS
        ) {
          syncCatalogItems()
        }
        if (key === null || key === STORAGE_KEYS.PAYMENT_QR) syncPaymentQR()
      },
    )
  }, [])

  useEffect(() => {
    storageUpdate<Order[]>(STORAGE_KEYS.ORDERS, [], (current) =>
      hydrateOrders(current.length > 0 ? current : null),
    )
  }, [])

  useEffect(() => {
    let running = false
    let retryTimer: number | null = null
    let retryCount = 0
    const scheduleRetry = (sync: () => void) => {
      if (retryTimer !== null || retryCount >= 3) {
        if (retryCount >= 3) {
          console.error(
            "[monthly-settlements] Retry limit reached; next hourly run will retry",
          )
        }
        return
      }
      retryCount += 1
      retryTimer = window.setTimeout(() => {
        retryTimer = null
        sync()
      }, 30 * 1000)
    }
    const sync = () => {
      if (running) return
      running = true
      try {
        const result = syncMonthlySettlements(state.orders)
        if (result.failures.length > 0) scheduleRetry(sync)
        else retryCount = 0
      } catch (error) {
        console.error("[monthly-settlements] Unexpected job failure", error)
        scheduleRetry(sync)
      } finally {
        running = false
      }
    }
    const initialRun = window.setTimeout(sync, 0)
    const interval = window.setInterval(sync, 60 * 60 * 1000)
    return () => {
      window.clearTimeout(initialRun)
      if (retryTimer !== null) window.clearTimeout(retryTimer)
      window.clearInterval(interval)
    }
  }, [state.orders])

  useEffect(() => {
    storageSet(STORAGE_KEYS.CART, state.cart)
  }, [state.cart])

  useEffect(() => {
    storageSet(STORAGE_KEYS.WISHLIST, state.wishlist)
  }, [state.wishlist])

  useEffect(() => {
    if (state.user) {
      storageSet(STORAGE_KEYS.USER, state.user)
    } else {
      storageRemove(STORAGE_KEYS.USER)
    }
  }, [state.user])

  const addToCart = useCallback((gift: Gift, quantity = 1) => {
    dispatch({ type: "ADD_TO_CART", payload: { gift, quantity } })
  }, [])

  const removeFromCart = useCallback((giftId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: giftId })
  }, [])

  const updateCartQuantity = useCallback((giftId: string, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { giftId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const toggleWishlist = useCallback((giftId: string) => {
    dispatch({ type: "TOGGLE_WISHLIST", payload: giftId })
  }, [])

  const isInWishlist = useCallback((giftId: string) => {
    return stateRef.current.wishlist.includes(giftId)
  }, [])

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = `toast_${Date.now()}_${Math.random()}`
      dispatch({ type: "ADD_TOAST", payload: { id, message, type } })
      setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", payload: id })
      }, 3500)
    },
    [],
  )

  const loginCustomer = useCallback((email: string, name?: string) => {
    // Check saved test users first
    const saved = storageGet<User[]>(STORAGE_KEYS.TEST_USERS, [])
    const resolved =
      saved.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
    const user: User = resolved ?? {
      ...mockUser,
      email,
      name: name ?? email.split("@")[0],
      isAdmin: false,
    }
    dispatch({ type: "SET_USER", payload: user })
  }, [])

  // Returns true on success, false on bad credentials.
  // Credential verification happens server-side in production.
  const loginAdmin = useCallback(
    (email: string, password: string, name?: string): boolean => {
      if (!email.trim() || !password) return false
      const savedAdmins = storageGet<SavedAdmin[]>(STORAGE_KEYS.ADMINS, [])

      // If registering (name provided), persist to admin list
      if (name) {
        const updated = [
          ...savedAdmins.filter((a) => a.email !== email),
          { email, name },
        ]
        storageSet(STORAGE_KEYS.ADMINS, updated)
      }
      const adminName =
        name ?? savedAdmins.find((a) => a.email === email)?.name ?? "Admin"
      const user: User = { ...mockUser, email, name: adminName, isAdmin: true }
      dispatch({ type: "SET_USER", payload: user })
      return true
    },
    [],
  )

  const logout = useCallback(() => {
    dispatch({ type: "SET_USER", payload: null })
  }, [])

  const setCheckoutData = useCallback((data: Partial<CheckoutData>) => {
    dispatch({ type: "SET_CHECKOUT_DATA", payload: data })
  }, [])

  const clearCheckoutData = useCallback(() => {
    dispatch({ type: "CLEAR_CHECKOUT_DATA" })
  }, [])

  const startBuyNow = useCallback((gift: Gift, quantity: number) => {
    dispatch({ type: "START_BUY_NOW", payload: { gift, quantity } })
  }, [])

  const startCartCheckout = useCallback(() => {
    dispatch({ type: "START_CART_CHECKOUT" })
  }, [])

  const commitSharedAction = useCallback(
    (
      action: Extract<AppAction, { type: "ADD_ORDER" } | {
        type: "UPDATE_ORDER_PAYMENT"
      } | { type: "CONFIRM_COD_ORDER" } | { type: "UPDATE_ORDER_STATUS" } | {
        type: "UPDATE_SHOP_FULFILLMENT"
      }>,
    ) => {
      const targetId =
        action.type === "ADD_ORDER"
          ? action.payload.id
          : action.type === "CONFIRM_COD_ORDER"
            ? action.payload
            : action.payload.orderId
      const latestCoupons = storageGetFresh(STORAGE_KEYS.COUPONS, mockCoupons)
      const latestOrders = hydrateOrders(
        storageGetFresh<Order[] | null>(STORAGE_KEYS.ORDERS, null),
      )
      const previousOrder = latestOrders.find((order) => order.id === targetId)
      const next = reducer(
        { ...stateRef.current, orders: latestOrders, coupons: latestCoupons },
        action,
      )
      const nextOrder = next.orders.find((order) => order.id === targetId)
      if (previousOrder === nextOrder) {
        return { previousOrder, nextOrder, committed: false }
      }
      if (!storageSet(STORAGE_KEYS.ORDERS, next.orders)) {
        return { previousOrder, nextOrder: previousOrder, committed: false }
      }
      if (
        next.coupons !== latestCoupons &&
        !storageSet(STORAGE_KEYS.COUPONS, next.coupons)
      ) {
        storageSet(STORAGE_KEYS.ORDERS, latestOrders)
        return { previousOrder, nextOrder: previousOrder, committed: false }
      }
      return { previousOrder, nextOrder, committed: true }
    },
    [],
  )

  const placeOrder = useCallback(
    async (submission: CheckoutSubmission): Promise<OrderAuthorityResult> => {
      // Compatibility path for the current local-only prototype. The request shape
      // intentionally matches a future backend command and contains no financial
      // values or statuses. Replace this implementation with an API call; the UI
      // should continue consuming the returned authoritative Order unchanged.
      const reservation = reserveProductStock(submission.items)
      if (!reservation.ok) return reservation

      const currentShops = getShops()
      const items = reservation.items.map((item) => ({
        gift: item.gift,
        quantity: item.quantity,
        price: item.gift.discountPrice ?? item.gift.price,
      }))
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
      const latestCoupons = storageGetFresh(STORAGE_KEYS.COUPONS, mockCoupons)
      const coupon = submission.couponCode
        ? latestCoupons.find(
            (candidate) =>
              candidate.code.toUpperCase() ===
              submission.couponCode?.trim().toUpperCase(),
          )
        : undefined
      const couponResult = coupon
        ? validateCoupon(coupon.code, latestCoupons, subtotal)
        : null
      if (submission.couponCode && (!coupon || !couponResult?.valid)) {
        releaseProductStock(reservation.items)
        return {
          ok: false as const,
          message: "The selected coupon changed or is no longer available.",
        }
      }

      const applied = couponResult?.valid ? couponResult.applied : null
      const deliveryFee = applied?.deliveryFree
        ? 0
        : getDeliverySettings().defaultDeliveryFee
      const discount =
        applied && !applied.deliveryFree ? applied.discountAmount : 0
      const total = Math.max(0, subtotal + deliveryFee - discount)
      const now = new Date().toISOString()
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const compatibilityOrder = normalizeOrderForMarketplace(
        {
          id: orderId,
          customerId: stateRef.current.user?.isAdmin
            ? null
            : (stateRef.current.user?.id ?? null),
          mode: submission.mode,
          items,
          recipient: submission.recipient,
          location: submission.location,
          deliveryDate: submission.deliveryDate,
          deliveryTime: submission.deliveryTime,
          status: "pending",
          subtotal,
          deliveryFee,
          discount,
          total,
          paymentMethod: submission.paymentMethod,
          paymentStatus:
            submission.paymentMethod === "QR Transfer"
              ? "screenshot_submitted"
              : "pending",
          paymentScreenshots: submission.paymentProofReferences,
          createdAt: now,
          updatedAt: now,
          inventoryReservedAt: now,
          couponId: applied?.coupon.id,
        },
        currentShops,
      )
      const { previousOrder, nextOrder, committed } = commitSharedAction({
        type: "ADD_ORDER",
        payload: compatibilityOrder,
      })
      if (!committed || previousOrder || !nextOrder) {
        releaseProductStock(reservation.items)
        return {
          ok: false as const,
          message: "This order could not be created. Please try again.",
        }
      }
      dispatch({ type: "RECEIVE_AUTHORITATIVE_ORDER", payload: nextOrder })
      if (stateRef.current.checkoutSource === "cart")
        dispatch({ type: "CLEAR_CART" })
      dispatch({ type: "CLEAR_CHECKOUT_DATA" })
      return { ok: true as const, order: nextOrder }
    },
    [commitSharedAction],
  )

  const addReview = useCallback(
    (review: Omit<Review, "id" | "createdAt" | "helpful">) => {
      const full: Review = {
        ...review,
        id: `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString().split("T")[0],
        helpful: 0,
      }
      dispatch({ type: "ADD_REVIEW", payload: full })
    },
    [],
  )

  const markReviewHelpful = useCallback((reviewId: string) => {
    dispatch({ type: "MARK_REVIEW_HELPFUL", payload: reviewId })
  }, [])

  const setMenuOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_MENU_OPEN", payload: open })
  }, [])

  const setPaymentQR = useCallback((qr: string | null) => {
    if (qr) storageSet(STORAGE_KEYS.PAYMENT_QR, qr)
    else storageRemove(STORAGE_KEYS.PAYMENT_QR)
    dispatch({ type: "SET_PAYMENT_QR", payload: qr })
  }, [])

  const submitPaymentProof = useCallback(
    async ({ orderId, paymentProofReferences }: PaymentProofSubmission) => {
      const result = commitSharedAction({
        type: "UPDATE_ORDER_PAYMENT",
        payload: {
          orderId,
          status: "screenshot_submitted",
          screenshots: paymentProofReferences,
        },
      })
      if (!result.committed || !result.nextOrder) {
        return {
          ok: false as const,
          message: "Payment status changed before the upload completed.",
        }
      }
      dispatch({
        type: "RECEIVE_AUTHORITATIVE_ORDER",
        payload: result.nextOrder,
      })
      return { ok: true as const, order: result.nextOrder }
    },
    [commitSharedAction],
  )

  const reviewPayment = useCallback(
    async ({ orderId, decision }: PaymentReviewSubmission) => {
      const result = commitSharedAction({
        type: "UPDATE_ORDER_PAYMENT",
        payload: { orderId, status: decision },
      })
      if (!result.committed || !result.nextOrder) {
        return { ok: false as const, message: "Payment changed elsewhere." }
      }
      dispatch({
        type: "RECEIVE_AUTHORITATIVE_ORDER",
        payload: result.nextOrder,
      })
      return { ok: true as const, order: result.nextOrder }
    },
    [commitSharedAction],
  )

  const confirmCODOrder = useCallback(
    async (orderId: string) => {
      const result = commitSharedAction({
        type: "CONFIRM_COD_ORDER",
        payload: orderId,
      })
      if (!result.committed || !result.nextOrder) {
        return {
          ok: false as const,
          message: "Order changed elsewhere and could not be confirmed.",
        }
      }
      dispatch({
        type: "RECEIVE_AUTHORITATIVE_ORDER",
        payload: result.nextOrder,
      })
      return { ok: true as const, order: result.nextOrder }
    },
    [commitSharedAction],
  )

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const { previousOrder, nextOrder, committed } = commitSharedAction({
        type: "UPDATE_ORDER_STATUS",
        payload: { orderId, status },
      })
      if (
        committed &&
        status === "cancelled" &&
        previousOrder?.inventoryReservedAt &&
        !previousOrder.inventoryRestoredAt &&
        nextOrder?.inventoryRestoredAt
      )
        releaseProductStock(nextOrder.items)
      return committed
    },
    [commitSharedAction],
  )

  const updateShopFulfillment = useCallback(
    (orderId: string, shopId: string, status: "preparing" | "ready") => {
      return commitSharedAction({
        type: "UPDATE_SHOP_FULFILLMENT",
        payload: { orderId, shopId, status },
      }).committed
    },
    [commitSharedAction],
  )

  const addAddress = useCallback((address: DeliveryLocation) => {
    dispatch({ type: "ADD_ADDRESS", payload: address })
  }, [])

  const updateAddress = useCallback(
    (index: number, address: DeliveryLocation) => {
      dispatch({ type: "UPDATE_ADDRESS", payload: { index, address } })
    },
    [],
  )

  const deleteAddress = useCallback((index: number) => {
    dispatch({ type: "DELETE_ADDRESS", payload: index })
  }, [])

  const applyCoupon = useCallback((applied: AppliedCoupon) => {
    dispatch({ type: "APPLY_COUPON", payload: applied })
  }, [])

  const removeCoupon = useCallback(() => {
    dispatch({ type: "REMOVE_COUPON" })
  }, [])

  const addCoupon = useCallback((coupon: Coupon) => {
    storageUpdate(
      STORAGE_KEYS.COUPONS,
      mockCoupons,
      (coupons) =>
        reducer({ ...stateRef.current, coupons }, {
          type: "ADD_COUPON",
          payload: coupon,
        }).coupons,
    )
  }, [])

  const updateCoupon = useCallback((coupon: Coupon) => {
    storageUpdate(
      STORAGE_KEYS.COUPONS,
      mockCoupons,
      (coupons) =>
        reducer({ ...stateRef.current, coupons }, {
          type: "UPDATE_COUPON",
          payload: coupon,
        }).coupons,
    )
  }, [])

  const deleteCoupon = useCallback((id: string) => {
    storageUpdate(
      STORAGE_KEYS.COUPONS,
      mockCoupons,
      (coupons) =>
        reducer({ ...stateRef.current, coupons }, {
          type: "DELETE_COUPON",
          payload: id,
        }).coupons,
    )
  }, [])

  const toggleCouponStatus = useCallback((id: string) => {
    storageUpdate(
      STORAGE_KEYS.COUPONS,
      mockCoupons,
      (coupons) =>
        reducer({ ...stateRef.current, coupons }, {
          type: "TOGGLE_COUPON_STATUS",
          payload: id,
        }).coupons,
    )
  }, [])

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0
    let total = 0
    for (const item of state.cart) {
      count += item.quantity
      total += (item.gift.discountPrice ?? item.gift.price) * item.quantity
    }
    return { cartCount: count, cartTotal: total }
  }, [state.cart])

  const checkoutTotal = useMemo(
    () =>
      state.checkoutItems.reduce((sum: number, item: CartItem) => {
        const price = item.gift.discountPrice ?? item.gift.price
        return sum + price * item.quantity
      }, 0),
    [state.checkoutItems],
  )

  const actionsValue = useMemo<AppActionsValue>(
    () => ({
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      showToast,
      loginCustomer,
      loginAdmin,
      logout,
      setCheckoutData,
      clearCheckoutData,
      startBuyNow,
      startCartCheckout,
      placeOrder,
      addReview,
      markReviewHelpful,
      setMenuOpen,
      setPaymentQR,
      submitPaymentProof,
      reviewPayment,
      confirmCODOrder,
      updateOrderStatus,
      updateShopFulfillment,
      addAddress,
      updateAddress,
      deleteAddress,
      applyCoupon,
      removeCoupon,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponStatus,
    }),
    [
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      showToast,
      loginCustomer,
      loginAdmin,
      logout,
      setCheckoutData,
      clearCheckoutData,
      startBuyNow,
      startCartCheckout,
      placeOrder,
      addReview,
      markReviewHelpful,
      setMenuOpen,
      setPaymentQR,
      submitPaymentProof,
      reviewPayment,
      confirmCODOrder,
      updateOrderStatus,
      updateShopFulfillment,
      addAddress,
      updateAddress,
      deleteAddress,
      applyCoupon,
      removeCoupon,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponStatus,
    ],
  )

  const sessionValue = useMemo(
    () => ({ user: state.user, isMenuOpen: state.isMenuOpen }),
    [state.user, state.isMenuOpen],
  )
  const cartValue = useMemo(
    () => ({
      cart: state.cart,
      wishlist: state.wishlist,
      cartCount,
      cartTotal,
    }),
    [state.cart, state.wishlist, cartCount, cartTotal],
  )
  const checkoutValue = useMemo(
    () => ({
      checkoutData: state.checkoutData,
      paymentQR: state.paymentQR,
      coupons: state.coupons,
      appliedCoupon: state.appliedCoupon,
      checkoutItems: state.checkoutItems,
      checkoutSource: state.checkoutSource,
      checkoutTotal,
    }),
    [
      state.checkoutData,
      state.paymentQR,
      state.coupons,
      state.appliedCoupon,
      state.checkoutItems,
      state.checkoutSource,
      checkoutTotal,
    ],
  )
  const ordersValue = useMemo(
    () => ({ orders: state.orders, reviews: state.reviews }),
    [state.orders, state.reviews],
  )
  const toastValue = useMemo(() => ({ toasts: state.toasts }), [state.toasts])
  return (
    <AppActionsContext.Provider value={actionsValue}>
      <SessionStateContext.Provider value={sessionValue}>
        <CartStateContext.Provider value={cartValue}>
          <CheckoutStateContext.Provider value={checkoutValue}>
            <OrdersStateContext.Provider value={ordersValue}>
              <ToastStateContext.Provider value={toastValue}>
                {children}
              </ToastStateContext.Provider>
            </OrdersStateContext.Provider>
          </CheckoutStateContext.Provider>
        </CartStateContext.Provider>
      </SessionStateContext.Provider>
    </AppActionsContext.Provider>
  )
}
