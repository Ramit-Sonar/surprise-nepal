import { useState } from "react"
import { Link } from "react-router-dom"
import { WalletCards } from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import { SettlementStatusBadge } from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import CustomSelect from "../../../components/ui/CustomSelect"
import Modal from "../../../components/ui/Modal"
import { useAppActions } from "../../../context/useApp"
import { formatPrice } from "../../../utils/format"
import { getShops } from "../../shops/services/shopService"
import {
  getShopSettlements,
  updateShopSettlementStatus,
} from "../services/settlementService"
import type { Shop } from "../../shops/types"
import type { SettlementStatus, ShopSettlement } from "../types"

interface SettlementRow {
  shop: Shop
  settlement: ShopSettlement
  demo: boolean
}

export default function AdminSettlements() {
  const { showToast } = useAppActions()
  const shops = getShops()
  const stored = getShopSettlements()
  const [filter, setFilter] = useState<"all" | SettlementStatus>("all")
  const [demoStatuses, setDemoStatuses] =
    useState<Record<string, SettlementStatus>>({})
  const [viewing, setViewing] = useState<SettlementRow | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const realRows: SettlementRow[] = stored
    .filter((settlement) => settlement.grossSales > 0)
    .flatMap((settlement) => {
      const shop = shops.find((item) => item.id === settlement.shopId)
      return shop ? [{ shop, settlement, demo: false }] : []
    })
  const demoShops = {
    surprise:
      shops.find((shop) => shop.id === "shop_surprise_nepal") ?? shops[0],
    pokhara: shops.find((shop) => shop.id === "shop_pokhara_bloom") ?? shops[0],
    lalitpur:
      shops.find((shop) => shop.id === "shop_suspended_lalitpur") ?? shops[0],
  }
  const demoRows: SettlementRow[] = [
    {
      shop: demoShops.surprise,
      settlement: {
        id: "demo-settlement-jan",
        shopId: demoShops.surprise.id,
        period: "2026-01",
        status: "paid",
        eligibleOrderIds: [],
        orderCount: 8,
        unitsSold: 12,
        grossSales: 54000,
        commissionAmount: 5400,
        shopPayable: 48600,
        commissionRates: [10],
        createdAt: "2026-02-01T10:00:00.000Z",
        paidAt: "2026-02-05T10:00:00.000Z",
      },
      demo: true,
    },
    {
      shop: demoShops.pokhara,
      settlement: {
        id: "demo-settlement-feb",
        shopId: demoShops.pokhara.id,
        period: "2026-02",
        status: "paid",
        eligibleOrderIds: [],
        orderCount: 6,
        unitsSold: 9,
        grossSales: 42500,
        commissionAmount: 4250,
        shopPayable: 38250,
        commissionRates: [10],
        createdAt: "2026-03-01T10:00:00.000Z",
        paidAt: "2026-03-04T10:00:00.000Z",
      },
      demo: true,
    },
    {
      shop: demoShops.lalitpur,
      settlement: {
        id: "demo-settlement-mar",
        shopId: demoShops.lalitpur.id,
        period: "2026-03",
        status: "processing",
        eligibleOrderIds: [],
        orderCount: 5,
        unitsSold: 7,
        grossSales: 36800,
        commissionAmount: 3680,
        shopPayable: 33120,
        commissionRates: [10],
        createdAt: "2026-04-01T10:00:00.000Z",
      },
      demo: true,
    },
    {
      shop: demoShops.pokhara,
      settlement: {
        id: "demo-settlement-apr",
        shopId: demoShops.pokhara.id,
        period: "2026-04",
        status: "pending",
        eligibleOrderIds: [],
        orderCount: 7,
        unitsSold: 11,
        grossSales: 48200,
        commissionAmount: 4820,
        shopPayable: 43380,
        commissionRates: [10],
        createdAt: "2026-05-01T10:00:00.000Z",
      },
      demo: true,
    },
    {
      shop: demoShops.surprise,
      settlement: {
        id: "demo-settlement-may",
        shopId: demoShops.surprise.id,
        period: "2026-05",
        status: "pending",
        eligibleOrderIds: [],
        orderCount: 9,
        unitsSold: 14,
        grossSales: 61500,
        commissionAmount: 6150,
        shopPayable: 55350,
        commissionRates: [10],
        createdAt: "2026-06-01T10:00:00.000Z",
      },
      demo: true,
    },
  ].map((row) => ({
    ...row,
    settlement: {
      ...row.settlement,
      status: demoStatuses[row.settlement.id] ?? row.settlement.status,
      ...(demoStatuses[row.settlement.id] === "paid" && !row.settlement.paidAt
        ? { paidAt: new Date().toISOString() }
        : {}),
    },
  }))
  const sourceRows =
    realRows.length > 0 ? realRows : import.meta.env.DEV ? demoRows : []
  const rows = sourceRows.filter(
    (row) => filter === "all" || row.settlement.status === filter,
  )

  const updateStatus = (
    shopId: string,
    period: string,
    status: SettlementStatus,
  ) => {
    const updated = updateShopSettlementStatus(`${shopId}_${period}`, status)
    showToast(
      updated
        ? `Settlement marked as ${status}`
        : "Settlement changed elsewhere. The latest status has been kept.",
      updated ? "success" : "warning",
    )
  }

  const runAction = async (row: SettlementRow, status: SettlementStatus) => {
    if (updatingId !== null) return
    setUpdatingId(row.settlement.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      if (row.demo) {
        setDemoStatuses((current) => ({
          ...current,
          [row.settlement.id]: status,
        }))
        showToast(`Preview settlement marked as ${status}`)
        return
      }
      updateStatus(row.shop.id, row.settlement.period, status)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Settlements" },
      ]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Shop Settlements</h1>
          <p className="text-sm text-muted-foreground">
            Monthly payables from completed, eligible orders.
          </p>
        </div>
        <div className="w-full sm:w-48">
          <CustomSelect
            value={filter}
            onChange={(value) => setFilter(value as typeof filter)}
            options={[
              { value: "all", label: "All settlements" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "paid", label: "Paid" },
            ]}
          />
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-245">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Shop",
                  "Period",
                  "Orders",
                  "Units",
                  "Gross Sales",
                  "Commission",
                  "Shop Payable",
                  "Status",
                  "Action",
                ].map((label) => (
                  <th
                    key={label}
                    className="text-left text-xs uppercase text-muted-foreground px-4 py-3"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ shop, settlement, demo }) => (
                <tr key={settlement.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/shops/${shop.id}`}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {shop.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(
                      `${settlement.period}-01T00:00:00`,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">{settlement.orderCount}</td>
                  <td className="px-4 py-3 text-sm">{settlement.unitsSold}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatPrice(settlement.grossSales)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatPrice(settlement.commissionAmount)}
                    <span className="block text-xs text-muted-foreground">
                      {settlement.commissionRates.length === 1
                        ? `${settlement.commissionRates[0]}%`
                        : "Mixed rates"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {formatPrice(settlement.shopPayable)}
                  </td>
                  <td className="px-4 py-3">
                    <SettlementStatusBadge status={settlement.status} />
                  </td>
                  <td className="px-4 py-3">
                    {settlement.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={updatingId === settlement.id}
                        disabled={updatingId !== null}
                        onClick={() =>
                          runAction({ shop, settlement, demo }, "processing")
                        }
                      >
                        {updatingId === settlement.id
                          ? "Updating..."
                          : "Process"}
                      </Button>
                    )}
                    {settlement.status === "processing" && (
                      <Button
                        size="sm"
                        loading={updatingId === settlement.id}
                        disabled={updatingId !== null}
                        onClick={() =>
                          runAction({ shop, settlement, demo }, "paid")
                        }
                      >
                        {updatingId === settlement.id
                          ? "Updating..."
                          : "Mark as Paid"}
                      </Button>
                    )}
                    {settlement.status === "paid" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewing({ shop, settlement, demo })}
                      >
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="p-12 text-center">
            <WalletCards
              size={32}
              className="mx-auto text-muted-foreground mb-3"
            />
            <p className="font-semibold">No settlements found</p>
          </div>
        )}
      </div>
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Settlement Details"
        size="sm"
      >
        {viewing && (
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Shop</p>
              <p className="font-semibold">{viewing.shop.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="font-medium">
                {new Date(
                  `${viewing.settlement.period}-01T00:00:00`,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="font-medium">{viewing.settlement.orderCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Units</p>
                <p className="font-medium">{viewing.settlement.unitsSold}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gross Sales</p>
                <p className="font-medium">
                  {formatPrice(viewing.settlement.grossSales)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="font-medium">
                  {formatPrice(viewing.settlement.commissionAmount)} (
                  {viewing.settlement.commissionRates.join("%, ")}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shop Payable</p>
                <p className="font-semibold">
                  {formatPrice(viewing.settlement.shopPayable)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment Date</p>
                <p className="font-medium">
                  {viewing.settlement.paidAt
                    ? new Date(viewing.settlement.paidAt).toLocaleDateString()
                    : "Not recorded"}
                </p>
              </div>
            </div>
            {viewing.settlement.paymentReference && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Payment Reference
                </p>
                <p className="font-medium">
                  {viewing.settlement.paymentReference}
                </p>
              </div>
            )}
            <Button
              fullWidth
              variant="outline"
              onClick={() => setViewing(null)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}
