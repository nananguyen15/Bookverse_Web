# Quick Integration Examples

## 🛒 Cart - Add Multiple Items

### Update ProductDetail.tsx

```typescript
import { useState } from "react";
import { cartApi } from "../api/endpoints";

// Inside ProductDetail component
const [quantity, setQuantity] = useState(1);

const handleAddToCart = async () => {
  if (!product.active || product.stockQuantity === 0) {
    alert("Sản phẩm này hiện không khả dụng");
    return;
  }

  try {
    if (quantity > 1) {
      // Use addMultipleToCart for quantity > 1
      await cartApi.addMultipleToCart({
        bookId: product.id,
        quantity: quantity,
      });
    } else {
      // Use addOneToCart for quantity = 1
      await cartApi.addOneToCart({ bookId: product.id });
    }
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
  }
};

// Quantity selector UI
<div className="flex items-center gap-4">
  <label>Số lượng:</label>
  <input
    type="number"
    min="1"
    max={product.stockQuantity}
    value={quantity}
    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
    className="border px-3 py-2 rounded w-20"
  />
  <button onClick={handleAddToCart} className="btn-primary">
    Thêm vào giỏ hàng
  </button>
</div>
```

---

## ⭐ Review Integration in ProductDetail.tsx

```typescript
import { useState } from "react";
import { ReviewForm } from "../components/Review/ReviewForm";
import { ReviewList } from "../components/Review/ReviewList";
import { useAuth } from "../contexts/AuthContext";

function ProductDetail() {
  const { isAuthenticated, user } = useAuth();
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <div>
      {/* Product details... */}

      {/* Review Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brown-800 mb-6">
          Đánh giá sản phẩm
        </h2>

        {/* Show Review Form for logged-in CUSTOMER users */}
        {isAuthenticated && user?.role === "CUSTOMER" && (
          <div className="mb-6">
            {showReviewForm ? (
              <ReviewForm
                bookId={product.id}
                bookTitle={product.title}
                onSuccess={() => {
                  alert("Cảm ơn bạn đã đánh giá!");
                  setShowReviewForm(false);
                  setRefreshReviews((prev) => prev + 1);
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-brown-600 text-white px-6 py-2 rounded-lg hover:bg-brown-700"
              >
                ✍️ Viết đánh giá
              </button>
            )}
          </div>
        )}

        {/* Reviews List */}
        <ReviewList bookId={product.id} refreshTrigger={refreshReviews} />
      </section>
    </div>
  );
}
```

---

## 💳 Payment Integration in Cart/Checkout

```typescript
import { useState } from "react";
import { paymentApi } from "../api/endpoints";

function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (totalAmount: number, orderId: string) => {
    setLoading(true);
    try {
      // Create payment URL
      const { paymentUrl } = await paymentApi.createPayment({
        amount: totalAmount, // e.g., 500000 (500,000 VND)
        orderInfo: `Thanh toan don hang #${orderId}`,
      });

      // Redirect to VNPay
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Không thể tạo thanh toán. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tổng tiền: {totalAmount.toLocaleString("vi-VN")} ₫</h2>
      <button
        onClick={() => handlePayment(totalAmount, orderId)}
        disabled={loading}
        className="bg-brown-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Đang xử lý..." : "Thanh toán qua VNPay"}
      </button>
    </div>
  );
}
```

### Add VNPay Return Route in App.tsx

```typescript
import { VNPayReturn } from "./components/Payment/VNPayReturn";

// In your routes
<Route path="/payment/vnpay-return" element={<VNPayReturn />} />
```

---

## 🎁 Promotion Management in Admin

### Add route in AdminLayout.tsx

```typescript
import { PromotionManagement } from "./PromotionManagement";

// Add to routes
<Route path="promotions" element={<PromotionManagement />} />
```

### Add navigation link

```typescript
<NavLink to="/admin/promotions">
  🎁 Quản lý khuyến mãi
</NavLink>
```

---

## 📋 Complete Type Exports

Add to `src/types/api/index.ts`:

```typescript
// Cart types
export * from "./cart.types";

// Payment types
export * from "./payment.types";

// Review types
export * from "./review.types";

// Promotion types
export * from "./promotion.types";
```

---

## ✅ Testing Checklist

### Cart - Add Multiple
- [ ] Can add single item (quantity = 1) using addOneToCart
- [ ] Can add multiple items (quantity > 1) using addMultipleToCart
- [ ] Quantity selector respects stock limit
- [ ] Error handling for out-of-stock items

### Payment - VNPay
- [ ] Payment URL is created successfully
- [ ] Redirects to VNPay payment page
- [ ] Return URL processes payment correctly
- [ ] Shows success/failure message with invoice
- [ ] Saves payment to database via backend
- [ ] Navigates to appropriate page after payment

### Review
- [ ] Can view all reviews for a book
- [ ] Logged-in customers can write reviews
- [ ] Rating (1-5 stars) is required
- [ ] Comment is optional
- [ ] Can update own review
- [ ] Can delete own review
- [ ] Admin/Staff can delete any review
- [ ] Reviews refresh after create/update/delete

### Promotion
- [ ] Admin/Staff can view all promotions
- [ ] Can toggle active/inactive status
- [ ] Shows promotion dates and discount percentage
- [ ] Filters work (show/hide inactive)
- [ ] Ready for create/edit modal integration

---

## 🚀 Next Steps

1. **Integrate Cart API** in ProductDetail and Cart pages
2. **Add VNPay route** and test payment flow
3. **Add Review components** to ProductDetail page
4. **Add Promotion management** to Admin dashboard
5. **Test all flows** end-to-end
6. **Add simple-datatables** to management tables (pending)
