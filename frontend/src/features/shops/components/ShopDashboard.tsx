import { Link } from "react-router-dom"
import {
  AlertTriangle,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react"
import ShopLayout from "./ShopLayout"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { formatPrice } from "../../../utils/format"
import { getShopProducts } from "../../products/services/productService"
import { getCurrentShop } from "../services/shopService"
import {
  getShopMetrics,
  getShopOrderStatus,
} from "../../orders/services/orderService"
import { getOptimizedImageUrl } from "../../../utils/image"

export default function ShopDashboard() {
  const { orders: allOrders } = useOrdersState()
  const shop = getCurrentShop()!
  const products = getShopProducts(shop.id)
  const orders = allOrders
    .map((order) => ({
      ...order,
      items: order.items.filter(
        (item) => (item.shopId ?? item.gift.shopId) === shop.id,
      ),
    }))
    .filter((order) => order.items.length > 0)
  const totalCollection = getShopMetrics(
    shop.id,
    allOrders,
    products,
  ).shopPayable
  const pending = products.filter(
    (product) => product.status === "pending",
  ).length
  const outOfStock = products.filter(
    (product) => product.stockCount === 0,
  ).length

  return (
    <ShopLayout>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground">{shop.name}</h1>
        </div>
        <Link to="/shop/products/new">
          <Button size="sm" leftIcon={<Plus size={16} />}>
            Add Gift
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {[
          { label: "Products", value: String(products.length), icon: Package },
          { label: "Orders", value: String(orders.length), icon: ShoppingBag },
          {
            label: "Total Collection",
            value: formatPrice(totalCollection),
            icon: DollarSign,
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card rounded-2xl border border-border p-3 sm:p-5 min-w-0"
            >
              <Icon size={18} className="text-primary mb-3" />
              <p className="text-base sm:text-2xl font-bold text-foreground truncate">
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {(pending > 0 || outOfStock > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {pending > 0 && (
            <Link
              to="/shop/products"
              className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <AlertTriangle size={20} className="text-warning" />
              <div>
                <p className="font-semibold text-sm">
                  {pending} pending review
                </p>
                <p className="text-xs text-muted-foreground">
                  Waiting for Admin
                </p>
              </div>
            </Link>
          )}
          {outOfStock > 0 && (
            <Link
              to="/shop/products"
              className="bg-error/5 border border-error/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <Package size={20} className="text-error" />
              <div>
                <p className="font-semibold text-sm">
                  {outOfStock} out of stock
                </p>
                <p className="text-xs text-muted-foreground">
                  Update inventory
                </p>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link to="/shop/orders" className="text-xs text-primary font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0"
            >
              <img
                src={getOptimizedImageUrl(order.items[0].gift.image, 88)}
                alt=""
                width={44}
                height={44}
                className="w-11 h-11 rounded-xl object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {order.items[0].gift.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  #{order.id} ·{" "}
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  item(s)
                </p>
              </div>
              <OrderStatusBadge status={getShopOrderStatus(order, shop.id)} />
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No shop orders yet.
            </p>
          )}
        </div>
      </div>
    </ShopLayout>
  )
}
