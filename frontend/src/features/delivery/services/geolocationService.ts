import {
  GOOGLE_GEOLOCATION_URL,
  GOOGLE_MAPS_API_KEY,
  NOMINATIM_REVERSE_URL,
} from "../../../config/api"

interface Coordinates {
  lat: number
  lng: number
}

export async function reverseGeocodeLocation(
  position: Coordinates,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(
    `${NOMINATIM_REVERSE_URL}?lat=${position.lat}&lon=${position.lng}&format=json`,
    {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "GiftSurpriseApp/1.0",
      },
      signal,
    },
  )

  if (!response.ok) throw new Error("Reverse geocoding failed")
  const data = (await response.json()) as { display_name?: string }
  return data.display_name ?? ""
}

export async function geolocateViaIp(
  signal: AbortSignal,
): Promise<Coordinates> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured")
  }

  const response = await fetch(
    `${GOOGLE_GEOLOCATION_URL}?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ considerIp: true }),
      signal,
    },
  )

  if (!response.ok) throw new Error("Geolocation API failed")
  const data = (await response.json()) as { location: Coordinates }
  return data.location
}
