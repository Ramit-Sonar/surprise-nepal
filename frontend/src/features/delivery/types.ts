export interface GeoCoordinates {
  lat: number
  lng: number
}

export interface DeliveryLocation {
  city: string
  address: string
  landmark?: string
  coordinates: GeoCoordinates
}

export type DeliveryStatus = "not_scheduled" | "scheduled" | "out_for_delivery" | "delivered" | "failed" | "cancelled"

/**
 * Allowed server transitions:
 * not_scheduled -> scheduled | cancelled
 * scheduled -> out_for_delivery | failed | cancelled
 * out_for_delivery -> delivered | failed
 * failed -> scheduled | cancelled
 * delivered and cancelled are terminal.
 */
export interface DeliveryStatusTransition<
  From extends DeliveryStatus = DeliveryStatus,
  To extends DeliveryStatus = DeliveryStatus,
> {
  from: From
  to: To
}

export type AllowedDeliveryStatusTransition = DeliveryStatusTransition<"not_scheduled", "scheduled" | "cancelled"> | DeliveryStatusTransition<"scheduled", "out_for_delivery" | "failed" | "cancelled"> | DeliveryStatusTransition<"out_for_delivery", "delivered" | "failed"> | DeliveryStatusTransition<"failed", "scheduled" | "cancelled">
