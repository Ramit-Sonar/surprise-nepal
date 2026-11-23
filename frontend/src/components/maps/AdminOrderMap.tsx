import { AdvancedMarker, Map } from "@vis.gl/react-google-maps"
import { MapPin } from "lucide-react"
import { GOOGLE_MAPS_LINK_BASE, GOOGLE_MAP_ID } from "../../config/api"
import type { DeliveryLocation } from "../../types/index"
import GoogleMapsProvider from "./GoogleMapsProvider"

export default function AdminOrderMap({
  location,
}: {
  location: DeliveryLocation
}) {
  if (!location.coordinates) return null

  return (
    <GoogleMapsProvider>
      <div className="relative" style={{ height: 260 }}>
        <Map
          defaultCenter={location.coordinates}
          defaultZoom={15}
          mapId={GOOGLE_MAP_ID}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <AdvancedMarker position={location.coordinates}>
            <div className="flex flex-col items-center drop-shadow-xl">
              <div className="bg-primary text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin size={20} fill="white" />
              </div>
              <div className="w-0.5 h-3 bg-primary" />
              <div className="w-4 h-1.5 bg-black/20 rounded-full blur-sm" />
            </div>
          </AdvancedMarker>
        </Map>

        <div className="absolute bottom-2 left-2 right-12 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-200 flex items-start gap-2">
            <MapPin size={13} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {location.address}
              </p>
              <p className="text-[10px] text-gray-500">
                {location.city}
                {location.landmark ? ` · ${location.landmark}` : ""}
              </p>
            </div>
          </div>
        </div>

        <a
          href={`${GOOGLE_MAPS_LINK_BASE}?q=${location.coordinates.lat},${location.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-white border border-gray-200 shadow-md rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <MapPin size={11} className="text-primary" /> Open
        </a>
      </div>
    </GoogleMapsProvider>
  )
}
