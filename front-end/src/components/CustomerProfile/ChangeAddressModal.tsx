import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ChangeAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newAddress: string) => void;
  currentAddress: string;
  orderId: string;
}

export function ChangeAddressModal({
  isOpen,
  onClose,
  onConfirm,
  currentAddress,
  orderId,
}: ChangeAddressModalProps) {
  const [newAddress, setNewAddress] = useState(currentAddress);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!newAddress.trim()) {
      alert("Please enter a valid address");
      return;
    }

    onConfirm(newAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-beige-900">
            Change Delivery Address
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
            title="Close"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-start p-3 mb-4 border rounded-md bg-blue-50 border-blue-300">
            <div className="mr-3 text-blue-500">ℹ</div>
            <p className="text-sm text-blue-800">
              Order #{orderId} - You can change the delivery address before the
              order is shipped.
            </p>
          </div>

          <div>
            <label
              htmlFor="newAddress"
              className="block mb-2 text-sm font-medium text-beige-900"
            >
              New Delivery Address
            </label>
            <textarea
              id="newAddress"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter your new delivery address..."
              className="w-full px-3 py-2 border rounded-md border-beige-300 focus:ring-beige-500 focus:border-beige-500"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 font-medium border rounded-md text-beige-700 border-beige-300 hover:bg-beige-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}
