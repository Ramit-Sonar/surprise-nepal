import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Zap,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import Button from "../../../components/ui/Button"
import ConfirmDialog from "../../../components/ui/ConfirmDialog"
import { useAppActions } from "../../../context/useApp"
import { useCheckoutState } from "../../payments/hooks/useCheckoutState"
import type { Coupon, CouponDiscountType, CouponStatus } from "../types"
import { getCouponStatus, formatDiscount } from "../services/couponService"

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CouponStatus, {
  label: string
  color: string
  Icon: React.ElementType
}> = {
  active: {
    label: "Active",
    color: "text-success bg-success/10",
    Icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    color: "text-muted-foreground bg-muted",
    Icon: Ban,
  },
  expired: {
    label: "Expired",
    color: "text-error bg-error/10",
    Icon: AlertCircle,
  },
  scheduled: {
    label: "Scheduled",
    color: "text-warning bg-amber-100",
    Icon: Clock,
  },
  exhausted: { label: "Exhausted", color: "text-error bg-error/10", Icon: Zap },
}

function StatusBadge({ coupon }: { coupon: Coupon }) {
  const status = getCouponStatus(coupon)
  const { label, color, Icon } = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      <Icon size={10} /> {label}
    </span>
  )
}

function PublicationBadge({ coupon }: { coupon: Coupon }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium ${
        coupon.publishedOnSite
          ? "text-primary bg-primary-light"
          : "text-muted-foreground bg-muted"
      }`}
    >
      {coupon.publishedOnSite ? "Published" : "Banner hidden"}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminCoupons() {
  const navigate = useNavigate()
  const { coupons } = useCheckoutState()
  const { deleteCoupon, toggleCouponStatus, showToast } = useAppActions()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<CouponStatus | "all">("all")
  const [filterType, setFilterType] = useState<CouponDiscountType | "all">(
    "all",
  )

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const status = getCouponStatus(c)
      if (filterStatus !== "all" && status !== filterStatus) return false
      if (filterType !== "all" && c.discountType !== filterType) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [coupons, search, filterStatus, filterType])

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCoupon(deleteTarget.id)
    showToast("Coupon deleted", "info")
    setDeleteTarget(null)
  }

  const handleToggle = (coupon: Coupon) => {
    toggleCouponStatus(coupon.id)
    showToast(
      coupon.status === "active" ? "Coupon deactivated" : "Coupon activated",
      coupon.status === "active" ? "info" : "success",
    )
  }

  const copyCode = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => showToast(`Copied "${code}"`))
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const active = coupons.filter((c) => getCouponStatus(c) === "active").length
    const totalUsage = coupons.reduce((s, c) => s + c.usageCount, 0)
    return { total: coupons.length, active, totalUsage }
  }, [coupons])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout
      breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Coupons" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Coupons & Discounts
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage discount codes and promotions
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={() => navigate("/admin/coupons/new")}
          >
            Create Coupon
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Coupons", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Total Redemptions", value: stats.totalUsage },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-card rounded-2xl border border-border p-4 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search code or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as CouponStatus | "all")
            }
            className="text-sm rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="exhausted">Exhausted</option>
          </select>
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as CouponDiscountType | "all")
            }
            className="text-sm rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
        </div>

        {/* Table — desktop; cards — mobile */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Code</span>
            <span>Discount</span>
            <span>Usage</span>
            <span>Expiry</span>
            <span>Status</span>
            <span>Min Order</span>
            <span>Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Tag
                size={32}
                className="text-muted-foreground mx-auto mb-3 opacity-40"
              />
              <p className="text-sm text-muted-foreground">
                No coupons match your filters
              </p>
            </div>
          ) : (
            filtered.map((coupon) => (
              <CouponRow
                key={coupon.id}
                coupon={coupon}
                onEdit={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
                onDelete={() => setDeleteTarget(coupon)}
                onToggle={() => handleToggle(coupon)}
                onCopy={() => copyCode(coupon.code)}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Coupon?"
        description={
          deleteTarget
            ? `${deleteTarget.code} will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        icon={<Trash2 size={26} />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

// ── Coupon Row Component ──────────────────────────────────────────────────────

function CouponRow({
  coupon,
  onEdit,
  onDelete,
  onToggle,
  onCopy,
}: {
  coupon: Coupon
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onCopy: () => void
}) {
  const usagePct =
    coupon.maxUsageLimit > 0
      ? Math.min(
          100,
          Math.round((coupon.usageCount / coupon.maxUsageLimit) * 100),
        )
      : null

  return (
    <>
      {/* ── Desktop row ── */}
      <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
        {/* Code */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground text-sm truncate">
              {coupon.code}
            </span>
            <button
              onClick={onCopy}
              className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
              title="Copy code"
            >
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {coupon.description}
          </p>
        </div>

        {/* Discount */}
        <div>
          <span className="text-sm font-semibold text-primary">
            {formatDiscount(coupon)}
          </span>
          {coupon.minOrderAmount > 0 && (
            <p className="text-2xs text-muted-foreground">
              min रु {coupon.minOrderAmount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Usage */}
        <div>
          <p className="text-sm font-medium text-foreground">
            {coupon.usageCount}
            {coupon.maxUsageLimit > 0 ? `/${coupon.maxUsageLimit}` : ""}
          </p>
          {usagePct !== null && (
            <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden w-20">
              <div
                className={`h-full rounded-full ${
                  usagePct >= 90
                    ? "bg-error"
                    : usagePct >= 70
                      ? "bg-warning"
                      : "bg-success"
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-muted-foreground">
          <p>{coupon.startDate}</p>
          <p>→ {coupon.expiryDate}</p>
        </div>

        {/* Status */}
        <div className="flex flex-col items-start gap-1">
          <StatusBadge coupon={coupon} />
          <PublicationBadge coupon={coupon} />
        </div>

        {/* Min order */}
        <p className="text-sm text-foreground">
          {coupon.minOrderAmount > 0
            ? `रु ${coupon.minOrderAmount.toLocaleString()}`
            : "—"}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Edit"
          >
            <Edit2
              size={14}
              className="text-muted-foreground hover:text-foreground"
            />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title={coupon.status === "active" ? "Deactivate" : "Activate"}
          >
            {coupon.status === "active" ? (
              <ToggleRight size={16} className="text-primary" />
            ) : (
              <ToggleLeft size={16} className="text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-error/10 transition-colors"
            title="Delete"
          >
            <Trash2
              size={14}
              className="text-muted-foreground hover:text-error"
            />
          </button>
        </div>
      </div>

      {/* ── Mobile card ── */}
      <div className="md:hidden border-b border-border last:border-0 p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-mono font-bold text-foreground">
              {coupon.code}
            </span>
            <button
              onClick={onCopy}
              className="p-1 rounded-md hover:bg-muted"
              title="Copy"
            >
              <Copy size={11} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge coupon={coupon} />
            <PublicationBadge coupon={coupon} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{coupon.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="font-semibold text-primary">
            {formatDiscount(coupon)}
          </span>
          <span className="text-muted-foreground">
            Used: {coupon.usageCount}
            {coupon.maxUsageLimit > 0 ? `/${coupon.maxUsageLimit}` : ""}
          </span>
          <span className="text-muted-foreground">
            Expires: {coupon.expiryDate}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1"
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={onToggle}
            className="flex-1 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1"
          >
            {coupon.status === "active" ? (
              <>
                <ToggleLeft size={12} /> Deactivate
              </>
            ) : (
              <>
                <ToggleRight size={12} /> Activate
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-1.5 rounded-xl border border-error/30 text-xs font-medium text-error hover:bg-error/10 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </>
  )
}
