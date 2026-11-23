import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Ban,
  CheckCircle2,
  RotateCcw,
  Search,
  Store,
  XCircle,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import ConfirmDialog from "../../../components/ui/ConfirmDialog"
import { useAppActions } from "../../../context/useApp"
import { getOptimizedImageUrl } from "../../../utils/image"
import { getShops, updateShopStatus } from "../services/shopService"
import type { Shop, ShopStatus } from "../types"

const filters: Array<"all" | ShopStatus> = [
  "all",
  "pending",
  "approved",
  "rejected",
  "suspended",
]

const statusVariant = (status: ShopStatus) =>
  status === "approved"
    ? "success"
    : status === "pending"
      ? "warning"
      : status === "rejected"
        ? "error"
        : "muted"

export default function AdminShops() {
  const { showToast } = useAppActions()
  const navigate = useNavigate()
  const shops = getShops()
  const [filter, setFilter] = useState<"all" | ShopStatus>("all")
  const [search, setSearch] = useState("")
  const [updatingShopId, setUpdatingShopId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{
    shop: Shop
    status: ShopStatus
    action: "Approve" | "Reject" | "Suspend" | "Reactivate"
  } | null>(null)
  const counts = useMemo(
    () => ({
      all: shops.length,
      pending: shops.filter((shop) => shop.status === "pending").length,
      approved: shops.filter((shop) => shop.status === "approved").length,
      rejected: shops.filter((shop) => shop.status === "rejected").length,
      suspended: shops.filter((shop) => shop.status === "suspended").length,
    }),
    [shops],
  )

  const visible = useMemo(
    () =>
      shops.filter(
        (shop) =>
          (filter === "all" || shop.status === filter) &&
          (!search ||
            `${shop.name} ${shop.ownerName} ${shop.email}`
              .toLowerCase()
              .includes(search.toLowerCase())),
      ),
    [filter, search, shops],
  )

  const requestStatusChange = (
    shop: Shop,
    status: ShopStatus,
    action: "Approve" | "Reject" | "Suspend" | "Reactivate",
  ) => {
    setConfirmation({ shop, status, action })
  }

  const confirmStatusChange = async () => {
    if (!confirmation || updatingShopId !== null) return
    const pending = confirmation
    setUpdatingShopId(pending.shop.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const updated = updateShopStatus(pending.shop.id, pending.status)
      showToast(
        updated
          ? `${pending.shop.name} ${pending.status}`
          : `${pending.shop.name} changed elsewhere. The latest status has been kept.`,
        updated ? "success" : "warning",
      )
      if (updated) setConfirmation(null)
    } finally {
      setUpdatingShopId(null)
    }
  }

  return (
    <AdminLayout
      breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Shops" }]}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Partner Shops</h1>
        <p className="text-sm text-muted-foreground">
          Review applications and manage partner shop access.
        </p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto mb-5">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap ${
              filter === item
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {item} <span className="opacity-60">({counts[item]})</span>
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search shops, owners, or email..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-3">
        {visible.map((shop) => (
          <article
            key={shop.id}
            className="bg-card rounded-2xl border border-border p-4 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {shop.logo ? (
                  <img
                    src={getOptimizedImageUrl(shop.logo, 88)}
                    alt={`${shop.name} logo`}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <Store size={20} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {shop.ownerName}
                    </p>
                  </div>
                  <Badge
                    className="capitalize self-start"
                    variant={statusVariant(shop.status)}
                    size="sm"
                  >
                    {shop.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-2 mt-4"
              onClick={(event) => event.stopPropagation()}
            >
              {shop.status === "pending" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/shops/${shop.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      requestStatusChange(shop, "approved", "Approve")
                    }
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      requestStatusChange(shop, "rejected", "Reject")
                    }
                    leftIcon={<XCircle size={14} />}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/shops/${shop.id}`)}
                  >
                    View Details
                  </Button>
                  {shop.status === "approved" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        requestStatusChange(shop, "suspended", "Suspend")
                      }
                      leftIcon={<Ban size={14} />}
                    >
                      Suspend
                    </Button>
                  ) : shop.status === "suspended" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        requestStatusChange(shop, "approved", "Reactivate")
                      }
                      leftIcon={<RotateCcw size={14} />}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        requestStatusChange(shop, "approved", "Approve")
                      }
                      leftIcon={<CheckCircle2 size={14} />}
                    >
                      Approve
                    </Button>
                  )}
                </>
              )}
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-10 text-center">
            <p className="font-semibold">No shops found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try another status or search term.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmation !== null}
        title={`${confirmation?.action ?? "Update"} Shop`}
        description={
          confirmation
            ? `${confirmation.action} ${confirmation.shop.name}? Their access and status will update immediately.`
            : ""
        }
        confirmLabel={confirmation?.action}
        variant={
          confirmation?.action === "Reject" ||
          confirmation?.action === "Suspend"
            ? "danger"
            : "success"
        }
        icon={
          confirmation?.action === "Reject" ||
          confirmation?.action === "Suspend" ? (
            <Ban size={26} />
          ) : (
            <CheckCircle2 size={26} />
          )
        }
        loading={updatingShopId !== null}
        onConfirm={confirmStatusChange}
        onCancel={() => setConfirmation(null)}
      />
    </AdminLayout>
  )
}
