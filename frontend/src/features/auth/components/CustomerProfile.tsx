import { formatPrice } from "../../../utils/format"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Edit2,
  LogOut,
  Plus,
  Trash2,
  Camera,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import CustomerLayout from "../../navigation/components/CustomerLayout"
import { Input } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import { useAppActions } from "../../../context/useApp"
import { useCartState } from "../../cart/hooks/useCartState"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import { useSessionState } from "../hooks/useSessionState"
import { getOptimizedImageUrl } from "../../../utils/image"
import type { DeliveryLocation } from "../../delivery/types"
import { getCatalogProducts } from "../../products/services/productService"

const TABS = [
  { id: "info", label: "Personal Info", icon: User },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
]

const EMPTY_ADDR: DeliveryLocation = {
  city: "",
  address: "",
  landmark: "",
  coordinates: { lat: 0, lng: 0 },
}

export default function Profile() {
  const sessionState = useSessionState()
  const cartState = useCartState()
  const ordersState = useOrdersState()
  const state = { ...sessionState, ...cartState, ...ordersState }
  const { logout, showToast, addAddress, updateAddress, deleteAddress } =
    useAppActions()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<string | null>(
    requestedTab === "wishlist" ? "wishlist" : null,
  )
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(state.user?.name ?? "")
  const [phone, setPhone] = useState(state.user?.phone ?? "")
  const [email, setEmail] = useState(state.user?.email ?? "")

  // Address management
  const [addrForm, setAddrForm] = useState<DeliveryLocation | null>(null)
  const [addrEditIdx, setAddrEditIdx] = useState<number | null>(null)
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null)

  const openAddAddress = () => {
    setAddrEditIdx(null)
    setAddrForm({ ...EMPTY_ADDR })
  }
  const openEditAddress = (idx: number) => {
    setAddrEditIdx(idx)
    setAddrForm({ ...state.user!.savedAddresses[idx] })
  }
  const closeAddrForm = () => {
    setAddrForm(null)
    setAddrEditIdx(null)
  }

  const saveAddress = () => {
    if (!addrForm?.city.trim() || !addrForm?.address.trim()) {
      showToast("City and address are required", "error")
      return
    }
    if (addrEditIdx !== null) {
      updateAddress(addrEditIdx, addrForm)
      showToast("Address updated")
    } else {
      addAddress(addrForm)
      showToast("Address added")
    }
    closeAddrForm()
  }

  const confirmDelete = (idx: number) => setDeleteIdx(idx)
  const doDelete = () => {
    if (deleteIdx !== null) {
      deleteAddress(deleteIdx)
      showToast("Address removed", "info")
    }
    setDeleteIdx(null)
  }

  useEffect(() => {
    if (!state.user) navigate("/auth")
  }, [state.user, navigate])

  useEffect(() => {
    if (requestedTab === "wishlist") setActiveTab("wishlist")
  }, [requestedTab])

  if (!state.user) return null

  const wishlistGifts = getCatalogProducts().filter((g) =>
    state.wishlist.includes(g.id),
  )

  const handleSave = () => {
    showToast("Profile updated successfully!")
    setEditing(false)
  }

  const handleLogout = () => {
    logout()
    showToast("Signed out successfully", "info")
    navigate("/")
  }

  /* ─── shared tab content ─────────────────────────────────────── */
  const TabContent = () => (
    <div className="animate-fadeIn">
      {/* Personal Info */}
      {activeTab === "info" && (
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">
              Personal Information
            </h2>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                leftIcon={<Edit2 size={14} />}
              >
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
            />
            {editing && (
              <div className="flex gap-3 pt-2">
                <Button size="md" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Addresses */}
      {activeTab === "addresses" && (
        <div className="space-y-3">
          {/* Delete confirmation */}
          {deleteIdx !== null && (
            <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-foreground">Delete this address?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteIdx(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={doDelete}
                  className="bg-error text-white hover:bg-error/90"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Add/Edit form */}
          {addrForm && (
            <div className="bg-card rounded-2xl border border-primary/30 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-foreground">
                {addrEditIdx !== null ? "Edit Address" : "New Address"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={addrForm.city}
                  onChange={(e) =>
                    setAddrForm((f) => (f ? { ...f, city: e.target.value } : f))
                  }
                  placeholder="e.g. Kathmandu"
                />
                <Input
                  label="Landmark (optional)"
                  value={addrForm.landmark ?? ""}
                  onChange={(e) =>
                    setAddrForm((f) =>
                      f ? { ...f, landmark: e.target.value } : f,
                    )
                  }
                  placeholder="e.g. Near Bhatbhateni"
                />
              </div>
              <Input
                label="Full Address"
                value={addrForm.address}
                onChange={(e) =>
                  setAddrForm((f) =>
                    f ? { ...f, address: e.target.value } : f,
                  )
                }
                placeholder="Street / locality / area"
              />
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={saveAddress}>
                  Save Address
                </Button>
                <Button size="sm" variant="ghost" onClick={closeAddrForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {state.user!.savedAddresses.length === 0 && !addrForm && (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <MapPin
                size={32}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="font-semibold text-foreground mb-1">
                No saved addresses
              </p>
              <p className="text-sm text-muted-foreground">
                Add an address to speed up checkout.
              </p>
            </div>
          )}

          {state.user!.savedAddresses.map((addr, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {addr.city}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {addr.address}
                  </p>
                  {addr.landmark && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {addr.landmark}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => openEditAddress(i)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => confirmDelete(i)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-error transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {!addrForm && (
            <button
              onClick={openAddAddress}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-2xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus size={16} /> Add New Address
            </button>
          )}
        </div>
      )}

      {/* Wishlist */}
      {activeTab === "wishlist" && (
        <div>
          {wishlistGifts.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <Heart size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">
                Your wishlist is empty
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Save gifts you love for later.
              </p>
              <Button size="sm" onClick={() => navigate("/gifts")}>
                Browse Gifts
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishlistGifts.map((gift) => (
                <div
                  key={gift.id}
                  onClick={() => navigate(`/gifts/${gift.id}`)}
                  className="bg-card rounded-2xl border border-border p-4 flex gap-3 cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.99]"
                >
                  <img
                    src={getOptimizedImageUrl(gift.image, 128)}
                    alt={gift.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {gift.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {gift.category}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-1.5">
                      {formatPrice(gift.discountPrice ?? gift.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <CustomerLayout>
      {/* ══════════════════════════════════════════════════════
          MOBILE LAYOUT (< lg)
      ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* If a section is open on mobile, show it with back button */}
        {activeTab ? (
          <div className="px-4 py-5 space-y-4 animate-fadeIn">
            {/* Back + section title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab(null)
                  setEditing(false)
                }}
                className="p-2 rounded-xl text-muted-foreground transition-all duration-150 active:scale-95"
                style={{
                  boxShadow:
                    "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-bold text-foreground text-base">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
            <TabContent />
          </div>
        ) : (
          /* Main profile menu */
          <div>
            {/* Hero header */}
            <div className="bg-card border-b border-border px-4 pt-8 pb-6 text-center">
              <div className="relative inline-block mb-4">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 mx-auto"
                  style={{
                    boxShadow:
                      "6px 6px 16px var(--nm-dark), -4px -4px 10px var(--nm-light)",
                  }}
                >
                  {state.user.avatar ? (
                    <img
                      src={getOptimizedImageUrl(state.user.avatar, 128)}
                      alt={state.user.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={36} className="text-primary" />
                    </div>
                  )}
                </div>
                <button
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-card shadow-md"
                >
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {state.user.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {state.user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since{" "}
                {new Date(state.user.joinedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>

              {/* Quick stats */}
              <div className="flex items-center justify-center gap-6 mt-5 pt-5 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    {state.orders.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    {state.wishlist.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Wishlist</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    {state.user.savedAddresses.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Addresses</p>
                </div>
              </div>
            </div>

            {/* Menu list */}
            <div className="px-4 py-4 space-y-2">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-all duration-150"
                    style={{
                      boxShadow:
                        "5px 5px 12px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="flex-1 font-medium text-sm text-foreground">
                      {tab.label}
                    </span>
                    {tab.id === "wishlist" && state.wishlist.length > 0 && (
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-1">
                        {state.wishlist.length}
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  </button>
                )
              })}

              {/* My Orders — navigates to dedicated orders page */}
              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-all duration-150"
                style={{
                  boxShadow:
                    "5px 5px 12px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={18} className="text-primary" />
                </div>
                <span className="flex-1 font-medium text-sm text-foreground">
                  My Orders
                </span>
                {state.orders.length > 0 && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-1">
                    {state.orders.length}
                  </span>
                )}
                <ChevronRight
                  size={16}
                  className="text-muted-foreground flex-shrink-0"
                />
              </button>

              {/* Sign out row */}
              <button
                onClick={handleLogout}
                className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-all duration-150 mt-3"
                style={{
                  boxShadow:
                    "5px 5px 12px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
                  <LogOut size={18} className="text-error" />
                </div>
                <span className="flex-1 font-medium text-sm text-error">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP LAYOUT (lg+)
      ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:block max-w-4xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 border border-border">
              {state.user.avatar ? (
                <img
                  src={getOptimizedImageUrl(state.user.avatar, 128)}
                  alt={state.user.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={32} className="text-primary" />
                </div>
              )}
            </div>
            <button
              aria-label="Change profile photo"
              className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-card"
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">
              {state.user.name}
            </h1>
            <p className="text-sm text-muted-foreground">{state.user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Member since{" "}
              {new Date(state.user.joinedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("info")
                setEditing(true)
              }}
              leftIcon={<Edit2 size={14} />}
            >
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut size={14} />}
            >
              Sign out
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="lg:col-span-1">
            <div
              role="tablist"
              aria-label="Profile sections"
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-border last:border-0 transition-colors ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.id === "wishlist" && state.wishlist.length > 0 && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {state.wishlist.length}
                      </span>
                    )}
                  </button>
                )
              })}
              <button
                onClick={() => navigate("/orders")}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-t border-border transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ShoppingBag size={16} />
                <span className="flex-1 text-left">My Orders</span>
                {state.orders.length > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {state.orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab ? (
              <TabContent />
            ) : (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <User
                  size={36}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="font-semibold text-foreground mb-1">
                  Select a section
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a tab on the left to view or edit your details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
