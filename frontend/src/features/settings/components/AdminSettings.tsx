import { useState, useCallback, useEffect, useRef } from "react"
import {
  loadNotifSettings,
  saveNotifSettings,
  type NotifSettings,
  type NotifType,
} from "../../notifications/services/notificationService"
import {
  Save,
  Bell,
  Shield,
  Globe,
  Truck,
  DollarSign,
  UserPlus,
  Copy,
  Trash2,
  RefreshCw,
  Check,
  Upload,
  QrCode,
  X,
  ImagePlus,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import { Input, Textarea } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import ConfirmDialog from "../../../components/ui/ConfirmDialog"
import { useAppActions } from "../../../context/useApp"
import { useCheckoutState } from "../../payments/hooks/useCheckoutState"
import { useSessionState } from "../../auth/hooks/useSessionState"
import {
  generateInviteCode,
  listInviteCodes,
  revokeInviteCode,
  type InviteCode,
} from "../../auth/services/adminInviteService"
import {
  STORAGE_KEYS,
  storageSet,
  subscribeStorage,
} from "../../../services/storage"
import {
  getDeliverySettings,
  saveDeliverySettings,
} from "../../delivery/services/deliveryService"
import { CITIES } from "../../delivery/services/deliveryService"

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "payment", label: "Payment", icon: DollarSign },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "access", label: "Admin Access", icon: UserPlus },
]

