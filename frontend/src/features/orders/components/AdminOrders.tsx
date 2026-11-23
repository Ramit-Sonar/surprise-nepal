import { formatPrice } from "../../../utils/format"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  Upload,
  Gift,
  User,
} from "lucide-react"
import type { PaymentStatus } from "../../payments/types"
import AdminLayout from "../../admin/components/AdminLayout"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import { useOrdersState } from "../hooks/useOrdersState"
import { groupOrderItemsByShop } from "../services/orderService"
import { getOrderStatusLabel } from "../../../config/orderStatus"
import type { OrderStatus } from "../types"

const ALL_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "collected",
  "out_for_delivery",
  "delivered",
  "cancelled",
]

function GiftModePill({ mode }: { mode: "self" | "surprise" }) {
  if (mode === "surprise") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-purple-100 text-purple-700 whitespace-nowrap">
        <Gift size={9} /> Surprise Gift
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-muted text-muted-foreground whitespace-nowrap">
      <User size={9} /> Self
    </span>
  )
}

function PaymentStatusPill({
  status,
  paymentMethod,
}: {
  status: PaymentStatus | undefined
  paymentMethod: string
}) {
  if (paymentMethod === "Cash on Delivery") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-muted text-muted-foreground">
        <Clock size={10} /> COD
      </span>
    )
  }
  if (!status || status === "pending" || status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-muted text-muted-foreground">
        <Clock size={10} /> Pending
      </span>
    )
  }
  if (status === "screenshot_submitted") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-100 text-amber-700">
        <Upload size={10} /> Screenshot Submitted
      </span>
    )
  }
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
        <ShieldCheck size={10} /> Verified
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-muted text-muted-foreground">
      <Clock size={10} /> Pending
    </span>
  )
}

export default function AdminOrders() {
  const { orders } = useOrdersState()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("shop") ?? "")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const filtered = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter
    const matchesSearch =
      !search ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.recipient.name.toLowerCase().includes(search.toLowerCase()) ||
      order.location.city.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some((item) =>
        `${item.shopName ?? item.gift.shopName ?? ""} ${item.gift.name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when filters change
  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const handleStatus = (v: string) => {
    setStatusFilter(v)
    setPage(1)
  }

  const labelFor = (s: string) =>
    s === "all" ? "All" : getOrderStatusLabel(s as OrderStatus)

  return (
    <AdminLayout
      breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Orders" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by order ID, recipient, city..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labelFor(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  "Order ID",
                  "Recipient",
                  "Shop / Products",
                  "City",
                  "Date",
                  "Amount",
                  "Order Status",
                  "Payment",
                  "Gift Type",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted-foreground px-3 py-3 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <td className="px-3 py-3">
                    <p className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {order.id}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-foreground whitespace-nowrap">
                      {order.recipient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.recipient.phone}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1 min-w-[170px]">
                      {groupOrderItemsByShop(order).map((group) => (
                        <div key={group.shopId}>
                          <p className="text-xs font-semibold text-foreground">
                            {group.shopName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[190px]">
                            {group.items
                              .map(
                                (item) =>
                                  `${item.gift.name} × ${item.quantity}`,
                              )
                              .join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                      <MapPin size={12} />
                      {order.location.city}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                      <Calendar size={12} />
                      {new Date(
                        order.deliveryDate + "T00:00:00",
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-sm text-foreground whitespace-nowrap">
                      {formatPrice(order.total)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-3 py-3">
                    <PaymentStatusPill
                      status={order.paymentStatus}
                      paymentMethod={order.paymentMethod}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <GiftModePill mode={order.mode} />
                  </td>
                  <td className="px-3 py-3">
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/admin/orders/${order.id}`)}
            className="bg-card rounded-2xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  {order.id}
                </p>
                <p className="font-semibold text-foreground text-sm">
                  {order.recipient.name}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {order.location.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="min-w-0">
                {groupOrderItemsByShop(order).map((group) => (
                  <p
                    key={group.shopId}
                    className="text-xs text-muted-foreground truncate max-w-[190px]"
                  >
                    <span className="font-semibold text-foreground">
                      {group.shopName}:
                    </span>{" "}
                    {group.items
                      .map((item) => `${item.gift.name} × ${item.quantity}`)
                      .join(", ")}
                  </p>
                ))}
              </div>
              <p className="font-bold text-sm">{formatPrice(order.total)}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PaymentStatusPill
                status={order.paymentStatus}
                paymentMethod={order.paymentMethod}
              />
              <GiftModePill mode={order.mode} />
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p =
                totalPages <= 7
                  ? i + 1
                  : page <= 4
                    ? i + 1
                    : page >= totalPages - 3
                      ? totalPages - 6 + i
                      : page - 3 + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-white"
                      : "border border-border bg-card hover:bg-muted text-foreground"
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
