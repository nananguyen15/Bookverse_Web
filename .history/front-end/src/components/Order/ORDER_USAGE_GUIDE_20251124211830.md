# Order Management Components - Usage Guide

Hướng dẫn sử dụng các components và utilities đã implement cho Order & Payment flow.

## 📦 Components

### 1. OrderStatusBadge & PaymentStatusBadge
Hiển thị trạng thái đơn hàng và thanh toán với màu sắc phù hợp.

```tsx
import { OrderStatusBadge, PaymentStatusBadge } from "../components/Order";

// Trong component
<OrderStatusBadge status={order.status} />
<PaymentStatusBadge status={order.payment.status} />
```

### 2. CancelOrderModal
Modal cho customer hủy đơn hàng với lý do bắt buộc.

```tsx
import { useState } from "react";
import { CancelOrderModal } from "../components/Order";
import { orderApi } from "../api";

function OrderList() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const handleCancelOrder = async (cancelReason: string) => {
    if (!selectedOrder) return;

    try {
      await orderApi.cancelMyOrder(selectedOrder.id, { cancelReason });
      alert("Đơn hàng đã được hủy thành công");
      setShowCancelModal(false);
      // Reload orders
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Không thể hủy đơn hàng");
    }
  };

  return (
    <>
      <button onClick={() => {
        setSelectedOrder(order);
        setShowCancelModal(true);
      }}>
        Hủy đơn
      </button>

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        orderNumber={selectedOrder?.id || 0}
      />
    </>
  );
}
```

### 3. RefundNotificationModal
Hiển thị thông báo hoàn tiền khi customer hủy đơn hàng VNPay đã thanh toán.

```tsx
import { useState } from "react";
import { RefundNotificationModal } from "../components/Order";
import { requiresRefundNotification } from "../utils/orderHelpers";

function OrderActions({ order }: { order: OrderResponse }) {
  const [showRefundModal, setShowRefundModal] = useState(false);

  const handleCancelOrder = async (cancelReason: string) => {
    try {
      await orderApi.cancelMyOrder(order.id, { cancelReason });
      
      // Check if need to show refund notification
      if (requiresRefundNotification(order)) {
        setShowRefundModal(true);
      } else {
        alert("Đơn hàng đã được hủy thành công");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Cancel button */}
      
      <RefundNotificationModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        orderAmount={order.totalAmount}
      />
    </>
  );
}
```

### 4. OrderStatusUpdate
Component cho staff/admin cập nhật trạng thái đơn hàng với validation.

```tsx
import { OrderStatusUpdate } from "../components/Order";
import { orderApi } from "../api";

function AdminOrderDetails({ order }: { order: OrderResponse }) {
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    await orderApi.updateOrder(order.id, { status: newStatus });
    // Reload order
  };

  return (
    <div>
      <h3>Cập nhật trạng thái</h3>
      <OrderStatusUpdate
        currentStatus={order.status}
        onUpdate={handleUpdateStatus}
      />
    </div>
  );
}
```

## 🛠️ Helper Functions

### Validation Functions

```tsx
import {
  canCancelOrder,
  canChangeAddress,
  shouldShowRefundStatus,
  requiresRefundNotification,
} from "../utils/orderHelpers";

// Check if customer can cancel order
if (canCancelOrder(order.status)) {
  // Show cancel button
}

// Check if customer can change address
if (canChangeAddress(order.status)) {
  // Show change address button
}

// Check if should show refund status column (VNPay only)
if (shouldShowRefundStatus(order.payment.method)) {
  // Show payment status column
}

// Check if need to show refund notification
if (requiresRefundNotification(order)) {
  // Show refund notification modal after cancel
}
```

### Status Transition Functions (Staff/Admin)

```tsx
import {
  getNextAllowedStatuses,
  isValidStatusTransition,
  getInvalidTransitionMessage,
} from "../utils/orderHelpers";

// Get next allowed statuses
const allowedStatuses = getNextAllowedStatuses(order.status);
// Returns: ["CONFIRMED", "CANCELLED"] for PENDING status

// Validate status transition before API call
if (!isValidStatusTransition(fromStatus, toStatus)) {
  const errorMessage = getInvalidTransitionMessage(fromStatus, toStatus);
  alert(errorMessage); // "Invalid status transition from PENDING to DELIVERED..."
}
```

### Display Functions

```tsx
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
  formatOrderDate,
  getTotalOrderItems,
} from "../utils/orderHelpers";

// Get Vietnamese label for status
const statusLabel = getOrderStatusLabel("PENDING"); // "Chờ xác nhận"
const paymentLabel = getPaymentStatusLabel("SUCCESS"); // "Đã thanh toán"

// Format date
const formattedDate = formatOrderDate(order.createdAt); // "24/11/2025 19:30"

// Get total items
const totalItems = getTotalOrderItems(order); // Sum of all item quantities
```

