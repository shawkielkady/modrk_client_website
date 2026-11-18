# Modrek API Documentation for Mobile Development

Comprehensive API reference and documentation for the **Modrek Mobile Ecosystem** (Modrek Client & Modrek Shepherd / Operations).

---

## 1. General & Architecture Overview

### 1.1 Base URLs

| Environment            | Base URL                                    | Notes                       |
| :--------------------- | :------------------------------------------ | :-------------------------- |
| **Production Host**    | `https://modrk.modrk-app.com`               | Primary API domain          |
| **Client App API**     | `https://modrk.modrk-app.com/api/{locale}`  | e.g. `/api/ar` or `/api/en` |
| **Shepherd / Ops API** | `https://modrk.modrk-app.com/api/{locale}/` | Same backend service        |

> **Localization in URL & Query**:  
> The API supports dynamic localization. URLs are prefixed with the current language code (`/ar` or `/en`), and requests should also include `?lang=ar` (or `?lang=en`) query parameter.

---

### 1.2 Common Request Headers

All requests should supply the following headers:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <TOKEN>   # (Required for authenticated customer/staff routes)
```

> **Note for Multipart/File Uploads**: When uploading photos or media (e.g. avatar, sheep images), omit `Content-Type: application/json` so the client boundary is generated automatically (`multipart/form-data`).

---

### 1.3 Standard Response Formats

#### Standard Base Response Envelope (`BaseResponse<T>`)

Every JSON response from the API is wrapped in a consistent top-level payload:

```json
{
  "message": "Operation successful description",
  "errors": null,
  "data": { ... } // or [ ... ] or null
}
```

- `message` (_string_, nullable): Human-readable status or error message.
- `errors` (_dynamic_, nullable): Validation error map or array if validation failed (HTTP 422).
- `data` (_T_, nullable): The requested data payload.

#### Standard Paginated Response Envelope (`PaginationModel<T>`)

For paginated list endpoints, the `data` field contains:

```json
{
  "message": "Success",
  "errors": null,
  "data": {
    "items": [
      { "id": 1, ... }
    ],
    "current_page": 1,
    "last_page": 5,
    "has_more_pages": true
  }
}
```

---

### 1.4 HTTP Status Codes

| Code    | Status                 | Meaning                                                     |
| :------ | :--------------------- | :---------------------------------------------------------- |
| **200** | `OK`                   | Request succeeded.                                          |
| **201** | `Created`              | Entity created successfully.                                |
| **400** | `Bad Request`          | Malformed parameters or business logic precondition failed. |
| **401** | `Unauthorized`         | Token missing, invalid, or expired. Requires re-login.      |
| **403** | `Forbidden`            | User does not have permission for the requested action.     |
| **404** | `Not Found`            | Requested entity does not exist.                            |
| **422** | `Unprocessable Entity` | Validation errors on request body fields.                   |
| **500** | `Server Error`         | Internal backend server error.                              |

---

## 2. Customer Authentication & Profile API

Base path prefix: `/auth`

---

### 2.1 Customer Login

- **Endpoint**: `POST /auth/customer/login`
- **Auth Required**: No
- **Description**: Authenticate customer using phone number and password.

#### Request Body:

```json
{
  "dial_code": "+966",
  "phone": "501234567",
  "password": "Password123"
}
```

#### Response (`200 OK`):

```json
{
  "message": "Login successful",
  "errors": null,
  "data": {
    "user": {
      "id": 12,
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "image": "https://modrk.modrk-app.com/storage/users/user12.jpg",
      "device_id": null,
      "is_verified": true
    },
    "token": "123|laravel_sanctum_token_string"
  }
}
```

---

### 2.2 Customer Register

- **Endpoint**: `POST /auth/customer/register`
- **Auth Required**: No
- **Description**: Create a new customer account.

#### Request Body:

```json
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "dial_code": "+966",
  "phone": "501234567",
  "password": "Password123",
  "password_confirmation": "Password123"
}
```

#### Response (`200 OK`):

```json
{
  "message": "Registered successfully. Please verify your phone number.",
  "errors": null,
  "data": {
    "user": {
      "id": 13,
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "is_verified": false
    },
    "token": "124|token"
  }
}
```

---

### 2.3 Verify Phone OTP

- **Endpoint**: `POST /auth/customer/verify`
- **Auth Required**: Optional / Recommended
- **Description**: Verifies phone number with OTP code received via SMS.

#### Request Body:

```json
{
  "dial_code": "+966",
  "phone": "501234567",
  "otp_code": "1234"
}
```

#### Response (`200 OK`):

Returns `AuthResponseData` with updated `is_verified: true` and active token.

---

### 2.4 Resend OTP Code

- **Endpoint**: `POST /auth/customer/resend-code`
- **Auth Required**: No

#### Request Body:

```json
{
  "dial_code": "+966",
  "phone": "501234567"
}
```

---

### 2.5 Forgot Password (Request Reset OTP)

- **Endpoint**: `POST /auth/customer/forget-password`
- **Auth Required**: No

#### Request Body:

```json
{
  "dial_code": "+966",
  "phone": "501234567"
}
```

---

### 2.6 Reset Password

- **Endpoint**: `POST /auth/customer/reset-password`
- **Auth Required**: Yes (using temporary token from verify step)

#### Request Body:

```json
{
  "new_password": "NewSecretPassword123",
  "new_password_confirmation": "NewSecretPassword123"
}
```

---

### 2.7 Change Password (In-App)

- **Endpoint**: `POST /auth/customer/change-password`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "old_password": "OldPassword123",
  "new_password": "NewPassword456",
  "new_password_confirmation": "NewPassword456"
}
```

