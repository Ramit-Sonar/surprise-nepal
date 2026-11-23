import type { Order } from "../../orders/types"
import type { ShopSettlement } from "../types"
import {
  getOrderPeriods,
  getSettlementSnapshot,
} from "../../orders/services/orderService"
import { getShops } from "../../shops/services/shopService"

export interface SettlementRepository {
  getShopSettlements(): ShopSettlement[]
  syncPendingShopSettlement(settlement: ShopSettlement): boolean
  updateShopSettlementStatus(
    id: string,
    status: ShopSettlement["status"],
    paymentReference?: string,
  ): boolean
}

let repository: SettlementRepository

export function configureSettlementRepository(
  nextRepository: SettlementRepository,
) {
  repository = nextRepository
}

export const getShopSettlements = () => repository.getShopSettlements()
export const syncPendingShopSettlement = (settlement: ShopSettlement) =>
  repository.syncPendingShopSettlement(settlement)
export const updateShopSettlementStatus: SettlementRepository["updateShopSettlementStatus"] =
  (...args) => repository.updateShopSettlementStatus(...args)

const currentPeriod = () => new Date().toISOString().slice(0, 7)

export interface SettlementSyncFailure {
  settlementId: string
  message: string
}

export interface SettlementSyncResult {
  settlements: ShopSettlement[]
  failures: SettlementSyncFailure[]
}

/**
 * Idempotently creates or reconciles pending records for closed months.
 * Processing and paid records are immutable and skipped by the persistence
 * layer. A failure for one shop/month does not block the remaining work.
 */
export function syncMonthlySettlements(orders: Order[]): SettlementSyncResult {
  const existing = getShopSettlements()
  const eligiblePeriods = getOrderPeriods(orders).filter(
    (period) => period < currentPeriod(),
  )
  const failures: SettlementSyncFailure[] = []

  for (const shop of getShops()) {
    const periods = [
      ...new Set([
        ...eligiblePeriods,
        ...existing
          .filter(
            (settlement) =>
              settlement.shopId === shop.id && settlement.status === "pending",
          )
          .map((settlement) => settlement.period),
      ]),
    ]
    for (const period of periods) {
      const settlementId = `${shop.id}_${period}`
      try {
        const settlement = getSettlementSnapshot(shop.id, period, orders)
        syncPendingShopSettlement(settlement)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        failures.push({ settlementId, message })
        console.error("[monthly-settlements] Failed shop/month sync", {
          settlementId,
          message,
        })
      }
    }
  }

  return { settlements: getShopSettlements(), failures }
}
