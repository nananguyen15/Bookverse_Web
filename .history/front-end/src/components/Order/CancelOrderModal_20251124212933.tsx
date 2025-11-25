import { useState } from "react";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cancelReason: string) => void;
  orderNumber: number;
  isLoading?: boolean;
}

/**
 * Cancel Order Modal
 * Allows customer to cancel order with a required reason
 * Shows for orders with status: PENDING, CONFIRMED, or PROCESSING
 */
export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}: CancelOrderModalProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Validate reason
    if (!cancelReason.trim()) {
      setError("Please enter a cancellation reason");
      return;
    }

    if (cancelReason.trim().length < 10) {
      setError("Cancellation reason must be at least 10 characters");
      return;
    }

    setError("");
    onConfirm(cancelReason.trim());
  };

  const handleClose = () => {
    setCancelReason("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Cancel Order
              </h3>
              <p className="text-sm text-gray-500">Order #{orderNumber}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> After cancelling, this action cannot be undone. Please provide a reason to help us improve our service.
            </p>
          </div>

          <div>
            <label
              htmlFor="cancelReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              placeholder="Please enter your reason for cancellation (minimum 10 characters)..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-2 text-xs text-gray-500">
              {cancelReason.length}/500 characters
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900">
              Common Reasons:
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Found a better price",
                "Changed my mind",
                "Ordered wrong item",
                "Delivery time too long",
                "Need to change delivery address",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setCancelReason(reason)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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
                Processing...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
