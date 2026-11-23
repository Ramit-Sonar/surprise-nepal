# Surprise Nepal Admin Dashboard — Production V1 Audit and Rationalization Plan

## 1. Review target and conclusion

This audit evaluates the current Admin system against a **production-ready V1 marketplace** standard, not merely an interactive prototype.

### Overall conclusion

The current Admin UI contains a strong V1 workflow concept and many reusable screens, but the implementation is **not production-feasible yet** because its authoritative data, authentication, permissions, financial records, images, and operational state are stored or derived in the browser. The primary work is not a visual redesign. It is to:

1. retain the useful Admin information architecture and existing design system;
2. remove or defer disconnected and misleading UI;
3. establish one backend-owned source of truth;
4. enforce order/shop/admin status ownership server-side;
5. make settlements immutable and auditable once reviewed or paid.

The existing customer-facing design and customer timeline should remain unchanged.

---

## 2. Current Admin information architecture

The current protected Admin routes are:

- `/admin` — Dashboard
- `/admin/products` and `/admin/products/:id` — Products and product editing
- `/admin/shops` and `/admin/shops/:id` — Partner shops and shop details
- `/admin/settlements` — Monthly shop settlements
- `/admin/orders` and `/admin/orders/:id` — Orders and order details
- `/admin/customers` — Customers
- `/admin/delivery` — Delivery map
- `/admin/coupons` and coupon create/edit routes — Coupons
- `/admin/settings` — General, delivery, payment, notification, security, and access settings

This route structure is understandable and does not need a wholesale redesign. The problem is that some pages are connected to real in-app state while others are static, locally persisted, partially wired, or purely illustrative.

---

## 3. What should remain in production V1

### 3.1 Admin shell and navigation

**Keep:**

- Existing sidebar, responsive behavior, breadcrumb pattern, status colors, typography, cards, dialogs, buttons, and notifications affordance.
- Protected route concept.
- Existing section names for Dashboard, Products, Shops, Settlements, Orders, Delivery, and Settings.

**Required production change:** authorization must be enforced by the backend, not only by `AdminGuard` reading a browser-owned `isAdmin` flag.

### 3.2 Dashboard

**Keep, but reduce to operational and financial decisions:**

- Pending shop applications
- Pending product reviews
- Orders awaiting payment/admin confirmation
- Orders awaiting shop preparation
- Shop portions ready for pickup
- Orders collected / out for delivery
- Eligible gross shop sales
- Platform commission
- Outstanding shop payable / pending settlements
- Ready-for-pickup queue with shop and pickup address
- Recent orders

These answer the core Admin questions: what needs review, what needs pickup, what is being delivered, and what is owed.

### 3.3 Partner Shops

**Keep:**

- Status tabs: All, Pending, Approved, Rejected, Suspended
- Search
- Data-driven product and order counts
- Approve, reject, suspend, reactivate actions with confirmation
- Shop Details route
- Shop information
- Admin-controlled commission rate
- Performance summary
- Shop products
- Recent shop orders
- Monthly settlements

**Required production behavior:** all status changes must be authorized, timestamped, attributed to an Admin, and written through a backend transaction or command.

### 3.4 Products

**Keep:**

- Product list
- Shop ownership
- Search and compact status filtering
- Pending-review workflow
- Approve/reject with feedback
- Activate/deactivate
- Product edit form
- Stock and selling price

**Required production behavior:** product deletion should become archive/soft-delete when a product has order history. Historical order items must remain intact.

### 3.5 Orders and Order Details

**Keep:**

- Existing order table and pagination pattern
- Payment verification
- One customer order ID and overall payment/delivery record
- Multi-shop grouping
- Shop-specific products and quantities
- Shop pickup addresses
- Shop-specific preparation state
- Admin collection and delivery workflow
- Existing customer-facing timeline unchanged
- Admin operational timeline with collection stage

**Status ownership to enforce:**

