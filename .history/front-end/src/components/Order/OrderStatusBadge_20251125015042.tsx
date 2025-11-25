import type { OrderStatus } from "../../types";
import {
  getOrderStatusLabel,
  getOrderStatusColor,
} from "../../utils/orderHelpers";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/**
 * Order Status Badge Component
 * Displays order status with appropriate color and label
 */
export function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  const color = getOrderStatusColor(status);
  const label = getOrderStatusLabel(status);

  const colorClasses = {
    default: "bg-gray-100 text-gray-800 border-gray-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    success: "bg-green-100 text-green-800 border-green-300",
    danger: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color]} ${className}`}
    >
      {label}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDING" | "REFUNDED";
  className?: string;
}

/**
 * Payment Status Badge Component
 * Displays payment status with appropriate color and compact label
 */
export function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const badges = {
    PENDING: {
      label: "Awaiting Payment",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    SUCCESS: {
      label: "Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    FAILED: {
      label: "Failed",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    REFUNDING: {
      label: "Refunding",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const { label, className: badgeClassName } = badges[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClassName} ${className}`}
    >
      {label}
    </span>
  );
}
