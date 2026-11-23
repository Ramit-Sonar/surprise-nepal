import { formatPrice } from "../../../utils/format"
import { useState, useEffect, useMemo, useRef } from "react"
import { Heart, ShoppingCart, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Gift } from "../types"
import { useAppActions } from "../../../context/useApp"
import { useCartState } from "../../cart/hooks/useCartState"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import Rating from "../../../components/ui/Rating"
import Badge from "../../../components/ui/Badge"
import { getDeliverySettings } from "../../delivery/services/deliveryService"
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../../utils/image"

interface ProductCardProps {
  gift: Gift
  className?: string
}

export default function ProductCard({
  gift,
  className = "",
}: ProductCardProps) {
  const deliveryService = getDeliverySettings()
  const { wishlist } = useCartState()
  const { reviews } = useOrdersState()
  const { addToCart, toggleWishlist, showToast } = useAppActions()
  const navigate = useNavigate()
  const [cartAnimating, setCartAnimating] = useState(false)
  const [imgError, setImgError] = useState(false)
  const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (cartTimerRef.current) clearTimeout(cartTimerRef.current)
    },
    [],
  )

  const inWishlist = wishlist.includes(gift.id)

  // Compute live rating from submitted reviews
  const giftReviews = useMemo(
    () => reviews.filter((r) => r.giftId === gift.id),
    [gift.id, reviews],
  )
  const liveRating =
    giftReviews.length > 0
      ? Math.round(
          (giftReviews.reduce((s, r) => s + r.rating, 0) / giftReviews.length) *
            10,
        ) / 10
      : gift.rating
  const liveReviewCount =
    giftReviews.length > 0 ? giftReviews.length : gift.reviewCount
  const hasDiscount = gift.discountPrice !== undefined
  const discountPct = hasDiscount
    ? Math.round(((gift.price - gift.discountPrice!) / gift.price) * 100)
    : 0
  const imageSource = imgError
    ? "https://images.unsplash.com/photo-1513201099705-a9746e1e201f"
    : gift.image

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!gift.inStock) return
    addToCart(gift)
    setCartAnimating(true)
    if (cartTimerRef.current) clearTimeout(cartTimerRef.current)
    cartTimerRef.current = setTimeout(() => setCartAnimating(false), 400)
    showToast(`${gift.name} added to cart!`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlist(gift.id)
    showToast(
      inWishlist ? "Removed from wishlist" : "Added to wishlist!",
      inWishlist ? "info" : "success",
    )
  }

  return (
    <div
      className={`group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      onClick={() => navigate(`/gifts/${gift.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-square">
        <img
          src={getOptimizedImageUrl(imageSource, 640)}
          srcSet={getResponsiveImageSrcSet(imageSource, [240, 360, 480, 640])}
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 25vw"
          alt={gift.name}
          width={640}
          height={640}
          className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-300 sm:duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
          decoding="async"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge variant="primary" size="sm">
              {discountPct}% OFF
            </Badge>
          )}
          {!gift.inStock && (
            <Badge variant="error" size="sm">
              Out of Stock
            </Badge>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 p-2 rounded-full bg-card/90 backdrop-blur-sm shadow-md sm:hover:scale-110 transition-transform duration-150 flex items-center justify-center"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            className={`transition-colors duration-150 ${
              inWishlist
                ? "fill-primary text-primary animate-heartBeat"
                : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 capitalize">
          {gift.category}
        </p>
        <h3 className="font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {gift.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {gift.shortDescription}
        </p>

        {/* Rating */}
        <Rating
          value={liveRating}
          count={liveReviewCount}
          showCount
          size="sm"
          className="mb-3"
        />

        {/* Delivery */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Clock size={11} />
          <span>{deliveryService.estimatedDeliveryTime}</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div className="min-w-0">
            <span className="font-bold text-foreground text-base leading-tight block">
              {formatPrice(gift.discountPrice ?? gift.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through leading-tight block">
                {formatPrice(gift.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!gift.inStock}
            className={`
              flex items-center justify-center gap-1 px-3 py-2 min-h-11 sm:min-h-0 rounded-xl text-xs font-semibold transition-transform duration-150 shrink-0
              ${
                gift.inStock
                  ? "bg-primary text-white hover:bg-primary-dark active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }
              ${cartAnimating ? "animate-cartBounce" : ""}
            `}
            aria-label={`Add ${gift.name} to cart`}
          >
            <ShoppingCart size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}
