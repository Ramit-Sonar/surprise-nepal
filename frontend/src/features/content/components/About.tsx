import { useNavigate } from "react-router-dom"
import {
  Gift,
  MapPin,
  Calendar,
  Smile,
  Heart,
  Shield,
  Clock,
  Users,
  ArrowRight,
  ChevronLeft,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import Button from "../../../components/ui/Button"
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../../utils/image"

const ABOUT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d"

export default function About() {
  const navigate = useNavigate()

  return (
    <CustomerLayout>
      {/* Mobile back bar */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground active:scale-95 transition-transform flex-shrink-0"
          style={{
            boxShadow:
              "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
          }}
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-foreground">About Us</span>
      </div>

      {/* Hero */}
      <section className="bg-foreground py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={getOptimizedImageUrl(ABOUT_HERO_IMAGE, 1600, 600)}
            srcSet={getResponsiveImageSrcSet(
              ABOUT_HERO_IMAGE,
              [640, 960, 1280, 1600],
              8 / 3,
            )}
            sizes="100vw"
            alt=""
            width={1600}
            height={600}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
            Our Story
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Making Every Moment
            <br />
            Unforgettable
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            We believe distance shouldn't stop you from showing someone you
            care. GiftSurprise was built to make gift-giving magical, personal,
            and effortless — anywhere in Nepal.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center">
            <Heart size={22} className="text-primary" />
          </div>
        </div>
        <h2
          className="text-3xl font-bold text-foreground mb-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Power of a Surprise
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
          There's something deeply special about receiving a surprise — the
          moment of joy when someone realizes you remembered, that you care
          enough to send something beautiful. We exist to create that moment,
          every day, for as many people as possible.
        </p>
      </section>

      {/* How It Works — detailed */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
              Simple by design
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Gift,
                step: "01",
                title: "Choose a Gift",
                desc: "Browse our handpicked collection of gifts for every occasion — flowers, cakes, chocolates, personalized items, and more.",
              },
              {
                icon: MapPin,
                step: "02",
                title: "Set the Location",
                desc: "Enter the recipient's address and pin the exact delivery location on our interactive map. Cross-city delivery available.",
              },
              {
                icon: Calendar,
                step: "03",
                title: "Pick Date & Time",
                desc: "Select the perfect delivery date and choose your preferred time window — morning, afternoon, or evening.",
              },
              {
                icon: Smile,
                step: "04",
                title: "We Do the Rest",
                desc: "Our team prepares, packages, and delivers your gift beautifully. You get real-time tracking every step of the way.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-foreground/10">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What We Stand For
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Trust & Security",
              desc: "Every transaction is encrypted. Every product verified. Your trust is our greatest asset.",
            },
            {
              icon: Clock,
              title: "Punctual Delivery",
              desc: "We understand the importance of timing. We go above and beyond to deliver on your chosen day.",
            },
            {
              icon: Heart,
              title: "Emotional Impact",
              desc: "We're not just delivering products. We're delivering feelings, memories, and connection.",
            },
            {
              icon: Users,
              title: "Community First",
              desc: "We partner with local florists, bakers, and artisans to support Nepali businesses.",
            },
            {
              icon: Gift,
              title: "Curated Quality",
              desc: "Every gift on our platform is hand-selected for quality, presentation, and emotional resonance.",
            },
            {
              icon: MapPin,
              title: "Nepal-Wide Reach",
              desc: "From Kathmandu to Janakpur, we're building a network that connects every city.",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex gap-4">
                <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
            {[
              ["10,000+", "Happy Customers"],
              ["500+", "Gifts Delivered"],
              ["98%", "On-Time Rate"],
              ["10", "Cities Covered"],
            ].map(([n, l]) => (
              <div key={l}>
                <p
                  className="text-4xl font-bold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {n}
                </p>
                <p className="text-white/70 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ready to send joy?
        </h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of people making moments unforgettable with
          GiftSurprise.
        </p>
        <Button
          size="xl"
          onClick={() => navigate("/gifts")}
          rightIcon={<ArrowRight size={20} />}
        >
          Start Gifting Today
        </Button>
      </section>
    </CustomerLayout>
  )
}
