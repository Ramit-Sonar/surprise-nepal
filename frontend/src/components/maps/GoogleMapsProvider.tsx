import { useCallback, useState, type ReactNode } from "react"
import {
  APIProvider,
  APILoadingStatus,
  useApiLoadingStatus,
} from "@vis.gl/react-google-maps"
import { Loader2, MapPin } from "lucide-react"
import { GOOGLE_MAPS_API_KEY, HAS_GOOGLE_MAPS_API_KEY } from "../../config/api"

interface GoogleMapsProviderProps {
  children: ReactNode
  fallback?: ReactNode
}

function MapStatus({
  children,
  fallback,
}: {
  children: ReactNode
  fallback: ReactNode
}) {
  const status = useApiLoadingStatus()

  if (
    status === APILoadingStatus.NOT_LOADED ||
    status === APILoadingStatus.LOADING
  ) {
    return (
      <div
        className="flex min-h-64 h-full w-full items-center justify-center bg-muted/30"
        role="status"
        aria-label="Loading map"
      >
        <Loader2
          size={24}
          className="animate-spin text-primary"
          aria-hidden="true"
        />
      </div>
    )
  }

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

function DefaultMapFallback({ missingKey = false }: { missingKey?: boolean }) {
  return (
    <div className="flex min-h-64 h-full w-full flex-col items-center justify-center bg-muted/40 px-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-sm">
        <MapPin size={20} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        {missingKey
          ? "Google Maps is not configured"
          : "Google Maps could not load"}
      </p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {missingKey
          ? "Add VITE_GOOGLE_MAPS_API_KEY to the application environment and reload the preview."
          : "Check that Maps JavaScript API and Places API are enabled and that this site is allowed by the key restrictions."}
      </p>
    </div>
  )
}

export default function GoogleMapsProvider({
  children,
  fallback,
}: GoogleMapsProviderProps) {
  const [loadFailed, setLoadFailed] = useState(false)
  const errorFallback = fallback ?? <DefaultMapFallback />
  const handleError = useCallback((error: unknown) => {
    console.error(
      "Google Maps failed to load. Check API enablement and key restrictions.",
      error,
    )
    setLoadFailed(true)
  }, [])

  if (!HAS_GOOGLE_MAPS_API_KEY) {
    return fallback ?? <DefaultMapFallback missingKey />
  }

  if (loadFailed) {
    return <>{errorFallback}</>
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      region="NP"
      language="en"
      onError={handleError}
    >
      <MapStatus fallback={errorFallback}>{children}</MapStatus>
    </APIProvider>
  )
}
