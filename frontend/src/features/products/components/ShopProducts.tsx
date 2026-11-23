import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Edit,
  LoaderCircle,
  Minus,
  MoreVertical,
  Package,
  Plus,
  Search,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import ShopLayout from "../../shops/components/ShopLayout"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import CustomSelect from "../../../components/ui/CustomSelect"
import { Input } from "../../../components/ui/Input"
import { formatPrice } from "../../../utils/format"
import {
  adjustProductStock,
  getShopProducts,
  updateProductStatus,
} from "../services/productService"
import { getCurrentShop } from "../../shops/services/shopService"
import type { Gift } from "../types"
import { useAppActions } from "../../../context/useApp"
import { getOptimizedImageUrl } from "../../../utils/image"

const statusConfig: Record<Gift["status"], {
  label: string
  variant: "success" | "warning" | "error" | "muted"
}> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending Review", variant: "warning" },
  rejected: { label: "Rejected", variant: "error" },
  inactive: { label: "Hidden", variant: "muted" },
  draft: { label: "Draft", variant: "muted" },
}

export default function ShopProducts() {
  const { showToast } = useAppActions()
  const shop = getCurrentShop()!
  const products = getShopProducts(shop.id)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null,
  )
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const visibleProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "out_of_stock"
          ? product.stockCount === 0
          : statusFilter === "active"
            ? product.status === "active" && product.stockCount > 0
            : statusFilter === "inactive"
              ? product.status === "inactive" && product.stockCount > 0
              : product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const changeStock = async (product: Gift, amount: number) => {
    if (updatingProductId !== null) return
    setUpdatingProductId(product.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 250))
      const updated = adjustProductStock(product.id, amount)
      if (!updated) {
        showToast("Stock could not be updated. Please try again.", "error")
        return
      }
      if (updated.stockCount === 0) {
        showToast("Product is out of stock and has been deactivated", "info")
      }
    } finally {
      setUpdatingProductId(null)
    }
  }

  const toggleActive = async (product: Gift) => {
    if (updatingProductId !== null) return
    if (product.status === "inactive" && product.stockCount === 0) {
      showToast("Add stock before activating this product", "warning")
      return
    }
    const nextStatus = product.status === "active" ? "inactive" : "active"
    setUpdatingProductId(product.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 250))
      const updated = updateProductStatus(
        product.id,
        nextStatus,
        undefined,
        product.updatedAt ?? null,
      )
      setOpenMenu(null)
      showToast(
        updated
          ? nextStatus === "active"
            ? "Product activated"
            : "Product deactivated"
          : "Product changed elsewhere. The latest status has been kept.",
        updated ? "info" : "warning",
      )
    } finally {
      setUpdatingProductId(null)
    }
  }

  return (
    <ShopLayout>
      <div className="flex items-center justify-between gap-3 mb-5 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">My Gifts</h1>
          <p className="text-sm text-muted-foreground">
            {visibleProducts.length === products.length
              ? `${products.length} products`
              : `${visibleProducts.length} of ${products.length} products`}
          </p>
        </div>
        <Link to="/shop/products/new" className="flex-shrink-0">
          <Button size="sm" leftIcon={<Plus size={16} />}>
            Add Gift
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,1fr)_190px] gap-3 mb-5">
        <Input
          aria-label="Search gifts"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search gifts by name..."
          leftIcon={<Search size={16} />}
        />
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "out_of_stock", label: "Out of Stock" },
            { value: "pending", label: "Pending Review" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        {visibleProducts.map((product) => {
          const config =
            product.stockCount === 0
              ? { label: "Out of Stock", variant: "error" as const }
              : statusConfig[product.status]
          return (
            <article
              key={product.id}
              className={`group relative bg-card rounded-2xl p-3 sm:p-4 min-w-0 transition-all duration-200 hover:-translate-y-0.5 ${
                openMenu === product.id ? "z-50" : ""
              }`}
              style={{
                boxShadow:
                  "7px 7px 18px var(--nm-dark), -4px -4px 12px var(--nm-light)",
              }}
            >
              <div className="flex gap-3 sm:gap-4 min-w-0">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={getOptimizedImageUrl(product.image, 192)}
                    alt={product.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {product.stockCount === 0 && (
                    <div className="absolute inset-0 bg-foreground/25" />
                  )}
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide capitalize">
                          {product.category}
                        </p>
                        {product.featured && (
                          <Badge
                            variant="warning"
                            size="sm"
                            className="!px-1.5 !py-0"
                          >
                            <Star size={9} className="fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-foreground truncate">
                        {product.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge
                        variant={config.variant}
                        size="sm"
                        className="max-w-24"
                      >
                        <span className="truncate">{config.label}</span>
                      </Badge>
                      <div className="relative">
                        <button
                          disabled={updatingProductId !== null}
                          onClick={() =>
                            setOpenMenu(
                              openMenu === product.id ? null : product.id,
                            )
                          }
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-95"
                          aria-label={`Actions for ${product.name}`}
                          aria-expanded={openMenu === product.id}
                        >
                          <MoreVertical size={17} />
                        </button>
                        {openMenu === product.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-40 bg-card rounded-xl z-50 py-1"
                            style={{
                              boxShadow:
                                "8px 8px 20px var(--nm-dark), -4px -4px 12px var(--nm-light)",
                            }}
                          >
                            <Link
                              to={`/shop/products/${product.id}`}
                              onClick={() => setOpenMenu(null)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted w-full"
                            >
                              <Edit size={14} /> Edit
                            </Link>
                            {(product.status === "active" ||
                              product.status === "inactive") && (
                              <button
                                disabled={updatingProductId !== null}
                                onClick={() => toggleActive(product)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted w-full"
                              >
                                {product.status === "active" ? (
                                  <ToggleLeft size={14} />
                                ) : (
                                  <ToggleRight size={14} />
                                )}
                                {product.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 mt-2">
                    <p className="font-bold text-base text-foreground leading-none">
                      {formatPrice(product.discountPrice ?? product.price)}
                    </p>
                    {product.discountPrice && (
                      <p className="text-[10px] text-muted-foreground line-through leading-none">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {product.rejectionReason && (
                <p className="text-xs text-error bg-error/5 rounded-xl p-2.5 mt-3">
                  {product.rejectionReason}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/70 min-w-0">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Stock
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      product.stockCount === 0
                        ? "text-error"
                        : product.stockCount < 10
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {product.stockCount === 0
                      ? "Out of stock"
                      : product.stockCount < 10
                        ? "Low stock"
                        : "Available"}
                  </p>
                </div>
                <div
                  className="flex items-center rounded-full overflow-hidden bg-card flex-shrink-0"
                  style={{
                    boxShadow:
                      "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                  }}
                >
                  <button
                    onClick={() => changeStock(product, -1)}
                    disabled={
                      product.stockCount === 0 || updatingProductId !== null
                    }
                    className="w-10 h-10 flex items-center justify-center text-foreground transition-all active:scale-90 hover:text-primary disabled:opacity-35"
                    aria-label={`Decrease stock for ${product.name}`}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-foreground select-none tabular-nums">
                    {updatingProductId === product.id ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin mx-auto"
                      />
                    ) : (
                      product.stockCount
                    )}
                  </span>
                  <button
                    disabled={updatingProductId !== null}
                    onClick={() => changeStock(product, 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground transition-all active:scale-90 hover:text-primary"
                    aria-label={`Increase stock for ${product.name}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
        {visibleProducts.length === 0 && (
          <div className="md:col-span-2 text-center bg-card rounded-2xl border border-border p-10">
            <Package size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">
              {products.length === 0 ? "No gifts yet" : "No matching gifts"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length === 0
                ? "Add your first gift and submit it for review."
                : "Try another name or select a different status."}
            </p>
          </div>
        )}
      </div>

      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}
    </ShopLayout>
  )
}