---

### 2.8 Get Current Authenticated Profile

- **Endpoint**: `GET /auth/customer/me`
- **Auth Required**: Yes (`Bearer <token>`)

#### Response (`200 OK`):

```json
{
  "message": "User profile fetched",
  "errors": null,
  "data": {
    "user": {
      "id": 12,
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "image": "https://modrk.modrk-app.com/storage/avatar.jpg",
      "is_verified": true
    },
    "token": null
  }
}
```

---

### 2.9 Edit Profile

- **Endpoint**: `POST /auth/customer/edit-profile`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "name": "Ahmed M. Al-Mutawa",
  "email": "ahmed.new@example.com"
}
```

---

### 2.10 Update Push Notification Device Token (FCM)

- **Endpoint**: `POST /auth/device-token`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "device_id": "fcm_device_token_string_here"
}
```

---

### 2.11 Logout

- **Endpoint**: `POST /auth/customer/logout`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Revokes the current access token.

---

## 3. General & Master Data API

Endpoints for dropdown lists, filters, master records, and app configurations.

| Endpoint                          | Method | Auth | Response Type                | Description                                                                          |
| :-------------------------------- | :----: | :--: | :--------------------------- | :----------------------------------------------------------------------------------- |
| `/general/get-farm_types`         | `GET`  |  No  | `List<FarmTypeModel>`        | Livestock breeds (e.g., Nuaimi, Harri, Najdi, Sawakni)                               |
| `/general/get-farm-weights`       | `GET`  |  No  | `List<FarmWeightModel>`      | Weight brackets (e.g., Small 20-25kg, Medium 26-30kg)                                |
| `/general/get-delivery-methods`   | `GET`  |  No  | `List<DeliveryMethodModel>`  | Delivery types (e.g. Refrigerated Van, Farm Pickup)                                  |
| `/general/get-delivery-times`     | `GET`  |  No  | `List<DeliveryTimeModel>`    | Delivery time slots (e.g., 08:00 AM - 12:00 PM)                                      |
| `/general/get-cutting-types`      | `GET`  |  No  | `List<CuttingTypeModel>`     | Meat cutting styles (Quarters, Halves, Small pieces, Whole)                          |
| `/general/get-preparation-types`  | `GET`  |  No  | `List<PreparationTypeModel>` | Packaging/preparation (Vacuum sealed, Trays, Bags)                                   |
| `/general/get-payment-methods`    | `GET`  |  No  | `List<PaymentMethodModel>`   | Payment types (Mada, Visa, Apple Pay, Cash on delivery, Tamara)                      |
| `/general/get-order-status-types` | `GET`  |  No  | `List<OrderStatusTypeModel>` | Stages: Pending, Slaughtering, Cutting, Quality Checked, Out for Delivery, Delivered |
| `/general/get-countries`          | `GET`  |  No  | `List<CountryModel>`         | Supported countries                                                                  |
| `/general/get-regions`            | `GET`  |  No  | `List<RegionModel>`          | Regions of country (`?country_id={id}`)                                              |
| `/general/get-cities`             | `GET`  |  No  | `List<CityModel>`            | Cities of region (`?region_id={id}`)                                                 |
| `/general/get-settings`           | `GET`  |  No  | `SettingModel`               | Contact numbers, working hours, auto-cancel timers                                   |

