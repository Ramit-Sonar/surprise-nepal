Design a complete, production-ready, mobile-first responsive web application for a modern gift and surprise-delivery platform.

PRODUCT CONCEPT
The platform allows customers to discover gifts, add them to cart, choose a delivery date and location, and send gifts as surprises to friends/family—even when the sender and recipient are in different cities.

There are TWO major interfaces:
1. PUBLIC CUSTOMER WEBSITE
2. ADMIN DASHBOARD

The main business flow is:
Admin adds and manages gifts → customers browse gifts → view gift details → add to cart → enter recipient/location details → optionally choose an exact location on a map → select delivery date → place order.

The design must feel trustworthy, warm, joyful, modern, simple, and easy enough for users of all ages and technical abilities.

IMPORTANT:
This is NOT a generic clothing or electronics e-commerce website.
The core emotional experience is "sending a surprise to someone you care about."

==================================================
1. DESIGN DIRECTION
==================================================

Create a premium but approachable visual identity.

Overall feeling:
- Surprise
- Celebration
- Happiness
- Trust
- Warmth
- Personal connection

Design style:
- Modern
- Clean
- Soft
- Minimal
- Friendly
- Premium without being luxurious or complicated
- Strong visual hierarchy
- Generous whitespace
- Rounded cards and buttons
- Subtle shadows
- Soft gradients used carefully
- High-quality gift/product imagery
- Smooth micro-interactions

Avoid:
- Overly childish cartoon design
- Excessive gradients
- Too many colors
- Complex navigation
- Dense dashboards
- Tiny text
- Unnecessary animations
- Generic marketplace appearance

Use a warm primary color system suitable for a gift/surprise brand, supported by neutral backgrounds and strong readable text.

Typography:
- Modern sans-serif
- Excellent readability on mobile
- Clear hierarchy between headings, body text, labels and prices
- Large touch-friendly buttons

Accessibility:
- WCAG-conscious contrast
- Minimum comfortable touch target around 44px
- Never rely only on color to communicate status
- Clear error messages
- Visible focus states
- Readable font sizes

==================================================
2. RESPONSIVE / MOBILE-FIRST REQUIREMENT
==================================================

Design mobile-first.

The website must work beautifully at:
- 360px mobile
- 390px mobile
- 430px mobile
- Tablet
- Laptop
- Desktop
- Large desktop

Do NOT simply shrink desktop layouts.

Create responsive layouts intentionally:
- Mobile navigation
- Mobile bottom actions where useful
- Single-column mobile product layout
- 2-column tablet product grid
- 3–4 column desktop product grid
- Responsive dashboard tables
- Mobile-friendly forms
- Mobile-friendly map interaction
- Sticky checkout CTA on mobile when appropriate

Every important customer action should be easy to perform using one hand on mobile.

==================================================
3. PUBLIC WEBSITE INFORMATION ARCHITECTURE
==================================================

Create these customer-facing pages:

1. Home
2. Gift Listing / Explore Gifts
3. Gift Details
4. Search Results
5. Category Results
6. Cart
7. Checkout
8. Delivery Location / Map Selection
9. Order Confirmation
10. Order Tracking
11. My Orders
12. Customer Login / Signup
13. Customer Profile
14. About / How It Works
15. Help / FAQ

==================================================
4. HOME PAGE
==================================================

Create a strong emotional hero section.

Hero message concept:
"Make Someone's Day Special."

Supporting message:
"Choose a gift, pick the perfect day, and send a surprise anywhere."

Hero should contain:
- Beautiful gift/surprise imagery
- Primary CTA: "Explore Gifts"
- Secondary CTA: "How It Works"

Below hero:

A. Popular Categories
Examples:
- Birthday
- Anniversary
- Flowers
- Cakes
- Chocolates
- Personalized Gifts
- For Her
- For Him
- Friendship
- Celebration

B. Featured Gifts
Product cards with:
- Image
- Product name
- Price
- Rating
- Short description
- Delivery information
- Add to Cart button
- Wishlist icon

C. "How It Works"
Use 3 or 4 simple steps:
1. Choose a Gift
2. Choose Date & Location
3. We Deliver the Surprise
4. Make Someone Smile

D. "Send a Surprise Anywhere"
Explain that the sender and recipient can be in different cities.