- System: Order Placed
- Admin: payment verification and Confirmed
- Shop: Preparing → Ready for Pickup, only for its own portion
- Admin: Collected → Out for Delivery → Delivered
- Admin: Cancelled only while cancellation is allowed

### 3.6 Settlements

**Keep:**

- Monthly shop settlement list
- Shop, period, order count, units, gross sales, commission, payable, status, action
- Pending → Processing → Paid
- Process, Mark as Paid, View
- Paid settlement details containing payment date/reference

**Required production behavior:** settlement amounts must be generated from eligible completed shop portions and frozen when reviewed/processed. Paid settlements must never be recomputed from mutable live data.

### 3.7 Delivery settings

**Keep:**

- Global delivery cities
- Default delivery fee
- Estimated delivery time
- Delivery notes

These are already consumed by checkout/product surfaces to varying degrees and are valid global settings.

### 3.8 Payment settings

**Keep conceptually:**

- Admin-configured QR payment destination
- Customer payment screenshot submission
- Admin verification/rejection

**Required production change:** store payment assets in object storage and payment records in the backend. Do not store QR or screenshots as browser Base64/localStorage data.

### 3.9 Notifications

**Keep conceptually:**

- New order
- Payment screenshot
- COD confirmation
- Low stock
- Ready for pickup

Notifications should be backend event-driven and user-scoped. Read state must not be browser-only.

---

## 4. What is unnecessary, misleading, or should be deferred

### 4.1 Dashboard charts

**Remove from V1:**

- Revenue area chart
- Order-status pie chart

Reasons:

- The user has repeatedly requested a simple operational V1.
- Charts duplicate information already available in cards and lists.
- The current “Revenue & Orders” series sums all order totals, including orders that may be pending or cancelled, while the financial cards use delivered item values. This creates conflicting definitions.
- Charts add bundle size and cognitive load without supporting an essential workflow.

### 4.2 Excessive dashboard cards

The current 12-card grid is too dense. Consolidate to approximately 6–8 cards centered on pending reviews, order operations, pickup, gross sales, commission, and settlement liability. Total shops/products can be shown as lightweight secondary counts if needed.

### 4.3 Customers page in its current form

**Remove from production V1 navigation until rebuilt.**

Current problems:

- It is backed by a hard-coded `MOCK_CUSTOMERS` array.
- Customer totals are manually embedded and disconnected from orders.
- Orders do not have a reliable `customerId`, so customer history cannot be joined correctly.

Reintroduce only after customer identity and order ownership exist in the backend. A V1 customer page should be read-only and derive order count/spend from actual eligible orders.

### 4.4 General Settings in its current form

**Remove or hide until wired.**

Store name, email, phone, description, and currency are uncontrolled inputs with no persistence or downstream consumers. Presenting a Save button implies functionality that does not exist.

### 4.5 Security Settings in its current form

**Remove immediately from production UI until backed by real authentication.**

Current password, new password, confirmation, and two-factor controls are visual only. Fake security controls create risk and false confidence.

### 4.6 Admin Access / invite codes in its current form

**Remove from production until implemented server-side.**

Invite codes are generated and consumed in localStorage, and the admin login accepts any syntactically valid email without validating the password. This is not an access-control system.

### 4.7 Unused delivery options

**Remove from V1 unless explicitly implemented:**

- Free delivery threshold setting
- Same-day cutoff
- Same-day enabled toggle
- Cross-city delivery toggle

The repository stores these values, but they are not used to enforce checkout availability or pricing. Keep only settings with real consumers.

### 4.8 Product rating column in Admin Products

**Remove from the operational product table for V1.** Ratings are customer merchandising data and are not needed for product approval, inventory, ownership, or activation decisions. They can remain on customer product pages.

### 4.9 Hard delete for products with history

**Remove as a normal action.** Use archive/inactive status. Hard delete should be allowed only when a product has never appeared in an order and should require a protected backend operation.

