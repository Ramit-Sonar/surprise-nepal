/**
 * Centralised API / external service configuration.
 * All keys must come from environment variables — never hardcoded here.
 */

export const GOOGLE_MAPS_API_KEY: string = (
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined ?? ""
).trim()

// A configured key is the single source of truth. Requiring a second enable
// flag can silently disable every map even when a valid key is available.
export const HAS_GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY.length > 0

// Advanced markers require a map ID. Use Google's demo ID locally until a
// project-specific map ID is configured for deployment.
export const GOOGLE_MAP_ID =
  (
    import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined ?? ""
  ).trim() || "DEMO_MAP_ID"

export const NOMINATIM_REVERSE_URL =
  "https://nominatim.openstreetmap.org/reverse"

export const GOOGLE_GEOLOCATION_URL =
  "https://www.googleapis.com/geolocation/v1/geolocate"

export const GOOGLE_MAPS_LINK_BASE = "https://www.google.com/maps"
