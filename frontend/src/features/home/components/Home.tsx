import { formatPrice } from "../../../utils/format"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Headphones,
  Package,
  MapPin,
  Gift,
  BadgeCheck,
  Store,
  TrendingUp,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import ProductCard from "../../products/components/ProductCard"
import CategoryCard from "../../products/components/CategoryCard"
import Button from "../../../components/ui/Button"
import { testimonials } from "../../../services/contentService"
import { categories } from "../../products/services/productService"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { getCatalogProducts } from "../../products/services/productService"
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../../utils/image"

const HERO_IMAGE = "https://images.unsplash.com/photo-1544639044-4f142ceb6a2b"
const RECENT_SALES_WINDOW_MS = 90 * 24 * 60 * 60 * 1000

export default function Home() {
  const navigate = useNavigate()
  const { orders, reviews } = useOrdersState()
  const catalogProducts = getCatalogProducts()
  const featured = catalogProducts.filter((gift) => gift.featured === true)
  const bestSellers = useMemo(() => {
    const completedOrders = orders
      .filter((order) => order.status === "delivered")
      .map((order) => ({
        order,
        completedAt: new Date(
          order.statusTimestamps?.delivered ??
            order.updatedAt ??
            order.createdAt,
        ).getTime(),
      }))
      .filter(({ completedAt }) => Number.isFinite(completedAt))

    if (completedOrders.length === 0) return []

    const latestCompletedAt = Math.max(
      ...completedOrders.map(({ completedAt }) => completedAt),
    )
    const cutoff = latestCompletedAt - RECENT_SALES_WINDOW_MS
    const sales = new Map<string, number>()

    completedOrders
      .filter(({ completedAt }) => completedAt >= cutoff)
      .forEach(({ order }) => {
        order.items.forEach((item) => {
          sales.set(
            item.gift.id,
            (sales.get(item.gift.id) ?? 0) + item.quantity,
          )
        })
      })

    return catalogProducts
      .filter((gift) => (sales.get(gift.id) ?? 0) > 0)
      .sort(
        (a, b) =>
          (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) ||
          b.rating - a.rating,
      )
      .slice(0, 8)
  }, [catalogProducts, orders])

  // All reviews for the marquee: user-submitted first (newest), then static testimonials
  const displayTestimonials = useMemo(() => {
    const userReviews = [...reviews]
      .filter((r) => r.comment.length > 40)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((r) => ({
        id: r.id,
        name: r.userName,
        location: r.verified ? "Verified Purchase" : "Customer",
        text: r.comment,
        rating: r.rating,
        avatar: r.userAvatar ?? "",
        verified: r.verified,
        isUserReview: true,
      }))

    const staticItems = testimonials.map((t) => ({
      ...t,
      verified: false,
      isUserReview: false,
    }))
    return [...userReviews, ...staticItems]
  }, [reviews])

  return (
    <CustomerLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground min-h-[88vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl(HERO_IMAGE, 1600, 900)}
            srcSet={getResponsiveImageSrcSet(
              HERO_IMAGE,
              [480, 640, 960, 1280, 1600],
              16 / 9,
            )}
            sizes="100vw"
            alt="Gift surprise"
            width={1600}
            height={900}
            className="w-full h-full object-cover opacity-30"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/70 to-foreground/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm mb-5 sm:mb-6 backdrop-blur-sm border border-white/20">
              <Gift size={13} className="text-primary" />
              Delivering joy across Nepal
            </div>
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5 sm:mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Make Someone's
              <span className="block text-primary">Day Special.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 sm:mb-10 max-w-lg">
              Choose a gift, pick the perfect day, and send a surprise anywhere
              in Nepal — even when you're in a different city.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="xl"
                onClick={() => navigate("/gifts")}
                rightIcon={<ArrowRight size={20} />}
                className="shadow-lg shadow-primary/30"
              >
                Explore Gifts
              </Button>
            </div>
            {/* Trust stats */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10 pt-8 border-t border-white/10">
              {[
                ["10,000+", "Happy customers"],
                ["500+", "Gifts delivered"],
                ["10", "Cities covered"],
              ].map(([n, l]) => (
                <div key={l} className="flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {n}
                  </p>
                  <p className="text-xs sm:text-sm text-white/50">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating gift cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end animate-slideInRight">
            {featured.slice(0, 3).map((gift, i) => (
              <div
                key={gift.id}
                onClick={() => navigate(`/gifts/${gift.id}`)}
                className="bg-card/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 w-72 cursor-pointer hover:bg-card/20 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <img
                  src={getOptimizedImageUrl(gift.image, 160)}
                  alt={gift.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm leading-tight truncate">
                    {gift.name}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {formatPrice(gift.discountPrice ?? gift.price)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-accent fill-accent" />
                    <span className="text-white/60 text-xs">
                      {(() => {
                        const giftRevs = reviews.filter(
                          (r) => r.giftId === gift.id,
                        )
                        return giftRevs.length > 0
                          ? (
                              giftRevs.reduce((s, r) => s + r.rating, 0) /
                              giftRevs.length
                            ).toFixed(1)
                          : gift.rating
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="deferred-section max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-center justify-between gap-3 mb-10">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
              Browse by mood
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Popular Categories
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/gifts")}
            rightIcon={<ChevronRight size={16} />}
            className="flex-shrink-0"
          >
            See all
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Gifts */}
      <section className="deferred-section bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 mb-10">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
                Handpicked for you
              </p>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Featured Gifts
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/gifts")}
              rightIcon={<ChevronRight size={16} />}
              className="flex-shrink-0"
            >
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((gift) => (
              <ProductCard key={gift.id} gift={gift} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="deferred-section bg-primary-light/40 border-y border-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
                Trending right now
              </p>
              <p
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Best Sellers
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Discover the gifts everyone loves and make their special moment
                unforgettable.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-sm font-medium text-primary self-start sm:self-auto">
              <TrendingUp size={16} aria-hidden="true" />
              <span>Ranked automatically by sales</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestSellers.map((gift) => (
              <ProductCard key={gift.id} gift={gift} />
            ))}
          </div>
          {bestSellers.length === 0 && (
            <p className="text-sm text-muted-foreground py-8">
              Best sellers will appear after completed sales are recorded.
            </p>
          )}
        </div>
      </section>

      {/* Send anywhere banner — keep original */}
      <section className="deferred-section bg-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin size={32} className="text-white" />
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Send a Surprise Anywhere
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            You don't have to be in the same city as the recipient. Be in
            Kathmandu, send joy to Pokhara. You choose where, we make it happen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              "Kathmandu",
              "Pokhara",
              "Lalitpur",
              "Bhaktapur",
              "Biratnagar",
              "Birgunj",
              "Butwal",
              "Dharan",
              "+ more",
            ].map((city) => (
              <span
                key={city}
                className="px-3 py-1.5 bg-white/15 text-white rounded-full text-sm backdrop-blur-sm border border-white/20"
              >
                {city}
              </span>
            ))}
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/gifts")}
            className="bg-white !text-primary hover:bg-white/90 hover:!text-primary font-bold shadow-lg hover:shadow-xl"
          >
            Send a Surprise Now
          </Button>
        </div>
      </section>

      {/* Trust section */}
      <section className="deferred-section max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            {
              icon: Shield,
              title: "Secure Checkout",
              desc: "All payments encrypted & protected",
            },
            {
              icon: Clock,
              title: "On-Time Delivery",
              desc: "We guarantee your chosen delivery date",
            },
            {
              icon: Package,
              title: "Verified Products",
              desc: "Curated quality gifts, every time",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              desc: "Our team is always here to help",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-3 sm:p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-light rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Icon size={18} className="text-primary sm:hidden" />
                  <Icon size={22} className="text-primary hidden sm:block" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-xs sm:text-base">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Testimonials — infinite marquee */}
      <section className="deferred-section bg-muted/40 py-20 overflow-hidden">
        <div className="text-center mb-12 px-4">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Real stories
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What Our Customers Say
          </h2>
        </div>

        {/* Fade edges */}
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, var(--color-muted), transparent)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, var(--color-muted), transparent)",
            }}
          />

          <div className="animate-marquee gap-5 px-2.5">
            {/* Duplicate the list so the loop is seamless */}
            {[...displayTestimonials, ...displayTestimonials].map((t, idx) => (
              <div
                key={`${t.id}-${idx}`}
                className="bg-card rounded-2xl p-6 border border-border flex flex-col gap-4 mx-2.5 hover:shadow-lg transition-shadow cursor-default"
                style={{ minWidth: "300px", maxWidth: "300px" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < t.rating
                            ? "text-accent fill-accent"
                            : "text-border fill-border"
                        }
                      />
                    ))}
                  </div>
                  {"verified" in t && t.verified && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <BadgeCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-4">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <img
                      src={getOptimizedImageUrl(t.avatar, 80)}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-border flex-shrink-0">
                      {t.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="deferred-section max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🎁</div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to make
            <br />
            someone smile?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Discover the perfect gift and send a surprise that will be
            remembered forever.
          </p>
          <Button
            size="xl"
            onClick={() => navigate("/gifts")}
            rightIcon={<ArrowRight size={20} />}
            className="shadow-lg shadow-primary/25"
          >
            Start Gifting
          </Button>
        </div>
      </section>

      {/* Partner entry point */}
      <section className="deferred-section max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Store size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1.5">
              For gift shop owners
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground font-display">
              Have a Gift Shop?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Join Surprise Nepal and sell your gifts to customers across Nepal.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/partner")}
            rightIcon={<ArrowRight size={16} />}
            className="sm:flex-shrink-0"
          >
            Partner With Us
          </Button>
        </div>
      </section>
    </CustomerLayout>
  )
}
