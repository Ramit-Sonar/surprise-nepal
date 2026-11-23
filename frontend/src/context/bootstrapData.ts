import type { Coupon, Order, Review, User } from "../types/index"

export interface BootstrapData {
  orders: Order[]
  user: User
  reviews: Review[]
  coupons: Coupon[]
}

let bootstrapData: BootstrapData

export function configureBootstrapData(data: BootstrapData) {
  bootstrapData = data
}

export function getBootstrapData(): BootstrapData {
  if (!bootstrapData) {
    throw new Error("Application bootstrap data has not been configured")
  }
  return bootstrapData
}
