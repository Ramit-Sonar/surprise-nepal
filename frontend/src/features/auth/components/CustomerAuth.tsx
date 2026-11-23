import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Gift, ArrowLeft, Mail, RefreshCw } from "lucide-react"
import { isValidEmail } from "../../../utils/format"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { Input } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import { useAppActions } from "../../../context/useApp"
import {
  SESSION_KEYS,
  sessionStorageGet,
  sessionStorageRemove,
} from "../../../services/storage"

type Stage = "choose" | "otp"

// Simulated Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function Auth() {
  const [stage, setStage] = useState<Stage>("choose")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [emailError, setEmailError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { loginCustomer, showToast } = useAppActions()
  const navigate = useNavigate()

  const redirectAfterLogin = () => {
    const dest = sessionStorageGet(SESSION_KEYS.REDIRECT_AFTER_LOGIN) || "/"
    sessionStorageRemove(SESSION_KEYS.REDIRECT_AFTER_LOGIN)
    navigate(dest)
  }

  const handleGoogleLogin = async () => {
    if (loading) return
    setLoading(true)
    // Simulated Google OAuth — in production, redirect to Google OAuth flow
    await new Promise((r) => setTimeout(r, 1000))
    loginCustomer("guest@gmail.com", "Google User")
    showToast("Welcome! Signed in with Google.")
    setLoading(false)
    redirectAfterLogin()
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!email.trim() || !isValidEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    }
    setEmailError("")
    setLoading(true)
    // Simulated OTP send — in production, call backend to send OTP
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setStage("otp")
    showToast(`Verification code sent to ${email}`)
    startResendCooldown()
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code from your email")
      return
    }
    setOtpError("")
    setLoading(true)
    // Simulated OTP verification — in production, verify with backend
    await new Promise((r) => setTimeout(r, 800))
    // Accept any 6-digit code in demo mode
    loginCustomer(email)
    showToast("Welcome to GiftSurprise!")
    setLoading(false)
    redirectAfterLogin()
  }

  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current)
    }
  }, [])

  const startResendCooldown = () => {
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current)
    setResendCooldown(30)
    resendIntervalRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(resendIntervalRef.current!)
          resendIntervalRef.current = null
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (loading || resendCooldown > 0) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    showToast("New code sent!")
    startResendCooldown()
  }

  return (
    <CustomerLayout noFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <Gift size={28} className="text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stage === "choose" ? "Sign in or Sign up" : "Check your email"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {stage === "choose"
                ? "No password needed — we'll verify your identity securely"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-7 shadow-sm">
            {stage === "choose" && (
              <>
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 mb-5 active:scale-[0.98]"
                  style={{
                    background: "var(--color-card)",
                    boxShadow: loading
                      ? "inset 3px 3px 8px var(--nm-dark), inset -2px -2px 6px var(--nm-light)"
                      : "6px 6px 14px var(--nm-dark), -4px -4px 10px var(--nm-light)",
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground">
                    or continue with email
                  </span>
                  <div className="flex-1 border-t border-border" />
                </div>

                {/* Email OTP form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError("")
                    }}
                    error={emailError}
                    autoFocus
                    required
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loading}
                    leftIcon={<Mail size={16} />}
                  >
                    Send Verification Code
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy. An account will be created automatically if you don't
                  have one.
                </p>
              </>
            )}

            {stage === "otp" && (
              <>
                <button
                  onClick={() => {
                    setStage("choose")
                    setOtp("")
                    setOtpError("")
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
                >
                  <ArrowLeft size={14} /> Change email
                </button>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  {/* OTP digit input */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Verification code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      autoFocus
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ""))
                        setOtpError("")
                      }}
                      placeholder="000000"
                      className={`w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-xl border ${
                        otpError ? "border-error bg-error/5" : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-background transition-colors`}
                    />
                    {otpError && (
                      <p className="text-xs text-error mt-1">{otpError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Didn't receive it? Check your spam folder.{" "}
                      {resendCooldown > 0 ? (
                        <span>Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <RefreshCw size={11} /> Resend
                        </button>
                      )}
                    </p>
                  </div>

                  <Button type="submit" fullWidth size="lg" loading={loading}>
                    Verify & Continue
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Demo: enter any 6-digit number to sign in
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
