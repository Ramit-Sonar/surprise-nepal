import { formatPrice, VALIDATION_MESSAGES } from "../../../utils/format"
import { lazy, Suspense, useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Calendar,
  MessageSquare,
  CreditCard,
  Check,
  Gift,
  Sparkles,
  Home,
  QrCode,
  Package,
  Truck,
  Banknote,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { Input, Textarea } from "../../../components/ui/Input"
import CustomSelect from "../../../components/ui/CustomSelect"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import DateTimePicker from "../../../components/common/DateTimePicker"
import PaymentCouponSummary from "./PaymentCouponSummary"
import { useAppActions } from "../../../context/useApp"
import { useCheckoutState } from "../hooks/useCheckoutState"
import { useSessionState } from "../../auth/hooks/useSessionState"
import {
  usePendingCoupon,
  clearPendingCoupon,
} from "../../coupons/hooks/usePendingCoupon"
import type { DeliveryLocation } from "../../delivery/types"
import type { CheckoutSubmission } from "../types"
import { getDeliverySettings } from "../../delivery/services/deliveryService"
import { getOptimizedImageUrl } from "../../../utils/image"

const MapSelector = lazy(() => import("../../delivery/components/MapSelector"))

function MapSelectorFallback() {
  return (
    <div className="h-90 rounded-2xl border border-border bg-muted flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

// Steps differ by mode
const SELF_STEPS = [
  { id: 1, label: "Your Details", icon: User },
  { id: 2, label: "Delivery", icon: MapPin },
  { id: 3, label: "Date & Time", icon: Calendar },
  { id: 4, label: "Payment", icon: CreditCard },
]

const SURPRISE_STEPS = [
  { id: 1, label: "Recipient", icon: User },
  { id: 2, label: "Delivery", icon: MapPin },
  { id: 3, label: "Date & Time", icon: Calendar },
  { id: 4, label: "Your Message", icon: MessageSquare },
  { id: 5, label: "Payment", icon: CreditCard },
]

export default function Checkout() {
  const deliveryService = getDeliverySettings()
  const checkoutState = useCheckoutState()
  const sessionState = useSessionState()
  const state = { ...checkoutState, ...sessionState }
  const { checkoutTotal } = checkoutState
  const { placeOrder, showToast, removeCoupon } = useAppActions()
  usePendingCoupon()
  const navigate = useNavigate()

  // Read mode set by the button that triggered checkout
  const mode = state.checkoutData.mode ?? "self"
  const isSurprise = mode === "surprise"
  const STEPS = isSurprise ? SURPRISE_STEPS : SELF_STEPS
  const lastStep = STEPS.length

  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const placingOrderRef = useRef(false)

  // Shared form state
  const [myName, setMyName] = useState(state.user?.name ?? "")
  const [myPhone, setMyPhone] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")

  const [city, setCity] = useState(deliveryService.availableCities[0] ?? "")
  const [location, setLocation] = useState<DeliveryLocation | null>(null)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] =
    useState<"morning" | "afternoon" | "evening">("morning")

  const [message, setMessage] = useState("")
  const [senderName, setSenderName] = useState(state.user?.name ?? "")
  const [senderPhone, setSenderPhone] = useState("")

  const [paymentScreenshots, setPaymentScreenshots] = useState<string[]>([])
  // For self flow only; surprise is always QR
  const [selfPaymentMethod, setSelfPaymentMethod] = useState<"qr" | "cod">("qr")

  const DELIVERY_FEE = deliveryService.defaultDeliveryFee
  const applied = state.appliedCoupon
  const deliveryFee = applied?.deliveryFree ? 0 : DELIVERY_FEE
  const couponDiscount =
    applied && !applied.deliveryFree ? applied.discountAmount : 0
  const total = checkoutTotal + deliveryFee - couponDiscount

  if (state.checkoutItems.length === 0) {
    return (
      <CustomerLayout>
        <EmptyState
          icon={<Gift size={32} />}
          title="Your cart is empty"
          description="Add some gifts before proceeding to checkout."
          action={{ label: "Browse Gifts", onClick: () => navigate("/gifts") }}
        />
      </CustomerLayout>
    )
  }

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {}

    if (!isSurprise) {
      // Self flow
      if (s === 1) {
        if (!myName.trim()) e.myName = "Your name is required"
        if (!myPhone.trim()) e.myPhone = "Your phone number is required"
        else if (!/^[9][678]\d{8}$/.test(myPhone.replace(/\s/g, "")))
          e.myPhone = VALIDATION_MESSAGES.phone
      }
      if (s === 2) {
        if (!location?.address) e.location = "Please select a delivery location"
      }
      if (s === 3) {
        if (!deliveryDate) e.date = "Please select a delivery date"
      }
    } else {
      // Surprise flow
      if (s === 1) {
        if (!recipientName.trim())
          e.recipientName = "Recipient's name is required"
        if (!recipientPhone.trim())
          e.recipientPhone = "Recipient's phone is required"
        else if (!/^[9][678]\d{8}$/.test(recipientPhone.replace(/\s/g, "")))
          e.recipientPhone = VALIDATION_MESSAGES.phone
        if (!senderPhone.trim()) e.senderPhone = "Your phone number is required"
        else if (!/^[9][678]\d{8}$/.test(senderPhone.replace(/\s/g, "")))
          e.senderPhone = VALIDATION_MESSAGES.phone
      }
      if (s === 2) {
        if (!location?.address) e.location = "Please select a delivery location"
      }
      if (s === 3) {
        if (!deliveryDate) e.date = "Please select a delivery date"
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (validate(step)) setStep((s) => Math.min(lastStep, s + 1))
  }
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const mountedRef = useRef(true)
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handlePlaceOrder = async () => {
    if (placingOrderRef.current) return
    placingOrderRef.current = true
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    const recipient = isSurprise
      ? {
          name: recipientName,
          phone: recipientPhone,
          message,
          senderName,
          senderPhone,
        }
      : {
          name: myName,
          phone: myPhone,
          message: "",
          senderName: "",
          senderPhone: "",
        }

    const submission: CheckoutSubmission = {
      mode,
      items: state.checkoutItems.map((item) => ({
        productId: item.gift.id,
        quantity: item.quantity,
      })),
      recipient,
      location: location!,
      deliveryDate,
      deliveryTime,
      paymentMethod:
        isSurprise || selfPaymentMethod === "qr"
          ? "QR Transfer"
          : "Cash on Delivery",
      paymentProofReferences: paymentScreenshots,
      couponCode: applied?.coupon.code,
    }

    const result = await placeOrder(submission)
    if (!result.ok) {
      showToast(result.message, "error")
      setLoading(false)
      placingOrderRef.current = false
      return
    }
    removeCoupon()
    clearPendingCoupon()
    showToast("Order placed successfully!")
    navigate(`/order-confirmation/${result.order.id}`)
    placingOrderRef.current = false
    if (mountedRef.current) setLoading(false)
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 overflow-x-hidden">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/cart" className="hover:text-foreground">
            Cart
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">
            {isSurprise ? "Send as Surprise" : "Buy for Myself"}
          </span>
        </nav>

        {/* Mode badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 ${
            isSurprise
              ? "bg-primary-light text-primary border border-primary/20"
              : "bg-success/10 text-success border border-success/20"
          }`}
        >
          {isSurprise ? (
            <>
              <Sparkles size={15} /> Sending as a Surprise Gift
            </>
          ) : (
            <>
              <Home size={15} /> Buying for Myself
            </>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500 z-0"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s) => {
            const Icon = s.icon
            const done = step > s.id
            const current = step === s.id
            return (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1.5 relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background ${
                    done
                      ? "bg-primary border-primary"
                      : current
                        ? "border-primary bg-primary-light"
                        : "border-border"
                  }`}
                >
                  {done ? (
                    <Check size={13} className="text-white" />
                  ) : (
                    <Icon
                      size={13}
                      className={
                        current ? "text-primary" : "text-muted-foreground"
                      }
                    />
                  )}
                </div>
                <span
                  className={`text-2xs font-medium hidden sm:block ${
                    current
                      ? "text-primary"
                      : done
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Mobile step label */}
        <p className="sm:hidden text-xs font-semibold text-primary mb-4">
          Step {step} of {STEPS.length} — {STEPS[step - 1].label}
        </p>

        {/* Mobile order summary — collapsed card, hidden on desktop */}
        <div className="lg:hidden bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Order Summary
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatPrice(total)}
            </p>
          </div>
          <div className="mt-2 space-y-1">
            {state.checkoutItems.map((item) => (
              <div key={item.gift.id} className="flex items-center gap-2">
                <img
                  src={getOptimizedImageUrl(item.gift.image, 64)}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-xs text-muted-foreground truncate flex-1">
                  {item.gift.name} × {item.quantity}
                </p>
                <p className="text-xs font-medium text-foreground shrink-0">
                  {formatPrice(
                    (item.gift.discountPrice ?? item.gift.price) *
                      item.quantity,
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Delivery{applied?.deliveryFree ? " (FREE)" : ""}</span>
              <span className={applied?.deliveryFree ? "line-through" : ""}>
                {formatPrice(DELIVERY_FEE)}
              </span>
            </div>
            {applied && !applied.deliveryFree && (
              <div className="flex justify-between text-success">
                <span>Coupon {applied.coupon.code}</span>
                <span>− {formatPrice(couponDiscount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 min-w-0">
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 lg:p-8">
              {/* ── SELF FLOW ── */}
              {!isSurprise && step === 1 && (
                <div className="animate-fadeIn space-y-6">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Your details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      We'll deliver this gift directly to you.
                    </p>
                  </div>
                  <div className="bg-success/8 border border-success/20 rounded-xl p-4 flex items-start gap-3">
                    <Home
                      size={16}
                      className="text-success mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-foreground">
                      This gift is <strong>for you</strong>. We'll deliver it to
                      your address on the date you choose.
                    </p>
                  </div>
                  <Input
                    label="Your Full Name"
                    placeholder="e.g. Priya Sharma"
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    error={errors.myName}
                    required
                    autoFocus
                  />
                  <Input
                    label="Your Phone Number"
                    placeholder="e.g. 9841234567"
                    type="tel"
                    value={myPhone}
                    onChange={(e) => setMyPhone(e.target.value)}
                    error={errors.myPhone}
                    hint="Our delivery team will call you when they're close"
                    required
                  />
                </div>
              )}

              {!isSurprise && step === 2 && (
                <div className="animate-fadeIn space-y-5">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Your delivery address
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Pin your exact location so we deliver right to your door.
                    </p>
                  </div>
                  <CustomSelect
                    label="Your City"
                    value={city}
                    onChange={setCity}
                    options={deliveryService.availableCities.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    required
                  />
                  <Suspense fallback={<MapSelectorFallback />}>
                    <MapSelector
                      city={city}
                      value={location}
                      onChange={setLocation}
                    />
                  </Suspense>
                  {errors.location && (
                    <p className="text-xs text-error">⚠ {errors.location}</p>
                  )}
                </div>
              )}

              {!isSurprise && step === 3 && (
                <div className="animate-fadeIn space-y-5">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      When should it arrive?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Pick the date and time slot that works best for you.
                    </p>
                  </div>
                  <DateTimePicker
                    selectedDate={deliveryDate}
                    selectedTime={deliveryTime}
                    onDateChange={setDeliveryDate}
                    onTimeChange={setDeliveryTime}
                  />
                  {errors.date && (
                    <p className="text-xs text-error">⚠ {errors.date}</p>
                  )}
                </div>
              )}

              {!isSurprise && step === 4 && (
                <PaymentStep
                  total={total}
                  deliveryFee={DELIVERY_FEE}
                  isSurprise={isSurprise}
                  selfPaymentMethod={selfPaymentMethod}
                  setSelfPaymentMethod={setSelfPaymentMethod}
                  paymentScreenshots={paymentScreenshots}
                  setPaymentScreenshots={setPaymentScreenshots}
                />
              )}

              {/* ── SURPRISE FLOW ── */}
              {isSurprise && step === 1 && (
                <div className="animate-fadeIn space-y-6">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Who is receiving the surprise?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Enter the details of the person you're surprising — they
                      won't know it's coming.
                    </p>
                  </div>
                  <div className="bg-primary-light border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles
                      size={16}
                      className="text-primary mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-primary mb-0.5">
                        Their surprise stays secret
                      </p>
                      <p className="text-xs text-muted-foreground">
                        The recipient gets no notification until the gift is at
                        their door. You can be anywhere in Nepal.
                      </p>
                    </div>
                  </div>
                  <Input
                    label="Recipient's Full Name"
                    placeholder="e.g. Anisha Thapa"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    error={errors.recipientName}
                    required
                    autoFocus
                  />
                  <Input
                    label="Recipient's Phone Number"
                    placeholder="e.g. 9841234567"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    error={errors.recipientPhone}
                    hint="Only used by our delivery team to coordinate drop-off — not to spoil the surprise"
                    required
                  />
                  <div className="border-t border-border pt-4 space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Your Contact (Sender)
                    </p>
                    <Input
                      label="Your Phone Number"
                      placeholder="e.g. 9807654321"
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      error={errors.senderPhone}
                      hint="We'll call you if we can't reach the recipient — this number is never shared"
                      required
                    />
                    <Input
                      label="Your Name (optional)"
                      placeholder="e.g. Rahul"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      hint="Leave blank to stay anonymous"
                    />
                  </div>
                </div>
              )}

              {isSurprise && step === 2 && (
                <div className="animate-fadeIn space-y-5">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Where should the surprise be delivered?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Pin the recipient's exact location — their home, office,
                      or wherever they'll be.
                    </p>
                  </div>
                  <CustomSelect
                    label="Recipient's City"
                    value={city}
                    onChange={setCity}
                    options={deliveryService.availableCities.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    required
                  />
                  <Suspense fallback={<MapSelectorFallback />}>
                    <MapSelector
                      city={city}
                      value={location}
                      onChange={setLocation}
                    />
                  </Suspense>
                  {errors.location && (
                    <p className="text-xs text-error">⚠ {errors.location}</p>
                  )}
                </div>
              )}

              {isSurprise && step === 3 && (
                <div className="animate-fadeIn space-y-5">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Choose the perfect surprise moment
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Pick the date and time the gift should arrive — plan it
                      around their birthday, anniversary, or just because.
                    </p>
                  </div>
                  <DateTimePicker
                    selectedDate={deliveryDate}
                    selectedTime={deliveryTime}
                    onDateChange={setDeliveryDate}
                    onTimeChange={setDeliveryTime}
                  />
                  {errors.date && (
                    <p className="text-xs text-error">⚠ {errors.date}</p>
                  )}
                </div>
              )}

              {isSurprise && step === 4 && (
                <div className="animate-fadeIn space-y-5">
                  <div>
                    <h2
                      className="text-xl font-bold text-foreground mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Add a heartfelt message
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your message will be printed on a card and delivered with
                      the gift.
                    </p>
                  </div>
                  <Textarea
                    label="Your message to them"
                    placeholder={`e.g. Happy Birthday! I know I can't be there with you today, but I hope this little surprise reaches you with all my love. You deserve every bit of happiness. ❤️`}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={300}
                    showCount
                    currentLength={message.length}
                    hint="Optional — but it turns a gift into a memory"
                  />
                  <Input
                    label="Your name (how to sign the card)"
                    placeholder="e.g. Rahul"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    hint="Leave blank to stay anonymous"
                  />
                  {message && (
                    <div className="bg-muted rounded-xl p-4 border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        Card Preview
                      </p>
                      <p className="text-sm text-foreground italic leading-relaxed">
                        "{message}"
                      </p>
                      {senderName && (
                        <p className="text-sm text-muted-foreground mt-2">
                          — {senderName}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isSurprise && step === 5 && (
                <PaymentStep
                  total={total}
                  deliveryFee={DELIVERY_FEE}
                  isSurprise={isSurprise}
                  selfPaymentMethod={selfPaymentMethod}
                  setSelfPaymentMethod={setSelfPaymentMethod}
                  paymentScreenshots={paymentScreenshots}
                  setPaymentScreenshots={setPaymentScreenshots}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-border gap-3">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevStep}
                    leftIcon={<ChevronLeft size={15} />}
                  >
                    Back
                  </Button>
                ) : (
                  <Link to="/cart">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ChevronLeft size={15} />}
                    >
                      Cart
                    </Button>
                  </Link>
                )}
                {step < lastStep ? (
                  <Button
                    size="sm"
                    onClick={nextStep}
                    rightIcon={<ChevronRight size={15} />}
                  >
                    Continue
                  </Button>
                ) : (
                  (() => {
                    const needsScreenshot =
                      isSurprise || selfPaymentMethod === "qr"
                    const blocked =
                      needsScreenshot && paymentScreenshots.length === 0
                    return (
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          size="sm"
                          loading={loading}
                          disabled={blocked}
                          onClick={handlePlaceOrder}
                          leftIcon={<Check size={14} />}
                        >
                          <span className="hidden sm:inline">
                            {isSurprise ? "Send Surprise" : "Place Order"} ·{" "}
                          </span>
                          <span>{formatPrice(total)}</span>
                        </Button>
                        {blocked && (
                          <p className="text-xs text-muted-foreground text-right">
                            Upload screenshot first
                          </p>
                        )}
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Order summary sidebar — desktop only */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              {state.checkoutItems.map((item) => (
                <div key={item.gift.id} className="flex gap-3">
                  <img
                    src={getOptimizedImageUrl(item.gift.image, 96)}
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover bg-muted"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">
                      {item.gift.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">
                    {formatPrice(
                      (item.gift.discountPrice ?? item.gift.price) *
                        item.quantity,
                    )}
                  </p>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(checkoutTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Delivery
                    {applied?.deliveryFree ? (
                      <span className="ml-1 text-success text-xs">(FREE)</span>
                    ) : null}
                  </span>
                  <span
                    className={
                      applied?.deliveryFree
                        ? "line-through text-muted-foreground"
                        : ""
                    }
                  >
                    {formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
                {applied && !applied.deliveryFree && (
                  <div className="flex justify-between text-sm text-success">
                    <span className="flex items-center gap-1">
                      Coupon{" "}
                      <span className="font-mono font-bold">
                        {applied.coupon.code}
                      </span>
                    </span>
                    <span>− {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Live delivery summary */}
              <div className="bg-muted rounded-xl p-3 text-xs space-y-1.5">
                <p className="font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1">
                    {isSurprise ? (
                      <>
                        <Gift size={12} /> Surprise for
                      </>
                    ) : (
                      <>
                        <Package size={12} /> Delivering to
                      </>
                    )}
                  </span>
                </p>
                {isSurprise ? (
                  <>
                    {recipientName && (
                      <p>
                        <span className="text-muted-foreground">
                          Recipient:{" "}
                        </span>
                        {recipientName}
                      </p>
                    )}
                    {location && (
                      <p>
                        <span className="text-muted-foreground">At: </span>
                        {location.address}, {location.city}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {myName && (
                      <p>
                        <span className="text-muted-foreground">Name: </span>
                        {myName}
                      </p>
                    )}
                    {location && (
                      <p>
                        <span className="text-muted-foreground">At: </span>
                        {location.address}, {location.city}
                      </p>
                    )}
                  </>
                )}
                {deliveryDate && (
                  <p>
                    <span className="text-muted-foreground">On: </span>
                    {new Date(deliveryDate + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}{" "}
                    ({deliveryTime})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

function ScreenshotSlot({
  label,
  required,
  value,
  onRemove,
  onFile,
  fileRef,
  dragOver,
  setDragOver,
  uploading,
  uploadError,
}: {
  label: string
  required: boolean
  value: string | null
  onRemove: () => void
  onFile: (f: File) => void
  fileRef: React.RefObject<HTMLInputElement | null>
  dragOver: boolean
  setDragOver: (v: boolean) => void
  uploading: boolean
  uploadError: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-error">*</span>}
      </p>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-success bg-success/5">
          <img
            src={value}
            alt={label}
            className="w-full max-h-52 object-contain bg-muted"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-foreground/70 hover:bg-foreground rounded-full flex items-center justify-center transition-colors"
            aria-label={`Remove ${label}`}
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      ) : (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files?.[0]
              if (f) onFile(f)
            }}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-primary-light scale-[1.01]"
                : uploadError
                  ? "border-error/50 bg-error/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-xs font-medium text-foreground">
                  Uploading…
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload size={18} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Tap to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    JPG, PNG, WebP · max 10 MB
                  </p>
                </div>
              </>
            )}
          </div>
          {uploadError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-error">
              <AlertCircle size={12} /> {uploadError}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
              e.target.value = ""
            }}
          />
        </div>
      )}
    </div>
  )
}

function PaymentStep({
  total,
  deliveryFee,
  isSurprise,
  selfPaymentMethod,
  setSelfPaymentMethod,
  paymentScreenshots,
  setPaymentScreenshots,
}: {
  total: number
  deliveryFee: number
  isSurprise: boolean
  selfPaymentMethod: "qr" | "cod"
  setSelfPaymentMethod: (v: "qr" | "cod") => void
  paymentScreenshots: string[]
  setPaymentScreenshots: (v: string[]) => void
}) {
  const state = useCheckoutState()
  const { checkoutTotal } = state
  const { showToast } = useAppActions()
  const isQR = isSurprise || selfPaymentMethod === "qr"
  const fileRef1 = useRef<HTMLInputElement>(null)
  const fileRef2 = useRef<HTMLInputElement>(null)
  const [dragOver1, setDragOver1] = useState(false)
  const [dragOver2, setDragOver2] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleDownloadPaymentQR = () => {
    if (!state.paymentQR) return

    const mimeType =
      state.paymentQR.match(/^data:image\/([^;]+);/)?.[1] ?? "png"
    const extension =
      {
        jpeg: "jpg",
        jpg: "jpg",
        png: "png",
        webp: "webp",
        gif: "gif",
        "svg+xml": "svg",
      }[mimeType] ?? "png"
    const downloadLink = document.createElement("a")
    downloadLink.href = state.paymentQR
    downloadLink.download = `GiftSurprise-payment-QR.${extension}`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    showToast("Payment QR downloaded")
  }

  const processFile = (file: File, slot: 0 | 1) => {
    setUploadError("")
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!allowed.includes(file.type)) {
      setUploadError(
        "Invalid file type. Please upload a JPG, PNG, or WebP image.",
      )
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 10 MB.")
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      setTimeout(() => {
        const result = e.target?.result as string
        setPaymentScreenshots(
          slot === 0
            ? [result, ...paymentScreenshots.slice(1)]
            : [paymentScreenshots[0], result],
        )
        setUploading(false)
      }, 600)
    }
    reader.readAsDataURL(file)
  }

  const removeScreenshot = (slot: 0 | 1) => {
    if (slot === 0) {
      // shift second to first
      setPaymentScreenshots(paymentScreenshots.slice(1))
    } else {
      setPaymentScreenshots([paymentScreenshots[0]])
    }
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2
          className="text-xl font-bold text-foreground mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Payment
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSurprise
            ? "Scan the QR to pay, then upload your screenshot."
            : "Choose how you would like to pay."}
        </p>
      </div>

      {/* Payment method selector — self only */}
      {!isSurprise && (
        <div className="grid grid-cols-2 gap-3">
          {([
            {
              id: "qr" as const,
              label: "QR Payment",
              Icon: QrCode,
              desc: "Scan & pay instantly",
            },
            {
              id: "cod" as const,
              label: "Cash on Delivery",
              Icon: Banknote,
              desc: "Pay when delivered",
            },
          ] as const).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelfPaymentMethod(m.id)
                setPaymentScreenshots([])
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                selfPaymentMethod === m.id
                  ? "border-primary bg-primary-light"
                  : "border-border hover:border-primary/40 hover:bg-muted"
              }`}
            >
              <m.Icon
                size={24}
                className={
                  selfPaymentMethod === m.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              />
              <p className="font-semibold text-sm text-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selfPaymentMethod === m.id
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {selfPaymentMethod === m.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <PaymentCouponSummary
        subtotal={checkoutTotal}
        deliveryFee={deliveryFee}
        total={total}
      />

      {/* ── COD confirmation ── */}
      {!isQR && (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-5 bg-muted rounded-2xl border border-border">
            <Truck size={28} className="text-muted-foreground shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Cash on Delivery</p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll pay{" "}
                <span className="font-bold text-foreground">
                  {formatPrice(total)}
                </span>{" "}
                in cash when your gift arrives. No advance payment needed.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertCircle
              size={16}
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <p className="text-sm text-amber-800">
              Your order will be confirmed by our team before dispatch. You'll
              see <strong>Order Confirmed</strong> in your timeline once
              approved.
            </p>
          </div>
        </div>
      )}

      {/* ── QR display ── */}
      {isQR &&
        (state.paymentQR ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground text-center">
              Scan this QR to pay
            </p>
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-5 shadow-xl shadow-foreground/10 border border-border max-w-65 w-full">
                <p className="text-center text-2xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  GiftSurprise · Payment QR
                </p>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={state.paymentQR}
                    alt="Payment QR Code — scan to pay"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                  Please pay exactly{" "}
                  <span className="text-foreground font-bold">
                    {formatPrice(total)}
                  </span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  leftIcon={<Download size={15} />}
                  onClick={handleDownloadPaymentQR}
                >
                  Download QR
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Open your payment app, scan the QR, and enter the exact amount
              above.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertCircle
              size={18}
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Payment QR not configured
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Contact support or wait until the payment QR is set up by the
                admin.
              </p>
            </div>
          </div>
        ))}

      {/* Divider + screenshot — QR only */}
      {isQR && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground font-medium px-1">
            After paying
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* Screenshot upload */}
      {isQR && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Upload Payment Screenshot
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a screenshot of your completed payment. If your payment was
              rejected previously, you can attach both the original and top-up
              screenshots.
            </p>
          </div>

          {/* Slot 1 — required */}
          <ScreenshotSlot
            label="Screenshot 1"
            required
            value={paymentScreenshots[0] ?? null}
            onRemove={() => removeScreenshot(0)}
            onFile={(f) => processFile(f, 0)}
            fileRef={fileRef1}
            dragOver={dragOver1}
            setDragOver={setDragOver1}
            uploading={uploading && paymentScreenshots.length === 0}
            uploadError={paymentScreenshots.length === 0 ? uploadError : ""}
          />

          {/* Slot 2 — optional, shown after slot 1 is filled */}
          {paymentScreenshots.length >= 1 && (
            <ScreenshotSlot
              label="Screenshot 2 (optional)"
              required={false}
              value={paymentScreenshots[1] ?? null}
              onRemove={() => removeScreenshot(1)}
              onFile={(f) => processFile(f, 1)}
              fileRef={fileRef2}
              dragOver={dragOver2}
              setDragOver={setDragOver2}
              uploading={uploading && paymentScreenshots.length === 1}
              uploadError={paymentScreenshots.length === 1 ? uploadError : ""}
            />
          )}

          {paymentScreenshots.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl border border-success/20">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <p className="text-sm text-success font-medium">
                {paymentScreenshots.length === 1
                  ? "Screenshot uploaded — you're ready to place your order!"
                  : "2 screenshots uploaded — you're ready to place your order!"}
              </p>
            </div>
          )}

          {uploadError && paymentScreenshots.length === 0 && (
            <p className="flex items-center gap-1.5 text-xs text-error">
              <AlertCircle size={13} /> {uploadError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
