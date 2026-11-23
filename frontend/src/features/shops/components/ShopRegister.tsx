import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, ImagePlus, Store } from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { Input, Textarea } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import { registerShop } from "../services/shopService"
import {
  getImageValidationError,
  isValidEmail,
  isValidPhone,
  VALIDATION_MESSAGES,
} from "../../../utils/format"
import { useAppActions } from "../../../context/useApp"

export default function ShopRegister() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    description: "",
    logo: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useAppActions()
  const logoRef = useRef<HTMLInputElement>(null)
  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = VALIDATION_MESSAGES.required("Shop name")
    if (!form.ownerName.trim())
      next.ownerName = VALIDATION_MESSAGES.required("Owner name")
    if (!form.phone.trim())
      next.phone = VALIDATION_MESSAGES.required("Phone number")
    else if (!isValidPhone(form.phone)) next.phone = VALIDATION_MESSAGES.phone
    if (!form.email.trim()) next.email = VALIDATION_MESSAGES.required("Email")
    else if (!isValidEmail(form.email)) next.email = VALIDATION_MESSAGES.email
    if (!form.address.trim())
      next.address = VALIDATION_MESSAGES.required("Shop address")
    if (!form.password) next.password = VALIDATION_MESSAGES.required("Password")
    else if (form.password.length < 8)
      next.password = VALIDATION_MESSAGES.password
    if (!form.confirmPassword)
      next.confirmPassword = VALIDATION_MESSAGES.required(
        "Password confirmation",
      )
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = VALIDATION_MESSAGES.passwordConfirmation
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const shop = registerShop({
        name: form.name,
        ownerName: form.ownerName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        description: form.description,
        logo: form.logo || undefined,
      })
      if (shop) setSubmitted(true)
      else
        showToast(
          "Shop registration could not be saved. Please try again.",
          "error",
        )
    } finally {
      setSubmitting(false)
    }
  }

  const uploadLogo = (file?: File) => {
    if (!file) return
    const error = getImageValidationError(file)
    if (error) {
      setErrors((current) => ({ ...current, logo: error }))
      return
    }
    setErrors((current) => ({ ...current, logo: "" }))
    const reader = new FileReader()
    reader.onload = (event) => set("logo", String(event.target?.result ?? ""))
    reader.readAsDataURL(file)
  }

  return (
    <CustomerLayout noFooter>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {submitted ? (
          <div className="bg-card rounded-2xl border border-border p-7 sm:p-10 text-center nm-raised">
            <CheckCircle2 size={44} className="text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">
              Your shop registration has been submitted.
            </h1>
            <p className="text-muted-foreground mt-2">
              Your account will be available after Admin approval.
            </p>
            <Link to="/shop/login" className="inline-block mt-6">
              <Button>Go to Shop Login</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-7">
              <Store size={34} className="text-primary mx-auto mb-3" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">
                Register Your Shop
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Start selling gifts with Surprise Nepal.
              </p>
            </div>
            <form
              onSubmit={submit}
              className="bg-card rounded-2xl border border-border p-5 sm:p-7 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Shop Name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  label="Owner Name"
                  value={form.ownerName}
                  onChange={(e) => set("ownerName", e.target.value)}
                  error={errors.ownerName}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  error={errors.phone}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errors.email}
                  required
                />
              </div>
              <Input
                label="Shop Address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                error={errors.address}
                required
              />
              <Textarea
                label="Shop Description (optional)"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  error={errors.password}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  required
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  Shop Logo (optional)
                </p>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadLogo(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="w-full min-h-20 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-3 text-sm text-muted-foreground hover:border-primary/50"
                >
                  {form.logo ? (
                    <img
                      src={form.logo}
                      alt="Shop logo preview"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <ImagePlus size={22} />
                  )}
                  {form.logo ? "Change logo" : "Add shop logo"}
                </button>
                {errors.logo && (
                  <p role="alert" className="text-xs text-error mt-1.5">
                    {errors.logo}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" fullWidth loading={submitting}>
                {submitting ? "Submitting..." : "Submit Registration"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already registered?{" "}
                <Link to="/shop/login" className="text-primary font-medium">
                  Shop Login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </CustomerLayout>
  )
}
