import type { OrderStatus, OrderResponse } from "../types";

/**
 * Order Helper Functions
 * Business logic for order status transitions and validations
 */

/**
 * Check if customer can cancel the order
 * Can only cancel when status: PENDING, CONFIRMED, or PROCESSING (before DELIVERING)
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return ["PENDING", "CONFIRMED", "PROCESSING"].includes(status);
};

/**
 * Check if customer can change order address
 * Can only change address before order is confirmed for delivery
 */
export const canChangeAddress = (status: OrderStatus): boolean => {
  return ["PENDING", "CONFIRMED", "PROCESSING"].includes(status);
};

/**
 * Check if should show refund status column
 * Only VNPay orders can have refund status
 */
export const shouldShowRefundStatus = (method: "COD" | "VNPAY"): boolean => {
  return method === "VNPAY";
};

/**
 * Check if order requires refund notification popup
 * Show popup when cancelling VNPay order that has been paid (SUCCESS)
 */
export const requiresRefundNotification = (order: OrderResponse): boolean => {
  return (
    order.payment.method === "VNPAY" &&
    order.payment.status === "SUCCESS" &&
    canCancelOrder(order.status)
  );
};

/**
 * Get next allowed status transitions for staff/admin
 * Enforces proper order flow: PENDING → CONFIRMED → PROCESSING → DELIVERING → DELIVERED
 * Returns empty array if no valid transitions available
 */
export const getNextAllowedStatuses = (
  currentStatus: OrderStatus
): OrderStatus[] => {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    PENDING_PAYMENT: ["PENDING", "CANCELLED"], // After payment or cancel
    PENDING: ["CONFIRMED", "CANCELLED"], // Staff confirms or customer cancels
    CONFIRMED: ["PROCESSING", "CANCELLED"], // Start processing or cancel
    PROCESSING: ["DELIVERING", "CANCELLED"], // Ship or cancel
    DELIVERING: ["DELIVERED"], // Only can complete delivery
    DELIVERED: [], // Final state - no transitions
    CANCELLED: [], // Final state - no transitions
    RETURNED: [], // Final state - no transitions
  };

  return statusFlow[currentStatus] || [];
};

/**
 * Validate if status transition is allowed
 * Prevents invalid jumps (e.g., PENDING → DELIVERED)
 */
export const isValidStatusTransition = (
  from: OrderStatus,
  to: OrderStatus
): boolean => {
  const allowedTransitions = getNextAllowedStatuses(from);
  return allowedTransitions.includes(to);
};

/**
 * Get error message for invalid status transition
 */
export const getInvalidTransitionMessage = (
  from: OrderStatus,
  to: OrderStatus
): string => {
  const allowedStatuses = getNextAllowedStatuses(from);

  if (allowedStatuses.length === 0) {
    return `Cannot change status from ${from}. This order is in a final state.`;
  }

  return `Invalid status transition from ${from} to ${to}. Allowed next statuses: ${allowedStatuses.join(
    ", "
  )}`;
};

/**
 * Get display label for order status
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Pending Payment",
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    DELIVERING: "Delivering",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
  };
  return labels[status] || status;
};

/**
 * Get display label for payment status
 */
export const getPaymentStatusLabel = (
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDING" | "REFUNDED"
): string => {
  const labels = {
    PENDING: "Pending",
    SUCCESS: "Paid",
    FAILED: "Failed",
    REFUNDING: "Refunding",
    REFUNDED: "Refunded",
  };
  return labels[status] || status;
};

/**
 * Get color/variant for order status badge
 */
export const getOrderStatusColor = (
  status: OrderStatus
): "default" | "warning" | "success" | "danger" | "info" => {
  const colors: Record<
    OrderStatus,
    "default" | "warning" | "success" | "danger" | "info"
  > = {
    PENDING_PAYMENT: "warning",
    PENDING: "warning",
    CONFIRMED: "info",
    PROCESSING: "info",
    DELIVERING: "info",
    DELIVERED: "success",
    CANCELLED: "danger",
    RETURNED: "danger",
  };
  return colors[status] || "default";
};

/**
 * Get color/variant for payment status badge
 */
export const getPaymentStatusColor = (
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDING" | "REFUNDED"
): "default" | "warning" | "success" | "danger" | "info" => {
  const colors: Record<
    string,
    "default" | "warning" | "success" | "danger" | "info"
  > = {
    PENDING: "warning",
    SUCCESS: "success",
    FAILED: "danger",
    REFUNDING: "warning",
    REFUNDED: "info",
  };
  return (colors[status] || "default") as
    | "default"
    | "warning"
    | "success"
    | "danger"
    | "info";
};

/**
 * Format order date to readable format
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Calculate total items in order
 */
export const getTotalOrderItems = (order: OrderResponse): number => {
  return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Check if staff/admin can mark payment as refunded
 * Only when payment status is REFUNDING
 */
export const canMarkAsRefunded = (
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDING" | "REFUNDED"
): boolean => {
  return paymentStatus === "REFUNDING";
};

/**
 * Get refund notification message
 */
export const getRefundNotificationMessage = (): string => {
  return "Your order has been cancelled successfully. We will contact you within 1-2 business days to process your refund.";
};
