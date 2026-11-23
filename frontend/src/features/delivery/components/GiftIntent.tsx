import { useNavigate } from "react-router-dom"
import {
  User,
  Gift,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Heart,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { useAppActions } from "../../../context/useApp"
import { useSessionState } from "../../auth/hooks/useSessionState"
import { SESSION_KEYS, sessionStorageSet } from "../../../services/storage"

export default function GiftIntent() {
  const navigate = useNavigate()
  const { user } = useSessionState()
  const { setCheckoutData } = useAppActions()

  const handleSelect = (mode: "self" | "surprise") => {
    if (!user) {
      sessionStorageSet(SESSION_KEYS.REDIRECT_AFTER_LOGIN, "/gift-intent")
      navigate("/auth")
      return
    }
    setCheckoutData({ mode })
    navigate("/checkout")
  }

  return (
    <CustomerLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Neomorphic header icon */}
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{
                background: "var(--color-background)",
                boxShadow:
                  "8px 8px 20px var(--nm-dark), -5px -5px 14px var(--nm-light)",
              }}
            >
              <Sparkles size={28} className="text-primary" />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How would you like to order?
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Choose whether this gift is for yourself or you'd like to send it
              as a surprise to someone special.
            </p>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* ── Buy for Myself ── */}
            <button
              onClick={() => handleSelect("self")}
              className="group relative text-left rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: "var(--color-background)",
                boxShadow:
                  "10px 10px 24px var(--nm-dark), -6px -6px 16px var(--nm-light)",
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "14px 14px 30px var(--nm-dark), -8px -8px 20px var(--nm-light)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "10px 10px 24px var(--nm-dark), -6px -6px 16px var(--nm-light)"
              }}
              onMouseDown={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "inset 6px 6px 14px var(--nm-dark), inset -4px -4px 10px var(--nm-light)"
              }}
              onMouseUp={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "10px 10px 24px var(--nm-dark), -6px -6px 16px var(--nm-light)"
              }}
            >
              {/* 3D Raised icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                style={{
                  background: "var(--color-background)",
                  boxShadow:
                    "7px 7px 16px var(--nm-dark), -4px -4px 10px var(--nm-light)",
                }}
              >
                <User size={28} className="text-primary" />
              </div>

              <h2
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Buy for Myself
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Order for your own address. Fill in your delivery details and
                choose a convenient date.
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-7">
                {[
                  "Your delivery address",
                  "Your preferred date & time",
                  "Standard checkout flow",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-background)",
                        boxShadow:
                          "2px 2px 5px var(--nm-dark), -1px -1px 4px var(--nm-light)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
                Select <ArrowRight size={15} />
              </span>
            </button>

            {/* ── Send as a Surprise ── */}
            <button
              onClick={() => handleSelect("surprise")}
              className="group relative text-left rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: "var(--color-background)",
                boxShadow:
                  "10px 10px 24px var(--nm-dark), -6px -6px 16px var(--nm-light)",
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "14px 14px 30px var(--nm-dark), -8px -8px 20px var(--nm-light)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "10px 10px 24px var(--nm-dark), -6px -6px 16px var(--nm-light)"
              }}
              onMouseDown={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "inset 6px 6px 14px var(--nm-dark), inset -4px -4px 10px var(--nm-light)"
              }}
              onMouseUp={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  "10px 10px 24px var(--nm-dark), -6px -6px 16px var(--nm-light)"
              }}
            >
              {/* Popular badge */}
              <span
                className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest text-primary px-2.5 py-1 rounded-full"
                style={{
                  background: "var(--color-background)",
                  boxShadow:
                    "3px 3px 7px var(--nm-dark), -2px -2px 5px var(--nm-light)",
                }}
              >
                Popular
              </span>

              {/* 3D Raised primary icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                style={{
                  background: "var(--color-primary)",
                  boxShadow:
                    "7px 7px 18px rgba(140,0,30,0.45), -4px -4px 10px rgba(255,255,255,0.30)",
                }}
              >
                <Gift size={28} className="text-white" />
              </div>

              <h2
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Send as a Surprise
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Send this gift secretly to someone special. They won't know it's
                coming until it arrives!
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-7">
                {[
                  { icon: User, text: "Recipient's name & number" },
                  { icon: MapPin, text: "Pin exact drop-off location" },
                  { icon: Calendar, text: "Schedule the surprise date" },
                  { icon: Heart, text: "Add a personal message" },
                ].map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-2.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-background)",
                        boxShadow:
                          "2px 2px 5px var(--nm-dark), -1px -1px 4px var(--nm-light)",
                      }}
                    >
                      <Icon size={10} className="text-primary" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
                Select <ArrowRight size={15} />
              </span>
            </button>
          </div>

          {/* Back link */}
          <p className="text-center mt-8 text-sm text-muted-foreground">
            Changed your mind?{" "}
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:underline font-medium"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    </CustomerLayout>
  )
}