### 4.10 Coupons unless required for launch

Coupons are optional for the managed-marketplace core. If promotions are not a launch requirement, defer the entire Coupons section.

If retained, the current implementation must be fixed first because usage counts are seeded/client-owned, per-customer usage is not enforced, coupon redemption is not atomically recorded, and free-delivery discount uses a hard-coded delivery fee.

### 4.11 Delivery map as a separate V1 section

**Conditional keep:**

- Keep if Surprise Nepal staff genuinely dispatch from a map and location pins are operationally useful.
- Otherwise defer it and use the Orders pickup/delivery queues.

If kept, the default view should include only actionable delivery states (Collected and Out for Delivery, optionally today’s Delivered), not every pending/preparing/completed order. The current “active deliveries” count includes all orders and is misleading.

### 4.12 Demo/seed data in production code paths

**Remove from production data sources.**

Demo shops, products, orders, preview settlements, and generated preview orders currently coexist with application logic. Development fixtures should load only in explicit demo/dev mode and must never merge into production records.

---

## 5. Architecture and data-integrity issues

### P0 — production blockers

#### 5.1 Browser storage is acting as the database

Orders, shops, products, settlements, admins, invite codes, notification state, settings, payment QR, and sessions are stored in localStorage or React state.

Consequences:

- Data differs by browser/device.
- Admin and shop views are not truly synchronized.
- Clearing storage destroys records.
- Concurrent edits overwrite one another.
- There is no audit trail, access control, backup, or reliable query layer.
- Base64 images can exceed storage quota and failures are sometimes silently ignored.

**Required:** introduce a backend database and object storage. Browser storage may remain only for cart, transient drafts, and non-sensitive UI preferences.

#### 5.2 Authentication and authorization are not real

`loginAdmin` validates email format but does not validate a password. Admin identity and `isAdmin` are browser-owned. Shop passwords are stored in plaintext. Invite codes are browser-local.

**Required:** backend authentication, hashed credentials or managed auth, server-side sessions/JWT validation, and route/action authorization by role.

#### 5.3 Role ownership exists only in UI

The UI now expresses System/Admin/Shop ownership, but any client can call local mutation functions. Production must enforce transitions server-side with an allowed-transition matrix and actor role.

#### 5.4 Settlements are recomputed from live orders

`getSettlementSnapshot` reconstructs settlement values from current orders every time, even when a previous settlement exists. A paid settlement can therefore change if order data is edited.

**Required:** settlement creation must snapshot immutable settlement lines containing order item ID, price, quantity, commission rate, commission amount, payable, and eligibility/completion timestamp. Processing/Paid settlements become immutable except for payment metadata and controlled corrections.

#### 5.5 Settlement month uses order creation date

Current period assignment uses `order.createdAt`, not the date the shop portion became eligible/completed. An order placed in September and delivered in October is incorrectly settled in September.

**Required:** store `deliveredAt`/eligible-at timestamps and use the agreed eligibility date for settlement periods.

### P1 — correctness and maintainability

#### 5.6 No canonical order event history

An order has only `createdAt` and one `updatedAt`; the timeline cannot reliably show when each stage occurred or who performed it. Item-level timestamps exist only for some preparation stages.

**Required:** append-only order status events with actor type/id, from/to status, timestamp, and optional note. Shop-portion events should be separately auditable.

#### 5.7 Multi-shop fulfillment should be a first-class entity

The current model stores fulfillment status on each item, then updates every item matching a shop. This works for the demo but makes invariants and querying harder.

**Recommended entity:** `OrderShopFulfillment` keyed by `(orderId, shopId)` with status, pickup address snapshot, preparedAt, readyAt, collectedAt, and actor metadata. Order items reference this fulfillment group.

#### 5.8 Full product objects are embedded in order items

