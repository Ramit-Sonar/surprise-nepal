import { useNavigate } from "react-router-dom"
import { LogOut, MapPin, Phone, Mail, Store } from "lucide-react"
import ShopLayout from "./ShopLayout"
import Button from "../../../components/ui/Button"
import Badge from "../../../components/ui/Badge"
import { clearShopSession, getCurrentShop } from "../services/shopService"
import { getOptimizedImageUrl } from "../../../utils/image"

export default function ShopProfile() {
  const shop = getCurrentShop()!
  const navigate = useNavigate()
  const signOut = () => {
    clearShopSession()
    navigate("/shop/login")
  }
  return (
    <ShopLayout>
      <h1 className="text-2xl font-bold text-foreground mb-5">Shop Profile</h1>
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-7">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          {shop.logo ? (
            <img
              src={getOptimizedImageUrl(shop.logo, 128)}
              alt={shop.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover"
              decoding="async"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Store size={26} className="text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{shop.name}</h2>
            <p className="text-sm text-muted-foreground">{shop.ownerName}</p>
            <Badge variant="success" className="mt-2">
              Approved
            </Badge>
          </div>
        </div>
        <div className="space-y-4 py-5">
          <p className="flex items-start gap-3 text-sm">
            <Mail size={17} className="text-primary mt-0.5" />
            <span>{shop.email}</span>
          </p>
          <p className="flex items-start gap-3 text-sm">
            <Phone size={17} className="text-primary mt-0.5" />
            <span>{shop.phone}</span>
          </p>
          <p className="flex items-start gap-3 text-sm">
            <MapPin size={17} className="text-primary mt-0.5" />
            <span>{shop.address}</span>
          </p>
          {shop.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {shop.description}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={signOut}
          leftIcon={<LogOut size={16} />}
        >
          Sign Out
        </Button>
      </div>
    </ShopLayout>
  )
}
