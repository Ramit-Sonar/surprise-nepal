import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X, Copy, Check, Zap, Gift, ArrowRight } from "lucide-react"
import { useCheckoutState } from "../../payments/hooks/useCheckoutState"
import {
  getCouponStatus,
  formatDiscount,
} from "../../coupons/services/couponService"
import { SESSION_KEYS, sessionStorageSet } from "../../../services/storage"

function useCountdown(expiryDate: string, active: boolean) {
  const getRemaining = () => {
    const diff = new Date(expiryDate).setHours(23, 59, 59, 999) - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
      done: false,
    }
  }
  const [remaining, setRemaining] = useState(getRemaining)
  useEffect(() => {
    if (!active) return
    let id: ReturnType<typeof setInterval> | null = null
    const stop = () => {
      if (id) clearInterval(id)
      id = null
    }
    const start = () => {
      stop()
      setRemaining(getRemaining())
      if (!document.hidden)
        id = setInterval(() => setRemaining(getRemaining()), 1000)
    }
    const onVisibilityChange = () => (document.hidden ? stop() : start())
    start()
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, expiryDate])
  return remaining
}

interface TimeBlockProps {
  value: number
  label: string
}

function TimeBlock({ value, label }: TimeBlockProps) {
  const str = String(value).padStart(2, "0")
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg text-base sm:text-xl font-black text-white tabular-nums"
        style={{
          background: "rgba(0,0,0,0.28)",
          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.35)",
        }}
      >
        {str}
      </span>
      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/60 leading-none">
        {label}
      </span>
    </div>
  )
}

function Sep() {
  return (
    <span className="text-base sm:text-xl font-black text-white/40 pb-4 leading-none select-none">
      :
    </span>
  )
}

export default function AnnouncementBar() {
  const { coupons } = useCheckoutState()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)

  const coupon =
    coupons
      .filter((c) => c.publishedOnSite && getCouponStatus(c) === "active")
      .sort((a, b) => {
        if (a.discountType === "free_delivery") return -1
        if (b.discountType === "free_delivery") return 1
        if (a.discountType === "percentage" && b.discountType === "percentage")
          return b.discountValue - a.discountValue
        return 0
      })[0] ?? null

  const countdown = useCountdown(
    coupon?.expiryDate ?? "2099-12-31",
    Boolean(coupon) && !dismissed,
  )

  if (dismissed || !coupon || countdown.done) return null

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleGrab = () => {
    sessionStorageSet(SESSION_KEYS.PENDING_COUPON, coupon.code)
    navigate("/gifts")
  }

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(100deg, #6e0020 0%, #C2003C 45%, #D4004A 65%, #8a0028 100%)",
      }}
    >
      {/* dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ── DESKTOP layout (sm+) — single row ── */}
      <div className="relative hidden sm:flex items-center gap-4 max-w-7xl mx-auto px-6 py-3">
        {/* Badge */}
        <div
          className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: "rgba(0,0,0,0.22)",
            border: "2px solid rgba(255,255,255,0.18)",
          }}
        >
          <Gift size={18} className="text-yellow-300 mb-0.5" />
          <span className="text-[8px] font-black text-white uppercase tracking-tight leading-tight text-center">
            BIG
            <br />
            DEAL
          </span>
        </div>

        {/* Offer text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Zap
              size={13}
              className="text-yellow-300 fill-yellow-300 shrink-0"
            />
            <span className="text-white font-bold text-sm leading-tight truncate">
              {coupon.description}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/70 text-xs">Use code</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 font-mono font-black text-sm text-white px-2.5 py-0.5 rounded-lg transition-all active:scale-95 hover:bg-white/25"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px dashed rgba(255,255,255,0.45)",
              }}
            >
              {coupon.code}
              {copied ? (
                <Check size={11} className="text-green-300" />
              ) : (
                <Copy size={11} className="opacity-60" />
              )}
            </button>
            <span className="text-yellow-300 font-black text-base">
              {formatDiscount(coupon)}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-end gap-1.5 shrink-0">
          <TimeBlock value={countdown.days} label="DAYS" />
          <Sep />
          <TimeBlock value={countdown.hours} label="HRS" />
          <Sep />
          <TimeBlock value={countdown.mins} label="MINS" />
          <Sep />
          <TimeBlock value={countdown.secs} label="SECS" />
        </div>

        {/* CTA */}
        <button
          onClick={handleGrab}
          className="shrink-0 flex items-center gap-1.5 font-black text-sm text-primary bg-white hover:bg-white/90 px-4 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
          style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.22)" }}
        >
          GRAB NOW <ArrowRight size={13} />
        </button>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X size={15} className="text-white/70" />
        </button>
      </div>

      {/* ── MOBILE layout — two rows ── */}
      <div className="relative sm:hidden px-3 pt-2.5 pb-2">
        {/* Dismiss — absolute top-right */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors z-10"
          aria-label="Dismiss"
        >
          <X size={14} className="text-white/70" />
        </button>

        {/* Row 1: icon + description + compact inline countdown */}
        <div className="flex items-center gap-2 pr-6">
          <Zap
            size={12}
            className="text-yellow-300 fill-yellow-300 shrink-0"
          />
          <p className="text-white font-bold text-xs leading-tight flex-1 min-w-0 truncate">
            {coupon.description}
          </p>
          {/* Tiny inline countdown — no boxes, just numbers */}
          <span
            className="shrink-0 flex items-center gap-0.5 font-black tabular-nums"
            style={{ fontSize: "10px" }}
          >
            <span className="bg-black/25 rounded px-1 py-0.5 text-white font-black">
              {String(countdown.days).padStart(2, "0")}
            </span>
            <span className="text-white/50">d</span>
            <span className="bg-black/25 rounded px-1 py-0.5 text-white font-black">
              {String(countdown.hours).padStart(2, "0")}
            </span>
            <span className="text-white/50">h</span>
            <span className="bg-black/25 rounded px-1 py-0.5 text-white font-black">
              {String(countdown.mins).padStart(2, "0")}
            </span>
            <span className="text-white/50">m</span>
            <span className="bg-black/25 rounded px-1 py-0.5 text-white font-black">
              {String(countdown.secs).padStart(2, "0")}
            </span>
            <span className="text-white/50">s</span>
          </span>
        </div>

        {/* Row 2: code + discount */}
        <div className="flex items-center gap-2 mt-1.5">
          {/* Code pill */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 font-mono font-black text-xs text-white px-2 py-1 rounded-lg shrink-0 transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px dashed rgba(255,255,255,0.45)",
            }}
          >
            {coupon.code}
            {copied ? (
              <Check size={10} className="text-green-300" />
            ) : (
              <Copy size={10} className="opacity-60" />
            )}
          </button>

          {/* Discount value */}
          <span className="text-yellow-300 font-black text-sm shrink-0">
            {formatDiscount(coupon)}
          </span>
        </div>

        {/* Row 3: Grab button — full width */}
        <button
          onClick={handleGrab}
          className="mt-2 w-full flex items-center justify-center gap-1.5 font-black text-xs text-primary bg-white hover:bg-white/90 py-2 rounded-xl transition-all active:scale-95"
          style={{ boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}
        >
          GRAB OFFER <ArrowRight size={12} />
        </button>
      </div>

      {/* bottom shimmer */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",
        }}
      />
    </div>
  )
}
