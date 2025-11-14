// Order API Types

/**
 * Order Status Enum
 */
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

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
  method: string;
  status: string;
  amount: number;
  paidAt: string; // ISO date string
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
 * Update Order Request
 */
export type UpdateOrderRequest = {
  status: OrderStatus;
  address: string;
};