This preserves history but duplicates large images and mutable catalog fields. It also creates ambiguous fallbacks among `item.shopId`, `item.gift.shopId`, and the current catalog product.

**Required snapshot:** productId, productName, primaryImage URL, SKU/category if needed, shopId/shopName snapshot, unit price, quantity, and commission fields. The catalog product remains a separate relation.

#### 5.9 Shop name is duplicated on products and order items

Renaming a shop can leave product `shopName` stale. Use `shopId` as the relation; snapshot `shopName` only on historical order/settlement records where historical display is intentional.

#### 5.10 Customer data is not related to orders

Orders have recipient information but no buyer/customer ID. Surprise orders further distinguish sender and recipient, but neither is a stable customer relation.

**Required:** `customerId` on orders, plus sender/recipient snapshots. This unlocks a real Customers page and coupon per-customer limits.

#### 5.11 Inventory is not transactionally connected to orders

Stock is manually editable, but order placement does not atomically reserve/decrement inventory. Concurrent orders can oversell.

**Required:** server transaction for stock reservation/decrement, release on cancellation, and clear out-of-stock activation rules.

#### 5.12 Coupon logic is disconnected

- Usage count is not atomically incremented.
- Per-customer usage is passed as zero.
- Delivery discount assumes a hard-coded fee of 200 instead of global delivery settings.
- Coupon application and order creation are not transactional.

#### 5.13 Dashboard definitions conflict

- Gross shop sales use delivered order-item values.
- Revenue chart uses every order’s total, potentially including delivery fees, pending, and cancelled orders.
- Total orders includes demo and cancelled records.

Every metric needs a documented definition and a shared aggregation service/query.

#### 5.14 Delivery page includes non-delivery work

All orders are labeled “active deliveries,” including pending/preparing/delivered/cancelled records. Delivery operations should be filtered to operationally relevant states.

#### 5.15 Multiple disconnected state stores

- AppContext owns orders, customers/session-like state, payment QR, reviews, and coupons.
- `shopData` directly owns shops, products, settlements, shop sessions, and shop notifications.
- Delivery and notification settings have separate localStorage services.

This causes inconsistent refresh behavior and makes cross-entity transactions impossible.

**Required:** backend repositories/API clients by domain, with one query/mutation layer and explicit cache invalidation.

### P2 — scalability and quality

- Orders paginate only after loading all records into the browser.
- Shops, products, coupons, and customers have no server pagination.
- Dashboard recomputes all aggregates in the browser on every render.
- Search is client-only and will not scale.
- Images/payment screenshots are embedded as Base64.
- Errors are often swallowed, so failures appear successful.
- Status labels and color definitions are partly duplicated across components.
- Several controls use raw values and one-off implementations instead of shared components.

---

## 6. Connection audit

| Area | Current connection | Production assessment |
|---|---|---|
| Shops → Products | `Gift.shopId`, plus duplicated `shopName` | Concept is correct; normalize around `shopId` and backend foreign key |
| Products → Catalog | Active + in-stock products returned by `getCatalogProducts` | Keep; enforce status/stock query server-side |
| Customer checkout → Orders | React state/localStorage order creation | Workflow exists, persistence and stock transaction are missing |
| Orders → Shop portions | Item `shopId` + item fulfillment status | Works visually; replace with first-class shop fulfillment group |
| Shop status updates → Admin | Shared browser state only | UI is connected in one browser, not across real users/devices |
| Payment verification → Confirmation | Admin action updates payment and order status | Keep workflow; enforce backend transaction and audit event |
| Ready for pickup → Admin | Item status and derived notification | Keep; backend event/notification required |
| Orders → Settlements | Delivered items grouped by shop/month | Correct direction; wrong period timestamp and mutable settlement snapshots |
| Commission → Orders | Rate/amount/payable snapshotted on items | Strong concept; make fields required and server-generated |
| Settlements → Dashboard | Derived client-side from orders + stored status | Replace with backend aggregates and immutable settlement records |
| Delivery cities → Catalog/Checkout/Admin filter | Global delivery settings are consumed by Gift Listing, Checkout, Delivery | Keep; this is one of the better-connected settings |
| Default delivery fee → Checkout | Consumed by checkout | Keep; remove coupon hard-code |
| Delivery time/notes → Product surfaces | Consumed by cards/details | Keep |
| Same-day/cross-city/free threshold | Stored but not enforced | Remove or implement before showing |
| Coupons → Checkout | Validation is connected | Redemption counts, customer limits, and transaction safety are not connected |
| Customers → Orders | No reliable relation; page is static | Disconnected; remove until `customerId` exists |
| General/Security settings | Inputs only | Disconnected; remove until implemented |
| Admin invites/auth | Browser-local | Functionally connected only in one browser, insecure for production |
| Notifications → Order events | Derived client-side | Useful concept; backend ownership/read state missing |

