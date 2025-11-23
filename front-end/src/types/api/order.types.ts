// Order API Types

/**
 * Order Status Enum
 */
export type OrderStatus =
  | "PENDING" // COD: Pending approval
  | "PENDING_PAYMENT" // VNPay: Waiting for payment
  | "CONFIRMED" // Approved by staff/admin
  | "PREPARING" // Being prepared
  | "DELIVERING" // Out for delivery
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
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  paidAt: string; // ISO date string
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
