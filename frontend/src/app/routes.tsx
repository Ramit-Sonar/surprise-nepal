import { lazy, Suspense, useEffect, type ReactNode } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useSessionState } from "../features/auth/hooks/useSessionState"
import { getCurrentShop } from "../features/shops/services/shopService"

const Home = lazy(() => import("../features/home/components/Home"))
const GiftListing = lazy(
  () => import("../features/products/components/ProductListing"),
)
const GiftDetail = lazy(
  () => import("../features/products/components/ProductDetail"),
)
const Cart = lazy(() => import("../features/cart/components/Cart"))
const Checkout = lazy(() => import("../features/payments/components/Checkout"))
const GiftIntent = lazy(
  () => import("../features/delivery/components/GiftIntent"),
)
const OrderConfirmation = lazy(
  () => import("../features/orders/components/OrderConfirmation"),
)
const OrderTracking = lazy(
  () => import("../features/orders/components/OrderTracking"),
)
const MyOrders = lazy(() => import("../features/orders/components/MyOrders"))
const Profile = lazy(
  () => import("../features/auth/components/CustomerProfile"),
)
const Auth = lazy(() => import("../features/auth/components/CustomerAuth"))
const About = lazy(() => import("../features/content/components/About"))
const Help = lazy(() => import("../features/content/components/Help"))
const Partner = lazy(() => import("../features/content/components/Partner"))

const ShopRegister = lazy(
  () => import("../features/shops/components/ShopRegister"),
)
const ShopLogin = lazy(() => import("../features/shops/components/ShopLogin"))
const ShopDashboard = lazy(
  () => import("../features/shops/components/ShopDashboard"),
)
const ShopProducts = lazy(
  () => import("../features/products/components/ShopProducts"),
)
const ShopOrders = lazy(
  () => import("../features/orders/components/ShopOrders"),
)
const ShopSettlements = lazy(
  () => import("../features/settlements/components/ShopSettlements"),
)
const ShopNotifications = lazy(
  () => import("../features/notifications/components/ShopNotifications"),
)
const ShopProfile = lazy(
  () => import("../features/shops/components/ShopProfile"),
)

const AdminLogin = lazy(() => import("../features/auth/components/AdminLogin"))
const AdminRegister = lazy(
  () => import("../features/auth/components/AdminRegister"),
)
const AdminDashboard = lazy(
  () => import("../features/admin/components/AdminDashboard"),
)
const AdminProducts = lazy(
  () => import("../features/products/components/AdminProducts"),
)
const AddProduct = lazy(
  () => import("../features/products/components/ProductEditor"),
)
const AdminOrders = lazy(
  () => import("../features/orders/components/AdminOrders"),
)
const AdminOrderDetail = lazy(
  () => import("../features/orders/components/AdminOrderDetail"),
)
const AdminCustomers = lazy(
  () => import("../features/auth/components/AdminCustomers"),
)
const AdminDelivery = lazy(
  () => import("../features/delivery/components/AdminDelivery"),
)
const AdminCoupons = lazy(
  () => import("../features/coupons/components/AdminCoupons"),
)
const CouponForm = lazy(
  () => import("../features/coupons/components/CouponForm"),
)
const AdminSettings = lazy(
  () => import("../features/settings/components/AdminSettings"),
)
const AdminShops = lazy(() => import("../features/shops/components/AdminShops"))
const AdminShopDetail = lazy(
  () => import("../features/shops/components/AdminShopDetail"),
)
const AdminSettlements = lazy(
  () => import("../features/settlements/components/AdminSettlements"),
)

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useSessionState()
  if (!user?.isAdmin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function ShopGuard({ children }: { children: ReactNode }) {
  const shop = getCurrentShop()
  if (!shop || shop.status !== "approved")
    return <Navigate to="/shop/login" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gifts" element={<GiftListing />} />
          <Route path="/gifts/:id" element={<GiftDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/gift-intent" element={<GiftIntent />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/order-confirmation/:id"
            element={<OrderConfirmation />}
          />
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/partner" element={<Partner />} />

          <Route path="/shop/register" element={<ShopRegister />} />
          <Route path="/shop/login" element={<ShopLogin />} />
          <Route
            path="/shop"
            element={
              <ShopGuard>
                <ShopDashboard />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/products"
            element={
              <ShopGuard>
                <ShopProducts />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/products/new"
            element={
              <ShopGuard>
                <AddProduct />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/products/:id"
            element={
              <ShopGuard>
                <AddProduct />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/orders"
            element={
              <ShopGuard>
                <ShopOrders />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/settlements"
            element={
              <ShopGuard>
                <ShopSettlements />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/notifications"
            element={
              <ShopGuard>
                <ShopNotifications />
              </ShopGuard>
            }
          />
          <Route
            path="/shop/profile"
            element={
              <ShopGuard>
                <ShopProfile />
              </ShopGuard>
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminGuard>
                <AdminProducts />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/products/:id"
            element={
              <AdminGuard>
                <AddProduct />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminGuard>
                <AdminOrders />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <AdminGuard>
                <AdminOrderDetail />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminGuard>
                <AdminCustomers />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <AdminGuard>
                <AdminDelivery />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminGuard>
                <AdminCoupons />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/coupons/new"
            element={
              <AdminGuard>
                <CouponForm />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/coupons/:id/edit"
            element={
              <AdminGuard>
                <CouponForm />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminGuard>
                <AdminSettings />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <AdminGuard>
                <AdminShops />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/shops/:id"
            element={
              <AdminGuard>
                <AdminShopDetail />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/settlements"
            element={
              <AdminGuard>
                <AdminSettlements />
              </AdminGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