---

## 7. Recommended production V1 information architecture

### Keep in primary Admin navigation

1. **Overview**
2. **Orders**
3. **Shops**
4. **Products**
5. **Settlements**
6. **Delivery** — only if map/dispatch is used operationally
7. **Settings**

### Defer or conditionally include

- **Coupons** — only if required at launch and fully connected
- **Customers** — defer until customer/order relation exists

### Settings V1 tabs

- Delivery
- Payment
- Notifications

Move General, Security, and Admin Access out until backed by real persistence/authentication. Account/security actions should eventually live in a real identity-management surface.

---

## 8. Recommended production data model

### Identity and access

- `users`
- `admin_users` / roles
- `shop_users`
- secure sessions/auth provider
- audit actor references

### Marketplace

- `shops`
- `shop_commission_versions` or effective-dated commission configuration
- `products`
- `product_images`
- inventory/reservations

### Orders

- `orders`
- `order_items` with immutable commercial snapshots
- `order_shop_fulfillments`
- `order_status_events`
- `payments` and payment-proof asset references
- delivery assignments/events if needed

### Finance

- `settlements`
- `settlement_lines`
- payment date/reference
- immutable financial amounts after processing

### Commerce support

- `customers`
- `coupons`
- `coupon_redemptions`
- `delivery_settings`
- backend notifications / read receipts

---

## 9. Implementation sequence

### Phase 1 — remove misleading UI and define contracts

1. Document canonical status transition matrices for order, payment, shop fulfillment, product, shop, and settlement statuses.
2. Remove/hide static Customers, fake Security, fake General settings, and browser-only Admin Access from the production build.
3. Remove Dashboard charts and reduce summary cards.
4. Remove unused delivery settings or wire them before display.
5. Move all demo fixtures behind an explicit development/demo flag.
6. Define exact metric formulas: eligible order, gross shop sales, commission, payable, outstanding payable, and settlement period.

### Phase 2 — backend foundation

1. Add production database and object storage.
2. Add real authentication and role-based authorization.
3. Create the V1 data model above.
4. Implement backend commands for status transitions with audit events.
5. Implement server-side product/order/shop queries with pagination.
6. Implement secure image and payment-proof uploads.

### Phase 3 — migrate core workflows

1. Migrate shops and commission configuration.
2. Migrate products and stock management.
3. Migrate order placement with stock transaction and item financial snapshots.
4. Migrate payment verification and Admin confirmation.
5. Migrate shop fulfillment updates scoped to the authenticated shop.
6. Migrate Admin collection and delivery updates.
7. Drive notifications from committed events.

### Phase 4 — settlements and reporting

1. Add eligibility/completion timestamps.
2. Generate monthly settlement drafts from eligible shop portions.
3. Freeze settlement lines at Processing.
4. Record Paid metadata and prevent silent financial mutation.
5. Replace Dashboard client aggregation with backend summary endpoints/materialized aggregates.

### Phase 5 — optional modules

