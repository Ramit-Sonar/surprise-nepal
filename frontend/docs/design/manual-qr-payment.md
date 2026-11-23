Update the existing frontend payment system to use a **manual static QR payment flow**.

For this initial startup version, **do NOT include or implement eSewa API, Khalti API, Fonepay API, dynamic QR, payment gateway, or automatic payment verification**.

The business will receive payment through the **single QR image uploaded by Admin**, and the customer will submit a payment screenshot for manual verification.

### 1. Admin Settings → Payment

Remove all existing eSewa/Khalti/payment-provider configuration.

Create a clean **Payment Settings** section in Admin Settings.

Include:

* Current Payment QR
* Upload QR Image
* Replace QR
* Remove QR
* QR preview

Display the uploaded QR inside a beautiful, clean, centered frame/card with:

* Proper aspect ratio
* Large readable QR
* Rounded container
* Subtle border/shadow
* "Payment QR" heading
* Helpful instruction such as:
  **"Customers will see this QR during checkout."**

Allow Admin to upload or replace the QR image.

The uploaded QR should become the **single active payment QR** used throughout the customer payment flow.

---

### 2. Customer Payment Page

During checkout, after the order total is calculated, show:

```text
Payment

Total Amount
Rs. 500

Scan this QR to pay

[ LARGE QR IMAGE ]

Please pay exactly Rs. 500

After completing the payment,
upload your payment screenshot below.
```

The QR displayed here must be the **exact QR image currently uploaded by Admin**.

Do not create a different QR for each order.

Make the QR extremely clear and easy to scan on mobile.

---

### 3. Payment Screenshot Upload

Below the QR, create:

**Upload Payment Screenshot**

Allow the customer to:

* Select image
* Preview image
* Remove/change image
* Upload screenshot
* See upload progress/loading state
* See successful upload state
* See invalid file/error state

Accept common image formats such as:

* JPG
* JPEG
* PNG
* WEBP

Clearly show:

**"Please upload a screenshot showing your completed payment."**

---

### 4. Order/Sending Restriction

The customer must NOT be able to complete the purchase/send the surprise until a payment screenshot has been uploaded.

Flow:

```text
Select Surprise
      ↓
Checkout
      ↓
Order Total
      ↓
Show Admin QR
      ↓
Customer pays manually
      ↓
Upload Payment Screenshot
      ↓
Screenshot uploaded successfully
      ↓
Enable "Place Order / Send Surprise"
```

Before screenshot upload:

```text
[ Place Order ]
Disabled
```

After screenshot upload:

```text
[ Place Order ]
Enabled
```

This is only a **frontend submission requirement** for now. Do not implement real payment verification.

---

### 5. Admin Order Tab

Update the Admin **Orders** section.

For every order, show the payment status clearly.

Example:

```text
Order #SB-1024

Customer
Ramit Sonar

Total
Rs. 500

Payment Status
Screenshot Submitted

[ View Payment ]
```

When Admin opens the specific order, create a dedicated **Payment Details** section containing:

* Order total
* Customer payment screenshot
* Screenshot preview
* Uploaded date/time
* Payment status
* Customer information
* Order information

The screenshot displayed here must be the **actual screenshot uploaded by that customer for that specific order**.

---

### 6. Admin Payment Verification UI

Because there is no payment API yet, make payment verification manual.

Inside the order:

```text
Payment Verification

Amount Due
Rs. 500

Customer Payment Screenshot
[ Screenshot ]

[ Mark Payment Verified ]
[ Reject Payment ]
```

Possible statuses:

```text
Payment Pending
Screenshot Submitted
Payment Verified
Payment Rejected
```

If payment is rejected, show the customer an appropriate status/message and allow them to submit a new payment screenshot.

---

### 7. Important UX Rules

Make the entire flow:

* Mobile-first
* Very clear
* Touch-friendly
* Simple for non-technical customers
* Fast and visually clean
* Fully responsive
* Easy to scan
* Impossible to confuse the QR with other content

The QR should be large enough to scan comfortably from another phone.

Do not stretch or crop the QR image.

Preserve the QR's original aspect ratio.

---

### 8. Remove Unnecessary Payment UI

Remove references to:

* eSewa
* Khalti
* Fonepay
* Payment API
* Dynamic QR
* Automatic payment verification
* Payment gateway

The only payment method for this version is:

**Admin-uploaded static QR → Customer pays → Customer uploads screenshot → Admin manually verifies.**

---

### Final Flow

```text
ADMIN
Admin Settings
      ↓
Upload Payment QR
      ↓
QR becomes active
      ↓
CUSTOMER
Checkout
      ↓
See exact Admin QR
      ↓
Pay required amount
      ↓
Upload payment screenshot
      ↓
Place Order / Send Surprise
      ↓
ADMIN
Orders
      ↓
Open specific order
      ↓
View customer's actual payment screenshot
      ↓
Manually verify payment
      ↓
Approve / Reject
```

Keep the existing application's design language and components. Do not redesign unrelated features.

Make this payment flow feel like a polished, production-quality manual payment system even though actual payment API integration is intentionally postponed.