## 🔄 Complete Order Flow Examples

### Customer Order Creation with VNPay

```tsx
import { useState } from "react";
import { orderApi, paymentApi } from "../api";

function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");
  const [address, setAddress] = useState("");

  const handleCheckout = async () => {
    try {
      // 1. Create order
      const order = await orderApi.createOrder({ address });

      if (paymentMethod === "VNPAY") {
        // 2. Create payment record
        await paymentApi.createPaymentRecord({
          orderId: order.id,
          method: "VNPAY",
        });

        // 3. Get VNPay URL and redirect
        const paymentUrl = await paymentApi.createVNPayUrl({
          amount: order.totalAmount,
        });
        window.location.href = paymentUrl;
      } else {
        // COD - redirect to order confirmation
        window.location.href = `/orders/${order.id}`;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  return (
    <div>
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "COD" | "VNPAY")}>
        <option value="COD">Ship COD</option>
        <option value="VNPAY">VNPay</option>
      </select>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Địa chỉ giao hàng"
      />
      <button onClick={handleCheckout}>Đặt hàng</button>
    </div>
  );
}
```

### VNPay Return Handler

```tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentApi } from "../api";

function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentReturn = async () => {
      const responseCode = searchParams.get("vnp_ResponseCode");

      if (paymentApi.isPaymentSuccessful(responseCode || "")) {
        // Payment successful - mark as done
        const paymentId = parseInt(searchParams.get("vnp_TxnRef") || "0");
        await paymentApi.markPaymentDone(paymentId);
        
        alert("Thanh toán thành công!");
        navigate("/orders");
      } else {
        alert("Thanh toán thất bại!");
        navigate("/cart");
      }
    };

    handlePaymentReturn();
  }, [searchParams, navigate]);

  return <div>Đang xử lý thanh toán...</div>;
}
```

### Staff/Admin Mark Payment as Refunded

```tsx
import { canMarkAsRefunded } from "../utils/orderHelpers";
import { paymentApi } from "../api";

function AdminOrderDetails({ order }: { order: OrderResponse }) {
  const handleMarkRefunded = async () => {
    if (!canMarkAsRefunded(order.payment.status)) {
      alert("Chỉ có thể đánh dấu hoàn tiền khi trạng thái là REFUNDING");
      return;
    }

    try {
      await paymentApi.markPaymentRefunded(order.payment.id);
      alert("Đã đánh dấu hoàn tiền thành công");
      // Reload order
    } catch (error) {
      console.error(error);
      alert("Không thể cập nhật trạng thái hoàn tiền");
    }
  };

  return (
    <>
      {order.payment.method === "VNPAY" && order.payment.status === "REFUNDING" && (
        <button
          onClick={handleMarkRefunded}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Đánh dấu đã hoàn tiền
        </button>
      )}
    </>
  );
}
```

## 🎨 UI/UX Recommendations

### Customer Order List
- Tabs: "Tất cả", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"
- Show cancel button only when `canCancelOrder(status)` returns true
- Show change address button only when `canChangeAddress(status)` returns true
- Show payment status for VNPay orders

### Staff/Admin Order Management
- Filter by status and payment status
- Use `OrderStatusUpdate` component with built-in validation
- Show "Đánh dấu đã hoàn tiền" button when payment status is REFUNDING
- Display cancel reason when order is cancelled
- Highlight orders with REFUNDING status for attention

### Order Details Timeline
```tsx
const orderTimeline = [
  { status: "PENDING", label: "Chờ xác nhận", active: true },
  { status: "CONFIRMED", label: "Đã xác nhận", active: false },
  { status: "PROCESSING", label: "Đang xử lý", active: false },
  { status: "DELIVERING", label: "Đang giao", active: false },
  { status: "DELIVERED", label: "Hoàn thành", active: false },
];
```

## ⚠️ Important Notes

1. **Status Transition Validation**: Frontend validates before API call, but backend also validates. Frontend should show clear error messages.

2. **Stock Quantity**: Only decreases when order status changes to DELIVERING.

3. **Cancel Restrictions**: Customer can only cancel at PENDING/CONFIRMED/PROCESSING.

4. **Refund Flow**: 
   - Customer cancels VNPay order (already paid) → Payment status becomes REFUNDING
   - Show refund notification modal
   - Staff processes refund → Call `markPaymentRefunded()` → Status becomes REFUNDED

5. **Payment Method Display**: Only show payment status column for VNPay orders using `shouldShowRefundStatus()`.

6. **Error Handling**: Always show user-friendly error messages and handle backend validation errors gracefully.
