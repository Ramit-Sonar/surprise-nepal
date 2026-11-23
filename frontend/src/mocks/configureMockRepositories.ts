import { configureProductRepository } from "../features/products/services/productService"
import { configureShopRepository } from "../features/shops/services/shopService"
import { configureSettlementRepository } from "../features/settlements/services/settlementService"
import { configureShopNotificationRepository } from "../features/notifications/services/shopNotificationService"
import { configureContent } from "../services/contentService"
import { configureSeedCustomer } from "../features/auth/services/customerService"
import { configureDeliveryCities } from "../features/delivery/services/deliveryService"
import { configureBootstrapData } from "../context/bootstrapData"
import {
  categories,
  CITIES,
  faqs,
  mockCoupons,
  mockReviews,
  mockUser,
  OCCASIONS,
  orders,
  testimonials,
} from "./mockData"
import * as repository from "./mockMarketplaceRepository"

export function configureMockRepositories() {
  configureProductRepository(repository, {
    categories,
    occasions: OCCASIONS,
  })
  configureShopRepository(repository)
  configureSettlementRepository(repository)
  configureShopNotificationRepository(repository)
  configureContent({ faqs, testimonials })
  configureSeedCustomer(mockUser)
  configureDeliveryCities(CITIES)
  configureBootstrapData({
    orders,
    user: mockUser,
    reviews: mockReviews,
    coupons: mockCoupons,
  })
}
