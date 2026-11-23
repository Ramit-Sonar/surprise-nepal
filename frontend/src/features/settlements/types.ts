import type { OrderId, ShopId } from "../../types/identifiers"

export type SettlementStatus = "pending" | "processing" | "paid"

export interface ShopSettlement {
  id: string
  shopId: ShopId
  period: string
  status: SettlementStatus
  eligibleOrderIds: OrderId[]
  orderCount: number
  unitsSold: number
  grossSales: number
  commissionAmount: number
  shopPayable: number
  commissionRates: number[]
  createdAt: string
  paidAt?: string
  paymentReference?: string
}
