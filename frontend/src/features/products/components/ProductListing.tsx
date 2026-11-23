import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  Search,
  X,
  Grid3X3,
  LayoutList,
  Cake,
  Heart,
  Flower2,
  Cookie,
  Star,
  Sparkles,
  Crown,
  PartyPopper,
  Users,
  Candy,
  Tag,
} from "lucide-react"
import { useCheckoutState } from "../../payments/hooks/useCheckoutState"
import CustomSelect from "../../../components/ui/CustomSelect"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import ProductCard from "./ProductCard"
import EmptyState from "../../../components/ui/EmptyState"
import { categories } from "../services/productService"
import { getCatalogProducts } from "../services/productService"
import { getDeliverySettings } from "../../delivery/services/deliveryService"
import { SESSION_KEYS, sessionStorageGet } from "../../../services/storage"

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  birthday: <Cake size={28} />,
  anniversary: <Heart size={28} />,
  flowers: <Flower2 size={28} />,
  cakes: <Cake size={28} />,
  chocolates: <Cookie size={28} />,
  personalized: <Sparkles size={28} />,
  "for-her": <Star size={28} />,
  "for-him": <Crown size={28} />,
  celebration: <PartyPopper size={28} />,
  friendship: <Users size={28} />,
  sweets: <Candy size={28} />,
}

const PRICE_RANGES = [
  { label: "Under रु 2,000", min: 0, max: 2000 },
  { label: "रु 2,000 – 4,000", min: 2000, max: 4000 },
  { label: "रु 4,000 – 6,000", min: 4000, max: 6000 },
  { label: "Above रु 6,000", min: 6000, max: Infinity },
]