E. Trust section
Include:
- Secure checkout
- On-time delivery
- Verified products
- Customer support

F. Testimonials

G. Final CTA

==================================================
5. NAVIGATION
==================================================

Desktop navbar:
- Logo
- Home
- Gifts
- Categories
- How It Works
- Search
- Wishlist
- Cart
- Login/Profile

Mobile:
- Logo
- Search icon
- Cart icon
- Hamburger menu

Do not overcrowd mobile navigation.

Show cart item count.

==================================================
6. GIFT LISTING PAGE
==================================================

Create a clean marketplace-style browsing experience.

Top:
- Breadcrumb
- Page title
- Search
- Category filter
- Sort dropdown

Filters:
- Category
- Price range
- Occasion
- Delivery city
- Availability
- Rating

Product grid:
Mobile: 2 columns where appropriate
Tablet: 2–3 columns
Desktop: 3–4 columns

Product card:
- Large image
- Product name
- Price
- Discount if applicable
- Rating
- Delivery estimate
- Wishlist
- Add to Cart

Include:
- Empty state
- Loading skeleton
- No-result state

==================================================
7. GIFT DETAIL PAGE
==================================================

This is one of the most important pages.

Layout:

Desktop:
Left:
- Large product image
- Thumbnail gallery

Right:
- Product name
- Rating
- Price
- Discount
- Availability
- Short description
- Quantity selector
- Add to Cart
- Buy Now

Below:
- Full description
- What's included
- Delivery information
- Available delivery locations
- Important notes
- Reviews

Add a prominent section:

"SEND THIS AS A SURPRISE"

Explain:
"You can choose who receives it, where it should arrive, and the perfect date."

CTA:
"Send as a Surprise"

==================================================
8. CART
==================================================

Show:
- Product image
- Product name
- Price
- Quantity
- Remove
- Save for later

Order summary:
- Subtotal
- Delivery fee
- Discount
- Total

Primary CTA:
"Continue to Checkout"

Mobile:
Make checkout CTA sticky at bottom without hiding important content.

==================================================
9. CHECKOUT EXPERIENCE
==================================================

Design checkout as a simple step-by-step process.

Steps:

1. Gift
2. Recipient
3. Delivery
4. Date & Time
5. Payment
6. Confirmation

Customer information:
- Full name
- Phone number
- Email

Recipient information:
- Recipient name
- Recipient phone number
- Optional message

IMPORTANT SURPRISE FEATURE:

Allow the customer to choose:

"Who is receiving this gift?"

Sender:
Current customer

Recipient:
Friend / Family / Other

Recipient can be in another city.

==================================================
10. DELIVERY LOCATION + MAP
==================================================

This is a core feature of the product.

Create a dedicated location-selection interface.

Allow customer to:

A. Select city
B. Enter address manually
C. Search location
D. Use current location
E. Select exact location from an interactive map
F. Move a map pin
G. Confirm exact delivery location

Map UI should contain:
- Search bar
- Current location button
- Draggable pin
- Zoom controls
- Selected address
- Delivery radius/service availability indicator
- Confirm location button

After selecting:
Show:

"Delivery Location"
Exact formatted address

"Is this location correct?"

Buttons:
- Change Location
- Confirm Location

IMPORTANT:
Make map interaction extremely simple for non-technical users.

Mobile map:
- Full-width map
- Bottom sheet containing address
- Large "Confirm Location" button

Desktop:
- Map and address form side-by-side

==================================================
11. DELIVERY DATE
==================================================

After selecting location, allow customer to choose delivery date.

Create a friendly date picker.

Display:
- Available dates
- Unavailable dates
- Selected date
- Delivery estimate
- Optional time slot

Example:

"Choose the day you want the surprise to arrive."

Date:
[ 25 Sep ]

Time:
[ Morning ]
[ Afternoon ]
[ Evening ]

Clearly communicate:
- Same-day delivery if available
- Next available date
- Cut-off time
- Delivery availability

Do not make the date picker complicated.

==================================================
12. SURPRISE MESSAGE
==================================================

Allow customer to add a personal message.

Example:
"Happy Birthday! Hope this little surprise makes your day special ❤️"

Fields:
- Personal message
- Optional sender name

