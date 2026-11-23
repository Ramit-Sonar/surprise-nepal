import { CalendarDays, WalletCards } from "lucide-react"
import ShopLayout from "../../shops/components/ShopLayout"
import { SettlementStatusBadge } from "../../../components/ui/Badge"
import { formatPrice } from "../../../utils/format"
import { getCurrentShop } from "../../shops/services/shopService"
import { getShopSettlements } from "../services/settlementService"

export default function ShopSettlements() {
  const shop = getCurrentShop()!
  const storedSettlements = getShopSettlements()
  const settlements = storedSettlements
    .filter(
      (settlement) =>
        settlement.shopId === shop.id && settlement.grossSales > 0,
    )
    .sort((a, b) => b.period.localeCompare(a.period))

  return (
    <ShopLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Shop Settlements</h1>
        <p className="text-sm text-muted-foreground">
          Your monthly receiving amounts from eligible orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settlements.map((settlement) => {
          return (
            <article
              key={settlement.id}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Period</p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays size={16} className="text-primary" />
                    {new Date(
                      `${settlement.period}-01T00:00:00`,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1.5">Status</p>
                  <SettlementStatusBadge status={settlement.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {settlement.orderCount}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Units</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {settlement.unitsSold}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Amount to Receive
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatPrice(settlement.shopPayable)}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      {settlements.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <WalletCards
            size={32}
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="font-semibold text-foreground">No settlements yet</p>
        </div>
      )}
    </ShopLayout>
  )
}
