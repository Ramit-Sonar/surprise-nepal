import React from "react"
import { formatPrice } from "../../../utils/format"
import {
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  Truck,
  Building2,
  BadgePercent,
  WalletCards,
  ClipboardCheck,
  MapPin,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Link } from "react-router-dom"
import AdminLayout from "./AdminLayout"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { getProducts } from "../../products/services/productService"
import { getShops } from "../../shops/services/shopService"
import { getShopSettlements } from "../../settlements/services/settlementService"
import {
  getOrderItemEconomics,
  groupOrderItemsByShop,
} from "../../orders/services/orderService"
import { ORDER_STATUS_CONFIG } from "../../../config/orderStatus"
import type { OrderStatus } from "../../../types/index"
import { getOptimizedImageUrl } from "../../../utils/image"

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-3 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color + "15" }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-foreground mb-0.5 truncate">
        {value}
      </p>
      <p className="text-xs text-muted-foreground truncate">{title}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { orders } = useOrdersState()
  const gifts = getProducts()
  const shops = getShops()
  const storedSettlements = getShopSettlements()

  // Derive real stats from actual orders
  const totalOrders = orders.length
  const deliveredItems = orders
    .filter(
      (order) =>
        order.status === "delivered" && order.refundStatus !== "refunded",
    )
    .flatMap((order) => order.items)
  const deliveredEconomics = deliveredItems.map(getOrderItemEconomics)
  const grossSales = deliveredEconomics.reduce(
    (sum, item) => sum + item.gross,
    0,
  )
  const platformCommission = deliveredEconomics.reduce(
    (sum, item) => sum + item.commissionAmount,
    0,
  )
  const shopPayable = deliveredEconomics.reduce(
    (sum, item) => sum + item.shopPayable,
    0,
  )
  const readyForPickup = orders.filter((order) =>
    order.items.some((item) => item.fulfillmentStatus === "ready"),
  ).length
  const awaitingPreparation = orders.filter(
    (order) =>
      !["cancelled", "out_for_delivery", "delivered"].includes(order.status) &&
      order.items.some(
        (item) =>
          item.fulfillmentStatus === "confirmed" ||
          item.fulfillmentStatus === "preparing",
      ),
  ).length
  const pendingSettlements = storedSettlements.filter(
    (settlement) =>
      settlement.grossSales > 0 && settlement.status === "pending",
  ).length

  const monthly = new Map<string, {
    month: string
    orders: number
    revenue: number
  }>()
  orders.forEach((order) => {
    const key = order.createdAt.slice(0, 7)
    const current = monthly.get(key) ?? {
      month: new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
      }),
      orders: 0,
      revenue: 0,
    }
    current.orders += 1
    current.revenue += order.total
    monthly.set(key, current)
  })
  const revenueData = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, value]) => value)
  const readyPickups = orders.flatMap((order) =>
    groupOrderItemsByShop(order)
      .filter((group) =>
        group.items.every((item) => item.fulfillmentStatus === "ready"),
      )
      .map((group) => ({
        orderId: order.id,
        shopName: group.shopName,
        address:
          shops.find((shop) => shop.id === group.shopId)?.address ??
          "Address unavailable",
        itemCount: group.items.filter(
          (item) => item.fulfillmentStatus === "ready",
        ).length,
      })),
  )

  // Derive status pie from real orders
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})
  const dashboardStatuses: OrderStatus[] = [
    "delivered",
    "out_for_delivery",
    "collected",
    "ready",
    "preparing",
    "confirmed",
    "pending",
    "cancelled",
  ]
  const realStatusData = dashboardStatuses
    .map((status) => ({
      name: ORDER_STATUS_CONFIG[status].label,
      value: statusCounts[status] ?? 0,
      color: ORDER_STATUS_CONFIG[status].color,
    }))
    .filter((d) => d.value > 0)
  const statusPieData = realStatusData

  return (
    <AdminLayout breadcrumb={[{ label: "Dashboard" }]}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Shops"
          value={String(shops.length)}
          icon={Building2}
          color="#8B5CF6"
        />
        <StatCard
          title="Pending Shop Applications"
          value={String(
            shops.filter((shop) => shop.status === "pending").length,
          )}
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          title="Active Shops"
          value={String(
            shops.filter((shop) => shop.status === "approved").length,
          )}
          icon={ClipboardCheck}
          color="#059669"
        />
        <StatCard
          title="Total Products"
          value={String(gifts.length)}
          icon={Package}
          color="#8B5CF6"
        />
        <StatCard
          title="Pending Product Reviews"
          value={String(
            gifts.filter((gift) => gift.status === "pending").length,
          )}
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          title="Total Orders"
          value={String(totalOrders)}
          icon={ShoppingBag}
          color="#C2003C"
        />
        <StatCard
          title="Awaiting Shop Preparation"
          value={String(awaitingPreparation)}
          icon={Package}
          color="#F59E0B"
        />
        <StatCard
          title="Ready for Pickup"
          value={String(readyForPickup)}
          icon={Truck}
          color={ORDER_STATUS_CONFIG.ready.color}
        />
        <StatCard
          title="Gross Shop Sales"
          value={formatPrice(grossSales)}
          icon={DollarSign}
          color="#059669"
        />
        <StatCard
          title="Platform Commission"
          value={formatPrice(platformCommission)}
          icon={BadgePercent}
          color="#C2003C"
        />
        <StatCard
          title="Shop Payable"
          value={formatPrice(shopPayable)}
          icon={WalletCards}
          color="#8B5CF6"
        />
        <StatCard
          title="Pending Settlements"
          value={String(pendingSettlements)}
          icon={Clock}
          color="#F59E0B"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">Revenue & Orders</h2>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Last 6 months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={revenueData}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C2003C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C2003C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  name === "revenue"
                    ? formatPrice(Number(value))
                    : String(value),
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C2003C"
                fill="url(#revenueGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-5">Order Status</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {statusPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {statusPieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Operational pickup queue */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Ready for Pickup</h2>
            <Link
              to="/admin/orders"
              className="text-xs text-primary hover:underline"
            >
              View orders
            </Link>
          </div>
          <div className="space-y-3">
            {readyPickups.slice(0, 5).map((pickup) => (
              <Link
                key={`${pickup.orderId}_${pickup.shopName}`}
                to={`/admin/orders/${pickup.orderId}`}
                className="block rounded-xl bg-muted/40 p-3 hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{pickup.shopName}</p>
                  <span className="text-xs text-success font-medium">
                    {pickup.itemCount} item{pickup.itemCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin size={11} />
                  {pickup.address}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {pickup.orderId}
                </p>
              </Link>
            ))}
            {readyPickups.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No gifts are waiting for pickup.
              </p>
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs text-primary hover:underline"
            >
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
                  src={getOptimizedImageUrl(order.items[0].gift.image, 72)}
                  alt=""
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">
                    #{order.id}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {order.recipient.name}
                  </p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