#### Query Parameters:

- `GET /general/get-regions?country_id=1`
- `GET /general/get-cities?region_id=2`

#### App Settings Model (`SettingModel`):

```json
{
  "shepherd_working_hours_start": "06:00",
  "shepherd_working_hours_end": "22:00",
  "call_not_picked_after_seconds": 30,
  "call_heartbeat_timeout_seconds": 15,
  "cart_auto_delete_after_minutes": 15,
  "home_bar": "Welcome to Modrek",
  "terms_and_conditions": "...",
  "about_us": "...",
  "phone": "+966XXXXXXXXX",
  "whatsapp": "+966XXXXXXXXX",
  "email": "support@modrk-app.com"
}
```

---

## 4. Farms & Livestock API

---

### 4.1 List Farms

- **Endpoint**: `GET /farms`
- **Auth Required**: No

#### Query Parameters:

| Parameter        | Type  | Required | Description                    |
| :--------------- | :---: | :------: | :----------------------------- |
| `page`           | `int` |    No    | Page number (default: 1)       |
| `farm_type_id`   | `int` |    No    | Filter by sheep breed / type   |
| `farm_weight_id` | `int` |    No    | Filter by sheep weight bracket |

#### Response (`200 OK`):

```json
{
  "message": "Farms retrieved successfully",
  "errors": null,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Al-Rehab Farm",
        "image": "https://modrk.modrk-app.com/storage/farms/1.jpg",
        "video": "https://modrk.modrk-app.com/storage/farms/1.mp4",
        "commercial_number": "1010123456",
        "average_price": 1250,
        "rating": 4.8,
        "has_tamara": true,
        "farm_type": "Harri",
        "farm_weight_from": 25,
        "farm_weight_to": 30,
        "has_active_sheeps": true,
        "shepherd": {
          "id": 5,
          "name": "Salem Al-Shepherd"
        }
      }
    ],
    "current_page": 1,
    "last_page": 3,
    "has_more_pages": true
  }
}
```

---

### 4.2 Get Farm Details & Sheep Inventory

- **Endpoint**: `GET /farms/{id}`
- **Auth Required**: No
- **Path Parameter**: `id` (_int_) - Farm ID
- **Query Parameter**: `farm_type_id` (_int_, optional)

#### Response (`200 OK`):

Returns `FarmModel` including:

- Available livestock (`sheeps`: list of `SheepModel` with ID, tag code, price, collar color, weight, images)
- Live streams / CCTV URLs (`live_urls`)
- Next/previous farm IDs for swiping (`next_farm_id`, `previous_farm_id`)
- Reserved live call info if active (`reserved_call_id`, `reserved_call_schedule_time`)

---

### 4.3 Get Farm Ratings & Reviews

- **Endpoint**: `GET /farms/{id}/ratings`
- **Auth Required**: No
- **Path Parameter**: `id` (_int_) - Farm ID
- **Query Parameters**: `page` (_int_, optional)

#### Response (`200 OK`):

Paginated list of `RateModel`:

```json
{
  "items": [
    {
      "id": 10,
      "order_id": 42,
      "customer": {
        "name": "Fahad"
      },
      "farm_rating": 5,
      "service_rating": 4,
      "farm_review": "Excellent sheep quality, clean and fast.",
      "service_review": "Delivery arrived on time.",
      "created_at": "2026-10-15T14:30:00.000Z"
    }
  ]
}
```

---

## 5. Cart, Checkout & Calculations API

Base path prefix: `/customer`

---

### 5.1 Get Current Active Cart

- **Endpoint**: `GET /customer/get-cart`
- **Auth Required**: Yes (`Bearer <token>`)

#### Response (`200 OK`):

```json
{
  "message": "Cart retrieved",
  "errors": null,
  "data": {
    "id": 104,
    "num_of_sheep": 1,
    "sub_total": 1400.0,
    "delivery_cost": 50.0,
    "coupon_value": 0.0,
    "total": 1450.0,
    "sale_type": "individual",
    "cart_items": [
      {
        "id": 15,
        "sheep": {
          "id": 88,
          "name": "Harri Premium",
          "code": "MOD-8821",
          "price": 1400.0,
          "collar_color": "Blue"
        },
        "price": 1400.0,
        "num_of_quarters": 4,
        "cutting_type_id": 1,
        "preparation_type_id": 2,
        "want_head_feet": true,
        "want_stomach_intestines": false,
        "notes": "Small pieces please"
      }
    ],
    "farm": {
      "id": 1,
      "name": "Al-Rehab Farm"
    }
  }
}
```

