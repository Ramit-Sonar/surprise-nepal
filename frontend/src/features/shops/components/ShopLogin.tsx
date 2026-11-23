import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Store } from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { Input } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import { authenticateShop, setShopSession } from "../services/shopService"
import { VALIDATION_MESSAGES } from "../../../utils/format"

export default function ShopLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    const nextErrors: Record<string, string> = {}
    if (!email.trim()) nextErrors.email = VALIDATION_MESSAGES.required("Email")
    if (!password)
      nextErrors.password = VALIDATION_MESSAGES.required("Password")
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    const shop = authenticateShop(email, password)
    if (!shop) {
      setErrors({ email: "No approved development shop is available." })
      setLoading(false)
      return
    }
    setShopSession(shop.id)
    navigate("/shop")
  }

  return (
    <CustomerLayout noFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store size={26} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-display">
              Shop Login
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your gifts and orders.
            </p>
          </div>
          <form
            onSubmit={submit}
            className="bg-card rounded-2xl border border-border p-6 space-y-4 nm-raised"
          >
            <Input
              label="Email"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((current) => ({ ...current, email: "" }))
              }}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((current) => ({ ...current, password: "" }))
              }}
              error={errors.password}
              required
            />
            <Button type="submit" size="lg" fullWidth loading={loading}>
              {loading ? "Signing in..." : "Sign In to Shop"}
            </Button>
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                Development access accepts any non-empty email and password.
              </p>
              <p>
                New partner?{" "}
                <Link to="/shop/register" className="text-primary font-medium">
                  Register your shop
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </CustomerLayout>
  )
}
