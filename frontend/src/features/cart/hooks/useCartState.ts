import { createContext, useContext } from "react"
import type { CartItem } from "../../products/types"

export interface CartStateValue {
  cart: CartItem[]
  wishlist: string[]
  cartCount: number
  cartTotal: number
}

export const CartStateContext = createContext<CartStateValue | null>(null)

export function useCartState() {
  const value = useContext(CartStateContext)
  if (!value) throw new Error("useCartState must be used within AppProvider")
  return value
}
