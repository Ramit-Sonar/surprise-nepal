import { useState, useCallback, useRef, useEffect } from "react"
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps"
import {
  Loader2,
  Crosshair,
  Navigation,
  MapPin,
  Search,
  X,
  CheckCircle2,
} from "lucide-react"
import { Input } from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import type { DeliveryLocation } from "../types"
import {
  GOOGLE_MAP_ID,
  HAS_GOOGLE_MAPS_API_KEY,
} from "../../../config/api"
import GoogleMapsProvider from "../../../components/maps/GoogleMapsProvider"
import {
  geolocateViaIp,
  reverseGeocodeLocation,
} from "../services/geolocationService"

const CITY_CENTERS: Record<string, google.maps.LatLngLiteral> = {
  Kathmandu: { lat: 27.7172, lng: 85.324 },
  Lalitpur: { lat: 27.6588, lng: 85.3247 },
  Bhaktapur: { lat: 27.671, lng: 85.4298 },
  Pokhara: { lat: 28.2096, lng: 83.9856 },
  Biratnagar: { lat: 26.4525, lng: 87.2718 },
  Birgunj: { lat: 27.0104, lng: 84.8777 },
  Butwal: { lat: 27.7006, lng: 83.4532 },
  Dharan: { lat: 26.8065, lng: 87.2846 },
  Hetauda: { lat: 27.4287, lng: 85.0308 },
  Janakpur: { lat: 26.7288, lng: 85.926 },
}
const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 27.7172, lng: 85.324 }
const GEOCODE_DEBOUNCE_MS = 300
const GEOCODE_CACHE_LIMIT = 50
const REVERSE_GEOCODE_CACHE_TTL_MS = 5 * 60 * 1000
const AUTOCOMPLETE_CACHE_LIMIT = 20
const AUTOCOMPLETE_CACHE_TTL_MS = 2 * 60 * 1000

interface TimedCacheEntry<T> {
  value: T
  expiresAt: number
}

const reverseGeocodeCache =
  new globalThis.Map<string, TimedCacheEntry<string>>()

function getCoordinateCacheKey(pos: google.maps.LatLngLiteral) {
  return `${pos.lat.toFixed(5)},${pos.lng.toFixed(5)}`
}

function cacheResolvedAddress(key: string, address: string) {
  reverseGeocodeCache.delete(key)
  reverseGeocodeCache.set(key, {
    value: address,
    expiresAt: Date.now() + REVERSE_GEOCODE_CACHE_TTL_MS,
  })
  if (reverseGeocodeCache.size > GEOCODE_CACHE_LIMIT) {
    reverseGeocodeCache.delete(reverseGeocodeCache.keys().next().value!)
  }
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (pos: google.maps.LatLngLiteral) => void
}) {
  const map = useMap("selector-map")
  useEffect(() => {
    if (!map) return
    const listener = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      },
    )
    return () => google.maps.event.removeListener(listener)
  }, [map, onMapClick])
  return null
}

interface Suggestion {
  placeId: string
  text: string
  secondaryText: string
}

interface MapSelectorProps {
  city: string
  value: DeliveryLocation | null
  onChange: (location: DeliveryLocation | null) => void
}

function ManualLocationSelector({ city, value, onChange }: MapSelectorProps) {
  const [address, setAddress] = useState(value?.address ?? "")
  const [landmark, setLandmark] = useState(value?.landmark ?? "")

  const handleConfirm = () => {
    const normalizedAddress = address.trim()
    if (!normalizedAddress) return

    onChange({
      city,
      address: normalizedAddress,
      landmark: landmark.trim() || undefined,
      coordinates: value?.coordinates ?? CITY_CENTERS[city] ?? DEFAULT_CENTER,
    })
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm">
          <MapPin size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Enter the delivery address
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Map selection is temporarily unavailable, but you can still provide
            the exact delivery details.
          </p>
        </div>
      </div>

      <Input
        label="Delivery address"
        placeholder="Street, neighborhood, or building"
        value={address}
        onChange={(event) => {
          setAddress(event.target.value)
          onChange(null)
        }}
        leftIcon={<MapPin size={16} />}
        required
      />
      <Input
        label="Landmark (optional)"
        placeholder="Near blue gate, opposite temple…"
        value={landmark}
        onChange={(event) => {
          setLandmark(event.target.value)
          onChange(null)
        }}
        hint="Helps our delivery team find the exact spot"
      />
      <Button
        variant={value?.address === address.trim() ? "success" : "primary"}
        size="md"
        fullWidth
        onClick={handleConfirm}
        disabled={!address.trim()}
        leftIcon={
          value?.address === address.trim() ? (
            <CheckCircle2 size={17} />
          ) : undefined
        }
      >
        {value?.address === address.trim()
          ? "Address Confirmed"
          : "Confirm Delivery Address"}
      </Button>
    </div>
  )
}

