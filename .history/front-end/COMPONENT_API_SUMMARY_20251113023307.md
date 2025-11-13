# Component & API Summary

## ✅ Created Files

### 📁 API Endpoints (`src/api/endpoints/`)
- ✅ `payment.api.ts` - VNPay payment integration
- ✅ `promotion.api.ts` - Promotion CRUD operations
- ✅ `review.api.ts` - Review CRUD operations
- ✅ `cart.api.ts` - Updated with `addMultipleToCart`

### 📁 Type Definitions (`src/types/api/`)
- ✅ `payment.types.ts` - Payment & VNPay types
- ✅ `promotion.types.ts` - Promotion types
- ✅ `review.types.ts` - Review types
- ✅ `cart.types.ts` - Updated with `AddMultipleToCartRequest`

### 📁 Components

#### Payment (`src/components/Payment/`)
- ✅ `VNPayReturn.tsx` - Handles VNPay callback & displays invoice

#### Review (`src/components/Review/`)
- ✅ `ReviewForm.tsx` - Create/Update review form with star rating
- ✅ `ReviewList.tsx` - Display reviews with average rating

#### Admin (`src/components/Admin/`)
- ✅ `PromotionManagement.tsx` - Manage promotions (list, toggle active/inactive)

### 📁 Documentation
- ✅ `API_CART_PAYMENT_REVIEW_PROMOTION.md` - Full API documentation
- ✅ `QUICK_INTEGRATION_EXAMPLES.md` - Quick integration snippets

---

## 🔧 API Endpoints Overview

### Cart API
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/carts/myCart/add-1-to-cart` | Add 1 item | `{ bookId: number }` |
| POST | `/carts/myCart/add-multiple-to-cart` | Add multiple items | `{ bookId: number, quantity: number }` |
| POST | `/carts/myCart/remove-1-from-cart` | Remove 1 item | `{ bookId: number }` |
| POST | `/carts/myCart/clear-an-item` | Clear item | `{ bookId: number }` |
| PUT | `/carts/myCart/update-item-quantity` | Update quantity | `{ bookId: number, quantity: number }` |
| GET | `/carts/myCart` | Get my cart | - |

### Payment API
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/payments/create` | Create payment URL | `amount`, `orderInfo`, `returnUrl?` |
| GET | `/payments/vnpay-return` | Handle VNPay return | All VNPay parameters |

**VNPay Return Parameters:**
- `vnp_Amount` ✅ Required
- `vnp_BankCode` ✅ Required
- `vnp_BankTranNo` ✅ Required
- `vnp_PayDate` ✅ Required
- `vnp_OrderInfo` ✅ Required
- `vnp_ResponseCode` ✅ Required (00 = success)
- `vnp_TransactionNo` ✅ Required

### Review API
| Method | Endpoint | Description | Request Body | Required Fields |
|--------|----------|-------------|--------------|-----------------|
| GET | `/reviews` | Get all reviews | - | - |
| GET | `/reviews/{bookId}` | Get book reviews | - | - |
| POST | `/reviews/create` | Create review | `{ bookId, rating, comment? }` | `bookId`, `rating` |
| PUT | `/reviews/update` | Update review | `{ bookId, rating?, comment? }` | `bookId` |
| DELETE | `/reviews/myReview/{bookId}` | Delete own review | - | - |
| DELETE | `/reviews/deleteByAdminStaff/{bookId}` | Admin delete | - | - |

### Promotion API
| Method | Endpoint | Description | Request Body | Required Fields |
|--------|----------|-------------|--------------|-----------------|
| GET | `/promotions` | Get all | - | - |
| GET | `/promotions/active` | Get active | - | - |
| GET | `/promotions/inactive` | Get inactive | - | - |
| GET | `/promotions/{id}` | Get by ID | - | - |
| GET | `/promotions/{id}/sub-categories` | Get with sub-cats | - | - |
| POST | `/promotions/create` | Create | Full object | `name`, `discountPercentage`, `startDate`, `endDate` |
| PUT | `/promotions/update/{id}` | Update | Partial object | `id` |
| PUT | `/promotions/active/{id}` | Set active | - | - |
| PUT | `/promotions/inactive/{id}` | Set inactive | - | - |

---

## 🎨 Component Props

### VNPayReturn
**Props:** None (reads from URL query params)

**Features:**
- Extracts VNPay parameters from URL
- Calls backend to process payment
- Displays payment invoice/receipt
- Shows success/failure message
- Navigation buttons (Order history / Home / Cart)

---

### ReviewForm
```typescript
type ReviewFormProps = {
  bookId: number;              // ✅ Required
  bookTitle?: string;          // Optional - shown in header
  existingReview?: {           // Optional - for editing
    rating: number;
    comment?: string;
  };
  onSuccess?: () => void;      // Callback after successful submit
  onCancel?: () => void;       // Callback for cancel button
};
```

**Features:**
- Star rating selector (1-5) ✅ Required
- Comment textarea (optional)
- Auto-detects create vs update mode
- Form validation
- Error handling
- Loading states

---

### ReviewList
```typescript
type ReviewListProps = {
  bookId: number;              // ✅ Required
  refreshTrigger?: number;     // Increment to force refresh
};
```

**Features:**
- Displays all reviews for a book
- Shows average rating and total count
- Delete button for own reviews
- Admin/Staff can delete any review
- Formatted dates
- Loading & error states
- Empty state message

---

### PromotionManagement
**Props:** None