1. Rebuild Customers from real customer/order relations.
2. Make coupon redemption transactional and customer-aware, or leave Coupons deferred.
3. Keep Delivery map only after validating its operational use and filtering it to actionable delivery states.
4. Add secure Admin invitations/security controls through the auth provider.

---

## 10. Required API/service boundaries

A production implementation should expose domain operations rather than direct storage mutation:

- `shops.list/get/updateStatus/updateCommission`
- `products.list/get/update/submit/approve/reject/activate/archive`
- `orders.list/get/verifyPayment/confirm/cancel`
- `shopFulfillments.startPreparing/markReady`
- `adminFulfillments.markCollected/startDelivery/markDelivered`
- `settlements.list/get/process/markPaid`
- `deliverySettings.get/update`
- `notifications.list/markRead`

Every mutation should return the updated canonical record and trigger targeted query invalidation. The server, not the client, validates role and transition legality.

---

## 11. Edge cases the implementation must resolve

- Multi-shop order where one shop is ready and another is still preparing
- One shop is suspended after an order is confirmed
- Product is archived after appearing in an order
- Stock changes between cart and checkout
- Payment is verified twice or concurrently by two admins
- Cancellation after one shop starts preparing
- Order created in one month and delivered in another
- Commission rate changes between orders
- Mixed historical commission rates in one settlement period
- Paid settlement followed by refund/correction
- Partial/failed image upload
- Duplicate status mutation/retry
- Admin and shop acting concurrently
- Delivery city removed while an existing order is scheduled there
- Coupon limit reached concurrently

Use idempotency keys/version checks for payment verification, fulfillment transitions, and settlement payment actions.

---

## 12. Verification strategy

### Automated domain tests

- Allowed/forbidden status transitions by role
- Multi-shop global-status derivation
- Commission snapshot preservation
- Settlement eligibility and month selection by completion date
- Settlement immutability after Processing/Paid
- Cancellation/refund exclusion from payable
- Stock reservation/decrement/release
- Coupon redemption limits and delivery-fee integration

### API/integration tests

- Admin versus shop authorization
- Concurrent transition conflict handling
- Paginated list/filter/search behavior
- Payment proof upload and verification
- Settlement generation and payment recording
- Notification creation and read state

### UI tests

- Pending shop/product review workflows
- Multi-shop order details and independent shop preparation
- Admin collection only for ready shop portions
- Delivery continuation only after required collection
- Shop details and settlement totals matching source orders
- Global delivery-city configuration reflected in checkout and filters
- Empty states with no fake production data

### Production readiness checks

- No secrets or passwords in localStorage
- No demo records merged into production
- No Base64 payment/image assets in localStorage
- Audit logs for financial and status changes
- Database backups and migration strategy
- Monitoring for failed uploads, failed status commands, and settlement discrepancies

---

## 13. Final keep/remove summary

### Keep

- Existing Admin visual system and shell
- Operational Dashboard cards/queues
- Shops and Shop Details
- Products and approval workflow
- Orders and multi-shop Order Details
- Settlements
- Global delivery settings that are actually consumed
- QR payment workflow concept
- Operational notifications
- Delivery map only if staff use it for dispatch
- Coupons only if launch-critical and repaired

### Remove or defer

- Dashboard charts and excessive cards
- Static Customers page
- Fake General settings
- Fake Security settings
- Browser-only Admin Access/invite system
- Unused same-day/cross-city/free-threshold controls
- Product rating in Admin management table
- Hard-delete for products with order history
- Coupons if not launch-critical
- Delivery map if no real dispatch use case
- All production-path demo/seed data

### Production blockers to solve first

1. Real backend persistence
2. Real authentication and role authorization
3. Server-enforced status ownership
4. Immutable settlement records based on completion date
5. Canonical order/shop-fulfillment event history
6. Transactional inventory and coupon redemption
7. Removal of fake/disconnected Admin surfaces
