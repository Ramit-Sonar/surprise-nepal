# Surprise Nepal Backend — Final Folder Structure

```text
surprise-nepal-backend/
│
├── src/
│   │
│   ├── config/                         # Environment validation and connections
│   │   ├── env.js                      # Validate required environment variables
│   │   ├── database.js                 # MongoDB connection
│   │   ├── redis.js                    # Redis connection
│   │   ├── cloudinary.js               # Cloudinary client configuration
│   │   ├── brevo.js                    # Brevo email client configuration
│   │   └── google.js                   # Google OAuth / Maps configuration
│   │
│   ├── modules/                        # Feature-based modules
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validator.js
│   │   │   ├── auth.constants.js
│   │   │   ├── otp.store.js            # OTP operations using Redis
│   │   │   └── session.store.js        # Refresh-session operations using Redis
│   │   │
│   │   ├── users/                      # Customer and admin identity/profile
│   │   │   ├── user.model.js           # role: user | admin | superadmin
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   └── user.validator.js
│   │   │
│   │   ├── admin/                      # Admin-only operations
│   │   │   ├── adminInviteCode.model.js
│   │   │   ├── admin.routes.js         # Invite codes, admin management, stats
│   │   │   ├── admin.controller.js
│   │   │   ├── admin.service.js
│   │   │   └── admin.validator.js
│   │   │
│   │   ├── gifts/
│   │   │   ├── gift.model.js
│   │   │   ├── gift.routes.js
│   │   │   ├── gift.controller.js
│   │   │   ├── gift.service.js
│   │   │   └── gift.validator.js
│   │   │
│   │   ├── categories/
│   │   │   ├── category.model.js
│   │   │   ├── category.routes.js
│   │   │   ├── category.controller.js
│   │   │   ├── category.service.js
│   │   │   └── category.validator.js
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.model.js
│   │   │   ├── cart.routes.js
│   │   │   ├── cart.controller.js
│   │   │   ├── cart.service.js
│   │   │   └── cart.validator.js
│   │   │
│   │   ├── coupons/
│   │   │   ├── coupon.model.js
│   │   │   ├── coupon.routes.js
│   │   │   ├── coupon.controller.js
│   │   │   ├── coupon.service.js
│   │   │   └── coupon.validator.js
│   │   │
│   │   ├── orders/
│   │   │   ├── order.model.js
│   │   │   ├── order.routes.js
│   │   │   ├── order.controller.js
│   │   │   ├── order.service.js
│   │   │   └── order.validator.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── notification.model.js
│   │   │   ├── notification.routes.js
│   │   │   ├── notification.controller.js
│   │   │   └── notification.service.js
│   │   │
│   │   └── settings/
│   │       ├── setting.model.js
│   │       ├── setting.routes.js
│   │       ├── setting.controller.js
│   │       └── setting.service.js
│   │
│   ├── routes/
│   │   └── index.js                    # Mount all module routes under /api/v1
│   │
│   ├── middleware/
│   │   ├── authenticate.js             # Verify access token; set req.user
│   │   ├── authorize.js                # Check user role/permissions
│   │   ├── rateLimiter.js              # Redis-backed request limits
│   │   ├── validate.js                 # Generic schema-validation middleware
│   │   ├── upload.js                   # Multer setup and upload limits
│   │   ├── notFound.js                 # Handle unknown routes
│   │   └── errorHandler.js             # Centralized error responses
│   │
│   ├── services/                       # Shared and external service operations
│   │   ├── email.service.js            # Send OTP/order/cancellation emails
│   │   ├── cloudinary.service.js       # Upload/delete media
│   │   ├── google.service.js           # Google API operations
│   │   └── cache.service.js            # Shared Redis cache helpers
│   │
│   ├── queues/                         # Background job producers
│   │   └── email.queue.js              # Enqueue email tasks with BullMQ
│   │
│   ├── workers/                        # Background job consumers
│   │   └── email.worker.js             # Process queued email tasks
│   │
│   ├── utils/                          # Small reusable helpers
│   │   ├── apiResponse.js              # Consistent API response format
│   │   ├── appError.js                 # Standard application error
│   │   ├── asyncHandler.js             # Forward async errors to middleware
│   │   ├── generateOtp.js
│   │   ├── generateInviteCode.js
│   │   ├── hash.js                     # Hash/compare sensitive values
│   │   ├── token.js                    # Create and verify tokens
│   │   ├── pagination.js               # Pagination helpers
│   │   └── logger.js                   # Structured application logging
│   │
│   ├── constants/                      # Shared fixed values
│   │   ├── orderStatus.js              # pending, confirmed, prepared, etc.
│   │   ├── orderType.js                 # myself | surprise
│   │   ├── paymentMethod.js             # COD | QR
│   │   └── roles.js                     # user | admin | superadmin
│   │
│   ├── docs/
│   │   └── swagger.js                  # OpenAPI documentation setup
│   │
│   ├── app.js                          # Configure Express; do not listen here
│   └── server.js                       # Connect services and start HTTP server
│
├── tests/
│   ├── auth/
│   ├── users/
│   ├── gifts/
│   ├── cart/
│   ├── coupons/
│   └── orders/
│
├── .env                                # Local secrets; never commit
├── .env.example                        # Required variable names, no secrets
├── .gitignore
├── .dockerignore
├── docker-compose.yml                  # Local app + MongoDB + Redis
├── Dockerfile
├── package.json
└── README.md
```

## Project-specific architecture rules

* **Users and admins:** one `User` model with a `role` field. The `admin/` module contains admin-only features, not a second user identity model.
* **Authentication:** `authenticate.js` verifies the access token and sets `req.user`; `authorize.js` checks roles. Refresh tokens are delivered in secure HttpOnly cookies and their sessions are managed through `auth/session.store.js` with Redis.
* **Validation:** each feature’s `*.validator.js` defines its schemas; `middleware/validate.js` is the reusable middleware that runs a supplied schema.
* **Orders:** use the shared `orderStatus.js`, `orderType.js`, and `paymentMethod.js`. QR submissions are recorded in `paymentAttempts` within the order. Do not add `paymentStatus.js` or a separate payment collection for the current manual QR process.
* **Uploads:** `middleware/upload.js` configures Multer and enforces file limits. `services/cloudinary.service.js` handles Cloudinary operations; Multer itself does not upload files to Cloudinary.
* **Email jobs:** `queues/` and `workers/` are for BullMQ-based background email processing. Keep these folders if you are implementing the queue now; otherwise add them when you introduce background jobs.
* **Notifications:** admin notifications are persisted in MongoDB through the notifications module. Email is reserved for the key customer messages you planned.
* **No repositories folder for now:** services can use Mongoose models directly. Add a repository layer only if your data-access needs become complex enough to benefit from it.
* **No duplicate order constants:** keep the shared constants in `src/constants/`; don't create a second `order.constants.js`.
* **Startup:** `app.js` configures Express middleware and routes. `server.js` loads validated environment settings, connects to MongoDB and Redis, starts any worker process as configured, and then listens.

## Main request flow

```text
Frontend
   ↓
Routes
   ↓
Middleware (authenticate / authorize / validate / upload as needed)
   ↓
Controller (HTTP request and response)
   ↓
Service (business rules and workflow)
   ↓
MongoDB / Redis / external service wrappers
   ↓
Controller sends response
```

For background emails:

```text
Feature service
   ↓
Email queue
   ↓
Redis / BullMQ
   ↓
Email worker
   ↓
Email service
   ↓
Brevo
```