function AdminAccessTab() {
  const { user } = useSessionState()
  const [codes, setCodes] = useState<InviteCode[]>(() => listInviteCodes())
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const refresh = useCallback(() => setCodes(listInviteCodes()), [])

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 500))
    generateInviteCode(user?.email ?? "admin")
    refresh()
    setGenerating(false)
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRevoke = (code: string) => {
    revokeInviteCode(code)
    refresh()
  }

  const unused = codes.filter((c) => !c.used)
  const used = codes.filter((c) => c.used)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Generate */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Admin Invitations</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Generate one-time invite codes to onboard new administrators. Each
              code can only be used once.
            </p>
          </div>
          <Button
            size="sm"
            loading={generating}
            onClick={handleGenerate}
            leftIcon={<UserPlus size={14} />}
          >
            Generate Code
          </Button>
        </div>

        <div className="bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Prototype only:</span>{" "}
          Invite codes are stored in this browser and do not provide server-side
          authorization.
        </div>
      </div>

      {/* Active codes */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">
            Active Codes{" "}
            <span className="text-muted-foreground font-normal text-sm">
              ({unused.length})
            </span>
          </h3>
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {unused.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No active invite codes. Generate one above to invite a new
            administrator.
          </p>
        ) : (
          <div className="space-y-2">
            {unused.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-muted rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono font-semibold text-foreground tracking-wider">
                    {c.code}
                  </code>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created by {c.createdBy} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {copied === c.code ? (
                      <Check size={12} className="text-success" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copied === c.code ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleRevoke(c.code)}
                    className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-colors"
                    title="Revoke code"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Used codes */}
      {used.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Used Codes{" "}
            <span className="text-muted-foreground font-normal text-sm">
              ({used.length})
            </span>
          </h3>
          <div className="space-y-2">
            {used.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/50 rounded-xl opacity-60"
              >
                <div>
                  <code className="text-sm font-mono text-muted-foreground tracking-wider line-through">
                    {c.code}
                  </code>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Used · Created by {c.createdBy}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-border px-2 py-0.5 rounded-full">
                  Used
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PaymentTab() {
  const { paymentQR } = useCheckoutState()
  const { setPaymentQR, showToast } = useAppActions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeDialog, setRemoveDialog] = useState(false)

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (JPG, PNG, WebP)", "error")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5 MB", "error")
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      setTimeout(() => {
        const paymentQR = e.target?.result as string
        if (!storageSet(STORAGE_KEYS.PAYMENT_QR, paymentQR)) {
          showToast(
            "QR image is too large to save. Please upload a smaller image.",
            "error",
          )
          setUploading(false)
          return
        }
        setPaymentQR(paymentQR)
        showToast("Payment QR uploaded successfully!")
        setUploading(false)
      }, 800)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const doRemove = async () => {
    setRemoveDialog(false)
    setRemoving(true)
    await new Promise((r) => setTimeout(r, 500))
    setPaymentQR(null)
    showToast("Payment QR removed", "info")
    setRemoving(false)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <QrCode size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Payment QR Code</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your bank or wallet QR code. Customers will scan this to
              pay during checkout and then upload a screenshot for manual
              verification.
            </p>
          </div>
        </div>
      </div>

      {paymentQR ? (
        /* ── QR is set: show preview + replace/remove actions ── */
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">
                Current Payment QR
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                This is what customers see during checkout
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Active
              </span>
            </div>
          </div>

          {/* QR Preview frame */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-white rounded-3xl p-6 shadow-xl shadow-foreground/10 border border-border max-w-[280px] w-full">
              <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Payment QR
              </p>
              <div className="aspect-square rounded-2xl overflow-hidden bg-white">
                <img
                  src={paymentQR}
                  alt="Payment QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-center text-[11px] text-muted-foreground mt-4 leading-snug">
                Scan to pay · GiftSurprise Nepal
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? "Uploading…" : "Replace QR"}
            </button>
            <button
              onClick={() => setRemoveDialog(true)}
              disabled={removing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-error text-sm font-semibold hover:bg-error/5 transition-colors disabled:opacity-50"
            >
              <X size={16} />
              {removing ? "Removing…" : "Remove QR"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* ── No QR: show upload zone ── */
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-1">
            Upload Payment QR
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            No QR is currently active. Customers will not be able to complete
            payment until you upload one.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-primary-light scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  Uploading QR…
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ImagePlus size={28} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Drop your QR image here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse · JPG, PNG, WebP · Max 5 MB
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Warning banner */}
          <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">No active QR.</span> Customers
              cannot complete checkout until a payment QR is uploaded here.
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">
          How manual QR payment works
        </h3>
        <ol className="space-y-3">
          {[
            {
              step: "1",
              text: "Admin uploads a single payment QR image here (bank, eSewa, Khalti, or any wallet).",
            },
            {
              step: "2",
              text: "Customer scans the QR from the checkout page and pays the exact order amount.",
            },
            {
              step: "3",
              text: "Customer uploads a screenshot of their payment confirmation.",
            },
            {
              step: "4",
              text: "Admin reviews the screenshot inside each order and marks payment as Verified or Rejected.",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </span>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <ConfirmDialog
        open={removeDialog}
        title="Remove Payment QR"
        description="Customers will not be able to complete QR payments until a new QR code is uploaded. Are you sure you want to remove it?"
        confirmLabel="Yes, Remove QR"
        variant="danger"
        icon={<Trash2 size={26} />}
        onConfirm={doRemove}
        onCancel={() => setRemoveDialog(false)}
      />
    </div>
  )
}

interface NotificationSettingItem {
  key: NotifType
  label: string
  description: string
}

const NOTIF_ITEMS: NotificationSettingItem[] = [
  {
    key: "new_order",
    label: "New order placed",
    description: "Alert when a customer places a new order",
  },
  {
    key: "payment_screenshot",
    label: "Payment screenshot submitted",
    description: "Alert when a customer uploads payment proof for review",
  },
  {
    key: "payment_rejected",
    label: "Payment rejected",
    description: "Alert when a payment has been rejected",
  },
  {
    key: "low_stock",
    label: "Low stock warning (< 5 units)",
    description: "Alert when a gift product runs low on inventory",
  },
  {
    key: "pending_cod",
    label: "COD order awaiting confirmation",
    description: "Alert for Cash on Delivery orders needing your confirmation",
  },
  {
    key: "ready_pickup",
    label: "Gift ready for pickup",
    description: "Alert when a shop marks an order ready for collection",
  },
]

function NotificationsTab() {
  const [settings, setSettings] = useState<NotifSettings>(() =>
    loadNotifSettings(),
  )
  const { showToast } = useAppActions()

  useEffect(
    () =>
      subscribeStorage([STORAGE_KEYS.ADMIN_NOTIFICATION_SETTINGS], () =>
        setSettings(loadNotifSettings()),
      ),
    [],
  )

  const toggle = (key: NotifType) => {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    saveNotifSettings(next)
    showToast(
      `"${NOTIF_ITEMS.find((i) => i.key === key)?.label}" notifications ${
        next[key] ? "enabled" : "disabled"
      }`,
      next[key] ? "success" : "info",
    )
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-foreground">
            Notification Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which events show up in the notification panel. Changes take
            effect immediately.
          </p>
        </div>
        <div className="space-y-1">
          {NOTIF_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
            >
              <div className="flex-1 pr-6">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={() => toggle(item.key)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-border rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-2xl border border-border p-4 flex items-start gap-3">
        <Bell
          size={16}
          className="text-muted-foreground flex-shrink-0 mt-0.5"
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Notifications appear in the bell icon at the top of the admin panel.
          They are derived from real order data and update automatically as
          orders change.
        </p>
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const { showToast } = useAppActions()
  const [saving, setSaving] = useState(false)
  const [deliveryService, setDeliverySettings] = useState(getDeliverySettings)
  const [deliveryCities, setDeliveryCities] = useState(
    () => getDeliverySettings().availableCities,
  )

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      if (activeTab === "delivery") {
        if (deliveryCities.length === 0) {
          showToast("Select at least one delivery city", "error")
          return
        }
        const nextDeliverySettings = {
          ...deliveryService,
          availableCities: deliveryCities,
        }
        if (!saveDeliverySettings(nextDeliverySettings)) {
          showToast("Settings could not be saved. Please try again.", "error")
          return
        }
        setDeliverySettings(nextDeliverySettings)
      }
      showToast("Settings saved!")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout
      breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Settings" }]}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        {activeTab !== "access" && (
          <Button
            size="sm"
            loading={saving}
            onClick={handleSave}
            leftIcon={<Save size={15} />}
          >
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tab list */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden lg:self-start">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-border last:border-0 transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-light text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3">
          {activeTab === "general" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <h2 className="font-semibold text-foreground">
                General Settings
              </h2>
              <Input label="Store Name" defaultValue="GiftSurprise" />
              <Input
                label="Store Email"
                type="email"
                defaultValue="hello@giftsurprise.com.np"
              />
              <Input label="Support Phone" defaultValue="+977 980-000-0000" />
              <Textarea
                label="Store Description"
                rows={3}
                defaultValue="Making moments unforgettable — one surprise at a time."
              />
              <Input label="Currency" defaultValue="NPR (रु)" />
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <div>
                <h2 className="font-semibold text-foreground">
                  Delivery Settings
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  These global rules apply to every gift and are managed by
                  Surprise Nepal.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1.5">
                  Available Delivery Cities
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Select every city where Surprise Nepal currently delivers.
                  This applies to all gifts.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => {
                    const selected = deliveryCities.includes(city)
                    return (
                      <button
                        key={city}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setDeliveryCities((current) =>
                            current.includes(city)
                              ? current.filter((item) => item !== city)
                              : [...current, city],
                          )
                        }
                        className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                          selected
                            ? "bg-primary text-white border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {selected && (
                          <Check size={13} className="inline mr-1.5" />
                        )}
                        {city}
                      </button>
                    )
                  })}
                </div>
                {deliveryCities.length === 0 && (
                  <p className="text-xs text-error mt-2">
                    Select at least one delivery city.
                  </p>
                )}
              </div>
              <Input
                label="Estimated Delivery Time"
                value={deliveryService.estimatedDeliveryTime}
                onChange={(event) =>
                  setDeliverySettings((settings) => ({
                    ...settings,
                    estimatedDeliveryTime: event.target.value,
                  }))
                }
                placeholder="e.g. 1–2 days"
              />
              <Textarea
                label="Delivery Notes / Instructions"
                rows={3}
                value={deliveryService.deliveryNotes}
                onChange={(event) =>
                  setDeliverySettings((settings) => ({
                    ...settings,
                    deliveryNotes: event.target.value,
                  }))
                }
                placeholder="Instructions shown to customers"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Default Delivery Fee (रु)"
                  type="number"
                  value={deliveryService.defaultDeliveryFee}
                  onChange={(event) =>
                    setDeliverySettings((settings) => ({
                      ...settings,
                      defaultDeliveryFee: Number(event.target.value),
                    }))
                  }
                />
                <Input
                  label="Free Delivery Threshold (रु)"
                  type="number"
                  value={deliveryService.freeDeliveryThreshold}
                  onChange={(event) =>
                    setDeliverySettings((settings) => ({
                      ...settings,
                      freeDeliveryThreshold: Number(event.target.value),
                    }))
                  }
                  hint="Global threshold for delivery promotions"
                />
              </div>
              <Input
                label="Same-Day Order Cutoff"
                value={deliveryService.sameDayOrderCutoff}
                onChange={(event) =>
                  setDeliverySettings((settings) => ({
                    ...settings,
                    sameDayOrderCutoff: event.target.value,
                  }))
                }
                hint="Orders placed before this time qualify for same-day delivery"
              />
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryService.sameDayEnabled}
                    onChange={(event) =>
                      setDeliverySettings((settings) => ({
                        ...settings,
                        sameDayEnabled: event.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Enable same-day delivery
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryService.crossCityEnabled}
                    onChange={(event) =>
                      setDeliverySettings((settings) => ({
                        ...settings,
                        crossCityEnabled: event.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Allow cross-city delivery
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "payment" && <PaymentTab />}

          {activeTab === "notifications" && <NotificationsTab />}

          {activeTab === "security" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5 animate-fadeIn">
              <h2 className="font-semibold text-foreground">
                Security Settings
              </h2>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
              />
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Two-factor authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add extra security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-border rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "access" && <AdminAccessTab />}
        </div>
      </div>
    </AdminLayout>
  )
}
