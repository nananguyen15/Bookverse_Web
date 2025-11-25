import { getRefundNotificationMessage } from "../../utils/orderHelpers";

interface RefundNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderAmount: number;
}

/**
 * Refund Notification Modal
 * Shows notification when customer cancels a VNPay order that has been paid
 * Informs customer that refund will be processed in 1-2 business days
 */
export function RefundNotificationModal({
  isOpen,
  onClose,
  orderAmount,
}: RefundNotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Refund Notification
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-gray-700">
              {getRefundNotificationMessage()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Refund Amount:</span>
              <span className="text-lg font-semibold text-gray-900">
                ${orderAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Please keep your registered phone number available</li>
              <li>Refund processing time: 1-2 business days</li>
              <li>
                The refund will be returned to the account/card used for payment
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