---

### 5.2 Add to Cart

- **Endpoint**: `POST /customer/add-to-cart`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "farm_id": 1,
  "num_of_sheeps": 1,
  "sale_type": "individual" // "individual" or "wholesale"
}
```

---

### 5.3 Apply Discount Coupon

- **Endpoint**: `POST /customer/add-coupon-to-cart`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "coupon_code": "RAMADAN2026"
}
```

---

### 5.4 Remove Discount Coupon

- **Endpoint**: `POST /customer/delete-coupon-from-cart`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**: Empty `{}`

---

### 5.5 Clear / Delete Cart

- **Endpoint**: `POST /customer/delete-cart`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**: Empty `{}`

---

### 5.6 Dynamic Cart Calculations

- **Endpoint**: `POST /customer/get-cart-calculations`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Recalculates shipping, cutting extras, fees, and grand total before checkout.

#### Request Body:

```json
{
  "payment_method_id": 1,
  "delivery_method_id": 2,
  "sheeps": [
    {
      "sheep_id": 88,
      "cutting_type_id": 2,
      "preparation_type_id": 1,
      "want_head_feet": true,
      "want_stomach_intestines": false
    }
  ]
}
```

#### Response (`200 OK`):

Returns `CartCalculationsModel`:

```json
{
  "cart_id": 104,
  "num_of_sheep": 1,
  "sub_total": 1400.0,
  "delivery_cost": 50.0,
  "delivery_base_cost": 50.0,
  "delivery_items_additional_fees": 0.0,
  "head_feet_cost": 20.0,
  "stomach_intestines_cost": 0.0,
  "shepherd_discount_percent": 0.0,
  "shepherd_discount_value": 0.0,
  "coupon_id": null,
  "coupon_value": 0.0,
  "free_shipping": false,
  "cod": 0.0,
  "total": 1470.0
}
```

---

### 5.7 Submit Cart & Place Order (Checkout)

- **Endpoint**: `POST /customer/submit-cart`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "address_id": 5,
  "payment_method_id": 2,
  "delivery_method_id": 1,
  "delivery_date": "2026-11-10",
  "delivery_time_id": 3,
  "notes": "Ring the bell upon arrival",
  "sheeps": [
    {
      "sheep_id": 88,
      "num_of_quarters": 4,
      "cutting_type_id": 1,
      "preparation_type_id": 2,
      "want_head_feet": true,
      "want_stomach_intestines": false,
      "notes": "Pack into two bags"
    }
  ]
}
```

#### Response (`200 OK`):

```json
{
  "message": "Order placed successfully",
  "errors": null,
  "data": {
    "order_id": 589,
    "payment_url": "https://secure.paymentgateway.com/pay/xyz123",
    "is_paid": false
  }
}
```

---

## 6. Orders & Online Payments API

---

### 6.1 Get Customer Orders (Paginated)

- **Endpoint**: `GET /customer/get-orders`
- **Auth Required**: Yes (`Bearer <token>`)

#### Query Parameters:

- `page` (_int_, optional): Page number

#### Response (`200 OK`):

Paginated list of `OrderModel`.

---

### 6.2 Get Single Order Details & Tracking

- **Endpoint**: `GET /customer/get-order`
- **Auth Required**: Yes (`Bearer <token>`)

#### Query Parameters:

- `order_id` (_int_, required)

#### Response (`200 OK`):

Full `OrderModel` with:

- Current `status` (ID, name, slug, live CCTV/video URL if active)
- Status timeline history (`statuses_history`)
- Assigned livestock details, invoice PDF link (`invoice`), addresses, breakdown costs.

---

### 6.3 Start / Retry Order Payment

- **Endpoint**: `POST /customer/start-payment`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Generates online payment webview URL for unpaid orders.

#### Request Body:

```json
{
  "order_id": 589
}
```

#### Response (`200 OK`):

```json
{
  "data": {
    "order_id": 589,
    "payment_url": "https://secure.paymentgateway.com/pay/xyz123",
    "is_paid": false
  }
}
```

---

### 6.4 Rate Completed Order

- **Endpoint**: `POST /customer/rate-order`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:

```json
{
  "order_id": 589,
  "farm_rating": 5,
  "service_rating": 5,
  "farm_review": "Clean sacrifice and great service.",
  "service_review": "Delivered on schedule."
}
```

---

## 7. Customer Addresses API

Base path prefix: `/customer`

| Endpoint                        | Method | Description                                    |
| :------------------------------ | :----: | :--------------------------------------------- |
| `/customer/get-addresses`       | `GET`  | Paginated list of saved addresses for customer |
| `/customer/get-default-address` | `GET`  | Get user's primary/default address             |
| `/customer/add-address`         | `POST` | Create a new delivery address                  |
| `/customer/edit-address`        | `POST` | Update an existing delivery address            |

#### Add / Edit Address Request Body:

```json
{
  "address_id": 12, // Required for edit-address, omit for add-address
  "country_id": 1,
  "region_id": 2,
  "city_id": 5,
  "phone": "+966501234567",
  "is_default": true,
  "address_type": "Home", // "Home", "Work", "Other"
  "building_name": "Al-Nakheel Tower",
  "floor_number": "4",
  "apartment_number": "14",
  "special_mark": "Opposite Kingdom Hospital",
  "details": "Al-Yasmin District, Anas Ibn Malik Rd",
  "lat": "24.7136",
  "lng": "46.6753"
}
```

---

## 8. Live Video Call & Real-Time Selection API

Modrek allows customers to video call the shepherd in real-time to pick live sheep.

Base path prefix: `/calls`

---

### 8.1 Call Life Cycle & Endpoints

```
[Customer] ---> POST /calls/start-call (initiates call session)
                     |
                     v
             Shepherd receives push/socket notification
                     |
        +------------+------------+
        |                         |
