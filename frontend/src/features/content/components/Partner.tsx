import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Store } from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import Button from "../../../components/ui/Button"

export default function Partner() {
  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 text-center nm-raised">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Store size={26} className="text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
            Partner With Us
          </h1>
          <p className="text-muted-foreground mt-3">
            Sell your gifts with Surprise Nepal.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-left my-8">
            {[
              "Create your shop account",
              "Submit gifts for review",
              "Receive and prepare orders",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 p-3 rounded-xl bg-muted/50"
              >
                <CheckCircle2
                  size={16}
                  className="text-success mt-0.5 shrink-0"
                />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              size="lg"
              onClick={() => window.location.assign("/shop/register")}
              rightIcon={<ArrowRight size={16} />}
            >
              Register Your Shop
            </Button>
            <Link to="/shop/login">
              <Button size="lg" variant="outline" fullWidth>
                Shop Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