export default function GiftListing() {
  const gifts = getCatalogProducts()
  const deliveryService = getDeliverySettings()
  const { coupons } = useCheckoutState()
  const [searchParams, setSearchParams] = useSearchParams()
  const pendingCoupon = sessionStorageGet(SESSION_KEYS.PENDING_COUPON)
  const pendingCouponData = pendingCoupon
    ? (coupons.find((c) => c.code === pendingCoupon) ?? null)
    : null
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : [],
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(
    null,
  )
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") ?? "",
  )
  const [inStockOnly, setInStockOnly] = useState(false)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const activeCategoryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [filtersOpen])

  useEffect(() => {
    const container = categoryScrollRef.current
    if (!container) return

    if (selectedCategories.length === 0) {
      container.scrollTo({ left: 0, behavior: "smooth" })
      return
    }

    activeCategoryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    })
  }, [selectedCategories])

  const query = searchParams.get("q") ?? ""

  const filtered = useMemo(() => {
    let result = [...gifts]

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.shortDescription.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.category.toLowerCase().includes(q),
      )
    }

    if (selectedCategories.length > 0) {
      result = result.filter((g) => selectedCategories.includes(g.category))
    }

    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange]
      result = result.filter((g) => {
        const price = g.discountPrice ?? g.price
        return price >= range.min && price < range.max
      })
    }

    if (selectedCity) {
      result = deliveryService.availableCities.includes(selectedCity)
        ? result
        : []
    }

    if (inStockOnly) {
      result = result.filter((g) => g.inStock)
    }

    // Sort
    switch (sort) {
      case "price_asc":
        result.sort(
          (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price),
        )
        break
      case "price_desc":
        result.sort(
          (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price),
        )
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return result
  }, [
    query,
    selectedCategories,
    selectedPriceRange,
    selectedCity,
    inStockOnly,
    sort,
    deliveryService.availableCities,
  ])

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => (prev.includes(id) ? [] : [id]))
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPriceRange(null)
    setSelectedCity("")
    setInStockOnly(false)
    setSearchParams({})
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPriceRange !== null ||
    selectedCity ||
    inStockOnly

  const activeCategory =
    selectedCategories.length === 1
      ? categories.find((c) => c.id === selectedCategories[0])
      : null
  const pageTitle = query
    ? `Results for "${query}"`
    : (activeCategory?.name ?? "All Gifts")

  const FilterPanel = ({
    showCategories = false,
  }: {
    showCategories?: boolean
  }) => (
    <div className="space-y-6">
      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          <X size={12} /> Clear all filters
        </button>
      )}

      {/* Categories — desktop only */}
      {showCategories && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Category</p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded border-border text-primary focus:ring-primary/30 w-4 h-4"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.giftCount}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          Price Range
        </p>
        <div className="space-y-2">
          {PRICE_RANGES.map((range, i) => (
            <label
              key={i}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                checked={selectedPriceRange === i}
                onChange={() =>
                  setSelectedPriceRange(selectedPriceRange === i ? null : i)
                }
                className="text-primary focus:ring-primary/30 w-4 h-4"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* City */}
      <CustomSelect
        label="Delivery City"
        value={selectedCity}
        onChange={setSelectedCity}
        options={[
          { value: "", label: "All cities" },
          ...deliveryService.availableCities.map((c) => ({
            value: c,
            label: c,
          })),
        ]}
      />

      {/* In stock */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary/30 w-4 h-4"
        />
        <span className="text-sm text-foreground">In stock only</span>
      </label>
    </div>
  )

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{pageTitle}</span>
          </nav>
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="text-xl sm:text-3xl font-bold text-foreground leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {activeCategory
                  ? `${activeCategory.giftCount} gifts in ${activeCategory.name}`
                  : `${filtered.length} ${
                      filtered.length === 1 ? "gift" : "gifts"
                    } found`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Sort */}
              <CustomSelect
                value={sort}
                onChange={setSort}
                options={SORT_OPTIONS}
                className="w-37.5 sm:w-42.5"
              />
              {/* View toggle */}
              <div className="hidden sm:flex border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer reminder strip — shown when user arrived via GRAB NOW */}
      {pendingCouponData && (
        <div className="bg-success/10 border-b border-success/20 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 text-sm">
            <Tag size={14} className="text-success shrink-0" />
            <span className="text-success font-semibold">
              Offer <span className="font-mono">{pendingCouponData.code}</span>{" "}
              is ready!
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              — {pendingCouponData.description}. Add gifts to your cart and the
              discount applies automatically.
            </span>
            <span className="text-muted-foreground sm:hidden text-xs">
              Add to cart — discount applies automatically.
            </span>
          </div>
        </div>
      )}

      {/* Mobile category horizontal scroll — hidden on desktop */}
      <div className="relative lg:hidden bg-background pt-3 pb-1 sticky top-16 z-40 border-b border-border/50">
        <div
          ref={categoryScrollRef}
          className="category-filter-strip flex gap-2.5 overflow-x-auto px-4 pt-1 pb-3 snap-x snap-proximity overscroll-x-contain"
          style={{ scrollbarWidth: "none" }}
        >
          {/* All button */}
          <button
            onClick={() => setSelectedCategories([])}
            className="flex w-20 flex-col items-center gap-2 shrink-0 snap-start transition-all duration-150 active:scale-95"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                selectedCategories.length === 0
                  ? "bg-primary text-white"
                  : "bg-card text-primary"
              }`}
              style={{
                boxShadow:
                  selectedCategories.length === 0
                    ? "3px 3px 8px var(--nm-dark), -2px -2px 6px var(--nm-light)"
                    : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
              }}
            >
              <Sparkles size={28} />
            </div>
            <span
              className={`w-full text-xs font-medium text-center leading-tight ${
                selectedCategories.length === 0
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              All
            </span>
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategories.includes(cat.id)
            return (
              <button
                key={cat.id}
                ref={isActive ? activeCategoryRef : null}
                onClick={() => toggleCategory(cat.id)}
                className="flex w-20 flex-col items-center gap-2 shrink-0 snap-start transition-all duration-150 active:scale-95"
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    isActive ? "bg-primary text-white" : "bg-card text-primary"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? "3px 3px 8px var(--nm-dark), -2px -2px 6px var(--nm-light)"
                      : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                  }}
                >
                  {CATEGORY_ICONS[cat.id] ?? <Sparkles size={28} />}
                </div>
                <span
                  className={`w-full text-xs font-medium text-center leading-tight ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <p className="font-semibold text-foreground mb-4 flex items-center justify-between">
                Filters
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </p>
              <FilterPanel showCategories />
            </div>
          </aside>

          {/* Mobile filters */}
          {filtersOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
            >
              <div
                className="bg-card w-72 h-full p-5 overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="font-semibold text-foreground">Filters</p>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Search size={32} />}
                title="No gifts found"
                description={
                  query
                    ? `No results for "${query}". Try different keywords or clear your filters.`
                    : "No gifts match your current filters."
                }
                action={{ label: "Clear filters", onClick: clearFilters }}
              />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5"
                    : "flex flex-col gap-3 sm:gap-4"
                }
              >
                {filtered.map((gift) => (
                  <ProductCard key={gift.id} gift={gift} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
