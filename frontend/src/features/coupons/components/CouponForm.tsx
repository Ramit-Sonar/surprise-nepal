import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Truck,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import Button from "../../../components/ui/Button"
import { useAppActions } from "../../../context/useApp"
import { useCheckoutState } from "../../payments/hooks/useCheckoutState"
import type { Coupon } from "../types"
import { generateCode } from "../services/couponService"

// ── Mini calendar date picker ─────────────────────────────────────────────────
function MiniCalendar({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  minDate?: string
  error?: string
}) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array.from({ length: firstDay })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const min = minDate
    ? new Date(minDate + "T00:00:00")
    : new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const isDisabled = (day: number) => {
    const d = new Date(year, month, day)
    return d < min
  }
  const isSelected = (day: number) => {
    if (!value) return false
    const sel = new Date(value + "T00:00:00")
    return (
      sel.getFullYear() === year &&
      sel.getMonth() === month &&
      sel.getDate() === day
    )
  }
  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const handleDay = (day: number) => {
    if (isDisabled(day)) return
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    onChange(formatted)
    setOpen(false)
  }

  const canGoPrev =
    new Date(year, month, 1) >
    new Date(today.getFullYear(), today.getMonth(), 1)

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
        style={{
          boxShadow: open
            ? "2px 2px 6px var(--nm-dark), -1px -1px 4px rgba(255,255,255,0.4)"
            : "4px 4px 10px var(--nm-dark), -3px -3px 8px rgba(255,255,255,0.35)",
          background: "var(--color-card)",
        }}
      >
        <Calendar size={15} className="text-primary flex-shrink-0" />
        <span
          className={
            displayValue
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          }
        >
          {displayValue || "Select date…"}
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-30 mt-2 rounded-2xl p-4 bg-card"
          style={{
            boxShadow:
              "8px 8px 20px var(--nm-dark), -4px -4px 12px rgba(255,255,255,0.35)",
          }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {monthName}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {dayLabels.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-medium text-muted-foreground py-0.5"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {blanks.map((_, i) => (
              <div key={`b${i}`} />
            ))}
            {days.map((day) => {
              const disabled = isDisabled(day)
              const selected = isSelected(day)
              const tod = isToday(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDay(day)}
                  disabled={disabled}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all duration-100
                    ${selected ? "bg-primary text-white scale-105" : ""}
                    ${
                      tod && !selected
                        ? "border border-primary text-primary font-bold"
                        : ""
                    }
                    ${
                      !selected && !tod && !disabled
                        ? "hover:bg-muted text-foreground"
                        : ""
                    }
                    ${
                      disabled
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                  style={
                    selected
                      ? {
                          boxShadow:
                            "2px 2px 6px rgba(194,0,60,0.4), -1px -1px 3px rgba(255,255,255,0.2)",
                        }
                      : {}
                  }
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const emptyForm = (): Omit<Coupon, "id" | "usageCount" | "createdAt"> => ({
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  maxUsageLimit: 0,
  perCustomerLimit: 0,
  startDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  status: "active",
  publishedOnSite: false,
})

export default function CouponForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { coupons } = useCheckoutState()
  const { addCoupon, updateCoupon, showToast } = useAppActions()

  const editingCoupon = id ? (coupons.find((c) => c.id === id) ?? null) : null
  const isEditing = Boolean(editingCoupon)

  const [form, setForm] =
    useState<Omit<Coupon, "id" | "usageCount" | "createdAt">>(() =>
      editingCoupon
        ? {
            code: editingCoupon.code,
            description: editingCoupon.description,
            discountType: editingCoupon.discountType,
            discountValue: editingCoupon.discountValue,
            minOrderAmount: editingCoupon.minOrderAmount,
            maxUsageLimit: editingCoupon.maxUsageLimit,
            perCustomerLimit: editingCoupon.perCustomerLimit,
            startDate: editingCoupon.startDate,
            expiryDate: editingCoupon.expiryDate,
            status: editingCoupon.status,
            publishedOnSite: editingCoupon.publishedOnSite ?? false,
          }
        : emptyForm(),
    )
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const setField = <K extends keyof typeof form,>(
    key: K,
    value: typeof form[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key])
      setFormErrors((prev) => {
        const n = { ...prev }
        delete n[key]
        return n
      })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.code.trim()) e.code = "Coupon code is required"
    else if (!/^[A-Z0-9_-]{3,20}$/i.test(form.code))
      e.code = "Code must be 3–20 alphanumeric characters"
    else {
      const dup = coupons.find(
        (c) =>
          c.code.toUpperCase() === form.code.toUpperCase() &&
          c.id !== editingCoupon?.id,
      )
      if (dup) e.code = "This code already exists"
    }
    if (!form.description.trim()) e.description = "Description is required"
    if (form.discountType !== "free_delivery") {
      if (!form.discountValue || form.discountValue <= 0)
        e.discountValue = "Value must be > 0"
      if (form.discountType === "percentage" && form.discountValue > 100)
        e.discountValue = "Percentage cannot exceed 100"
    }
    if (!form.startDate) e.startDate = "Start date is required"
    if (!form.expiryDate) e.expiryDate = "Expiry date is required"
    else if (form.startDate && form.expiryDate <= form.startDate)
      e.expiryDate = "Expiry must be after start date"
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (isEditing && editingCoupon) {
      updateCoupon({ ...editingCoupon, ...form })
      showToast("Coupon updated successfully")
    } else {
      addCoupon({
        ...form,
        code: form.code.toUpperCase(),
        id: `cp_${Date.now()}`,
        usageCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      })
      showToast("Coupon created successfully")
    }
    navigate("/admin/coupons")
  }

  // Derived discount label for preview
  const discountLabel =
    form.discountType === "free_delivery"
      ? "FREE DELIVERY"
      : form.discountType === "percentage"
        ? form.discountValue
          ? `${form.discountValue}% OFF`
          : "??% OFF"
        : form.discountValue
          ? `रु ${form.discountValue} OFF`
          : "रु ?? OFF"

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Coupons", to: "/admin/coupons" },
        { label: isEditing ? "Edit Coupon" : "Create Coupon" },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/coupons")}
              className="hidden lg:flex p-2 rounded-xl border border-border hover:bg-muted transition-colors"
              aria-label="Back to coupons"
            >
              <ArrowLeft size={16} className="text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Coupon" : "Create Coupon"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isEditing
                  ? `Editing ${editingCoupon?.code}`
                  : "Set up a new discount offer"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/coupons")}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Save Changes" : "Create Coupon"}
            </Button>
          </div>
        </div>

        {/* Two-column grid: form left, preview right (stacks on mobile) */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ── Left column: form ── */}
          <div className="space-y-5">
            {/* What customers see */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  What Customers See
                </span>
              </div>

              {/* Offer description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Offer Description <span className="text-error">*</span>
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    — shown as banner headline
                  </span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="e.g. Get 20% off on all birthday gifts!"
                  className="w-full text-sm rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={80}
                />
                <div className="flex justify-between mt-1">
                  {formErrors.description ? (
                    <p className="text-xs text-error">
                      {formErrors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {form.description.length}/80
                  </span>
                </div>
              </div>

              {/* Coupon code */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Coupon Code <span className="text-error">*</span>
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    — customers type this at checkout
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setField("code", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. SAVE20"
                    className="flex-1 text-sm rounded-xl px-3 py-2.5 font-mono border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => setField("code", generateCode())}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-foreground transition-all active:scale-95 flex-shrink-0"
                    style={{
                      boxShadow:
                        "4px 4px 10px var(--nm-dark), -3px -3px 8px rgba(255,255,255,0.35)",
                      background: "var(--color-card)",
                    }}
                  >
                    <RefreshCw size={13} className="text-primary" /> Auto
                  </button>
                </div>
                {formErrors.code && (
                  <p className="text-xs text-error mt-1">{formErrors.code}</p>
                )}
              </div>

              {/* Discount type + value */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount Type & Value
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    — highlighted on banner
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {([
                    { value: "percentage", label: "% Off", icon: null },
                    { value: "fixed", label: "रु Fixed", icon: null },
                    {
                      value: "free_delivery",
                      label: "Free Delivery",
                      icon: Truck,
                    },
                  ] as const).map((opt) => {
                    const active = form.discountType === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField("discountType", opt.value)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        style={
                          active
                            ? {
                                color: "var(--color-primary)",
                                background: "var(--color-card)",
                                boxShadow:
                                  "3px 3px 8px var(--nm-dark), -2px -2px 6px rgba(255,255,255,0.35)",
                              }
                            : {
                                color: "var(--color-muted-foreground)",
                                background: "var(--color-card)",
                                boxShadow:
                                  "4px 4px 10px var(--nm-dark), -3px -3px 8px rgba(255,255,255,0.35)",
                              }
                        }
                      >
                        {opt.icon && <opt.icon size={14} />}
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                {form.discountType !== "free_delivery" && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {form.discountType === "percentage" ? "%" : "रु"}
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={form.discountType === "percentage" ? 100 : undefined}
                      value={form.discountValue || ""}
                      onChange={(e) =>
                        setField("discountValue", Number(e.target.value))
                      }
                      placeholder={
                        form.discountType === "percentage"
                          ? "e.g. 20"
                          : "e.g. 500"
                      }
                      className="w-full text-sm rounded-xl pl-8 pr-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {formErrors.discountValue && (
                      <p className="text-xs text-error mt-1">
                        {formErrors.discountValue}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Validity */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Validity & Countdown
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <MiniCalendar
                    label="Start Date *"
                    value={form.startDate}
                    onChange={(v) => setField("startDate", v)}
                  />
                  {formErrors.startDate && (
                    <p className="text-xs text-error mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <MiniCalendar
                    label="Expiry Date *"
                    value={form.expiryDate}
                    onChange={(v) => setField("expiryDate", v)}
                    minDate={form.startDate || undefined}
                  />
                  {formErrors.expiryDate && (
                    <p className="text-xs text-error mt-1">
                      {formErrors.expiryDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Restrictions */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Redemption Restrictions
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Min Order (रु)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount || ""}
                    onChange={(e) =>
                      setField("minOrderAmount", Number(e.target.value))
                    }
                    placeholder="0 = none"
                    className="w-full text-sm rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Total Uses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxUsageLimit || ""}
                    onChange={(e) =>
                      setField("maxUsageLimit", Number(e.target.value))
                    }
                    placeholder="0 = unlimited"
                    className="w-full text-sm rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Per Customer
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.perCustomerLimit || ""}
                    onChange={(e) =>
                      setField("perCustomerLimit", Number(e.target.value))
                    }
                    placeholder="0 = unlimited"
                    className="w-full text-sm rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Coupon availability and banner visibility */}
            <div className="bg-card rounded-2xl border border-border p-6 divide-y divide-border">
              <div className="flex items-center justify-between gap-4 pb-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Coupon Active
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow customers to redeem this coupon during its validity
                    period
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      "status",
                      form.status === "active" ? "inactive" : "active",
                    )
                  }
                  className={`transition-colors ${
                    form.status === "active"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  aria-label={
                    form.status === "active"
                      ? "Deactivate coupon"
                      : "Activate coupon"
                  }
                >
                  {form.status === "active" ? (
                    <ToggleRight size={40} />
                  ) : (
                    <ToggleLeft size={40} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Publish on Site
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Show this active offer in the homepage announcement banner
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setField("publishedOnSite", !form.publishedOnSite)
                  }
                  className={`transition-colors ${
                    form.publishedOnSite
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  aria-label={
                    form.publishedOnSite
                      ? "Hide coupon from site banner"
                      : "Publish coupon in site banner"
                  }
                >
                  {form.publishedOnSite ? (
                    <ToggleRight size={40} />
                  ) : (
                    <ToggleLeft size={40} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right column: summary only ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Status card */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Summary
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-semibold text-primary">
                  {discountLabel}
                </span>
              </div>
              {form.minOrderAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min order</span>
                  <span className="font-medium text-foreground">
                    रु {form.minOrderAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {form.expiryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium text-foreground">
                    {form.expiryDate}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`font-semibold ${
                    form.status === "active"
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  {form.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Site banner</span>
                <span
                  className={`font-semibold ${
                    form.publishedOnSite
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {form.publishedOnSite ? "Published" : "Hidden"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom save bar (mobile-friendly) */}
        <div className="flex gap-3 lg:hidden">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate("/admin/coupons")}
          >
            Cancel
          </Button>
          <Button fullWidth onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Create Coupon"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
