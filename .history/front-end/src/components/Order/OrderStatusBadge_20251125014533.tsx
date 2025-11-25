import type { OrderStatus } from "../../types";
import {
  getOrderStatusLabel,
  getOrderStatusColor,
} from "../../utils/orderHelpers";
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaMoneyBillWave 
} from "react-icons/fa";

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
 * Displays payment status with appropriate color and label with icons
 */
export function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const badges = {
    PENDING: {
      label: "Awaiting Payment",
      icon: FaClock,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    SUCCESS: {
      label: "Paid",
      icon: FaCheckCircle,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    FAILED: {
      label: "Payment Failed",
      icon: FaTimesCircle,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    REFUNDING: {
      label: "Refunding",
      icon: FaExclamationTriangle,
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    REFUNDED: {
      label: "Refunded",
      icon: FaMoneyBillWave,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const { label, icon: Icon, className: badgeClassName } = badges[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${badgeClassName} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
