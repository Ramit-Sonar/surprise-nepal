import { useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BadgePercent,
  LoaderCircle,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import Badge, {
  OrderStatusBadge,
  SettlementStatusBadge,
} from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import Modal from "../../../components/ui/Modal"
import CustomSelect from "../../../components/ui/CustomSelect"
import { useAppActions } from "../../../context/useApp"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { formatPrice } from "../../../utils/format"
import {
  getProducts,
  updateProductFeatured,
} from "../../products/services/productService"
import {
  getShops,
  updateShop,
  updateShopCommission,
} from "../services/shopService"
import { getShopSettlements } from "../../settlements/services/settlementService"
import {
  getOrderPeriods,
  getSettlementSnapshot,
  getShopMetrics,
  getShopOrderStatus,
} from "../../orders/services/orderService"
import type { Order } from "../../orders/types"
import type { Gift } from "../../products/types"
import type { ShopSettlement } from "../../settlements/types"
import type { ShopStatus } from "../types"
import { getOptimizedImageUrl } from "../../../utils/image"

const productStatus = (status: string, stock: number) => {
  if (stock === 0) return { label: "Out of Stock", variant: "error" as const }
  if (status === "active")
    return { label: "Active", variant: "success" as const }
  if (status === "pending")
    return { label: "Pending Review", variant: "warning" as const }
  if (status === "rejected")
    return { label: "Rejected", variant: "error" as const }
  return {
    label: status === "inactive" ? "Inactive" : "Draft",
    variant: "muted" as const,
  }
}

function getPreviewOrders(
  shopId: string,
  shopName: string,
  products: Gift[],
): Order[] {
  if (!import.meta.env.DEV || shopId !== "shop_pokhara_bloom") return []
  const available = products.filter(
    (product) => product.shopId === shopId && product.status === "active",
  )
  if (available.length === 0) return []
  const specs = [
    {
      id: "PREVIEW-PKR-JUL",
      product: available[0],
      quantity: 2,
      createdAt: "2026-07-12T08:30:00Z",
      status: "delivered" as const,
    },
    {
      id: "PREVIEW-PKR-AUG",
      product: available[1] ?? available[0],
      quantity: 1,
      createdAt: "2026-08-18T10:20:00Z",
      status: "delivered" as const,
    },
    {
      id: "PREVIEW-PKR-SEP",
      product: available[2] ?? available[0],
      quantity: 3,
      createdAt: "2026-09-21T07:45:00Z",
      status: "delivered" as const,
    },
    {
      id: "PREVIEW-PKR-OCT",
      product: available[0],
      quantity: 1,
      createdAt: "2026-10-02T09:15:00Z",
      status: "ready" as const,
    },
  ]
  return specs.map((spec) => {
    const price = spec.product.discountPrice ?? spec.product.price
    const gross = price * spec.quantity
    const commissionAmount = gross * 0.1
    return {
      id: spec.id,
      customerId: null,
      mode: "self",
      paymentScreenshots: [],
      paymentStatus: "verified",
      items: [
        {
          gift: spec.product,
          quantity: spec.quantity,
          price,
          shopId,
          shopName,
          commissionRate: 10,
          commissionAmount,
          shopPayable: gross - commissionAmount,
          fulfillmentStatus:
            spec.status === "delivered" ? "collected" : "ready",
        },
      ],
      recipient: {
        name: "Preview Customer",
        phone: "",
        message: "",
        senderName: "",
        senderPhone: "",
      },
      location: {
        city: "Pokhara",
        address: "Lakeside, Pokhara",
        coordinates: { lat: 28.2096, lng: 83.9856 },
      },
      deliveryDate: spec.createdAt.slice(0, 10),
      deliveryTime: "afternoon",
      status: spec.status,
      subtotal: gross,
      deliveryFee: 200,
      discount: 0,
      total: gross + 200,
      paymentMethod: "QR Transfer",
      createdAt: spec.createdAt,
      updatedAt: spec.createdAt,
    }
  })
}

export default function AdminShopDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders } = useOrdersState()
  const { showToast } = useAppActions()
  const shops = getShops()
  const settlements = getShopSettlements()
  const [editingCommission, setEditingCommission] = useState(false)
  const [commission, setCommission] = useState("")
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(
    null,
  )
  const [editOpen, setEditOpen] = useState(false)
  const [viewingSettlement, setViewingSettlement] =
    useState<ShopSettlement | null>(null)
  const shop = shops.find((item) => item.id === id)
  const expectedUpdatedAtRef = useRef(
    shop ? (shop.updatedAt ?? null) : undefined,
  )
  const products = getProducts()
  const [shopForm, setShopForm] = useState({
    name: shop?.name ?? "",
    ownerName: shop?.ownerName ?? "",
    email: shop?.email ?? "",
    phone: shop?.phone ?? "",
    address: shop?.address ?? "",
    status: (shop?.status ?? "pending") as ShopStatus,
  })

  if (!shop) {
    return (
      <AdminLayout
        breadcrumb={[
          { label: "Shops", to: "/admin/shops" },
          { label: "Not Found" },
        ]}
      >
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="font-semibold">Shop not found</p>
          <Button className="mt-4" onClick={() => navigate("/admin/shops")}>
            Back to Shops
          </Button>
        </div>
      </AdminLayout>
    )
  }

  const actualMetrics = getShopMetrics(shop.id, orders, products)
  const previewOrders =
    actualMetrics.orders.length === 0
      ? getPreviewOrders(shop.id, shop.name, products)
      : []
  const effectiveOrders =
    previewOrders.length > 0 ? [...orders, ...previewOrders] : orders
  const metrics = getShopMetrics(shop.id, effectiveOrders, products)
  const shopOrders = metrics.orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  const monthly =
    previewOrders.length === 0
      ? settlements
          .filter((item) => item.shopId === shop.id && item.grossSales > 0)
          .sort((a, b) => b.period.localeCompare(a.period))
      : getOrderPeriods(effectiveOrders)
          .map((period) => {
            const stored = settlements.find(
              (item) => item.id === `${shop.id}_${period}`,
            )
            const snapshot = getSettlementSnapshot(
              shop.id,
              period,
              effectiveOrders,
              stored,
            )
            if (period === "2026-07")
              return {
                ...snapshot,
                status: "paid" as const,
                paidAt: "2026-08-04T11:00:00.000Z",
                paymentReference: "PKR-JUL-PREVIEW",
              }
            if (period === "2026-08")
              return { ...snapshot, status: "processing" as const }
            return snapshot
          })
          .filter((item) => item.grossSales > 0)
  // Keep a stable render alias for Vite hot-reloaded Shop Details modules.
  const monthlyRows = monthly
  const recentOrderRows = shopOrders.slice(0, 5).map((order) => {
    const items = order.items.filter(
      (item) => (item.shopId ?? item.gift.shopId) === shop.id,
    )
    const status = getShopOrderStatus(order, shop.id)
    return {
      id: order.id,
      products: items
        .map((item) => `${item.gift.name} × ${item.quantity}`)
        .join(", "),
      amount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status,
      orderId: order.id,
      preview: order.id.startsWith("PREVIEW-"),
    }
  })
  const paidTotal = monthly
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.shopPayable, 0)
  const currentlyPayable = Math.max(0, metrics.shopPayable - paidTotal)

  const saveCommission = () => {
    const value = Number(commission)
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      showToast("Enter a commission rate between 0 and 100", "error")
      return
    }
    updateShopCommission(shop.id, value)
    setEditingCommission(false)
    showToast(
      "Commission updated. Historical orders and settlements are unchanged.",
    )
  }

  const saveShop = () => {
    if (!updateShop(shop.id, shopForm, expectedUpdatedAtRef.current)) {
      showToast(
        "This shop changed elsewhere. Reopen it before saving your edits.",
        "warning",
      )
      return
    }
    setEditOpen(false)
    showToast("Shop details updated")
  }

  const toggleFeatured = async (product: Gift) => {
    if (updatingFeaturedId !== null) return
    const nextFeatured = !product.featured
    setUpdatingFeaturedId(product.id)
    try {
      const updated = updateProductFeatured(
        product.id,
        nextFeatured,
        product.updatedAt ?? null,
      )
      showToast(
        updated
          ? nextFeatured
            ? `${product.name} is now featured on Home`
            : `${product.name} was removed from Featured Gifts`
          : "Product changed elsewhere. The latest featured setting has been kept.",
        updated ? "success" : "warning",
      )
    } finally {
      setUpdatingFeaturedId(null)
    }
  }

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Shops", to: "/admin/shops" },
        { label: shop.name },
      ]}
    >
      {/* Shop header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Button
            className="hidden lg:inline-flex"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/shops")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Shops
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{shop.name}</h1>
              <Badge
                className="capitalize"
                variant={
                  shop.status === "approved"
                    ? "success"
                    : shop.status === "pending"
                      ? "warning"
                      : "error"
                }
              >
                {shop.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {shop.ownerName} · Registered{" "}
              {new Date(shop.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Edit Shop
        </Button>
      </div>

      {/* Shop information and commission */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <section className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Shop Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-medium">{shop.ownerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{shop.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{shop.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium">{shop.address}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Registration Date</p>
              <p className="font-medium">
                {new Date(shop.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Shop Status</p>
              <Badge
                className="capitalize"
                variant={
                  shop.status === "approved"
                    ? "success"
                    : shop.status === "pending"
                      ? "warning"
                      : "error"
                }
              >
                {shop.status}
              </Badge>
            </div>
          </div>
        </section>
        <section className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <BadgePercent size={18} className="text-primary" />
              <h2 className="font-semibold">Commission Rate</h2>
            </div>
            {!editingCommission && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCommission(String(shop.commissionRate ?? 10))
                  setEditingCommission(true)
                }}
              >
                Edit Commission
              </Button>
            )}
          </div>
          {editingCommission ? (
            <div className="space-y-3">
              <Input
                type="number"
                min="0"
                max="100"
                value={commission}
                onChange={(event) => setCommission(event.target.value)}
                rightIcon={<span className="text-sm">%</span>}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveCommission}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingCommission(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-3xl font-bold text-primary">
              {shop.commissionRate ?? 10}%
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Admin controlled. The commission rate is locked into new eligible
            orders when they are created.
          </p>
        </section>
      </div>

      {/* Performance */}
      <section className="mb-6">
        <h2 className="font-semibold mb-3">Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ["Gross Sales", formatPrice(metrics.grossSales)],
            ["Orders", String(metrics.orders.length)],
            ["Units Sold", String(metrics.unitsSold)],
            ["Commission", formatPrice(metrics.commissionAmount)],
            ["Shop Payable", formatPrice(currentlyPayable)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-card rounded-2xl border border-border p-4"
            >
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-primary" />
            <p className="font-semibold">Products</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-warning/10 border border-warning/20 px-3 py-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Featured placement
              </p>
              <p className="text-xs text-muted-foreground">
                Promote selected shop products on the Home page.
              </p>
            </div>
          </div>
        </div>
        {metrics.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl">
              <thead className="bg-muted/40">
                <tr>
                  {[
                    "Product",
                    "Status",
                    "Stock",
                    "Selling Price",
                    "Units Sold",
                    "Featured Placement",
                  ].map((label) => (
                    <th
                      key={label}
                      className="text-left text-xs text-muted-foreground uppercase px-4 py-3"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.products.map((product) => {
                  const status = productStatus(
                    product.status,
                    product.stockCount,
                  )
                  const soldItems = effectiveOrders
                    .filter((order) => order.status === "delivered")
                    .flatMap((order) => order.items)
                    .filter((item) => item.gift.id === product.id)
                  return (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={getOptimizedImageUrl(product.image, 80)}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <span>
                            <span className="block text-sm font-medium">
                              {product.name}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {product.category}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.stockCount}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatPrice(product.discountPrice ?? product.price)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {soldItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant={product.featured ? "secondary" : "outline"}
                          size="sm"
                          disabled={updatingFeaturedId !== null}
                          onClick={() => toggleFeatured(product)}
                          leftIcon={
                            updatingFeaturedId === product.id ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Star
                                size={14}
                                className={
                                  product.featured
                                    ? "fill-accent text-accent"
                                    : ""
                                }
                              />
                            )
                          }
                          className={product.featured ? "text-warning" : ""}
                        >
                          {product.featured ? "Featured" : "Feature product"}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No products submitted yet.
          </p>
        )}
      </section>

      {/* Recent orders */}
      <section className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          <Link
            to={`/admin/orders?shop=${encodeURIComponent(shop.name)}`}
            className="text-xs text-primary font-medium hover:underline"
          >
            View All Orders
          </Link>
        </div>
        {recentOrderRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Order", "Product(s)", "Amount", "Status"].map((label) => (
                    <th
                      key={label}
                      className="text-left text-xs text-muted-foreground uppercase px-4 py-3"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrderRows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      {row.preview ? (
                        <span className="text-sm font-mono text-foreground">
                          {row.id}
                        </span>
                      ) : (
                        <Link
                          to={`/admin/orders/${row.orderId}`}
                          className="text-sm font-mono text-primary"
                        >
                          {row.id}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{row.products}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatPrice(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        )}
      </section>

      {/* Monthly settlements */}
      <section className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Monthly Settlements</h2>
        </div>
        {monthlyRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-muted/40">
                <tr>
                  {[
                    "Period",
                    "Gross Sales",
                    "Commission",
                    "Shop Payable",
                    "Status",
                  ].map((label) => (
                    <th
                      key={label}
                      className="text-left text-xs text-muted-foreground uppercase px-4 py-3"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlyRows.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setViewingSettlement(item)}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {new Date(
                        `${item.period}-01T00:00:00`,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatPrice(item.grossSales)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatPrice(item.commissionAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatPrice(item.shopPayable)}
                    </td>
                    <td className="px-4 py-3">
                      <SettlementStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No settlements available yet.
          </p>
        )}
      </section>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Shop"
        size="md"
      >
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Shop Name"
              value={shopForm.name}
              onChange={(event) =>
                setShopForm((form) => ({ ...form, name: event.target.value }))
              }
            />
            <Input
              label="Owner"
              value={shopForm.ownerName}
              onChange={(event) =>
                setShopForm((form) => ({
                  ...form,
                  ownerName: event.target.value,
                }))
              }
            />
            <Input
              label="Email"
              type="email"
              value={shopForm.email}
              onChange={(event) =>
                setShopForm((form) => ({ ...form, email: event.target.value }))
              }
            />
            <Input
              label="Phone"
              value={shopForm.phone}
              onChange={(event) =>
                setShopForm((form) => ({ ...form, phone: event.target.value }))
              }
            />
          </div>
          <Input
            label="Address"
            value={shopForm.address}
            onChange={(event) =>
              setShopForm((form) => ({ ...form, address: event.target.value }))
            }
          />
          <div>
            <p className="text-sm font-semibold mb-1.5">Shop Status</p>
            <CustomSelect
              value={shopForm.status}
              onChange={(value) =>
                setShopForm((form) => ({
                  ...form,
                  status: value as ShopStatus,
                }))
              }
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "suspended", label: "Suspended" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveShop}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={viewingSettlement !== null}
        onClose={() => setViewingSettlement(null)}
        title="Settlement Details"
        size="sm"
      >
        {viewingSettlement && (
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="font-semibold">
                {new Date(
                  `${viewingSettlement.period}-01T00:00:00`,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Gross Sales</p>
                <p className="font-medium">
                  {formatPrice(viewingSettlement.grossSales)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="font-medium">
                  {formatPrice(viewingSettlement.commissionAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shop Payable</p>
                <p className="font-semibold">
                  {formatPrice(viewingSettlement.shopPayable)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <SettlementStatusBadge status={viewingSettlement.status} />
              </div>
            </div>
            {viewingSettlement.status === "paid" && (
              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Payment Date</p>
                  <p className="font-medium">
                    {viewingSettlement.paidAt
                      ? new Date(viewingSettlement.paidAt).toLocaleDateString()
                      : "Not recorded"}
                  </p>
                </div>
                {viewingSettlement.paymentReference && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Payment Reference
                    </p>
                    <p className="font-medium">
                      {viewingSettlement.paymentReference}
                    </p>
                  </div>
                )}
              </div>
            )}
            <Button
              fullWidth
              variant="outline"
              onClick={() => setViewingSettlement(null)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}
