import { useState } from "react"
import { Search, User, Package, Calendar } from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import EmptyState from "../../../components/ui/EmptyState"
import { getOptimizedImageUrl } from "../../../utils/image"
import { formatPrice } from "../../../utils/format"
import { seedCustomer as mockUser } from "../services/customerService"

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  joinedAt: string
  totalOrders: number
  totalSpent: number
  savedAddresses: unknown[]
  isAdmin: boolean
}

const MOCK_CUSTOMERS: CustomerRow[] = [
  { ...mockUser, id: "u1", totalOrders: 8, totalSpent: 24500 },
  {
    id: "u2",
    name: "Rohan Basnet",
    email: "rohan@example.com",
    phone: "9807654321",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    joinedAt: "2024-01-20",
    totalOrders: 3,
    totalSpent: 12800,
    savedAddresses: [],
    isAdmin: false,
  },
  {
    id: "u3",
    name: "Maya Gurung",
    email: "maya@example.com",
    phone: "9812345678",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    joinedAt: "2024-02-10",
    totalOrders: 5,
    totalSpent: 18300,
    savedAddresses: [],
    isAdmin: false,
  },
  {
    id: "u4",
    name: "Sagar Limbu",
    email: "sagar@example.com",
    phone: "9823456789",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    joinedAt: "2024-03-05",
    totalOrders: 2,
    totalSpent: 7500,
    savedAddresses: [],
    isAdmin: false,
  },
  {
    id: "u5",
    name: "Dipika Shrestha",
    email: "dipika@example.com",
    phone: "9834567890",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    joinedAt: "2024-04-15",
    totalOrders: 11,
    totalSpent: 38200,
    savedAddresses: [],
    isAdmin: false,
  },
]

export default function AdminCustomers() {
  const [search, setSearch] = useState("")

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  )

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Customers" },
      ]}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {MOCK_CUSTOMERS.length} registered customers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Desktop table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Customer", "Phone", "Joined", "Orders", "Total Spent"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No customers match your search.
                </td>
              </tr>
            )}
            {filtered.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                      {customer.avatar ? (
                        <img
                          src={getOptimizedImageUrl(customer.avatar, 72)}
                          alt=""
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <User
                          size={18}
                          className="m-auto text-primary mt-1.5"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {customer.phone}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar size={12} />
                    {new Date(customer.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Package size={12} className="text-muted-foreground" />
                    {customer.totalOrders ?? 0}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-sm text-foreground">
                    {formatPrice(customer.totalSpent ?? 0)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {filtered.length === 0 && (
        <div className="md:hidden py-8">
          <EmptyState
            icon={<User size={28} />}
            title="No customers found"
            description="Try adjusting your search."
          />
        </div>
      )}
      <div className="md:hidden space-y-3">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                {customer.avatar ? (
                  <img
                    src={getOptimizedImageUrl(customer.avatar, 88)}
                    alt=""
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <User size={20} className="m-auto text-primary mt-2" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Orders</p>
                <p className="font-medium">{customer.totalOrders ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Spent</p>
                <p className="font-semibold">
                  {formatPrice(customer.totalSpent ?? 0)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