(Accepts)                   (Declines / Timeout)
        |                         |
POST /calls/accept-call      POST /calls/not-picked-call OR /calls/decline-call
        |
Video room established (zego_room_id)
        |
Periodically: POST /calls/heartbeat (keep alive every ~15s)
        |
POST /calls/end-call (hang up)
```

#### 8.1.1 Start Call

- **Endpoint**: `POST /calls/start-call`
- **Auth Required**: Yes (`Bearer <token>`)

```json
{
  "farm_id": 1,
  "num_of_sheeps": 1
}
```

**Response**: Returns `CallModel` containing `id`, `farm_id`, `zego_room_id`, and initial status.

#### 8.1.2 Accept Call

- **Endpoint**: `POST /calls/accept-call`

```json
{
  "call_id": 45
}
```

#### 8.1.3 Mark Call Not Picked (Timeout)

- **Endpoint**: `POST /calls/not-picked-call`

```json
{
  "call_id": 45
}
```

#### 8.1.4 Decline Call

- **Endpoint**: `POST /calls/decline-call`

```json
{
  "call_id": 45,
  "cancel_reason": "Shepherd busy"
}
```

#### 8.1.5 End Call

- **Endpoint**: `POST /calls/end-call`

```json
{
  "call_id": 45
}
```

#### 8.1.6 Call Heartbeat

- **Endpoint**: `POST /calls/heartbeat`
- **Description**: Sent every 10–15 seconds to keep the live call connection active on backend.

```json
{
  "call_id": 45
}
```

---

### 8.2 Call Reservations & Scheduling

For busy farms or off-hours, customers can reserve a turn or schedule a future call.

#### 8.2.1 Instant Turn Reservation (Queue)

- **Endpoint**: `POST /calls/reserve-call`
- **Request Body**:

```json
{
  "farm_id": 1,
  "num_of_sheeps": 1
}
```

#### 8.2.2 Scheduled Call

- **Endpoint**: `POST /calls/schedule_call`
- **Request Body**:

```json
{
  "farm_id": 1,
  "schedule_time": "2026-11-10 16:30:00",
  "num_of_sheeps": 2
}
```

#### 8.2.3 Cancel Reservation

- **Endpoint**: `POST /calls/cancel-reserved-call`
- **Query Parameter**: `?call_id={id}`

---

## 9. Operations & Shepherd Mobile App API (Summary)

For the internal staff mobile app (`modrek_shepherd`), the API exposes dedicated role-based endpoints:

### 9.1 Staff Authentication

- **Shepherd Login**: `POST /auth/shepherds/login`
- **Production Operator Login**: `POST /auth/production_operators/login`
- **Quality Auditor Login**: `POST /auth/quality_auditors/login`

### 9.2 Shepherd Operations (`/shepherd`)

- `GET /shepherd/get-traders`: Fetch list of traders.
- `GET /shepherd/get-sheeps`: List sheep assigned to shepherd's farm.
- `GET /shepherd/get-sheep-lists`: Grouped inventory batches.
- `POST /shepherd/change-sheeps-status`: Change status of sheep (e.g. sold, available, dead).
- `POST /shepherd/add-images-to-sheep`: Upload photos for individual sheep (`multipart/form-data`).
- `POST /shepherd/delete-images-from-sheep`: Delete specific sheep images.
- `POST /shepherd/sell-sheep-externally`: Mark sheep sold directly at farm.
- `POST /shepherd/execute-sheep`: Mark sheep as slaughtered.
- `POST /shepherd/delete-sheep-list`: Delete sheep batch.
- `GET /shepherd/get-orders`: View shepherd's incoming orders.
- `POST /shepherd/change-order-status`: Update order workflow stage.

### 9.3 Production Line Operations (`/production_operator`)

- `GET /production_operator/get-orders`: Fetch orders ready for slaughter and packing.
- `POST /production_operator/change-order-status`: Update progress.
- `POST /production_operator/execute-sheep`: Record slaughter completion with proof photos (`multipart/form-data`).
- `POST /production_operator/add-sheep-images-in-order`: Upload slaughtering/packing inspection photos.
- `POST /production_operator/delete-sheep-images-in-order`: Remove inspection photos.
- `POST /production_operator/add-notes-to-order`: Append butcher notes to order.

### 9.4 Quality Auditor Operations (`/quality_auditor`)

- `GET /quality_auditor/get-orders`: Orders awaiting final quality sign-off.
- `GET /quality_auditor/get-emergencies-orders`: Flagged orders requiring urgent replacement.
- `POST /quality_auditor/review-add-sheeps`: Review batch additions.
- `POST /quality_auditor/submit-add-sheeps`: Approve sheep inventory.
- `POST /quality_auditor/add-sheep-images-in-order`: Add audit photos.
- `POST /quality_auditor/replace-executed-sheep-in-order`: Replace non-compliant carcass with another sheep in order.

### 9.5 Call Queue Operations (`/calls`)

- `GET /calls/get-reserved-calls`: View waiting customers in queue.
- `GET /calls/get-non-picked-calls`: View missed/unanswered customer calls.
- `GET /calls/get-canceled-carts`: View calls where customer abandoned cart.
- `GET /calls/get-reservations`: View scheduled appointments.

---

## 10. Core Data Models Reference

### `UserModel`

```json
{
  "id": 1,
  "name": "Full Name",
  "email": "user@example.com",
  "phone": "+966500000000",
  "image": "https://.../photo.jpg",
  "device_id": "fcm_token_or_uuid",
  "is_verified": true
}
```

### `SheepModel`

```json
{
  "id": 88,
  "name": "Harri Sheep",
  "farm": { "id": 1, "name": "Al-Rehab Farm" },
  "code": "MDRK-1044",
  "slug": "harri-sheep-88",
  "status": "available",
  "price": 1450.0,
  "type": "Harri",
  "images": [{ "id": 1, "url": "https://.../img1.jpg" }],
  "weight_from": 25.0,
  "weight_to": 30.0,
  "age_in_months": 7,
  "collar_color": "Green",
  "seal_color": "Blue",
  "num_of_purchased_quarters": 4,
  "reason_to_execute": null
}
```

### `StatusModel`

```json
{
  "id": 3,
  "name": "Under Slaughtering",
  "slug": "under_slaughtering",
  "image": "https://.../status_icon.png",
  "live_url": "https://.../slaughterhouse_live_cam.m3u8",
  "started_at": "2026-11-08T10:00:00Z",
  "ended_at": null,
  "created_at": "2026-11-08T10:00:00Z"
}
```

---

## 11. Mobile Integration Checklist for Developers

- [ ] **Axios BaseOptions**: Set base timeout to at least 60 seconds (for image uploads and payment initiation).
- [ ] **Authorization Interceptor**: Automatically attach `Authorization: Bearer <token>` on all private routes, and clear token on 401 response.
- [ ] **Localization**: Append `?lang=ar` or `?lang=en` and pass `Accept-Language` header to receive localized messages and status titles.
- [ ] **Heartbeat Timer**: During live video call (`CallStatusType.inCall`), run a recurring 15-second timer firing `POST /calls/heartbeat` to avoid call drops.
- [ ] **Device Token**: After successful login or registration, register FCM token using `POST /auth/device-token`.
