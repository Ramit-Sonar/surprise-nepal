import { formatPrice } from "../../../utils/format"
import { useState, useEffect } from "react"
import { MapPin, Calendar, Truck, Gift, User } from "lucide-react"
import CustomSelect from "../../../components/ui/CustomSelect"
import Button from "../../../components/ui/Button"
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps"
import AdminLayout from "../../admin/components/AdminLayout"
import Badge, { OrderStatusBadge } from "../../../components/ui/Badge"
import { useOrdersState } from "../../orders/hooks/useOrdersState"
import type { Order } from "../../orders/types"
import {
  getOrderStatusLabel,
  ORDER_STATUS_COLOR,
} from "../../../config/orderStatus"
import { GOOGLE_MAP_ID } from "../../../config/api"
import { getDeliverySettings } from "../services/deliveryService"
import GoogleMapsProvider from "../../../components/maps/GoogleMapsProvider"

const NEPAL_CENTER: google.maps.LatLngLiteral = { lat: 27.7172, lng: 85.324 }

const LEGEND = ([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "collected",
  "out_for_delivery",
] as const).map((key) => ({
  key,
  label: getOrderStatusLabel(key),
  color: ORDER_STATUS_COLOR[key],
}))

function GiftModeBadge({ mode }: { mode: Order["mode"] }) {
  return mode === "surprise" ? (
    <Badge variant="primary" size="sm">
      <Gift size={11} /> Surprise
    </Badge>
  ) : (
    <Badge variant="muted" size="sm">
      <User size={11} /> For Myself
    </Badge>
  )
}

function MapPanner({
  orders,
  selectedId,
}: {
  orders: Order[]
  selectedId: string | null
}) {
  const map = useMap("delivery-map")

  useEffect(() => {
    if (!map) return
    const selected = orders.find((o) => o.id === selectedId)
    if (selected?.location.coordinates) {
      map.panTo(selected.location.coordinates)
      map.setZoom(16)
      return
    }
    const withCoords = orders.filter((o) => o.location.coordinates)
    if (withCoords.length === 0) return
    if (withCoords.length === 1) {
      map.panTo(withCoords[0].location.coordinates!)
      map.setZoom(15)
      return
    }
    const bounds = new google.maps.LatLngBounds()
    withCoords.forEach((o) => bounds.extend(o.location.coordinates!))
    map.fitBounds(bounds, 60)
  }, [map, selectedId, orders])

  return null
}

