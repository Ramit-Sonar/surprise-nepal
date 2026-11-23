import { createContext, useContext } from "react"
import type { Review } from "../../products/types"
import type { Order } from "../types"

export interface OrdersStateValue {
  orders: Order[]
  reviews: Review[]
}

export const OrdersStateContext = createContext<OrdersStateValue | null>(null)

export function useOrdersState() {
  const value = useContext(OrdersStateContext)
  if (!value) throw new Error("useOrdersState must be used within AppProvider")
  return value
}