**Features:**
- Lists all promotions in table
- Filter: Show/Hide inactive promotions
- Toggle active/inactive status
- Shows discount percentage, dates, status
- Status badges (Active/Upcoming/Expired/Inactive)
- Placeholder buttons for Create/Edit modals
- Responsive table layout

---

## 📦 Helper Functions

### Payment API Helpers
```typescript
// Check if payment successful
paymentApi.isPaymentSuccessful(responseCode: string): boolean

// Format VNPay amount (divide by 100)
paymentApi.formatVNPayAmount(vnpAmount: string): number

// Format VNPay date (YYYYMMDDHHmmss -> YYYY-MM-DD HH:mm:ss)
paymentApi.formatVNPayDate(vnpPayDate: string): string

// Parse URL parameters
paymentApi.parseVNPayReturnUrl(url: string): VNPayReturnParams
```

---

## 🔒 Permission Requirements

### Cart
- `addOneToCart`: Requires authentication (Customer)
- `addMultipleToCart`: Requires authentication (Customer)
- All cart operations: Authenticated users only

### Payment
- `createPayment`: Requires authentication (Customer)
- `handleVNPayReturn`: Requires authentication (Customer)

### Review
- **Create**: Customer role only
- **Update**: Own reviews only (Customer)
- **Delete (myReview)**: Own reviews only (Customer)
- **Delete (adminStaff)**: Admin or Staff role

### Promotion
- **Get Active**: Public (for displaying promotions to customers)
- **Get All**: Admin or Staff
- **Create/Update/Delete**: Admin or Staff

---

## 🎯 Integration Points

### ProductDetail Page
1. ✅ Add quantity selector
2. ✅ Use `addMultipleToCart` when quantity > 1
3. ✅ Add ReviewForm component (for customers)
4. ✅ Add ReviewList component

### Cart Page
1. ✅ Use `addMultipleToCart` for bulk add
2. ✅ Add "Thanh toán" button
3. ✅ Integrate VNPay payment flow

### Admin Dashboard
1. ✅ Add PromotionManagement route
2. ✅ Add navigation link
3. ✅ Reuse table management patterns

### App Routes
1. ✅ Add `/payment/vnpay-return` route
2. ✅ Add `/admin/promotions` route

---

## ⚠️ Important Notes

### VNPay Payment Flow
1. Frontend calls `createPayment` → gets `paymentUrl`
2. Redirect user to VNPay: `window.location.href = paymentUrl`
3. User completes payment on VNPay site
4. VNPay redirects to: `/payment/vnpay-return?vnp_Amount=...&vnp_BankCode=...`
5. Frontend extracts parameters and calls backend
6. Backend saves payment to database
7. Frontend displays invoice

**⚠️ Critical:** Backend cannot receive VNPay callback parameters directly due to VNPay limitations. Frontend must extract URL params and send to backend.

### Review API Notes
- Review deletion uses `bookId` (not review ID)
- Users can only have 1 review per book
- Update overwrites existing review
- Delete endpoints differ for user vs admin/staff

### Promotion Status Logic
A promotion is **Active** when:
- `active = true` AND
- Current date >= `startDate` AND
- Current date <= `endDate`

### Cart Quantity Logic
- Use `addOneToCart` when quantity = 1 (single click)
- Use `addMultipleToCart` when quantity > 1 (bulk add)
- Use `updateItemQuantity` to change existing cart item quantity

---

## ✅ Testing Scenarios

### Cart - Add Multiple
```typescript
// Scenario 1: Add 1 book
await cartApi.addOneToCart({ bookId: 123 });

// Scenario 2: Add 5 books at once
await cartApi.addMultipleToCart({ bookId: 123, quantity: 5 });

// Scenario 3: Update existing cart item
await cartApi.updateItemQuantity({ bookId: 123, quantity: 10 });
```

### Payment
```typescript
// Step 1: Create payment
const { paymentUrl } = await paymentApi.createPayment({
  amount: 500000,
  orderInfo: "Don hang #12345"
});

// Step 2: Redirect (done by VNPayReturn component automatically)
```

### Review
```typescript
// Create review
await reviewApi.create({
  bookId: 123,
  rating: 5,
  comment: "Great book!"
});

// Update review
await reviewApi.update({
  bookId: 123,
  rating: 4,
  comment: "Updated review"
});

// Delete review
await reviewApi.deleteMyReview(123);
```

### Promotion
```typescript
// Create promotion
await promotionApi.create({
  name: "Flash Sale 50%",
  discountPercentage: 50,
  startDate: "2025-01-15",
  endDate: "2025-01-31",
  subCategoryIds: [1, 2, 3]
});

// Toggle status
await promotionApi.setInactive(1);
await promotionApi.setActive(1);
```

---

## 📝 Next Implementation Steps

1. **Update ProductDetail.tsx**
   - Add quantity selector
   - Integrate addMultipleToCart
   - Add ReviewForm and ReviewList components

2. **Update Cart page**
   - Add VNPay payment button
   - Implement checkout flow

3. **Update AdminLayout.tsx**
   - Add PromotionManagement route
   - Add navigation link

4. **Add App routes**
   - `/payment/vnpay-return` → VNPayReturn component

5. **Test all flows**
   - Cart operations
   - Payment complete cycle
   - Review CRUD
   - Promotion management

6. **Apply simple-datatables** (Original request)
   - Add to PromotionManagement table
   - Add to existing management tables
   - Add sorting, filtering, pagination, export
