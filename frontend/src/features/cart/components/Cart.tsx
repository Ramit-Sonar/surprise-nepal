import { Link, useNavigate } from "react-router-dom"
import { formatPrice } from "../../../utils/format"
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Shield,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import { useAppActions } from "../../../context/useApp"
import { useCartState } from "../hooks/useCartState"
import { useSessionState } from "../../auth/hooks/useSessionState"
import { getOptimizedImageUrl } from "../../../utils/image"
import { SESSION_KEYS, sessionStorageSet } from "../../../services/storage"

export default function Cart() {
  const { cart, cartTotal } = useCartState()
  const { user } = useSessionState()
  const { removeFromCart, updateCartQuantity, showToast, startCartCheckout } =
    useAppActions()
  const navigate = useNavigate()
  const DELIVERY_FEE = cart.length > 0 ? 200 : 0

  const handleCheckout = () => {
    startCartCheckout()
    if (!user) {
      sessionStorageSet(SESSION_KEYS.REDIRECT_AFTER_LOGIN, "/gift-intent")
      navigate("/auth")
      return
    }
    navigate("/gift-intent")
  }
  const total = cartTotal + DELIVERY_FEE

  if (cart.length === 0) {
    return (
      <CustomerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1
            className="text-2xl font-bold text-foreground mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Cart
          </h1>
          <EmptyState
            icon={<ShoppingBag size={36} />}
            title="Your cart is empty"
            description="Discover our beautiful gift collection and add something special for your loved ones."
            action={{
              label: "Browse Gifts",
              onClick: () => navigate("/gifts"),
            }}
          />
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">Cart</span>
        </nav>
        <h1
          className="text-2xl sm:text-3xl font-bold text-foreground mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const price = item.gift.discountPrice ?? item.gift.price
              return (
                <div
                  key={item.gift.id}
                  className="bg-card rounded-2xl border border-border p-4 sm:p-5 flex gap-4 sm:gap-5 animate-fadeIn"
                >
                  {/* Image */}
                  <Link to={`/gifts/${item.gift.id}`} className="shrink-0">
                    <img
                      src={getOptimizedImageUrl(item.gift.image, 192)}
                      alt={item.gift.name}
                      width={96}
                      height={96}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-muted border border-border hover:opacity-90 transition-opacity"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link to={`/gifts/${item.gift.id}`}>
                          <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight hover:text-primary transition-colors">
                            {item.gift.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {item.gift.category}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.gift.id)
                          showToast("Item removed from cart", "info")
                        }}
                        className="p-2 rounded-xl text-muted-foreground hover:text-error transition-all active:scale-95 shrink-0"
                        style={{
                          boxShadow:
                            "4px 4px 8px var(--nm-dark), -3px -3px 6px var(--nm-light)",
                        }}
                        aria-label={`Remove ${item.gift.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 gap-4">
                      {/* Quantity */}
                      <div
                        className="flex items-center rounded-full overflow-hidden bg-card"
                        style={{
                          boxShadow:
                            "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateCartQuantity(item.gift.id, item.quantity - 1)
                          }
                          className="w-9 h-9 flex items-center justify-center text-foreground transition-all active:scale-90 hover:text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-foreground select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.gift.id, item.quantity + 1)
                          }
                          className="w-9 h-9 flex items-center justify-center text-foreground transition-all active:scale-90 hover:text-primary disabled:opacity-40"
                          disabled={item.quantity >= item.gift.stockCount}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatPrice(price * item.quantity)}{" "}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order summary — inline on mobile, sticky sidebar on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground text-lg">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span className="font-medium text-foreground">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-xl text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderRadius: "0.875rem",
                  boxShadow:
                    "5px 5px 12px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
              >
                <Button
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Continue to Checkout
                </Button>
              </div>

              <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                <Shield size={13} />
                Secure & encrypted checkout
              </div>

              <div className="text-center">
                <Link
                  to="/gifts"
                  className="text-sm text-primary hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
