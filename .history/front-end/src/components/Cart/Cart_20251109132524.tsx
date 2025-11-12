import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";

export function Cart() {
  const { cart, isLoading, error, updateItemQuantity, clearItem, cartTotal } =
    useCart();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [editingQuantity, setEditingQuantity] = useState<{
    [key: number]: string;
  }>({});

  const handleSelectItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmDelete = window.confirm(
      `Remove ${selectedItems.size} selected item(s) from cart?`
    );
    if (!confirmDelete) return;

    try {
      for (const itemId of selectedItems) {
        const item = cartItems.find((i) => i.id === itemId);
        if (item) {
          await clearItem(item.bookId);
        }
      }
      setSelectedItems(new Set());
    } catch (err) {
      console.error("Failed to remove items:", err);
    }
  };

  const handleQuantityInputChange = (itemId: number, value: string) => {
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setEditingQuantity((prev) => ({ ...prev, [itemId]: value }));
    }
  };

  const handleQuantityBlur = async (item: any) => {
    const inputValue = editingQuantity[item.id];
    if (inputValue === undefined || inputValue === "") {
      // Reset to current quantity if empty
      setEditingQuantity((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
      return;
    }

    const newQuantity = parseInt(inputValue, 10);
    
    // Validate: must be positive and not exceed stock
    // Note: We don't have stock info in cart item, so just validate > 0
    if (newQuantity <= 0) {
      alert("Quantity must be at least 1");
      setEditingQuantity((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
      return;
    }

    if (newQuantity !== item.quantity) {
      try {
        await updateItemQuantity(item.bookId, newQuantity);
      } catch (err) {
        console.error("Failed to update quantity:", err);
        alert("Failed to update quantity. Please try again.");
      }
    }

    setEditingQuantity((prev) => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-beige-700">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-red-600">Error: {error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const cartItems = cart?.cartItems || [];
  const isEmpty = cartItems.length === 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center text-beige-900">
            Your Cart
          </h1>

          {isEmpty ? (
            <div className="text-center">
              <p className="mb-4 text-lg text-beige-700">Your cart is empty.</p>
              <Link
                to="/allbooks"
                className="px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="space-y-6 lg:col-span-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex-grow">
                      <h2 className="font-bold text-beige-900">
                        {item.bookTitle}
                      </h2>
                      <p className="text-sm text-beige-600">
                        Price: ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateItemQuantity(
                              item.bookId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-2 py-1 border rounded hover:bg-beige-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.bookId, item.quantity + 1)
                          }
                          className="px-2 py-1 border rounded hover:bg-beige-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-beige-900">
                        ${item.subtotal.toFixed(2)}
                      </p>
                      <button
                        onClick={() => clearItem(item.bookId)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-6 bg-white rounded-lg shadow-sm lg:col-span-1 h-fit">
                <h2 className="mb-4 text-xl font-bold text-beige-900">
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout">
                  <button className="w-full py-3 mt-6 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800">
                    Place Order
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