Add a character counter.

Show a small preview:
"Your message will be included with the gift."

==================================================
13. PAYMENT
==================================================

Create a clean payment interface.

Payment summary:
- Gift
- Quantity
- Delivery fee
- Total
- Delivery date
- Delivery location

Payment options should be designed so additional payment providers can be added later.

For Nepal-focused implementation, keep the design compatible with:
- eSewa
- Khalti
- Card
- Cash/payment options if supported

Do not hard-code the UI around only one payment provider.

==================================================
14. ORDER CONFIRMATION
==================================================

After successful purchase, create an emotional confirmation screen.

Example:

"Surprise is on its way! 🎁"

Show:
- Order number
- Gift
- Recipient
- Delivery date
- Delivery location
- Order status

CTA:
"Track Order"

Secondary:
"Continue Shopping"

==================================================
15. ORDER TRACKING
==================================================

Create a visual order timeline:

Order Placed
↓
Order Confirmed
↓
Gift Prepared
↓
Out for Delivery
↓
Delivered 🎁

Show:
- Current status
- Estimated delivery
- Recipient
- Delivery location
- Order details

Do NOT expose unnecessary technical information.

==================================================
16. CUSTOMER PROFILE
==================================================

Profile sections:
- Personal Information
- Saved Addresses
- My Orders
- Wishlist
- Saved Recipients
- Notification Preferences

Allow customers to save frequently used addresses.

==================================================
17. ADMIN DASHBOARD
==================================================

Create a completely separate professional admin interface.

Admin dashboard should feel like a modern SaaS management system.

Sidebar navigation:

Dashboard
Products / Gifts
Categories
Orders
Customers
Deliveries
Locations
Coupons
Reviews
Analytics
Settings

Top bar:
- Search
- Notifications
- Admin profile
- Logout

==================================================
18. ADMIN DASHBOARD OVERVIEW
==================================================

Dashboard cards:

- Total Orders
- Today's Orders
- Pending Orders
- Delivered Orders
- Total Revenue
- Active Gifts
- Customers

Charts:
- Orders over time
- Revenue over time
- Popular gifts
- Orders by city
- Delivery status

Use simple readable charts.

Avoid making the dashboard unnecessarily complicated.

==================================================
19. ADMIN PRODUCT / GIFT MANAGEMENT
==================================================

This is one of the most important admin modules.

Admin can:

- Add gift
- Edit gift
- Delete gift
- Activate/deactivate gift
- Upload product images
- Set price
- Set discount
- Set stock
- Select category
- Add description
- Add tags
- Set delivery availability
- Set estimated delivery time

Gift creation form:

Product image
Product name
Category
Price
Discount
Stock
Description
Tags
Available cities
Delivery availability
Status

Buttons:
- Save Draft
- Publish Gift
- Cancel

Use a clear form layout.

==================================================
20. ADMIN PRODUCT LIST
==================================================

Table columns:

Image
Gift Name
Category
Price
Stock
Status
Orders
Created Date
Actions

Actions:
- View
- Edit
- Duplicate
- Activate/Deactivate
- Delete

Mobile:
Convert table rows into responsive cards rather than forcing a wide table.

==================================================
21. ADMIN ORDER MANAGEMENT
==================================================

Order list:

Order ID
Customer
Recipient
Gift
Delivery City
Delivery Date
Amount
Status
Created Date

Statuses:
Pending
Confirmed
Preparing
Ready
Out for Delivery
Delivered
Cancelled

Order detail page should show:

Customer information
Recipient information
Gift information
Payment information
Delivery date
Exact delivery address
Map location
Order timeline
Customer message
Order notes

Admin should be able to update order status.

==================================================
22. ADMIN DELIVERY / MAP VIEW
==================================================

Create an admin delivery management screen.

Show:
- Map
- Delivery locations
- Orders
- Delivery date
- Delivery status

Allow admin to select an order and view its exact delivery location.

Use map markers with status indicators.

Provide filters:
- Date
- City
- Status

==================================================
23. CUSTOMER + ADMIN STATES
==================================================

Design all important states:

Loading
Empty
Success
Error
Validation error
No products
No orders
Out of stock
Unavailable delivery location
Unavailable delivery date
Payment failed
Payment successful
Order cancelled
Location permission denied