export default function AdminDelivery() {
  const { orders } = useOrdersState()
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedMode, setSelectedMode] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const deliveryCities = getDeliverySettings().availableCities
  const today = new Date()
  const toDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  const todayKey = toDateKey(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = toDateKey(tomorrow)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekKey = toDateKey(nextWeek)

  const timeOrder: Record<Order["deliveryTime"], number> = {
    morning: 0,
    afternoon: 1,
    evening: 2,
  }
  const timeLabels: Record<Order["deliveryTime"], string> = {
    morning: "Morning · 9–12",
    afternoon: "Afternoon · 12–5",
    evening: "Evening · 5–8",
  }
  const formatScheduleDate = (date: string) => {
    if (date === todayKey) return "Today"
    if (date === tomorrowKey) return "Tomorrow"
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  const demoSources = orders.filter((order) => order.items.length > 0)
  const demoOrders: Order[] =
    demoSources.length > 0
      ? [
          {
            ...demoSources[0],
            id: "DEMO-TODAY-PICKUP",
            recipient: {
              ...demoSources[0].recipient,
              name: "Today Pickup Demo",
            },
            location: {
              city: "Kathmandu",
              address: "Thamel, Kathmandu",
              coordinates: { lat: 27.7154, lng: 85.3123 },
            },
            deliveryDate: todayKey,
            status: "ready",
            paymentStatus: "verified",
            items: demoSources[0].items.map((item) => ({
              ...item,
              fulfillmentStatus: "ready" as const,
            })),
            updatedAt: new Date().toISOString(),
          },
          {
            ...(demoSources[1] ?? demoSources[0]),
            id: "DEMO-TOMORROW-DELIVERY",
            recipient: {
              ...(demoSources[1] ?? demoSources[0]).recipient,
              name: "Tomorrow Delivery Demo",
            },
            location: {
              city: "Lalitpur",
              address: "Patan Dhoka, Lalitpur",
              coordinates: { lat: 27.6788, lng: 85.3182 },
            },
            deliveryDate: tomorrowKey,
            status: "out_for_delivery",
            paymentStatus: "verified",
            items: (demoSources[1] ?? demoSources[0]).items.map((item) => ({
              ...item,
              fulfillmentStatus: "collected" as const,
            })),
            updatedAt: new Date().toISOString(),
          },
        ]
      : []
  const mapOrders = [...demoOrders, ...orders]

  const deliveries = mapOrders
    .filter((o) => {
      const matchCity = !selectedCity || o.location.city === selectedCity
      const matchStatus = !selectedStatus || o.status === selectedStatus
      const matchMode = !selectedMode || o.mode === selectedMode
      const matchDate =
        !selectedDate ||
        (selectedDate === "today" && o.deliveryDate === todayKey) ||
        (selectedDate === "tomorrow" && o.deliveryDate === tomorrowKey) ||
        (selectedDate === "next_7_days" &&
          o.deliveryDate >= todayKey &&
          o.deliveryDate < nextWeekKey) ||
        (selectedDate === "overdue" &&
          o.deliveryDate < todayKey &&
          !["delivered", "cancelled"].includes(o.status))
      return matchCity && matchStatus && matchMode && matchDate
    })
    .sort(
      (a, b) =>
        a.deliveryDate.localeCompare(b.deliveryDate) ||
        timeOrder[a.deliveryTime] - timeOrder[b.deliveryTime],
    )
  const hasFilters = Boolean(
    selectedCity || selectedStatus || selectedMode || selectedDate,
  )
  const clearFilters = () => {
    setSelectedCity("")
    setSelectedStatus("")
    setSelectedMode("")
    setSelectedDate("")
    setSelectedOrder(null)
  }

  const selected = mapOrders.find((o) => o.id === selectedOrder)

  const cityCenter = selectedCity
    ? (({
        Kathmandu: { lat: 27.7172, lng: 85.324 },
        Lalitpur: { lat: 27.6588, lng: 85.3247 },
        Bhaktapur: { lat: 27.671, lng: 85.4298 },
        Pokhara: { lat: 28.2096, lng: 83.9856 },
      } as Record<string, google.maps.LatLngLiteral>)[selectedCity] ??
      NEPAL_CENTER)
    : NEPAL_CENTER

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Delivery Map" },
      ]}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Delivery Map</h1>
          <p className="text-sm text-muted-foreground">
            {deliveries.length} matching deliveries
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <CustomSelect
          value={selectedCity}
          onChange={(v) => {
            setSelectedCity(v)
            setSelectedOrder(null)
          }}
          options={[
            { value: "", label: "All Cities" },
            ...deliveryCities.map((city) => ({ value: city, label: city })),
          ]}
          className="w-40"
        />
        <CustomSelect
          value={selectedStatus}
          onChange={(v) => {
            setSelectedStatus(v)
            setSelectedOrder(null)
          }}
          options={[
            { value: "", label: "All Statuses" },
            ...[
              "pending",
              "confirmed",
              "preparing",
              "ready",
              "collected",
              "out_for_delivery",
              "delivered",
            ].map((s) => ({
              value: s,
              label: getOrderStatusLabel(s as Order["status"]),
            })),
          ]}
          className="w-48"
        />
        <CustomSelect
          value={selectedDate}
          onChange={(v) => {
            setSelectedDate(v)
            setSelectedOrder(null)
          }}
          options={[
            {
              value: "",
              label: "All Delivery Dates",
              icon: <Calendar size={15} />,
            },
            { value: "today", label: "Today", icon: <Calendar size={15} /> },
            {
              value: "tomorrow",
              label: "Tomorrow",
              icon: <Calendar size={15} />,
            },
            {
              value: "next_7_days",
              label: "Next 7 Days",
              icon: <Calendar size={15} />,
            },
            {
              value: "overdue",
              label: "Overdue Active",
              icon: <Calendar size={15} />,
            },
          ]}
          className="w-48"
        />
        <CustomSelect
          value={selectedMode}
          onChange={(v) => {
            setSelectedMode(v)
            setSelectedOrder(null)
          }}
          options={[
            { value: "", label: "All Gift Types" },
            { value: "self", label: "For Myself", icon: <User size={15} /> },
            {
              value: "surprise",
              label: "Surprise Gift",
              icon: <Gift size={15} />,
            },
          ]}
          className="w-48"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="relative" style={{ height: 460 }}>
            <GoogleMapsProvider>
              <Map
                id="delivery-map"
                mapId={GOOGLE_MAP_ID}
                defaultCenter={cityCenter}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                zoomControl={true}
                style={{ width: "100%", height: "100%" }}
              >
                <MapPanner orders={deliveries} selectedId={selectedOrder} />

                {deliveries.map((order) => {
                  if (!order.location.coordinates) return null
                  const color = ORDER_STATUS_COLOR[order.status] ?? "#78716C"
                  const isSelected = selectedOrder === order.id
                  return (
                    <AdvancedMarker
                      key={order.id}
                      position={order.location.coordinates}
                      title={`${order.recipient.name} · ${
                        order.mode === "surprise"
                          ? "Surprise Gift"
                          : "For Myself"
                      } · ${order.location.city}`}
                      onClick={() =>
                        setSelectedOrder(isSelected ? null : order.id)
                      }
                    >
                      <div className="relative flex flex-col items-center cursor-pointer">
                        {isSelected && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg z-10 pointer-events-none">
                            <p className="font-semibold">
                              {order.recipient.name}
                            </p>
                            <p className="opacity-70">
                              {order.location.city} · {order.id}
                            </p>
                          </div>
                        )}
                        <div
                          className="flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform"
                          style={{
                            width: isSelected ? 44 : 36,
                            height: isSelected ? 44 : 36,
                            background: color,
                            transform: isSelected ? "scale(1.15)" : "scale(1)",
                          }}
                        >
                          <Truck
                            size={isSelected ? 20 : 16}
                            className="text-white"
                          />
                          <div
                            className={`absolute -top-1 -right-1 rounded-full border-2 border-white shadow flex items-center justify-center ${
                              order.mode === "surprise"
                                ? "w-5 h-5 bg-primary text-white"
                                : "w-5 h-5 bg-card text-foreground"
                            }`}
                          >
                            {order.mode === "surprise" ? (
                              <Gift size={11} />
                            ) : (
                              <User size={11} />
                            )}
                          </div>
                        </div>
                        <div
                          className="w-0.5 h-2"
                          style={{ background: color }}
                        />
                        <div className="w-3 h-1 rounded-full blur-sm bg-black/25" />
                      </div>
                    </AdvancedMarker>
                  )
                })}
              </Map>
            </GoogleMapsProvider>

            <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl p-3 text-xs space-y-1.5 shadow-md border border-border/50">
              {LEGEND.map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
              <div className="border-t border-border pt-1.5 mt-1.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Gift size={13} className="text-primary" />
                  <span className="text-muted-foreground">Surprise Gift</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={13} className="text-foreground" />
                  <span className="text-muted-foreground">For Myself</span>
                </div>
              </div>
            </div>

            {deliveries.length > 0 &&
              deliveries.every((o) => !o.location.coordinates) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-card/90 rounded-2xl px-6 py-4 text-center shadow border border-border">
                    <MapPin
                      size={24}
                      className="text-muted-foreground mx-auto mb-2"
                    />
                    <p className="text-sm font-medium text-foreground">
                      No map coordinates
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Orders placed without map pin won't appear here
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">
              {deliveries.length} matching deliveries
            </p>
          </div>
          <div
            className="flex-1 overflow-y-auto divide-y divide-border"
            style={{ maxHeight: 420 }}
          >
            {deliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Truck size={28} className="text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  No deliveries
                </p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting the filters
                </p>
              </div>
            ) : (
              deliveries.map((order) => (
                <button
                  key={order.id}
                  onClick={() =>
                    setSelectedOrder(
                      selectedOrder === order.id ? null : order.id,
                    )
                  }
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selectedOrder === order.id ? "bg-primary-light" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background:
                            ORDER_STATUS_COLOR[order.status] ?? "#78716C",
                        }}
                      />
                      <p className="font-medium text-sm text-foreground truncate">
                        {order.recipient.name}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="pl-4 mb-1.5">
                    <GiftModeBadge mode={order.mode} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-4">
                    <MapPin size={11} />
                    <span className="truncate">
                      {order.location.address}, {order.location.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 pl-4">
                    <Calendar size={11} />
                    <span>
                      {formatScheduleDate(order.deliveryDate)} ·{" "}
                      {timeLabels[order.deliveryTime]}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-5 bg-card rounded-2xl border border-primary/30 p-5 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                {selected.id}
              </p>
              <p className="font-bold text-foreground">
                {selected.recipient.name}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <GiftModeBadge mode={selected.mode} />
              <OrderStatusBadge status={selected.status} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase font-medium mb-1">
                Location
              </p>
              <p className="text-foreground">{selected.location.address}</p>
              <p className="text-muted-foreground">{selected.location.city}</p>
              {selected.location.coordinates && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.location.coordinates.lat.toFixed(5)},{" "}
                  {selected.location.coordinates.lng.toFixed(5)}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase font-medium mb-1">
                Delivery
              </p>
              <p className="text-foreground">
                {new Date(
                  selected.deliveryDate + "T00:00:00",
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-muted-foreground">
                {timeLabels[selected.deliveryTime]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase font-medium mb-1">
                Gift
              </p>
              <p className="text-foreground">{selected.items[0].gift.name}</p>
              <p className="font-bold text-primary">
                {formatPrice(selected.total)}
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
