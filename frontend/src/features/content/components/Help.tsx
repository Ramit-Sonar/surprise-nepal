import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Search,
  Phone,
  Mail,
  MessageCircle,
  ShieldAlert,
  ReceiptText,
  PackageCheck,
  Truck,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { faqs } from "../../../services/contentService"

const FAQ_CATEGORIES = [
  "All",
  ...Array.from(new Set(faqs.map((f) => f.category))),
]

export default function Help() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [openId, setOpenId] = useState<string | null>(null)
  const supportOrderId = searchParams.get("orderId")

  useEffect(() => {
    if (window.location.hash !== "#cancellation-policy") return
    requestAnimationFrame(() => {
      document
        .getElementById("cancellation-policy")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [supportOrderId])

  const filtered = faqs.filter((faq) => {
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
        <span className="text-sm font-semibold text-foreground">
          Help Center
        </span>
      </div>

      {/* Hero */}
      <section className="bg-foreground py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            Help Center
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How can we help?
          </h1>
          <p className="text-white/70 mb-8">
            Search our FAQ or contact our support team.
          </p>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-foreground text-sm sm:text-base">
                  {faq.question}
                </span>
                {openId === faq.id ? (
                  <ChevronUp
                    size={18}
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    className="text-muted-foreground flex-shrink-0 mt-0.5"
                  />
                )}
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-5 border-t border-border pt-4 animate-fadeIn">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Search
                size={32}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-foreground font-semibold mb-1">
                No results found
              </p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or contact our support team
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Cancellation and refund policy */}
      <section
        className="bg-muted/40 py-16 scroll-mt-6"
        id="cancellation-policy"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 text-warning font-semibold text-sm mb-3">
              <ShieldAlert size={17} />
              Cancellation and Refund Policy
            </div>
            <h2
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Contact support before cancelling
            </h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Cancellation eligibility and refund amounts depend on how far your
              gift has progressed. Our support team reviews every request before
              confirming a refund.
            </p>
          </div>

          {supportOrderId && (
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <ReceiptText
                size={18}
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-semibold text-foreground">
                  Support request for order #{supportOrderId}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Keep this order ID ready when you call, email, or chat with
                  our support team.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <ReceiptText size={19} className="text-success" />
              </div>
              <p className="font-semibold text-foreground">
                Before preparation
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Pending or confirmed orders may qualify for a full refund when
                cancellation is approved before preparation begins.
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-warning/30 p-5">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <PackageCheck size={19} className="text-warning" />
              </div>
              <p className="font-semibold text-foreground">
                Preparing or ready
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                A full refund may not be available. The approved amount is based
                on recoverable value after materials, customization, and
                preparation costs are deducted.
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Truck size={19} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">
                Dispatched or delivered
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Cancellation is normally unavailable after dispatch. Delivered
                gifts are reviewed only for damage, incorrect items, or
                exceptional delivery issues.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 mt-6">
            <p className="font-semibold text-foreground">
              What to send with a refund request
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-muted-foreground">
              {[
                "Your order ID",
                "Payment screenshot or transaction reference for prepaid orders",
                "Reason for cancellation or refund",
                "Customer name and contact number used on the order",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">
              Cash on Delivery orders do not require a payment refund when no
              payment has been collected. Prepaid refunds are processed only
              after support verifies the payment and approves the eligible
              amount.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16" id="contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Still need help?
            </h2>
            <p className="text-muted-foreground">
              Our support team is ready to help you.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Phone,
                title: "Call Us",
                desc: "+977 980-000-0000",
                sub: "Daily 8 AM – 9 PM",
                href: "tel:+977980000000",
              },
              {
                icon: Mail,
                title: "Email Us",
                desc: "hello@giftsurprise.com.np",
                sub: supportOrderId
                  ? "Attach your payment screenshot if prepaid"
                  : "Response within 24 hours",
                href: supportOrderId
                  ? `mailto:hello@giftsurprise.com.np?subject=${encodeURIComponent(`Cancellation or refund request - ${supportOrderId}`)}`
                  : "mailto:hello@giftsurprise.com.np",
              },
              {
                icon: MessageCircle,
                title: "Live Chat",
                desc: "Chat with our team",
                sub: supportOrderId
                  ? `Share order #${supportOrderId}`
                  : "Instant response",
                href: "#",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.sub}
                  </p>
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </CustomerLayout>
  )
}
