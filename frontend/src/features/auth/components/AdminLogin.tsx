import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Shield, Lock } from "lucide-react"
import { Input } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import { useAppActions } from "../../../context/useApp"
import { VALIDATION_MESSAGES } from "../../../utils/format"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const { loginAdmin, showToast } = useAppActions()
  const navigate = useNavigate()

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.trim()) e.email = VALIDATION_MESSAGES.required("Email")
    if (!password) e.password = VALIDATION_MESSAGES.required("Password")
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (loading) return
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))

    loginAdmin(email, password)
    showToast("Welcome to the Admin Panel")
    navigate("/admin")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-admin-sidebar flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Shield size={26} className="text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin Portal
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            GiftSurprise — Internal access only
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-6 bg-white/5 rounded-xl px-3 py-2">
            <Lock size={12} />
            Temporary development access
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Admin Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors({})
                }}
                placeholder="admin@giftsurprise.com"
                autoFocus
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                  errors.email
                    ? "border-red-500"
                    : "border-white/10 focus:border-primary"
                }`}
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
                    setErrors({})
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                    errors.password
                      ? "border-red-500"
                      : "border-white/10 focus:border-primary"
                  }`}
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

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 !bg-primary hover:!bg-primary-dark"
            >
              Sign In to Admin Panel
            </Button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            Need admin access?{" "}
            <Link to="/admin/register" className="text-primary hover:underline">
              Register with invite code
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          This portal is for authorized GiftSurprise staff only.
        </p>
      </div>
    </div>
  )
}
