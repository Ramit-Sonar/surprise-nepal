import { formatPrice } from "../../../utils/format"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Check,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  ToggleLeft,
  ToggleRight,
  X,
  LoaderCircle,
  Star,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Modal from "../../../components/ui/Modal"
import { Textarea } from "../../../components/ui/Input"
import { useAppActions } from "../../../context/useApp"
import ConfirmDialog from "../../../components/ui/ConfirmDialog"
import type { Gift } from "../types"
import {
  deleteProduct,
  getProducts,
  updateProductFeatured,
  updateProductStatus,
} from "../services/productService"
import { getOptimizedImageUrl } from "../../../utils/image"

export default function AdminProducts() {
  const navigate = useNavigate()
  const { showToast } = useAppActions()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Gift["status"]>(
    "all",
  )
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null,
  )
  const localGifts = getProducts()
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    giftId: string
    giftName: string
  }>({
    open: false,
    giftId: "",
    giftName: "",
  })
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    giftId: string
    giftName: string
    reason: string
    expectedUpdatedAt?: string | null
  }>({ open: false, giftId: "", giftName: "", reason: "" })

  const filtered = localGifts.filter((g) => {
    const matchesSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      (g.shopName ?? "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || g.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleStatus = async (id: string) => {
    if (updatingProductId !== null) return
    const gift = localGifts.find((item) => item.id === id)
    if (!gift) return
    setUpdatingProductId(id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const updated = updateProductStatus(
        id,
        gift.status === "active" ? "inactive" : "active",
        undefined,
        gift.updatedAt ?? null,
      )
      showToast(
        updated
          ? "Gift status updated"
          : "Gift changed elsewhere. The latest status has been kept.",
        updated ? "success" : "warning",
      )
      setOpenMenu(null)
    } finally {
      setUpdatingProductId(null)
    }
  }

  const toggleFeatured = async (id: string) => {
    if (updatingProductId !== null) return
    const gift = localGifts.find((item) => item.id === id)
    if (!gift) return
    setUpdatingProductId(id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const nextFeatured = !gift.featured
      const updated = updateProductFeatured(
        id,
        nextFeatured,
        gift.updatedAt ?? null,
      )
      showToast(
        updated
          ? nextFeatured
            ? "Gift added to Featured Gifts"
            : "Gift removed from Featured Gifts"
          : "Gift changed elsewhere. The latest featured setting has been kept.",
        updated ? "success" : "warning",
      )
      setOpenMenu(null)
    } finally {
      setUpdatingProductId(null)
    }
  }

  const deleteGift = (id: string) => {
    const gift = localGifts.find((g) => g.id === id)
    setDeleteDialog({
      open: true,
      giftId: id,
      giftName: gift?.name ?? "this gift",
    })
    setOpenMenu(null)
  }

  const doDeleteGift = async () => {
    if (updatingProductId !== null) return
    const id = deleteDialog.giftId
    setUpdatingProductId(id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const deleted = deleteProduct(id)
      showToast(
        deleted
          ? "Gift deleted"
          : "Gift could not be deleted because it changed elsewhere.",
        deleted ? "info" : "error",
      )
      if (deleted) setDeleteDialog((d) => ({ ...d, open: false }))
    } finally {
      setUpdatingProductId(null)
    }
  }

  const STATUS_BADGES: Record<string, any> = {
    active: { variant: "success", label: "Active" },
    inactive: { variant: "muted", label: "Inactive" },
    draft: { variant: "warning", label: "Draft" },
    pending: { variant: "warning", label: "Pending Review" },
    rejected: { variant: "error", label: "Rejected" },
  }

  const approveGift = async (id: string) => {
    if (updatingProductId !== null) return
    const gift = localGifts.find((item) => item.id === id)
    setUpdatingProductId(id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const updated = updateProductStatus(
        id,
        "active",
        undefined,
        gift?.updatedAt ?? null,
      )
      showToast(
        updated
          ? "Gift approved and published"
          : "Gift changed elsewhere. The latest status has been kept.",
        updated ? "success" : "warning",
      )
    } finally {
      setUpdatingProductId(null)
    }
  }

  const rejectGift = (id: string) => {
    const gift = localGifts.find((item) => item.id === id)
    setRejectDialog({
      open: true,
      giftId: id,
      giftName: gift?.name ?? "Gift",
      reason: "Please review the product details and images.",
      expectedUpdatedAt: gift?.updatedAt ?? null,
    })
  }

  const confirmReject = async () => {
    if (updatingProductId !== null) return
    setUpdatingProductId(rejectDialog.giftId)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const updated = updateProductStatus(
        rejectDialog.giftId,
        "rejected",
        rejectDialog.reason.trim() || "Please review this product.",
        rejectDialog.expectedUpdatedAt,
      )
      showToast(
        updated
          ? "Gift rejected"
          : "Gift changed elsewhere. The latest status has been kept.",
        updated ? "info" : "warning",
      )
      setRejectDialog((dialog) => ({ ...dialog, open: false }))
    } finally {
      setUpdatingProductId(null)
    }
  }

  return (
    <AdminLayout
      breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Products" }]}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Products / Gifts
          </h1>
          <p className="text-sm text-muted-foreground">
            {localGifts.length} total products
          </p>
        </div>
        <Badge variant="warning">
          {localGifts.filter((gift) => gift.status === "pending").length}{" "}
          pending review
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto">
          {([
            "all",
            "pending",
            "active",
            "rejected",
            "inactive",
            "draft",
          ] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize whitespace-nowrap flex-shrink-0 ${
                statusFilter === s
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Product
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Category
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Price
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Stock
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Featured
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide">
                Rating
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((gift) => {
              const { variant, label } = STATUS_BADGES[gift.status] ?? {
                variant: "muted",
                label: gift.status,
              }
              return (
                <tr
                  key={gift.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getOptimizedImageUrl(gift.image, 80)}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover bg-muted"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate max-w-[180px]">
                          {gift.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          Shop: {gift.shopName ?? "Surprise Nepal"} ·{" "}
                          {gift.submittedAt
                            ? new Date(gift.submittedAt).toLocaleDateString()
                            : gift.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground capitalize">
                      {gift.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {formatPrice(gift.discountPrice ?? gift.price)}
                      </p>
                      {gift.discountPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(gift.price)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        gift.stockCount < 10
                          ? "text-warning"
                          : "text-foreground"
                      }`}
                    >
                      {gift.stockCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={variant} size="sm">
                      {label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={gift.featured ? "warning" : "muted"}
                      size="sm"
                    >
                      <Star
                        size={10}
                        className={gift.featured ? "fill-current" : ""}
                      />
                      {gift.featured ? "Featured" : "Not featured"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-accent text-xs">★</span>
                      <span className="text-sm text-foreground">
                        {gift.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({gift.reviewCount})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {gift.status === "pending" ? (
                      <div className="flex items-center gap-1">
                        <button
                          disabled={updatingProductId !== null}
                          onClick={() => navigate(`/admin/products/${gift.id}`)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          disabled={updatingProductId !== null}
                          onClick={() => approveGift(gift.id)}
                          className="p-1.5 rounded-lg hover:bg-success/10 text-success disabled:opacity-50"
                          title="Approve"
                        >
                          {updatingProductId === gift.id ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Check size={15} />
                          )}
                        </button>
                        <button
                          disabled={updatingProductId !== null}
                          onClick={() => rejectGift(gift.id)}
                          className="p-1.5 rounded-lg hover:bg-error/10 text-error disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={15} />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingProductId !== null}
                          loading={updatingProductId === gift.id}
                          onClick={() => toggleFeatured(gift.id)}
                          title={
                            gift.featured
                              ? "Disable Featured"
                              : "Enable Featured"
                          }
                          aria-label={
                            gift.featured
                              ? "Disable Featured"
                              : "Enable Featured"
                          }
                          className="!p-1.5 !min-h-0"
                        >
                          <Star
                            size={15}
                            className={
                              gift.featured ? "fill-accent text-accent" : ""
                            }
                          />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === gift.id ? null : gift.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === gift.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-xl z-50 py-1 animate-scaleIn">
                            <button
                              onClick={() => {
                                navigate(`/admin/products/${gift.id}`)
                                setOpenMenu(null)
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted w-full"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => toggleStatus(gift.id)}
                              disabled={updatingProductId !== null}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted w-full disabled:opacity-50"
                            >
                              {updatingProductId === gift.id ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : gift.status === "active" ? (
                                <ToggleLeft size={14} />
                              ) : (
                                <ToggleRight size={14} />
                              )}
                              {gift.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              fullWidth
                              disabled={updatingProductId !== null}
                              loading={updatingProductId === gift.id}
                              onClick={() => toggleFeatured(gift.id)}
                              leftIcon={
                                <Star
                                  size={14}
                                  className={
                                    gift.featured
                                      ? "fill-accent text-accent"
                                      : ""
                                  }
                                />
                              }
                              className="!justify-start !rounded-none !px-4 !py-2 !min-h-0 !font-normal"
                            >
                              {gift.featured
                                ? "Disable Featured"
                                : "Enable Featured"}
                            </Button>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={() => deleteGift(gift.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-muted w-full"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-semibold">No products found</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((gift) => {
          const { variant, label } = STATUS_BADGES[gift.status] ?? {
            variant: "muted",
            label: gift.status,
          }
          return (
            <div
              key={gift.id}
              className="bg-card rounded-2xl border border-border p-4"
            >
              <div className="flex gap-3">
                <img
                  src={getOptimizedImageUrl(gift.image, 112)}
                  alt=""
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover bg-muted flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {gift.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {gift.category}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Shop: {gift.shopName ?? "Surprise Nepal"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={variant} size="sm">
                        {label}
                      </Badge>
                      <Badge
                        variant={gift.featured ? "warning" : "muted"}
                        size="sm"
                      >
                        <Star
                          size={10}
                          className={gift.featured ? "fill-current" : ""}
                        />
                        {gift.featured ? "Featured" : "Not featured"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm text-foreground">
                      {formatPrice(gift.discountPrice ?? gift.price)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={updatingProductId !== null}
                        onClick={() => navigate(`/admin/products/${gift.id}`)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-50"
                      >
                        <Edit size={14} />
                      </button>
                      {gift.status === "pending" && (
                        <>
                          <button
                            disabled={updatingProductId !== null}
                            onClick={() => approveGift(gift.id)}
                            className="p-1.5 rounded-lg hover:bg-success/10 text-success disabled:opacity-50"
                          >
                            {updatingProductId === gift.id ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button
                            disabled={updatingProductId !== null}
                            onClick={() => rejectGift(gift.id)}
                            className="p-1.5 rounded-lg hover:bg-error/10 text-error disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingProductId !== null}
                        loading={updatingProductId === gift.id}
                        onClick={() => toggleFeatured(gift.id)}
                        title={
                          gift.featured ? "Disable Featured" : "Enable Featured"
                        }
                        aria-label={
                          gift.featured ? "Disable Featured" : "Enable Featured"
                        }
                        className="!p-1.5 !min-h-0"
                      >
                        <Star
                          size={14}
                          className={
                            gift.featured ? "fill-accent text-accent" : ""
                          }
                        />
                      </Button>
                      <button
                        onClick={() => deleteGift(gift.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Click outside to close menu */}
      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title={`Delete "${deleteDialog.giftName}"?`}
        description="This gift will be permanently removed from your catalog. This action cannot be undone."
        confirmLabel="Yes, Delete Gift"
        variant="danger"
        loading={updatingProductId === deleteDialog.giftId}
        onConfirm={doDeleteGift}
        onCancel={() => setDeleteDialog((d) => ({ ...d, open: false }))}
      />
      <Modal
        open={rejectDialog.open}
        onClose={() =>
          setRejectDialog((dialog) => ({ ...dialog, open: false }))
        }
        title={`Reject "${rejectDialog.giftName}"?`}
        size="sm"
      >
        <div className="p-5 space-y-4">
          <Textarea
            label="Feedback for the shop"
            rows={4}
            value={rejectDialog.reason}
            onChange={(event) =>
              setRejectDialog((dialog) => ({
                ...dialog,
                reason: event.target.value,
              }))
            }
            placeholder="Explain what the shop should update."
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() =>
                setRejectDialog((dialog) => ({ ...dialog, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              loading={updatingProductId === rejectDialog.giftId}
              onClick={confirmReject}
              className="bg-error text-white hover:bg-error/90"
            >
              Reject Gift
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
