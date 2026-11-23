import ErrorBoundary from "../components/common/ErrorBoundary"
import { useStorageSync } from "../hooks/useStorageSync"
import { STORAGE_KEYS } from "../services/storage"
import AppProviders from "./providers"
import AppRoutes from "./routes"

const SHARED_STORAGE_KEYS = [
  STORAGE_KEYS.ORDERS,
  STORAGE_KEYS.PRODUCTS,
  STORAGE_KEYS.SHOPS,
  STORAGE_KEYS.SHOP_NOTIFICATIONS,
  STORAGE_KEYS.SHOP_SETTLEMENTS,
  STORAGE_KEYS.PAYMENT_QR,
  STORAGE_KEYS.ADMIN_NOTIFICATION_SETTINGS,
  STORAGE_KEYS.ADMIN_NOTIFICATION_READ,
] as const

export default function App() {
  useStorageSync(SHARED_STORAGE_KEYS)

  return (
    <AppProviders>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </AppProviders>
  )
}
