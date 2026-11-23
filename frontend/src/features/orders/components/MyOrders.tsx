import { formatPrice } from "../../../utils/format"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Package, ChevronRight, MapPin, Calendar, Search } from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { OrderStatusBadge } from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import EmptyState from "../../../components/ui/EmptyState"
import { useOrdersState } from "../hooks/useOrdersState"
import { getOptimizedImageUrl } from "../../../utils/image"

const STATUS_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: "active", label: "Active" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

export default function MyOrders() {
  const { orders } = useOrdersState()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? !["delivered", "cancelled"].includes(order.status)
          : order.status === statusFilter

    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) =>
        i.gift.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    return matchesStatus && matchesSearch
  })

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                My Orders
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {orders.length} total orders
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/gifts")}>
            New Gift
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search by order ID, recipient, or gift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto shrink-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === f.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={32} />}
            title={searchQuery ? "No orders found" : "No orders yet"}
            description={
              searchQuery
                ? `No results for "${searchQuery}"`
                : "Your gift orders will appear here once you place them."
            }
            action={{
              label: "Browse Gifts",
              onClick: () => navigate("/gifts"),
            }}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/track/${order.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        #{order.id}
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {order.items.map((i) => i.gift.name).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} publicView />
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Package size={12} />
                      For: {order.recipient.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {order.location.city}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(
                        order.deliveryDate + "T00:00:00",
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted/30">
                  <div className="flex gap-2">
                    {order.items.map((item) => (
                      <img
                        key={item.gift.id}
                        src={getOptimizedImageUrl(item.gift.image, 64)}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
