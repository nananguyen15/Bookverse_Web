# API Integration Guide - Cart, Payment, Review, Promotion

## 📦 Cart API - Add Multiple Items

### Add Multiple Items to Cart (Quantity > 1)

```typescript
import { cartApi } from "../api/endpoints";

// Add 5 books to cart at once
const addMultipleToCart = async (bookId: number, quantity: number) => {
  try {
    const cart = await cartApi.addMultipleToCart({
      bookId,
      quantity, // e.g., 5
    });
    console.log("Updated cart:", cart);
  } catch (error) {
    console.error("Error adding multiple items:", error);
  }
};
```

**Usage in ProductDetail:**
```typescript
// When user selects quantity and clicks "Add to Cart"
const handleAddToCart = async () => {
  if (quantity > 1) {
    // Use addMultipleToCart for quantity > 1
    await cartApi.addMultipleToCart({ bookId: product.id, quantity });
  } else {
    // Use addOneToCart for quantity = 1
    await cartApi.addOneToCart({ bookId: product.id });
  }
};
```

---

## 💳 Payment API - VNPay Integration

### Step 1: Create Payment URL

```typescript
import { paymentApi } from "../api/endpoints";

const createPayment = async (amount: number, orderInfo: string) => {
  try {
    const { paymentUrl } = await paymentApi.createPayment({
      amount, // Amount in VND (e.g., 500000)
      orderInfo, // e.g., "Thanh toan don hang #12345"
      returnUrl: `${window.location.origin}/payment/vnpay-return`, // Optional
    });
    
    // Redirect user to VNPay
    window.location.href = paymentUrl;
  } catch (error) {
    console.error("Error creating payment:", error);
  }
};
```

### Step 2: Handle VNPay Return

**Add route in your router:**
```typescript
// In App.tsx or routes file
import { VNPayReturn } from "./components/Payment/VNPayReturn";

<Route path="/payment/vnpay-return" element={<VNPayReturn />} />
```

The `VNPayReturn` component will:
1. ✅ Extract all VNPay parameters from URL
2. ✅ Call backend to process and save payment
3. ✅ Display payment invoice/receipt
4. ✅ Show success/failure message
5. ✅ Navigate to orders or cart

**VNPay Return Parameters:**
- `vnp_Amount` - Amount (multiplied by 100)
- `vnp_BankCode` - Bank code
- `vnp_BankTranNo` - Bank transaction number
- `vnp_PayDate` - Payment date (YYYYMMDDHHmmss)
- `vnp_OrderInfo` - Order information
- `vnp_ResponseCode` - Response code (00 = success)
- `vnp_TransactionNo` - VNPay transaction number

**Helper Functions:**
```typescript
// Check if payment was successful
const isSuccess = paymentApi.isPaymentSuccessful(responseCode); // true if "00"

// Format amount (VNPay multiplies by 100)
const actualAmount = paymentApi.formatVNPayAmount("50000000"); // 500000 VND

// Format date
const formattedDate = paymentApi.formatVNPayDate("20250113150530"); // "2025-01-13 15:05:30"
```

---

## ⭐ Review API

### Get Reviews for a Book

```typescript
import { reviewApi } from "../api/endpoints";

const fetchReviews = async (bookId: number) => {
  try {
    const reviews = await reviewApi.getByBookId(bookId);
    console.log("Reviews:", reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
};
```

### Create Review (Customer only)

```typescript
const createReview = async (bookId: number, rating: number, comment?: string) => {
  try {
    const review = await reviewApi.create({
      bookId, // Required
      rating, // Required: 1-5
      comment, // Optional
    });
    console.log("Review created:", review);
  } catch (error) {
    console.error("Error creating review:", error);
  }
};
```

### Update Review

```typescript
const updateReview = async (bookId: number, rating?: number, comment?: string) => {
  try {
    const review = await reviewApi.update({
      bookId, // Required
      rating, // Optional: 1-5
      comment, // Optional
    });
    console.log("Review updated:", review);
  } catch (error) {
    console.error("Error updating review:", error);
  }
};
```

### Delete Review

```typescript
// Customer deletes own review
const deleteMyReview = async (bookId: number) => {
  try {
    await reviewApi.deleteMyReview(bookId);
    console.log("Review deleted");
  } catch (error) {
    console.error("Error deleting review:", error);
  }
};

// Admin/Staff deletes any review
const deleteByAdminStaff = async (bookId: number) => {
  try {
    await reviewApi.deleteByAdminStaff(bookId);
    console.log("Review deleted by admin/staff");
  } catch (error) {
    console.error("Error deleting review:", error);
  }
};
```

### Using Review Components

**In ProductDetail.tsx:**
```typescript
import { ReviewForm } from "../components/Review/ReviewForm";
import { ReviewList } from "../components/Review/ReviewList";

function ProductDetail() {
  const [refreshReviews, setRefreshReviews] = useState(0);

  return (
    <div>
      {/* Product info... */}

      {/* Review Section */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Đánh giá</h2>
        
        {/* Review Form (for logged-in customers) */}
        {isAuthenticated && userRole === "CUSTOMER" && (
          <ReviewForm
            bookId={product.id}
            bookTitle={product.title}
            onSuccess={() => {
              alert("Đánh giá của bạn đã được gửi!");
              setRefreshReviews((prev) => prev + 1); // Trigger refresh
            }}
          />
        )}

        {/* Reviews List */}
        <ReviewList bookId={product.id} refreshTrigger={refreshReviews} />
      </div>
    </div>
  );
}
```

