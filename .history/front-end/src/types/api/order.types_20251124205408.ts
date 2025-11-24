// Order API Types

/**
 * Order Status Enum
 * Flow: PENDING_PAYMENT (VNPay) / PENDING (COD) → CONFIRMED → PROCESSING → DELIVERING → DELIVERED
 * Can cancel: PENDING/CONFIRMED/PROCESSING (before DELIVERING)
 */
export type OrderStatus =
  | "PENDING_PAYMENT" // VNPay: Waiting for payment
  | "PENDING" // COD: Pending approval OR VNPay: Payment completed, waiting for confirmation
  | "CONFIRMED" // Approved by staff/admin
  | "PROCESSING" // Being prepared/processed
  | "DELIVERING" // Out for delivery (stock quantity decreases at this point)
  | "DELIVERED" // Completed
  | "CANCELLED" // Cancelled
  | "RETURNED"; // Returned

/**
 * Order Item
 */
export type OrderItem = {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
};

/**
 * Payment Info
 */
export type OrderPayment = {
  id: number;
  orderId: number;
  method: "COD" | "VNPAY";
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDING" | "REFUNDED";
  amount: number;
  paidAt: string | null; // ISO date string, null if not paid yet
  createdAt: string; // ISO date string
};

/**
 * Order Response
 */
export type OrderResponse = {
  id: number;
  userId: string;
  userName: string;
  status: OrderStatus;
  totalAmount: number;
  address: string;
  createdAt: string; // ISO date string
  active: boolean;
  cancelReason?: string; // Reason for cancellation (if status is CANCELLED)
  orderItems: OrderItem[];
  payment: OrderPayment;
};

/**
 * Create Order Request
 */
export type CreateOrderRequest = {
  address: string;
};

/**
 * Update Order Request (for staff/admin)
 */
export type UpdateOrderRequest = {
  status: OrderStatus;
  cancelReason?: string;
};

/**
 * Change Address Request (for customer)
 */
export type ChangeAddressRequest = {
  address: string;
};

/**
 * Cancel Order Request (for customer)
 * Required when cancelling order - must provide reason
 */
export type CancelOrderRequest = {
  cancelReason: string;
};
