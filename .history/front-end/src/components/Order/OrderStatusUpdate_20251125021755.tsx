import { useState } from "react";
import type { OrderStatus } from "../../types";
import { orderApi } from "../../api";
import {
  getNextAllowedStatuses,
  getOrderStatusLabel,
  isValidStatusTransition,
  getInvalidTransitionMessage,
} from "../../utils/orderHelpers";

interface OrderStatusUpdateProps {
  orderId: number;
  currentStatus: OrderStatus;
  onUpdate?: (newStatus: OrderStatus) => Promise<void>;
  disabled?: boolean;
}

/**
 * Order Status Update Component
 * Allows staff/admin to update order status
 * Enforces proper status flow and prevents invalid transitions
 */
export function OrderStatusUpdate({
  currentStatus,
  onUpdate,
  disabled = false,
}: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedStatuses = getNextAllowedStatuses(currentStatus);

  const handleUpdate = async () => {
    if (!selectedStatus) {
      setError("Please select a new status");
      return;
    }

    // Validate transition
    if (!isValidStatusTransition(currentStatus, selectedStatus)) {
      setError(getInvalidTransitionMessage(currentStatus, selectedStatus));
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onUpdate(selectedStatus);
      setSelectedStatus("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (allowedStatuses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Order is in a final state and cannot be changed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label
          htmlFor="statusSelect"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Update Order Status
        </label>

        <div className="flex gap-3">
          <select
            id="statusSelect"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as OrderStatus);
              setError("");
            }}
            disabled={disabled || isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Select New Status --</option>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {getOrderStatusLabel(status)}
              </option>
            ))}
          </select>

          <button
            onClick={handleUpdate}
            disabled={!selectedStatus || disabled || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              "Update"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mr-2 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> Status can only be changed following the proper workflow: PENDING → CONFIRMED → PROCESSING → DELIVERING → DELIVERED
          </p>
        </div>
      </div>
    </div>
  );
}
