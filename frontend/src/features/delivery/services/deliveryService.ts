import { STORAGE_KEYS, storageGet, storageSet } from "../../../services/storage"

export let CITIES: string[] = []

export interface DeliverySettings {
  availableCities: string[]
  estimatedDeliveryTime: string
  deliveryNotes: string
  defaultDeliveryFee: number
  freeDeliveryThreshold: number
  sameDayOrderCutoff: string
  sameDayEnabled: boolean
  crossCityEnabled: boolean
}

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  availableCities: CITIES,
  estimatedDeliveryTime: "1–2 days",
  deliveryNotes: "Our delivery team will contact the recipient before arrival.",
  defaultDeliveryFee: 200,
  freeDeliveryThreshold: 5000,
  sameDayOrderCutoff: "2:00 PM",
  sameDayEnabled: true,
  crossCityEnabled: true,
}

export function configureDeliveryCities(cities: string[]) {
  CITIES = cities
  DEFAULT_DELIVERY_SETTINGS.availableCities = cities
}

export function getDeliverySettings(): DeliverySettings {
  return {
    ...DEFAULT_DELIVERY_SETTINGS,
    ...storageGet<Partial<DeliverySettings>>(
      STORAGE_KEYS.DELIVERY_SETTINGS,
      {},
    ),
  }
}

export function saveDeliverySettings(settings: DeliverySettings): boolean {
  return storageSet(STORAGE_KEYS.DELIVERY_SETTINGS, settings)
}
