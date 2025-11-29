# Bookverse System Flow Documentation

This document outlines the complete flow from Frontend (FE) to Backend (BE) to Database (DB) for key features in the Bookverse application.

---

## Table of Contents

1. [Authentication Flows](#authentication-flows)
   - [Sign Up](#1-sign-up)
   - [Sign In](#2-sign-in)
   - [Forgot Password](#3-forgot-password)
2. [Cart Flow](#cart-flow)
3. [Order Flow](#order-flow)
4. [Payment Flow](#payment-flow)

---

## Authentication Flows

### 1. Sign Up

#### Frontend → Backend

**API Endpoint:** `POST /api/users/signup`

**Frontend Code:** `front-end/src/api/endpoints/auth.api.ts`

```typescript
signUp: async (data: SignUpRequest): Promise<UserResponse>
```

**Request Body (SignUpRequest):**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "name": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)"
}
```

**Backend Controller:** `UserController.signupUser()`
- **Path:** `com/swp391/bookverse/controller/UserController.java`
- **Method:** `POST /api/users/signup`
- **Service:** `UserService.signupUser(request)`

#### Backend → Database

**Tables Involved:**
- `users` - Create new user record

**Database Operations:**
1. **Validate** username and email uniqueness
2. **Hash** password using BCrypt
3. **Create** new user record with:
   - Auto-generated UUID as `id`
   - Username, hashed password, email
   - Default role: `CUSTOMER`
   - `active` = `true`
   - Creation timestamp
4. **Return** UserResponse with user details (excluding password)

**Response (UserResponse):**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "name": "string",
  "phone": "string",
  "address": "string",
  "imageUrl": "string",
  "role": "CUSTOMER",
  "active": true,
  "createdAt": "timestamp"
}
```

---

### 2. Sign In

#### Frontend → Backend

**API Endpoint:** `POST /api/auth/token`

**Frontend Code:** `front-end/src/api/endpoints/auth.api.ts`

```typescript
signIn: async (data: SignInRequest): Promise<AuthenticationResponse>
```

**Request Body (SignInRequest):**
```json
{
  "username": "string",
  "password": "string"
}
```

**Backend Controller:** `AuthenticationController.authenticate()`
- **Path:** `com/swp391/bookverse/controller/AuthenticationController.java`
- **Method:** `POST /api/auth/token`
- **Service:** `AuthenticationService.authenticate(request)`

#### Backend → Database

**Tables Involved:**
- `users` - Validate credentials

**Database Operations:**
1. **Query** user by username from `users` table
2. **Verify** password using BCrypt comparison
3. **Check** if user is active (`active = true`)
4. **Generate** JWT token with:
   - User ID
   - Username
   - Role (CUSTOMER/STAFF/ADMIN)
   - Expiration time
5. **Return** authentication response with token

**Response (AuthenticationResponse):**
```json
{
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### After Sign In

**Get User Info:** `GET /api/users/myInfo`

**Frontend Code:**
```typescript
getMyInfo: async (): Promise<UserResponse>
```

**Backend:** 
- Extract user ID from JWT token
- Query user details from database
- Return UserResponse

---

### 3. Forgot Password

The forgot password flow involves multiple steps with OTP verification.

#### Step 1: Get User ID by Email

**API Endpoint:** `GET /api/users/id-by-email/{email}`

**Frontend Code:**
```typescript
getUserIdByEmail: async (email: string): Promise<string>
```

**Backend:** `UserController.getUserIdByEmail()`
- Query `users` table for user with matching email
- Return user ID if found

**Response:**
```json
{
  "result": "user-uuid"
}
```

#### Step 2: Send OTP for Password Reset

**API Endpoint:** `POST /api/otp/send-by-email-reset-password`

**Frontend Code:**
```typescript
sendOTPResetPassword: async (data: SendOTPRequest): Promise<void>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "userId": "user-uuid",
  "tokenType": "RESET_PASSWORD"
}
```

**Backend Controller:** `OtpController.sendByEmailResetPassword()`
- **Path:** `com/swp391/bookverse/controller/auth/otp/OtpController.java`
- **Service:** `OtpService.sendOtpByEmailResetPassword(request)`

**Database Operations:**
1. **Generate** random 6-digit OTP code
2. **Create** record in `otp_tokens` table:
   ```
   - user_id: UUID
   - email: string
   - code: string (6 digits)
   - token_type: "RESET_PASSWORD"
   - expires_at: current_time + 5 minutes
   - verified: false
   ```
3. **Send** OTP email to user
4. **Return** success response

#### Step 3: Verify OTP and Reset Password

**API Endpoint:** `POST /api/otp/verify-reset-password`

**Frontend Code:**
```typescript
verifyAndResetPassword: async (data: {
  userId: string;
  email: string;
  code: string;
  tokenType: string;
  newPassword: string;
}): Promise<void>
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "code": "123456",
  "tokenType": "RESET_PASSWORD",
  "newPassword": "newPassword123"
}
```

**Backend Controller:** `OtpController.verifyResetPassword()`
- **Service:** `OtpService.verifyResetPassword(request)`

**Database Operations:**
1. **Query** `otp_tokens` table for matching:
   - user_id
   - email
   - code
   - token_type = "RESET_PASSWORD"
   - expires_at > current_time
   - verified = false
2. **Validate** OTP code
3. If valid:
   - **Hash** new password using BCrypt
   - **Update** `users` table: set new password hash
   - **Update** `otp_tokens` table: set verified = true
   - **Return** success response
4. If invalid:
   - **Return** error response

---

## Cart Flow

### Get My Cart

**API Endpoint:** `GET /api/carts/myCart`

**Frontend Code:** `front-end/src/api/endpoints/cart.api.ts`

```typescript
getMyCart: async (): Promise<CartResponse>
```

**Backend Controller:** `CartController.getMyCart()`
- **Path:** `com/swp391/bookverse/controller/CartController.java`
- **Method:** `GET /api/carts/myCart`
- **Authorization:** `CUSTOMER` role required
- **Service:** `CartService.getMyCart()`

**Database Operations:**
1. **Extract** user ID from JWT token
2. **Query** `carts` table for user's cart
3. **Join** with `cart_items` table
4. **Join** with `books` table for each cart item
5. **Calculate** totals:
   - Subtotal per item = book price × quantity
   - Total cart value = sum of all item subtotals

**Response (CartResponse):**
```json
{
  "id": 1,
  "userId": "user-uuid",
  "items": [
    {
      "id": 1,
      "bookId": 10,
      "bookTitle": "Book Title",
      "bookPrice": 150000,
      "bookImageUrl": "/images/books/...",
      "quantity": 2,
      "subtotal": 300000
    }
  ],
  "totalItems": 2,
  "totalPrice": 300000,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### Add Item to Cart

**API Endpoint:** `POST /api/carts/myCart/add-1-to-cart`

**Frontend Code:**
```typescript
addOneToCart: async (data: AddToCartRequest): Promise<CartResponse>
```

**Request Body:**
```json
{
  "bookId": 10
}
```

**Backend Controller:** `CartController.addToCart()`
- **Service:** `CartService.addOneToCart(request)`

**Database Operations:**
1. **Extract** user ID from JWT token
2. **Query** or **Create** cart for user in `carts` table
3. **Check** if book exists in `cart_items`:
   - If exists: **Increment** quantity by 1
   - If not exists: **Insert** new cart item with quantity = 1
4. **Validate** stock availability from `books` table
5. **Update** cart updated_at timestamp
6. **Return** updated cart with all items

---

### Add Multiple Items to Cart

**API Endpoint:** `POST /api/carts/myCart/add-multiple-to-cart`

**Frontend Code:**
```typescript
addMultipleToCart: async (data: AddMultipleToCartRequest): Promise<CartResponse>
```

**Request Body:**
```json
{
  "bookId": 10,
  "quantity": 5
}
```

**Backend:** Similar to add-1-to-cart but adds specified quantity instead of 1

---

### Remove Item from Cart

**API Endpoint:** `POST /api/carts/myCart/remove-1-from-cart`

**Frontend Code:**
```typescript
removeOneFromCart: async (data: AddToCartRequest): Promise<CartResponse>
```

**Database Operations:**
1. **Find** cart item in `cart_items`
2. **Decrement** quantity by 1
3. If quantity becomes 0: **Delete** cart item
4. **Return** updated cart

---

### Clear Item from Cart

**API Endpoint:** `POST /api/carts/myCart/clear-an-item`

**Frontend Code:**
```typescript
clearAnItem: async (data: AddToCartRequest): Promise<CartResponse>
```

**Database Operations:**
1. **Delete** cart item completely from `cart_items` table
2. **Return** updated cart

---

### Update Item Quantity

**API Endpoint:** `PUT /api/carts/myCart/update-item-quantity`

**Frontend Code:**
```typescript
updateItemQuantity: async (data: CartItemUpdateRequest): Promise<CartResponse>
```

**Request Body:**
```json
{
  "bookId": 10,
  "quantity": 3
}
```

**Database Operations:**
1. **Update** quantity in `cart_items` table
2. If quantity is 0: **Delete** cart item
3. **Validate** stock availability
4. **Return** updated cart

---

## Order Flow

### Create Order

**API Endpoint:** `POST /api/orders/create`

**Frontend Code:** `front-end/src/api/endpoints/order.api.ts`

```typescript
createOrder: async (data: CreateOrderRequest): Promise<OrderResponse>
```

**Request Body (CreateOrderRequest):**
```json
{
  "address": "123 Street, City",
  "phone": "0123456789",
  "paymentMethod": "COD" | "VNPAY",
  "note": "Optional delivery note",
  "promotionId": 1 (optional)
}
```

**Backend Controller:** `OrderController.createOrder()`
- **Path:** `com/swp391/bookverse/controller/OrderController.java`
- **Method:** `POST /api/orders/create`
- **Authorization:** `CUSTOMER` role required
- **Service:** `OrderService.createOrder(request)`

**Database Operations:**

1. **Get** user's cart from `carts` and `cart_items` tables
2. **Validate** cart is not empty
3. **Check** stock availability for all items in `books` table
4. **Create** order in `orders` table:
   ```sql
   INSERT INTO orders (user_id, address, phone, payment_method, note, 
                       status, total_price, created_at)
   ```
   - Initial status: `PENDING`
   - Calculate total price from cart items
   
5. **Create** order items in `order_items` table:
   ```sql
   INSERT INTO order_items (order_id, book_id, quantity, price, subtotal)
   ```
   - For each cart item, create corresponding order item
   - Store current book price (price at time of order)
   
6. **Update** book stock in `books` table:
   ```sql
   UPDATE books SET quantity_in_stock = quantity_in_stock - ordered_quantity
   ```
   
7. **Apply promotion** if promotionId provided:
   - Validate promotion from `promotions` table
   - Calculate discount
   - Update order total_price
   
8. **Clear** user's cart:
   - Delete all items from `cart_items`
   
9. **Create** payment record in `payments` table:
   - payment_method: COD or VNPAY
   - payment_status: PENDING
   - amount: order total_price

**Response (OrderResponse):**
```json
{
  "id": 123,
  "userId": "user-uuid",
  "address": "123 Street, City",
  "phone": "0123456789",
  "paymentMethod": "COD",
  "status": "PENDING",
  "totalPrice": 450000,
  "note": "Delivery note",
  "items": [
    {
      "id": 1,
      "bookId": 10,
      "bookTitle": "Book Title",
      "quantity": 2,
      "price": 150000,
      "subtotal": 300000
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### Get My Orders

**API Endpoint:** `GET /api/orders/myOrders`

**Frontend Code:**
```typescript
getMyOrders: async (): Promise<OrderResponse[]>
```

**Backend:** `OrderController.getMyOrders()`

**Database Operations:**
1. **Query** `orders` table WHERE user_id = current_user
2. **Join** with `order_items` table
3. **Join** with `books` table to get book details
4. **Order by** created_at DESC (newest first)
5. **Return** array of OrderResponse

---

### Get Order by ID

**API Endpoint:** `GET /api/orders/{id}`

**Frontend Code:**
```typescript
getOrderById: async (id: number): Promise<OrderResponse>
```

**Database Operations:**
1. **Query** specific order from `orders` table
2. **Join** with `order_items` and `books`
3. **Return** detailed order information

---

### Update Order Status (Admin/Staff)

**API Endpoint:** `PUT /api/orders/update/{id}`

**Frontend Code:**
```typescript
updateOrder: async (id: number, data: UpdateOrderRequest): Promise<OrderResponse>
```

**Request Body:**
```json
{
  "status": "CONFIRMED" | "PROCESSING" | "DELIVERING" | "DELIVERED" | "CANCELLED"
}
```

**Backend:** `OrderController.updateOrder()`
- **Authorization:** `ADMIN` or `STAFF` role required

**Database Operations:**
1. **Query** order from `orders` table
2. **Validate** status transition is allowed
3. **Update** order status and updated_at timestamp
4. **If status = DELIVERED:**
   - Update payment status to SUCCESS (for COD)
5. **Return** updated order

**Order Status Flow:**
```
PENDING → CONFIRMED → PROCESSING → DELIVERING → DELIVERED
         ↓           ↓            ↓
      CANCELLED   CANCELLED   CANCELLED
```

---

### Cancel My Order (Customer)

**API Endpoint:** `PUT /api/orders/myOrders/cancel/{id}`

**Frontend Code:**
```typescript
cancelMyOrder: async (id: number, data: CancelOrderRequest): Promise<OrderResponse>
```

**Request Body:**
```json
{
  "cancelReason": "Customer cancellation reason"
}
```

**Backend:** `OrderController.CancelMyOrder()`
- **Authorization:** `CUSTOMER` role required
- **Constraint:** Can only cancel if status is PENDING, CONFIRMED, or PROCESSING

**Database Operations:**
1. **Query** order from `orders` table
2. **Validate** order belongs to current user
3. **Validate** order status allows cancellation (before DELIVERING)
4. **Update** order:
   - status = CANCELLED
   - cancel_reason = provided reason
5. **Restore stock** to `books` table:
   ```sql
   UPDATE books SET quantity_in_stock = quantity_in_stock + order_item_quantity
   ```
6. **Update payment** if VNPay and already paid:
   - Change payment_status to REFUNDING in `payments` table
7. **Return** updated order

---

### Admin/Staff Cancel Order

**API Endpoint:** `PUT /api/orders/admin-staff-cancel/{id}`

**Frontend Code:**
```typescript
adminStaffCancelOrder: async (id: number, data: {cancelReason: string}): Promise<OrderResponse>
```

**Backend:** `OrderController.adminStaffCancelOrder()`
- **Authorization:** `ADMIN` or `STAFF` role required
- **Special Rule:** If order is DELIVERING, stock is NOT restored (to account for lost/damaged goods)

**Database Operations:**
1. **Update** order status to CANCELLED
2. **Only restore stock** if status is NOT DELIVERING
3. **Update** payment status if needed
4. **Store** cancellation reason

---

### Change Order Address

**API Endpoint:** `PUT /api/orders/myOrders/change-address/{id}`

**Frontend Code:**
```typescript
changeMyOrderAddress: async (id: number, data: ChangeAddressRequest): Promise<OrderResponse>
```

**Request Body:**
```json
{
  "address": "New delivery address"
}
```

**Database Operations:**
1. **Validate** order belongs to current user
2. **Validate** order is not yet delivered
3. **Update** address in `orders` table
4. **Return** updated order

---

## Payment Flow

### Create Payment Record

**API Endpoint:** `POST /api/payments/create-payment-record`

**Frontend Code:** `front-end/src/api/endpoints/payment.api.ts`

```typescript
createPaymentRecord: async (data: CreatePaymentRecordRequest): Promise<PaymentResponse>
```

**Request Body:**
```json
{
  "orderId": 123,
  "paymentMethod": "VNPAY" | "COD",
  "amount": 450000
}
```

**Backend Controller:** `PaymentController.createPaymentRecord()`
- **Path:** `com/swp391/bookverse/controller/PaymentController.java`
- **Service:** `PaymentService.createPaymentRecord(request)`

**Database Operations:**
1. **Create** payment record in `payments` table:
   ```sql
   INSERT INTO payments (order_id, payment_method, amount, payment_status, created_at)
   VALUES (123, 'VNPAY', 450000, 'PENDING', NOW())
   ```
2. **Return** PaymentResponse with payment ID

**Response:**
```json
{
  "id": 456,
  "orderId": 123,
  "paymentMethod": "VNPAY",
  "amount": 450000,
  "paymentStatus": "PENDING",
  "createdAt": "timestamp"
}
```

---

### Create VNPay Payment URL

**API Endpoint:** `POST /api/payments/create-vnpay-url`

**Frontend Code:**
```typescript
createVNPayUrl: async (data: CreateVNPayUrlRequest): Promise<string>
```

**Request Body:**
```json
{
  "paymentId": 456,
  "amount": 450000
}
```

**Backend Controller:** `PaymentController.createPayment()`

**VNPay Integration Process:**

1. **Query** payment from `payments` table
2. **Build VNPay parameters:**
   ```
   vnp_Version: 2.1.0
   vnp_Command: pay
   vnp_TmnCode: merchant_code
   vnp_Amount: amount * 100 (VNPay uses minor units)
   vnp_CurrCode: VND
   vnp_TxnRef: payment_id
   vnp_OrderInfo: Order #{order_id} - Payment #{payment_id}
   vnp_OrderType: other
   vnp_Locale: vn
   vnp_ReturnUrl: frontend_callback_url
   vnp_IpAddr: user_ip
   vnp_CreateDate: YYYYMMDDHHmmss
   ```
3. **Generate** secure hash using HMAC SHA512
4. **Build** VNPay URL with all parameters
5. **Return** URL for frontend to redirect

**Response:**
```json
{
  "status": "OK",
  "message": "Created payment URL",
  "URL": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45000000&..."
}
```

**Frontend Flow:**
1. Receive VNPay URL
2. Redirect user to VNPay payment gateway
3. User completes payment on VNPay
4. VNPay redirects back to frontend with query parameters

---

### Handle VNPay Return (Callback)

**API Endpoint:** `GET /api/payments/vnpay-return`

**Frontend Code:**
```typescript
handleVNPayReturn: async (params: VNPayReturnParams): Promise<PaymentRecord>
```

**VNPay Return Parameters:**
```
vnp_Amount: "45000000"
vnp_BankCode: "NCB"
vnp_BankTranNo: "VNP01234567"
vnp_PayDate: "20250126095405"
vnp_OrderInfo: "Order #123 - Payment #456"
vnp_ResponseCode: "00" (00 = success, others = failure)
vnp_TransactionNo: "14567890"
vnp_TxnRef: "456" (payment_id)
vnp_SecureHash: "hash_value"
```

**Backend Controller:** `PaymentController.transaction()`

**Database Operations:**

1. **Verify** secure hash from VNPay
2. **Extract** payment_id from vnp_TxnRef
3. **Query** payment from `payments` table
4. **Check** vnp_ResponseCode:
   
   **If responseCode = "00" (Success):**
   - **Update** `payments` table:
     ```sql
     UPDATE payments 
     SET payment_status = 'SUCCESS',
         transaction_no = vnp_TransactionNo,
         bank_code = vnp_BankCode,
         bank_tran_no = vnp_BankTranNo,
         pay_date = vnp_PayDate,
         updated_at = NOW()
     WHERE id = payment_id
     ```
   - **Update** corresponding order status if needed
   
   **If responseCode != "00" (Failed):**
   - **Update** payment_status = 'FAILED'
   - **Restore** book stock (reverse the stock reduction from order creation)
   - **Update** order status to CANCELLED

5. **Return** payment record with transaction details

**Response (PaymentRecord):**
```json
{
  "id": 456,
  "orderId": 123,
  "paymentMethod": "VNPAY",
  "amount": 450000,
  "paymentStatus": "SUCCESS",
  "transactionNo": "14567890",
  "bankCode": "NCB",
  "bankTranNo": "VNP01234567",
  "payDate": "2025-01-26 09:54:05",
  "responseCode": "00"
}
```

---

### Mark Payment as Done (COD)

**API Endpoint:** `PUT /api/payments/payment-done/{paymentId}`

**Frontend Code:**
```typescript
markPaymentDone: async (paymentId: number): Promise<PaymentResponse>
```

**Backend Controller:** `PaymentController.markPaymentAsDone()`
- **Used for:** Cash on Delivery (COD) payments when order is delivered

**Database Operations:**
1. **Update** `payments` table:
   ```sql
   UPDATE payments 
   SET payment_status = 'SUCCESS',
       updated_at = NOW()
   WHERE id = paymentId
   ```
2. **Return** updated payment

---

### Mark Payment as Refunded

**API Endpoint:** `PUT /api/payments/status-refunded/{paymentId}`

**Frontend Code:**
```typescript
markPaymentRefunded: async (paymentId: number): Promise<PaymentResponse>
```

**Backend Controller:** `PaymentController.markPaymentAsRefunded()`
- **Authorization:** `ADMIN` or `STAFF` role required
- **Prerequisite:** Payment status must be REFUNDING

**Database Operations:**
1. **Validate** payment_status = 'REFUNDING'
2. **Update** `payments` table:
   ```sql
   UPDATE payments 
   SET payment_status = 'REFUNDED',
       updated_at = NOW()
   WHERE id = paymentId AND payment_status = 'REFUNDING'
   ```
3. **Return** updated payment

---

## Database Schema Overview

### Key Tables

#### users
```sql
- id (UUID, PK)
- username (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- phone (VARCHAR)
- address (TEXT)
- image_url (VARCHAR)
- role (ENUM: CUSTOMER, STAFF, ADMIN)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### otp_tokens
```sql
- id (BIGINT, PK)
- user_id (UUID, FK → users.id)
- email (VARCHAR)
- code (VARCHAR, 6 digits)
- token_type (ENUM: LOGIN, RESET_PASSWORD)
- expires_at (TIMESTAMP)
- verified (BOOLEAN)
- created_at (TIMESTAMP)
```

#### books
```sql
- id (BIGINT, PK)
- title (VARCHAR)
- price (DECIMAL)
- quantity_in_stock (INT)
- image_url (VARCHAR)
- ... (other book details)
```

#### carts
```sql
- id (BIGINT, PK)
- user_id (UUID, FK → users.id, UNIQUE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### cart_items
```sql
- id (BIGINT, PK)
- cart_id (BIGINT, FK → carts.id)
- book_id (BIGINT, FK → books.id)
- quantity (INT)
- UNIQUE(cart_id, book_id)
```

#### orders
```sql
- id (BIGINT, PK)
- user_id (UUID, FK → users.id)
- address (TEXT)
- phone (VARCHAR)
- payment_method (ENUM: COD, VNPAY)
- status (ENUM: PENDING, CONFIRMED, PROCESSING, DELIVERING, DELIVERED, CANCELLED)
- total_price (DECIMAL)
- note (TEXT)
- cancel_reason (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### order_items
```sql
- id (BIGINT, PK)
- order_id (BIGINT, FK → orders.id)
- book_id (BIGINT, FK → books.id)
- quantity (INT)
- price (DECIMAL) -- price at time of order
- subtotal (DECIMAL)
```

#### payments
```sql
- id (BIGINT, PK)
- order_id (BIGINT, FK → orders.id, UNIQUE)
- payment_method (ENUM: COD, VNPAY)
- amount (DECIMAL)
- payment_status (ENUM: PENDING, SUCCESS, FAILED, REFUNDING, REFUNDED)
- transaction_no (VARCHAR) -- VNPay transaction number
- bank_code (VARCHAR)
- bank_tran_no (VARCHAR)
- pay_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### promotions
```sql
- id (BIGINT, PK)
- code (VARCHAR, UNIQUE)
- discount_percentage (DECIMAL)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- active (BOOLEAN)
```

---

## Complete Flow Diagrams

### Sign Up Flow
```
User Form → FE (auth.api.ts) → POST /api/users/signup 
→ UserController.signupUser() 
→ UserService.signupUser() 
→ DB: INSERT INTO users 
→ UserResponse 
→ FE stores user data
```

### Sign In Flow
```
User Form → FE (auth.api.ts) → POST /api/auth/token 
→ AuthenticationController.authenticate() 
→ AuthenticationService.authenticate() 
→ DB: SELECT FROM users, validate password 
→ Generate JWT token 
→ AuthenticationResponse {token} 
→ FE stores token in localStorage/context 
→ FE calls GET /api/users/myInfo 
→ UserController.getMyInfo() 
→ DB: SELECT user details 
→ FE stores user data
```

### Forgot Password Flow
```
1. User enters email → FE → GET /api/users/id-by-email/{email} 
   → DB: SELECT id FROM users → userId

2. FE → POST /api/otp/send-by-email-reset-password 
   → OtpService.sendOtpByEmailResetPassword() 
   → DB: INSERT INTO otp_tokens 
   → Send email with OTP code

3. User enters OTP + new password → FE → POST /api/otp/verify-reset-password 
   → OtpService.verifyResetPassword() 
   → DB: SELECT FROM otp_tokens (validate) 
   → DB: UPDATE users SET password (hashed) 
   → DB: UPDATE otp_tokens SET verified = true 
   → Success response
```

### Cart to Order Flow
```
1. User adds items → POST /api/carts/myCart/add-1-to-cart 
   → DB: INSERT/UPDATE cart_items

2. User views cart → GET /api/carts/myCart 
   → DB: SELECT cart with items

3. User creates order → POST /api/orders/create 
   → OrderService.createOrder() 
   → DB: BEGIN TRANSACTION
      - INSERT INTO orders
      - INSERT INTO order_items (from cart_items)
      - UPDATE books (reduce stock)
      - DELETE FROM cart_items (clear cart)
      - INSERT INTO payments
   → DB: COMMIT
   → OrderResponse

4. If VNPay: POST /api/payments/create-vnpay-url 
   → Generate VNPay URL → Redirect to VNPay

5. After payment: VNPay redirects → GET /api/payments/vnpay-return 
   → DB: UPDATE payments SET status 
   → Payment confirmation
```

---

## API Method Summary

### Authentication APIs
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/users/signup` | POST | No | Register new user |
| `/api/auth/token` | POST | No | Sign in and get JWT token |
| `/api/users/myInfo` | GET | Yes | Get current user info |
| `/api/users/id-by-email/{email}` | GET | No | Get user ID by email |
| `/api/otp/send-by-email-reset-password` | POST | No | Send OTP for password reset |
| `/api/otp/verify-reset-password` | POST | No | Verify OTP and reset password |

### Cart APIs
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/carts/myCart` | GET | CUSTOMER | Get current user's cart |
| `/api/carts/myCart/add-1-to-cart` | POST | CUSTOMER | Add 1 item to cart |
| `/api/carts/myCart/add-multiple-to-cart` | POST | Yes | Add multiple items |
| `/api/carts/myCart/remove-1-from-cart` | POST | Yes | Remove 1 item |
| `/api/carts/myCart/clear-an-item` | POST | Yes | Clear item completely |
| `/api/carts/myCart/update-item-quantity` | PUT | Yes | Update item quantity |

### Order APIs
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/orders/create` | POST | CUSTOMER | Create new order |
| `/api/orders/myOrders` | GET | CUSTOMER | Get user's orders |
| `/api/orders/{id}` | GET | Yes | Get order by ID |
| `/api/orders` | GET | ADMIN/STAFF | Get all orders |
| `/api/orders/status/{status}` | GET | ADMIN/STAFF | Get orders by status |
| `/api/orders/update/{id}` | PUT | ADMIN/STAFF | Update order status |
| `/api/orders/myOrders/cancel/{id}` | PUT | CUSTOMER | Cancel own order |
| `/api/orders/admin-staff-cancel/{id}` | PUT | ADMIN/STAFF | Cancel any order |
| `/api/orders/myOrders/change-address/{id}` | PUT | CUSTOMER | Change delivery address |

### Payment APIs
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/payments/create-payment-record` | POST | Yes | Create payment record |
| `/api/payments/create-vnpay-url` | POST | Yes | Generate VNPay payment URL |
| `/api/payments/vnpay-return` | GET | No | VNPay callback handler |
| `/api/payments/{paymentId}` | GET | Yes | Get payment by ID |
| `/api/payments/payment-done/{paymentId}` | PUT | ADMIN/STAFF | Mark payment as done (COD) |
| `/api/payments/status-refunded/{paymentId}` | PUT | ADMIN/STAFF | Mark payment as refunded |

---

## Payment Status Transitions

```
PENDING → SUCCESS (Payment completed successfully)
        → FAILED (Payment failed)
        → REFUNDING (Order cancelled, refund initiated)

REFUNDING → REFUNDED (Refund completed by admin/staff)
```

## Order Status Transitions

```
PENDING → CONFIRMED → PROCESSING → DELIVERING → DELIVERED
   ↓         ↓           ↓            ↓
CANCELLED CANCELLED  CANCELLED   CANCELLED
   (Stock restored)              (Stock NOT restored)
```

---

## Notes

- All timestamps are stored in UTC
- Passwords are hashed using BCrypt
- JWT tokens expire after configured time (default: 24 hours)
- OTP codes expire after 5 minutes
- VNPay uses sandbox environment for testing
- Cart items are automatically cleared after order creation
- Stock is reduced immediately when order is created
- Payment methods: COD (Cash on Delivery) or VNPAY (VNPay online payment)
- Refunds for VNPay require manual processing by admin/staff

---

**Last Updated:** 2025-01-26