---

## 🎁 Promotion API

### Get All Promotions (Admin/Staff)

```typescript
import { promotionApi } from "../api/endpoints";

const fetchPromotions = async () => {
  try {
    const promotions = await promotionApi.getAll();
    console.log("All promotions:", promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
  }
};
```

### Get Active Promotions

```typescript
const fetchActivePromotions = async () => {
  try {
    const promotions = await promotionApi.getActive();
    console.log("Active promotions:", promotions);
  } catch (error) {
    console.error("Error fetching active promotions:", error);
  }
};
```

### Get Promotion by ID

```typescript
const fetchPromotion = async (id: number) => {
  try {
    const promotion = await promotionApi.getById(id);
    console.log("Promotion:", promotion);
  } catch (error) {
    console.error("Error fetching promotion:", error);
  }
};
```

### Get Promotion with Sub-Categories

```typescript
const fetchPromotionWithSubCategories = async (id: number) => {
  try {
    const promotion = await promotionApi.getSubCategories(id);
    console.log("Promotion with sub-categories:", promotion);
    console.log("Sub-category IDs:", promotion.subCategoryIds);
  } catch (error) {
    console.error("Error fetching promotion:", error);
  }
};
```

### Create Promotion (Admin/Staff)

```typescript
const createPromotion = async () => {
  try {
    const promotion = await promotionApi.create({
      name: "Flash Sale 50%", // Required
      description: "Giảm giá sốc cuối tuần", // Optional
      discountPercentage: 50, // Required (e.g., 10 for 10%)
      startDate: "2025-01-15", // Required (YYYY-MM-DD or ISO string)
      endDate: "2025-01-31", // Required
      subCategoryIds: [1, 2, 3], // Optional: Apply to specific sub-categories
    });
    console.log("Promotion created:", promotion);
  } catch (error) {
    console.error("Error creating promotion:", error);
  }
};
```

### Update Promotion (Admin/Staff)

```typescript
const updatePromotion = async (id: number) => {
  try {
    const promotion = await promotionApi.update(id, {
      name: "Flash Sale 70%", // Optional
      discountPercentage: 70, // Optional
      endDate: "2025-02-15", // Optional
      // Only include fields you want to update
    });
    console.log("Promotion updated:", promotion);
  } catch (error) {
    console.error("Error updating promotion:", error);
  }
};
```

### Toggle Active/Inactive (Admin/Staff)

```typescript
// Set as inactive
const deactivatePromotion = async (id: number) => {
  try {
    const promotion = await promotionApi.setInactive(id);
    console.log("Promotion deactivated:", promotion);
  } catch (error) {
    console.error("Error deactivating promotion:", error);
  }
};

// Set as active
const activatePromotion = async (id: number) => {
  try {
    const promotion = await promotionApi.setActive(id);
    console.log("Promotion activated:", promotion);
  } catch (error) {
    console.error("Error activating promotion:", error);
  }
};
```

### Using PromotionManagement Component

**In AdminLayout.tsx:**
```typescript
import { PromotionManagement } from "../components/Admin/PromotionManagement";

// Add route
<Route path="promotions" element={<PromotionManagement />} />
```

The component provides:
- ✅ List all promotions with filtering
- ✅ Toggle active/inactive status
- ✅ Display promotion details (discount, dates, status)
- ✅ Show current/upcoming/expired promotions
- ✅ Ready for Create/Edit modal integration

---

## 🔧 Type Definitions

All types are exported from:
```typescript
import type {
  // Cart
  AddMultipleToCartRequest,
  
  // Payment
  VNPayReturnParams,
  CreatePaymentRequest,
  PaymentRecord,
  PaymentStatus,
  
  // Review
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  
  // Promotion
  PromotionResponse,
  PromotionWithSubCategoriesResponse,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../types/api";
```

---

## ✅ Required Fields Summary

### Cart - Add Multiple
- `bookId` ✅ Required
- `quantity` ✅ Required (must be > 1)

### Payment - Create
- `amount` ✅ Required
- `orderInfo` ✅ Required
- `returnUrl` ⚠️ Optional (defaults to current origin + /payment/vnpay-return)

### Review - Create
- `bookId` ✅ Required
- `rating` ✅ Required (1-5)
- `comment` ⚠️ Optional

### Review - Update
- `bookId` ✅ Required
- `rating` ⚠️ Optional (1-5)
- `comment` ⚠️ Optional

### Promotion - Create
- `name` ✅ Required
- `discountPercentage` ✅ Required
- `startDate` ✅ Required
- `endDate` ✅ Required
- `description` ⚠️ Optional
- `subCategoryIds` ⚠️ Optional

---

## 🎯 Next Steps

1. **Cart Integration:**
   - Update ProductDetail to use `addMultipleToCart` when quantity > 1
   - Update Cart page to show correct quantities

2. **Payment Integration:**
   - Add "Thanh toán" button in Cart page
   - Call `createPayment` with total amount
   - Ensure `/payment/vnpay-return` route exists

3. **Review Integration:**
   - Add ReviewForm and ReviewList to ProductDetail
   - Allow customers to write reviews
   - Show all reviews for each book

4. **Promotion Management:**
   - Add PromotionManagement to Admin/Staff dashboard
   - Create/Edit forms for promotions
   - Apply promotions to books display (show discounted price)

5. **Management Tables:**
   - Use existing table management components for Review and Promotion
   - Reuse CustomerManagement, BookManagement patterns
   - Add simple-datatables for sorting, filtering, export
