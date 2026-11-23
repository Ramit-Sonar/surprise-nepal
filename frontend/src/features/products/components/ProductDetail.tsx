import { formatPrice } from "../../../utils/format"
import { useState, useMemo, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Heart,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Minus,
  Plus,
  Share2,
  Check,
  Gift,
  ArrowRight,
  Truck,
  ThumbsUp,
  BadgeCheck,
  Send,
  User,
  Calendar,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import Rating from "../../../components/ui/Rating"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import ProductCard from "./ProductCard"
import { useAppActions } from "../../../context/useApp"
import { useCartState } from "../../cart/hooks/useCartState"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { useSessionState } from "../../auth/hooks/useSessionState"
import { getCatalogProducts } from "../services/productService"
import { getDeliverySettings } from "../../delivery/services/deliveryService"
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../../utils/image"
import { SESSION_KEYS, sessionStorageSet } from "../../../services/storage"

export default function GiftDetail() {
  const gifts = getCatalogProducts()
  const deliveryService = getDeliverySettings()
  const { id } = useParams<{ id: string }>()
  const gift = gifts.find((g) => g.id === id)
  const navigate = useNavigate()
  const sessionState = useSessionState()
  const cartState = useCartState()
  const ordersState = useOrdersState()
  const state = { ...sessionState, ...cartState, ...ordersState }
  const {
    addToCart,
    startBuyNow,
    toggleWishlist,
    isInWishlist,
    showToast,
    setCheckoutData,
    addReview,
    markReviewHelpful,
  } = useAppActions()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] =
    useState<"description" | "includes" | "delivery" | "reviews">("description")
  const [cartAdded, setCartAdded] = useState(false)
  const cartAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (cartAddedTimerRef.current) clearTimeout(cartAddedTimerRef.current)
    },
    [],
  )

  // Review form state
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHoverRating, setReviewHoverRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [helpfulMarked, setHelpfulMarked] = useState<Set<string>>(new Set())

  if (!gift) {
    return (
      <CustomerLayout>
        <EmptyState
          icon={<Gift size={32} />}
          title="Gift not found"
          description="This gift may have been removed or is no longer available."
          action={{ label: "Browse gifts", onClick: () => navigate("/gifts") }}
        />
      </CustomerLayout>
    )
  }

  const inWishlist = isInWishlist(gift.id)
  const related = gifts
    .filter(
      (g) =>
        g.id !== gift.id &&
        (g.category === gift.category ||
          g.occasions.some((o) => gift.occasions.includes(o))),
    )
    .slice(0, 4)
  const reviews = state.reviews.filter((r) => r.giftId === gift.id)
  const price = gift.discountPrice ?? gift.price

  // Computed rating from live reviews (falls back to gift.rating if no reviews)
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : gift.rating
  const reviewCount = reviews.length > 0 ? reviews.length : gift.reviewCount

  // Rating distribution
  const ratingDist = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }))
    const total = reviews.length || 1
    return dist.map((d) => ({ ...d, pct: Math.round((d.count / total) * 100) }))
  }, [reviews])

  // Has the logged-in user already reviewed this gift?
  const userReview = state.user
    ? reviews.find(
        (r) => r.userId === state.user!.id || r.userId === state.user!.email,
      )
    : null

  // Has the user purchased this gift (check any order)
  const hasPurchased = state.user
    ? state.orders.some((o) => o.items.some((item) => item.gift.id === gift.id))
    : false
  const discountPct = gift.discountPrice
    ? Math.round(((gift.price - gift.discountPrice) / gift.price) * 100)
    : 0

  const handleAddToCart = () => {
    addToCart(gift, quantity)
    setCartAdded(true)
    if (cartAddedTimerRef.current) clearTimeout(cartAddedTimerRef.current)
    cartAddedTimerRef.current = setTimeout(() => setCartAdded(false), 2000)
    showToast(`${gift.name} added to cart!`)
  }

  const handleBuyNow = () => {
    startBuyNow(gift, quantity)
    if (!state.user) {
      sessionStorageSet(SESSION_KEYS.REDIRECT_AFTER_LOGIN, "/gift-intent")
      navigate("/auth")
      return
    }
    navigate("/gift-intent")
  }

  const handleSendSurprise = () => {
    startBuyNow(gift, quantity)
    setCheckoutData({ mode: "surprise" })
    if (!state.user) {
      sessionStorageSet(SESSION_KEYS.REDIRECT_AFTER_LOGIN, "/checkout")
      navigate("/auth")
      return
    }
    navigate("/checkout")
  }

  const handleSubmitReview = async () => {
    if (!state.user) {
      navigate("/auth")
      return
    }
    if (reviewRating === 0) {
      showToast("Please select a star rating", "error")
      return
    }
    if (reviewComment.trim().length < 10) {
      showToast("Review must be at least 10 characters", "error")
      return
    }
    setReviewSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    addReview({
      giftId: gift.id,
      userId: state.user.email,
      userName: state.user.name ?? state.user.email.split("@")[0],
      userAvatar: state.user.avatar,
      rating: reviewRating,
      comment: reviewComment.trim(),
      verified: hasPurchased,
    })
    setReviewRating(0)
    setReviewComment("")
    setReviewSubmitting(false)
    showToast("Thank you for your review!")
  }

  const handleMarkHelpful = (reviewId: string) => {
    if (helpfulMarked.has(reviewId)) return
    markReviewHelpful(reviewId)
    setHelpfulMarked((prev) => new Set(prev).add(reviewId))
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb row — back arrow on mobile, full breadcrumb on desktop */}
        <div className="flex items-center gap-2 mb-6 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground active:scale-95 transition-transform"
            style={{
              boxShadow:
                "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
            }}
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap pb-0.5 min-w-0">
            <Link to="/" className="hover:text-foreground shrink-0">
              Home
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <Link to="/gifts" className="hover:text-foreground shrink-0">
              Gifts
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <Link
              to={`/gifts?category=${gift.category}`}
              className="hover:text-foreground capitalize shrink-0"
            >
              {gift.category}
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-foreground font-medium truncate min-w-0">
              {gift.name}
            </span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              <img
                src={getOptimizedImageUrl(gift.images[selectedImage], 1200)}
                srcSet={getResponsiveImageSrcSet(
                  gift.images[selectedImage],
                  [480, 800, 1200],
                )}
                sizes="(max-width: 1023px) calc(100vw - 2rem), 50vw"
                alt={gift.name}
                width={1200}
                height={1200}
                className="w-full h-full object-cover transition-all duration-300"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            {gift.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                {gift.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(img, 160)}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Category + Occasions */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="muted" size="sm" className="capitalize">
                {gift.category}
              </Badge>
              {gift.occasions.slice(0, 2).map((o) => (
                <Badge key={o} variant="primary" size="sm">
                  {o}
                </Badge>
              ))}
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {gift.name}
            </h1>

            <Rating
              value={avgRating}
              count={reviewCount}
              showCount
              size="md"
              className="mb-5"
            />

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(price)}
              </span>
              {gift.discountPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(gift.price)}
                  </span>
                  <Badge variant="primary">{discountPct}% OFF</Badge>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <div
                className={`w-2 h-2 rounded-full ${
                  gift.inStock ? "bg-success" : "bg-error"
                }`}
              />
              <span className="text-sm font-medium">
                {gift.inStock ? (
                  <span className="text-success">
                    In Stock
                    {gift.stockCount < 10
                      ? ` — Only ${gift.stockCount} left`
                      : ""}
                  </span>
                ) : (
                  <span className="text-error">Out of Stock</span>
                )}
              </span>
            </div>

            {/* Short description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {gift.shortDescription}
            </p>

            {/* Delivery info */}
            <div className="flex items-start gap-3 p-4 bg-muted rounded-xl mb-6">
              <Clock size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {deliveryService.estimatedDeliveryTime}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {deliveryService.deliveryNotes}
                </p>
              </div>
            </div>

            {/* Cities */}
            <div className="flex items-start gap-2 mb-6">
              <MapPin
                size={15}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Available in:{" "}
                </span>
                {deliveryService.availableCities.join(", ")}
              </p>
            </div>

            {/* Quantity */}
            {gift.inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-foreground">
                  Quantity
                </span>
                <div
                  className="flex items-center rounded-2xl overflow-hidden bg-card"
                  style={{
                    boxShadow:
                      "5px 5px 12px var(--nm-dark), -4px -4px 10px var(--nm-light)",
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-foreground hover:text-primary transition-colors active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span
                    className="px-4 py-3 font-bold text-foreground min-w-10 text-center text-sm"
                    style={{
                      boxShadow:
                        "inset 3px 3px 6px var(--nm-dark), inset -2px -2px 5px var(--nm-light)",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(gift.stockCount, q + 1))
                    }
                    className="px-4 py-3 text-foreground hover:text-primary transition-colors active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {gift.inStock ? (
              <div className="space-y-3 mb-6">
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant={cartAdded ? "success" : "outline"}
                    onClick={handleAddToCart}
                    leftIcon={
                      cartAdded ? (
                        <Check size={18} />
                      ) : (
                        <ShoppingCart size={18} />
                      )
                    }
                    className="flex-1"
                  >
                    {cartAdded ? "Added!" : "Add to Cart"}
                  </Button>
                  <button
                    onClick={() => {
                      toggleWishlist(gift.id)
                      showToast(
                        inWishlist
                          ? "Removed from wishlist"
                          : "Added to wishlist!",
                        inWishlist ? "info" : "success",
                      )
                    }}
                    className={`p-3.5 rounded-xl transition-all active:scale-95 ${
                      inWishlist
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    style={{
                      boxShadow: inWishlist
                        ? "inset 3px 3px 7px var(--nm-dark), inset -2px -2px 5px var(--nm-light)"
                        : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={20}
                      className={inWishlist ? "fill-primary" : ""}
                    />
                  </button>
                </div>
                <Button size="lg" fullWidth onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-xl text-center mb-6">
                <p className="text-muted-foreground text-sm">
                  This gift is currently out of stock.
                </p>
              </div>
            )}

            {/* Share */}
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Share2 size={15} /> Share this gift
            </button>
          </div>
        </div>

        {/* SURPRISE SECTION */}
        <div className="mt-16 bg-linear-to-br from-primary/5 via-primary-light to-primary/10 border-2 border-primary/20 rounded-3xl p-5 sm:p-8 lg:p-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Gift size={20} className="text-white" />
              </div>
              <Badge variant="primary" size="md">
                Surprise Feature
              </Badge>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Send This as a Surprise
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You can choose exactly who receives it, where it should arrive —
              down to the precise location on a map — and the perfect delivery
              date. The recipient doesn't need to know it's coming.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  Icon: User,
                  title: "Choose Recipient",
                  desc: "Enter their name & number",
                },
                {
                  Icon: MapPin,
                  title: "Pin Location",
                  desc: "Select exact drop-off on a map",
                },
                {
                  Icon: Calendar,
                  title: "Pick the Date",
                  desc: "Choose when the surprise arrives",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="bg-card/70 backdrop-blur-sm rounded-xl p-4 border border-white/50"
                >
                  <div className="mb-2">
                    <step.Icon size={22} className="text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={handleSendSurprise}
              rightIcon={<ArrowRight size={18} />}
              className="shadow-lg shadow-primary/25"
            >
              Send as a Surprise
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-border overflow-x-auto">
            {(["description", "includes", "delivery", "reviews"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "includes"
                    ? "What's Included"
                    : tab === "delivery"
                      ? "Delivery Info"
                      : tab}
                  {tab === "reviews" && ` (${reviews.length})`}
                </button>
              ),
            )}
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {gift.description}
              </p>
            )}
            {activeTab === "includes" && (
              <ul className="space-y-3 max-w-md">
                {gift.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className="text-success shrink-0 mt-0.5"
                    />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "delivery" && (
              <div className="space-y-4 max-w-lg">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                  <Truck size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Estimated Delivery
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {deliveryService.estimatedDeliveryTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                  <Clock size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Delivery Policy
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {deliveryService.deliveryNotes}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                  <MapPin size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Available Cities
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {deliveryService.availableCities.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Rating summary */}
                {reviews.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-6 p-5 bg-muted rounded-2xl">
                    {/* Big score */}
                    <div className="flex flex-col items-center justify-center sm:min-w-25">
                      <span className="text-5xl font-bold text-foreground">
                        {avgRating.toFixed(1)}
                      </span>
                      <div className="flex gap-0.5 mt-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i <= Math.round(avgRating)
                                ? "text-accent fill-accent"
                                : "text-border fill-border"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                    {/* Bar breakdown */}
                    <div className="flex-1 space-y-2">
                      {ratingDist.map(({ star, count, pct }) => (
                        <div
                          key={star}
                          className="flex items-center gap-3 text-xs"
                        >
                          <span className="text-muted-foreground w-3 text-right">
                            {star}
                          </span>
                          <Star
                            size={11}
                            className="text-accent fill-accent shrink-0"
                          />
                          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-5">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Write a review */}
                {!userReview && (
                  <div className="border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Star size={16} className="text-accent" />
                      Write a Review
                    </h3>
                    {!state.user ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Sign in to share your experience with this gift.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            sessionStorageSet(
                              SESSION_KEYS.REDIRECT_AFTER_LOGIN,
                              `/gifts/${gift.id}`,
                            )
                            navigate("/auth")
                          }}
                        >
                          Sign in to Review
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {hasPurchased && (
                          <div className="flex items-center gap-2 text-xs text-success bg-success/8 rounded-xl px-3 py-2">
                            <BadgeCheck size={13} />
                            Verified Purchase — your review will display a
                            verified badge
                          </div>
                        )}
                        {/* Star picker */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">
                            Your rating <span className="text-error">*</span>
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setReviewHoverRating(star)}
                                onMouseLeave={() => setReviewHoverRating(0)}
                                onClick={() => setReviewRating(star)}
                                className="transition-transform hover:scale-110 active:scale-95"
                              >
                                <Star
                                  size={28}
                                  className={`transition-colors ${
                                    star <= (reviewHoverRating || reviewRating)
                                      ? "text-accent fill-accent"
                                      : "text-border fill-border"
                                  }`}
                                />
                              </button>
                            ))}
                            {(reviewHoverRating || reviewRating) > 0 && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                {
                                  [
                                    "",
                                    "Poor",
                                    "Fair",
                                    "Good",
                                    "Very Good",
                                    "Excellent",
                                  ][reviewHoverRating || reviewRating]
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Comment */}
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-1.5">
                            Your Review <span className="text-error">*</span>
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            placeholder="Share your honest experience — what did you love, what could be better? (min. 10 characters)"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-colors"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {reviewComment.length} characters
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSubmitReview}
                          loading={reviewSubmitting}
                          leftIcon={<Send size={14} />}
                          disabled={
                            reviewRating === 0 ||
                            reviewComment.trim().length < 10
                          }
                        >
                          Submit Review
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* User's existing review */}
                {userReview && (
                  <div className="border-2 border-primary/20 bg-primary-light rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-xs text-primary font-medium mb-3">
                      <Check size={13} />
                      Your Review
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {userReview.userName[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-foreground">
                            {userReview.userName}
                          </span>
                          <Rating value={userReview.rating} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {userReview.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <EmptyState
                    title="No reviews yet"
                    description="Be the first to share your experience with this gift."
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-sm">
                      {reviews.length}{" "}
                      {reviews.length === 1 ? "Review" : "Reviews"}
                    </h3>
                    {reviews
                      .filter(
                        (r) =>
                          !(
                            state.user &&
                            (r.userId === state.user.id ||
                              r.userId === state.user.email)
                          ),
                      )
                      .map((r) => (
                        <div
                          key={r.id}
                          className="border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            {r.userAvatar ? (
                              <img
                                src={getOptimizedImageUrl(r.userAvatar, 72)}
                                alt={r.userName}
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                {r.userName[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <span className="font-semibold text-sm text-foreground">
                                  {r.userName}
                                </span>
                                {r.verified && (
                                  <span className="flex items-center gap-1 text-xs text-success bg-success/8 px-2 py-0.5 rounded-full">
                                    <BadgeCheck size={11} /> Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Rating value={r.rating} size="sm" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(r.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {r.comment}
                          </p>
                          <button
                            onClick={() => handleMarkHelpful(r.id)}
                            className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-1.5 rounded-lg border ${
                              helpfulMarked.has(r.id)
                                ? "border-primary/30 text-primary bg-primary-light"
                                : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                            }`}
                          >
                            <ThumbsUp size={12} />
                            Helpful (
                            {r.helpful + (helpfulMarked.has(r.id) ? 1 : 0)})
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                You Might Also Like
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/gifts")}
                rightIcon={<ChevronRight size={15} />}
              >
                View all
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((g) => (
                <ProductCard key={g.id} gift={g} />
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
