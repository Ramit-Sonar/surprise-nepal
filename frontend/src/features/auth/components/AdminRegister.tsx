import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react"
import Button from "../../../components/ui/Button"
import { useAppActions } from "../../../context/useApp"
import { validateAndConsumeInviteCode } from "../services/adminInviteService"
import { isValidEmail, VALIDATION_MESSAGES } from "../../../utils/format"

export default function AdminRegister() {
  const [step, setStep] = useState<"invite" | "details">("invite")
  const [inviteCode, setInviteCode] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const { loginAdmin, showToast } = useAppActions()
  const navigate = useNavigate()

  const handleInviteSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (loading) return
    if (!inviteCode.trim()) {
      setErrors({ invite: VALIDATION_MESSAGES.required("Invite code") })
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)

    if (!validateAndConsumeInviteCode(inviteCode.trim())) {
      setErrors({ invite: "Invalid or expired invite code" })
      return
    }
    setErrors({})
    setStep("details")
  }

  const handleRegisterSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (loading) return
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = VALIDATION_MESSAGES.required("Full name")
    if (!email.trim()) e.email = VALIDATION_MESSAGES.required("Email")
    else if (!isValidEmail(email)) e.email = VALIDATION_MESSAGES.email
    if (!password) e.password = VALIDATION_MESSAGES.required("Password")
    else if (password.length < 8) e.password = VALIDATION_MESSAGES.password
    if (!confirmPassword)
      e.confirmPassword = VALIDATION_MESSAGES.required("Password confirmation")
    else if (password !== confirmPassword)
      e.confirmPassword = VALIDATION_MESSAGES.passwordConfirmation
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    loginAdmin(email, password, name)
    showToast("Admin account created. Welcome!")
    setLoading(false)
    navigate("/admin")
  }

  const fieldClass = (error?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
      error ? "border-red-500" : "border-white/10 focus:border-primary"
    }`

  return (
    <div className="min-h-screen bg-admin-sidebar flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Shield size={26} className="text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {step === "invite" ? "Admin Registration" : "Create Admin Account"}
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            {step === "invite"
              ? "Enter your invite code to proceed"
              : "Set up your admin credentials"}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
          <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5 mb-5">
            <AlertTriangle
              size={14}
              className="text-yellow-400 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              Admin registration requires a valid invite code issued by an
              existing administrator.
            </p>
          </div>

          {step === "invite" && (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Admin Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value)
                    setErrors({})
                  }}
                  placeholder="Enter your invite code"
                  autoFocus
                  className={fieldClass(errors.invite)}
                />
                {errors.invite && (
                  <p className="text-xs text-red-400 mt-1">{errors.invite}</p>
                )}
                <p className="text-xs text-white/30 mt-2">
                  Invite codes are single-use and issued by an existing
                  GiftSurprise administrator.
                </p>
              </div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="!bg-primary hover:!bg-primary-dark"
              >
                Verify Invite Code
              </Button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setErrors((p) => ({ ...p, name: "" }))
                  }}
                  placeholder="Your full name"
                  autoFocus
                  className={fieldClass(errors.name)}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((p) => ({ ...p, email: "" }))
                  }}
                  placeholder="you@giftsurprise.com"
                  className={fieldClass(errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((p) => ({ ...p, password: "" }))
                    }}
                    placeholder="At least 8 characters"
                    className={fieldClass(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((p) => ({ ...p, confirmPassword: "" }))
                  }}
                  placeholder="Repeat password"
                  className={fieldClass(errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="!bg-primary hover:!bg-primary-dark"
              >
                Create Admin Account
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-white/30 mt-6">
            Already have an account?{" "}
            <Link to="/admin/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
