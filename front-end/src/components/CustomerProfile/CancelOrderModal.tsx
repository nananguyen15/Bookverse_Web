import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details: string) => void;
  orderId: string;
}

const cancelReasons = [
  "Want to change delivery address",
  "Want to enter/change voucher code",
  "Want to change products in order (size, color, quantity, etc.)",
  "Payment process is too complicated",
  "Found a better price elsewhere",
  "Changed my mind, don't want to buy anymore",
  "Other",
];

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) {
      alert("Please select a reason for cancellation");
      return;
    }

    if (selectedReason === "Other" && !otherReason.trim()) {
      alert("Please specify the reason for cancellation");
      return;
    }

    const finalReason =
      selectedReason === "Other" ? otherReason : selectedReason;
    onConfirm(selectedReason, finalReason);
    setSelectedReason("");
    setOtherReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-beige-900">Cancel Reason</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-start p-3 mb-4 border rounded-md bg-orange-50 border-orange-300">
            <div className="mr-3 text-orange-500">⚠</div>
            <p className="text-sm text-orange-800">
              Please choose a reason for cancellation. Note: This action will
              cancel all products in the order and cannot be undone.
            </p>
          </div>

          <div className="space-y-2">
            {cancelReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-beige-50"
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3"
                />
                <span className="text-beige-900">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Other" && (
            <div className="mt-4">
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please specify your reason..."
                className="w-full px-3 py-2 border rounded-md border-beige-300 focus:ring-beige-500 focus:border-beige-500"
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 font-medium border rounded-md text-beige-700 border-beige-300 hover:bg-beige-50"
          >
            Go Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