function MapSelectorContent({ city, value, onChange }: MapSelectorProps) {
  const placesLib = useMapsLibrary("places")
  const map = useMap("selector-map")
  const cityCenter = CITY_CENTERS[city] ?? DEFAULT_CENTER

  const [pinPos, setPinPos] = useState<google.maps.LatLngLiteral | null>(
    value?.coordinates ?? null,
  )
  const [address, setAddress] = useState(value?.address ?? "")
  const [landmark, setLandmark] = useState(value?.landmark ?? "")
  const [geocoding, setGeocoding] = useState(false)
  const [locating, setLocating] = useState(false)
  const [confirmed, setConfirmed] = useState(Boolean(value))

  // New Places API autocomplete state
  const [searchText, setSearchText] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const suggestionCacheRef = useRef(
    new globalThis.Map<string, TimedCacheEntry<Suggestion[]>>(),
  )
  const suggestionInFlightRef = useRef(
    new globalThis.Map<string, Promise<Suggestion[]>>(),
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestionRequestRef = useRef(0)
  const placeDetailsRequestRef = useRef(0)
  const reverseGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const reverseGeocodeAbortRef = useRef<AbortController | null>(null)
  const reverseGeocodeRequestRef = useRef(0)
  const geolocationAbortRef = useRef<AbortController | null>(null)

  // Cancel pending work when the selector unmounts.
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (reverseGeocodeTimerRef.current)
        clearTimeout(reverseGeocodeTimerRef.current)
      reverseGeocodeAbortRef.current?.abort()
      geolocationAbortRef.current?.abort()
      suggestionRequestRef.current += 1
      placeDetailsRequestRef.current += 1
      reverseGeocodeRequestRef.current += 1
      suggestionInFlightRef.current.clear()
    },
    [],
  )

  // Pan to city when it changes, reset pin (use ref for map to avoid triggering on every map instance change)
  const mapRef = useRef(map)
  mapRef.current = map
  const cityEffectReadyRef = useRef(false)
  useEffect(() => {
    if (!cityEffectReadyRef.current) {
      cityEffectReadyRef.current = true
      return
    }
    suggestionRequestRef.current += 1
    placeDetailsRequestRef.current += 1
    reverseGeocodeRequestRef.current += 1
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (reverseGeocodeTimerRef.current)
      clearTimeout(reverseGeocodeTimerRef.current)
    reverseGeocodeAbortRef.current?.abort()
    geolocationAbortRef.current?.abort()
    setPinPos(null)
    setAddress("")
    setSearchText("")
    setSuggestions([])
    setSearching(false)
    setGeocoding(false)
    setLocating(false)
    setConfirmed(false)
    onChange(null)
    if (mapRef.current) {
      mapRef.current.panTo(cityCenter)
      mapRef.current.setZoom(14)
    }
  }, [city, cityCenter, onChange])

  // Create session token when placesLib is ready
  useEffect(() => {
    if (!placesLib) return
    sessionTokenRef.current = new (placesLib as any).AutocompleteSessionToken()
    suggestionCacheRef.current.clear()
    suggestionInFlightRef.current.clear()
  }, [placesLib])

  const fetchSuggestions = useCallback(
    async (input: string, requestId: number) => {
      if (!placesLib || input.length < 2) {
        setSuggestions([])
        return
      }
      const cacheKey = input.trim().toLowerCase()
      const cached = suggestionCacheRef.current.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        suggestionCacheRef.current.delete(cacheKey)
        suggestionCacheRef.current.set(cacheKey, cached)
        if (requestId !== suggestionRequestRef.current) return
        setSuggestions(cached.value)
        setSuggestionsOpen(true)
        setSearching(false)
        return
      }
      if (cached) suggestionCacheRef.current.delete(cacheKey)

      setSearching(true)
      try {
        const PlacesLib = placesLib as any
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new PlacesLib.AutocompleteSessionToken()
        }
        const existingRequest = suggestionInFlightRef.current.get(cacheKey)
        const request: Promise<Suggestion[]> =
          existingRequest ??
          (() => {
            const nextRequest =
              (PlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: input.trim(),
                includedRegionCodes: ["np"],
                sessionToken: sessionTokenRef.current,
              }) as Promise<{ suggestions: any[] }>).then(
                ({ suggestions: raw }) =>
                  raw.map((s: any) => ({
                    placeId: s.placePrediction.placeId,
                    text:
                      s.placePrediction.mainText?.toString() ??
                      s.placePrediction.text?.toString() ??
                      "",
                    secondaryText:
                      s.placePrediction.secondaryText?.toString() ?? "",
                  })),
              )
            suggestionInFlightRef.current.set(cacheKey, nextRequest)
            const clearInFlight = () => {
              if (suggestionInFlightRef.current.get(cacheKey) === nextRequest) {
                suggestionInFlightRef.current.delete(cacheKey)
              }
            }
            void nextRequest.then(clearInFlight, clearInFlight)
            return nextRequest
          })()
        const nextSuggestions = await request
        if (requestId !== suggestionRequestRef.current) return
        suggestionCacheRef.current.set(cacheKey, {
          value: nextSuggestions,
          expiresAt: Date.now() + AUTOCOMPLETE_CACHE_TTL_MS,
        })
        if (suggestionCacheRef.current.size > AUTOCOMPLETE_CACHE_LIMIT) {
          suggestionCacheRef.current.delete(
            suggestionCacheRef.current.keys().next().value!,
          )
        }
        setSuggestions(nextSuggestions)
        setSuggestionsOpen(true)
      } catch {
        if (requestId === suggestionRequestRef.current) setSuggestions([])
      } finally {
        if (requestId === suggestionRequestRef.current) setSearching(false)
      }
    },
    [placesLib],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const requestId = ++suggestionRequestRef.current
    setSearchText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) {
      setSuggestions([])
      setSuggestionsOpen(false)
      setSearching(false)
      return
    }
    debounceRef.current = setTimeout(
      () => fetchSuggestions(val, requestId),
      GEOCODE_DEBOUNCE_MS,
    )
  }

  const selectSuggestion = useCallback(
    async (s: Suggestion) => {
      if (!placesLib) return
      suggestionRequestRef.current += 1
      if (debounceRef.current) clearTimeout(debounceRef.current)
      reverseGeocodeRequestRef.current += 1
      if (reverseGeocodeTimerRef.current)
        clearTimeout(reverseGeocodeTimerRef.current)
      reverseGeocodeAbortRef.current?.abort()
      geolocationAbortRef.current?.abort()
      setLocating(false)
      const requestId = ++placeDetailsRequestRef.current
      setSuggestionsOpen(false)
      setSearchText(s.text)
      setSuggestions([])
      setGeocoding(true)
      try {
        const PlacesLib = placesLib as any
        const place = new PlacesLib.Place({
          id: s.placeId,
          requestedLanguage: "en",
        })
        await place.fetchFields({
          fields: ["location", "formattedAddress", "displayName"],
        })
        if (requestId !== placeDetailsRequestRef.current) return
        const pos: google.maps.LatLngLiteral = {
          lat: place.location.lat(),
          lng: place.location.lng(),
        }
        const label = place.formattedAddress ?? place.displayName ?? s.text
        setPinPos(pos)
        setAddress(label)
        setConfirmed(false)
        // New session token after a completed selection
        sessionTokenRef.current = new PlacesLib.AutocompleteSessionToken()
        suggestionCacheRef.current.clear()
        suggestionInFlightRef.current.clear()
        if (map) {
          map.panTo(pos)
          map.setZoom(17)
        }
        onChange(null)
      } catch {
        // fallback: geocode the text
      } finally {
        if (requestId === placeDetailsRequestRef.current) setGeocoding(false)
      }
    },
    [placesLib, map, city, landmark, onChange],
  )

  const reverseGeocode = useCallback(
    async (
      pos: google.maps.LatLngLiteral,
      signal: AbortSignal,
    ): Promise<string> => {
      const cacheKey = getCoordinateCacheKey(pos)
      const cached = reverseGeocodeCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        cacheResolvedAddress(cacheKey, cached.value)
        return cached.value
      }
      if (cached) reverseGeocodeCache.delete(cacheKey)

      const address = await reverseGeocodeLocation(pos, signal)
      if (address) cacheResolvedAddress(cacheKey, address)
      return address
    },
    [],
  )

  const handleMapClick = useCallback(
    async (pos: google.maps.LatLngLiteral) => {
      suggestionRequestRef.current += 1
      placeDetailsRequestRef.current += 1
      reverseGeocodeRequestRef.current += 1
      const requestId = reverseGeocodeRequestRef.current
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (reverseGeocodeTimerRef.current)
        clearTimeout(reverseGeocodeTimerRef.current)
      reverseGeocodeAbortRef.current?.abort()
      geolocationAbortRef.current?.abort()

      setPinPos(pos)
      setSuggestions([])
      setSuggestionsOpen(false)
      setSearching(false)
      setLocating(false)
      setConfirmed(false)
      onChange(null)
      setGeocoding(true)
      reverseGeocodeTimerRef.current = setTimeout(async () => {
        const controller = new AbortController()
        reverseGeocodeAbortRef.current = controller
        try {
          const label = await reverseGeocode(pos, controller.signal)
          if (
            controller.signal.aborted ||
            requestId !== reverseGeocodeRequestRef.current
          )
            return
          setAddress(label || city)
          setSearchText("")
        } catch {
          if (
            controller.signal.aborted ||
            requestId !== reverseGeocodeRequestRef.current
          )
            return
          setAddress(city)
          setSearchText("")
        } finally {
          if (requestId === reverseGeocodeRequestRef.current)
            setGeocoding(false)
        }
      }, GEOCODE_DEBOUNCE_MS)
    },
    [city, landmark, onChange, reverseGeocode],
  )

  const handleMyLocation = () => {
    suggestionRequestRef.current += 1
    placeDetailsRequestRef.current += 1
    reverseGeocodeRequestRef.current += 1
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (reverseGeocodeTimerRef.current)
      clearTimeout(reverseGeocodeTimerRef.current)
    reverseGeocodeAbortRef.current?.abort()
    setSuggestions([])
    setSuggestionsOpen(false)
    setSearching(false)
    setGeocoding(false)
    geolocationAbortRef.current?.abort()
    const geolocationController = new AbortController()
    geolocationAbortRef.current = geolocationController
    setLocating(true)

    const applyLocation = async (location: google.maps.LatLngLiteral) => {
      if (geolocationController.signal.aborted) return
      setPinPos(location)
      setConfirmed(false)
      onChange(null)
      if (map) {
        map.panTo(location)
        map.setZoom(17)
      }
      const requestId = ++reverseGeocodeRequestRef.current
      const controller = new AbortController()
      reverseGeocodeAbortRef.current = controller
      try {
        const label = await reverseGeocode(location, controller.signal)
        if (
          controller.signal.aborted ||
          requestId !== reverseGeocodeRequestRef.current
        )
          return
        setAddress(label || city)
      } catch {
        if (
          controller.signal.aborted ||
          requestId !== reverseGeocodeRequestRef.current
        )
          return
        setAddress(city)
      } finally {
        if (requestId === reverseGeocodeRequestRef.current) setLocating(false)
      }
    }

    const tryGoogleFallback = async () => {
      try {
        const location = await geolocateViaIp(geolocationController.signal)
        if (geolocationController.signal.aborted) return
        await applyLocation(location)
      } catch {
        if (geolocationController.signal.aborted) return
        // Last resort: pan to city center silently
        await applyLocation(cityCenter)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          applyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        async () => {
          await tryGoogleFallback()
        },
        { timeout: 8000, enableHighAccuracy: false },
      )
    } else {
      tryGoogleFallback()
    }
  }

  const handleConfirm = () => {
    if (!pinPos || !address) return
    onChange({ city, address, landmark, coordinates: pinPos })
    setConfirmed(true)
  }

  return (
    <div className="space-y-4 w-full">
      {/* Search — New Places API */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted-foreground">
          {searching ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </div>
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
          placeholder={
            placesLib
              ? "Search address, place, or landmark in Nepal…"
              : "Loading search…"
          }
          disabled={!placesLib}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent shadow-sm disabled:opacity-50"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => {
              suggestionRequestRef.current += 1
              if (debounceRef.current) clearTimeout(debounceRef.current)
              setSearchText("")
              setSuggestions([])
              setSuggestionsOpen(false)
              setSearching(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}

        {/* Suggestions dropdown */}
        {suggestionsOpen && suggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl z-50 overflow-hidden max-h-56 overflow-y-auto"
            style={{
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s.placeId}
                type="button"
                onMouseDown={() => selectSuggestion(s)}
                className={`w-full text-left px-4 py-3.5 hover:bg-muted active:bg-muted transition-colors flex items-center gap-3 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <MapPin size={16} className="text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.text}
                  </p>
                  {s.secondaryText && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {s.secondaryText}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        className="relative rounded-2xl overflow-hidden border border-border shadow-sm w-full"
        style={{ height: "clamp(260px, 55vw, 360px)" }}
        onClick={() => setSuggestionsOpen(false)}
      >
        <Map
          id="selector-map"
          mapId={GOOGLE_MAP_ID}
          defaultCenter={pinPos ?? cityCenter}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          fullscreenControlOptions={{ position: 3 }}
          zoomControl={true}
          style={{ width: "100%", height: "100%" }}
        >
          <MapClickHandler onMapClick={handleMapClick} />
          {pinPos && (
            <AdvancedMarker position={pinPos} title="Delivery location">
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow-md">
                  <MapPin size={20} fill="white" />
                </div>
                <div className="w-0.5 h-3 bg-primary" />
                <div className="w-4 h-1.5 bg-black/20 rounded-full blur-sm" />
              </div>
            </AdvancedMarker>
          )}
        </Map>

        {/* My Location */}
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={locating}
          title="Use my current location"
          className="absolute top-2.5 right-2.5 z-10 bg-white border border-gray-300 shadow-md rounded p-2 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={18} className="text-primary animate-spin" />
          ) : (
            <Crosshair size={18} className="text-gray-600" />
          )}
        </button>

        {!pinPos && !geocoding && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-white/95 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow border border-gray-200 pointer-events-none text-center max-w-[85%]">
            Tap the map to drop a pin
          </div>
        )}
        {geocoding && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow flex items-center gap-2 pointer-events-none max-w-[85%]">
            <Loader2 size={12} className="animate-spin text-primary" /> Getting
            address…
          </div>
        )}
      </div>

      {/* Address fields */}
      <div className="space-y-3">
        <Input
          label="Delivery address"
          placeholder="Street, neighborhood, landmark"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            setConfirmed(false)
            onChange(null)
          }}
          leftIcon={<MapPin size={16} />}
          required
        />
        <Input
          label="Landmark (optional)"
          placeholder="Near blue gate, opposite temple…"
          value={landmark}
          onChange={(e) => {
            setLandmark(e.target.value)
            setConfirmed(false)
            onChange(null)
          }}
          hint="Helps our delivery team find the exact spot"
        />
      </div>

      {/* Confirmed location card */}
      {pinPos && address && (
        <div
          className={`rounded-2xl p-4 w-full overflow-hidden border ${
            confirmed
              ? "bg-success/10 border-success/25"
              : "bg-primary-light border-primary/20"
          }`}
          aria-live="polite"
        >
          <div className="flex items-start gap-3 min-w-0">
            {confirmed ? (
              <CheckCircle2
                size={18}
                className="text-success shrink-0 mt-0.5"
              />
            ) : (
              <Navigation
                size={18}
                className="text-primary shrink-0 mt-0.5"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {confirmed
                  ? "Delivery Location Confirmed"
                  : "Delivery Location Ready"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {address}
                {landmark ? `, ${landmark}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {city} · {pinPos.lat.toFixed(4)}, {pinPos.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <Button
            variant={confirmed ? "success" : "primary"}
            size="md"
            fullWidth
            className="mt-3"
            onClick={handleConfirm}
            leftIcon={confirmed ? <CheckCircle2 size={17} /> : undefined}
          >
            {confirmed ? "Location Confirmed" : "Confirm This Location"}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function MapSelector(props: MapSelectorProps) {
  if (!HAS_GOOGLE_MAPS_API_KEY) {
    return <ManualLocationSelector {...props} />
  }

  return (
    <GoogleMapsProvider fallback={<ManualLocationSelector {...props} />}>
      <MapSelectorContent {...props} />
    </GoogleMapsProvider>
  )
}