Every state should have:
- Clear message
- Helpful explanation
- Appropriate CTA

Never show technical error messages to customers.

==================================================
24. COMPONENT DESIGN SYSTEM
==================================================

Create reusable components and maintain visual consistency.

Components:
- Navbar
- Mobile navigation
- Footer
- Product card
- Category card
- Button
- Input
- Select
- Search bar
- Filter
- Modal
- Bottom sheet
- Toast
- Badge
- Rating
- Price display
- Date picker
- Map selector
- Address card
- Order timeline
- Status badge
- Pagination
- Empty state
- Loading skeleton
- Confirmation modal

Create consistent:
- Border radius
- Shadows
- Spacing
- Typography
- Button styles
- Form states
- Card styles

==================================================
25. UX PRINCIPLES
==================================================

Prioritize:

1. Simplicity
2. Trust
3. Speed
4. Clarity
5. Emotional experience
6. Mobile usability

A user should understand:
- What can I buy?
- How much does it cost?
- Where can it be delivered?
- When can it arrive?
- How do I send it as a surprise?
- How much will I pay?

without having to search through the interface.

Use progressive disclosure:
Do not show every field at once.

Especially during checkout:
First ask what is necessary,
then recipient,
then location,
then date,
then payment.

==================================================
26. UX FOR NON-TECHNICAL USERS
==================================================

The website will be used by people with different levels of technical knowledge.

Therefore:

- Use simple language
- Avoid technical terminology
- Use clear labels
- Provide examples inside forms
- Use obvious CTAs
- Confirm important actions
- Never make users guess what happens next
- Keep forms short
- Show progress during checkout
- Clearly explain delivery restrictions
- Make map selection understandable
- Make error recovery easy

==================================================
27. MICRO-INTERACTIONS
==================================================

Use subtle animations:

- Add-to-cart animation
- Wishlist heart animation
- Button feedback
- Product image hover
- Page transitions
- Toast notifications
- Order success animation
- Gift/surprise celebration animation

Keep animations fast and subtle.

Respect reduced-motion preferences.

==================================================
28. FOOTER
==================================================

Include:

Brand
About Us
How It Works
Contact
FAQ
Delivery Information
Refund Policy
Privacy Policy
Terms & Conditions

Social icons

Customer support information.

==================================================
29. IMPORTANT BUSINESS LOGIC TO REFLECT IN UI
==================================================

The UI must visually support these business rules:

- Admin controls all available gifts.
- Customers can browse published gifts.
- Customers can add gifts to cart.
- Customers can purchase one or multiple gifts.
- Customers can send gifts to another person.
- Recipient can be in a different city.
- Customer can select delivery date.
- Customer can select exact delivery location using a map.
- Delivery availability may depend on location.
- Products can become unavailable/out of stock.
- Admin manages orders and delivery status.
- Customer can track order status.
- Customer can save addresses and recipients.

Do not design features that are not required, such as:
- Tutor marketplace
- AI recommendation system
- Social media feed
- Complex seller marketplace
- Unnecessary loyalty systems
- Cryptocurrency
- Advanced enterprise features

Keep the product focused.

==================================================
30. FINAL FIGMA OUTPUT
==================================================

Generate a complete high-fidelity UI/UX design, not a wireframe.

Create:
- Desktop screens
- Tablet-responsive layouts
- Mobile screens
- Customer flow
- Admin flow
- Component library
- Design system
- All major states
- Checkout flow
- Map/location flow
- Order tracking flow

Make the prototype flow logically:

Home
→ Browse Gifts
→ Gift Details
→ Add to Cart
→ Checkout
→ Recipient
→ Location
→ Map
→ Delivery Date
→ Message
→ Payment
→ Order Confirmation
→ Track Order

Admin:

Login
→ Dashboard
→ Gifts
→ Add Gift
→ Product Details
→ Orders
→ Order Details
→ Delivery Map
→ Customers
→ Analytics
→ Settings

The final design should look like a real startup product that could be handed directly to a frontend development team.

Prioritize UX quality over adding more features.

The most important unique experience is:

"Choose a gift → choose who receives it → choose exactly where → choose exactly when → send the surprise."

Make this experience extremely clear, emotional, simple, and trustworthy.