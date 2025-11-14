import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import { FaShoppingCart, FaTrash } from "react-icons/fa";

export function Cart() {
  const {
    cartDetails,
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll,
    removeSelectedItems,
  } = useCart();

  const {
    itemsWithDetails,
    selectedItems,
    subtotal,
    promotionDiscount,
    shippingFee,
    total,
    selectedCount,
    totalCount,
  } = cartDetails;
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const allSelected = itemsWithDetails.length > 0 && selectedCount === totalCount;

  const handleQuantityChange = (
    id: string,
    type: "book" | "series",
    value: string,
    stockQuantity: number
  ) => {
    // Allow empty string for editing
    if (value === "") {
      setQuantityInputs({ ...quantityInputs, [`${type}-${id}`]: "" });
      return;
    }

    // Validate number
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      return;
    }

    // Cap at stock quantity
    const validQuantity = Math.min(numValue, stockQuantity);
    setQuantityInputs({ ...quantityInputs, [`${type}-${id}`]: validQuantity.toString() });
    updateQuantity(id, type, validQuantity);
  };

  const handleQuantityBlur = (
    id: string,
    type: "book" | "series",
    currentQuantity: number
  ) => {
    const key = `${type}-${id}`;
    const inputValue = quantityInputs[key];

    if (!inputValue || inputValue === "") {
      // Reset to current quantity if empty
      setQuantityInputs({ ...quantityInputs, [key]: currentQuantity.toString() });
      updateQuantity(id, type, currentQuantity);
    }
  };

  const handleButtonQuantityChange = (
    id: string,
    type: "book" | "series",
    newQuantity: number
  ) => {
    const key = `${type}-${id}`;
    setQuantityInputs({ ...quantityInputs, [key]: newQuantity.toString() });
    updateQuantity(id, type, newQuantity);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-linear-to-br from-beige-50 via-white to-beige-100 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-4xl font-bold text-beige-900">
              Shopping Cart
            </h1>
            <p className="text-beige-600">
              {totalCount > 0
                ? `${totalCount} item${totalCount > 1 ? "s" : ""} in your cart`
                : "Your cart is empty"}
            </p>
          </div>

          {itemsWithDetails.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mb-6">
                <FaShoppingCart className="w-24 h-24 mx-auto text-beige-300" />
              </div>
              <p className="mb-2 text-2xl font-semibold text-beige-900">Your cart is empty</p>
              <p className="mb-6 text-beige-600">Looks like you haven't added anything yet</p>
              <Link
                to="/allbooks"
                className="inline-block px-8 py-3 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md bg-beige-700 hover:bg-beige-800 hover:shadow-lg hover:-translate-y-0.5"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column - Cart Items */}
              <div className="space-y-4 lg:col-span-2">
                {/* Select All Bar */}
                <div className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-xl border-beige-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 border-2 rounded cursor-pointer text-beige-700 border-beige-300 focus:ring-2 focus:ring-beige-500"
                    />
                    <span className="font-medium text-beige-900">
                      Select All ({selectedCount}/{totalCount})
                    </span>
                  </div>
                  <button
                    onClick={removeSelectedItems}
                    disabled={selectedCount === 0}
                    className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-beige-700 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove Selected
                  </button>
                </div>

                {/* Cart Items */}
                {itemsWithDetails.map((item) => {
                  const key = `${item.type}-${item.id}`;
                  const displayQuantity = quantityInputs[key] !== undefined
                    ? quantityInputs[key]
                    : item.quantity.toString();

                  return (
                    <div
                      key={key}
                      className={`grid grid-cols-3 gap-4 p-4 transition-all duration-300 bg-white border shadow-sm rounded-xl hover:shadow-md ${item.selected ? "border-beige-300" : "border-beige-100"
                        }`}
                    >
                      {/* Column 1: Checkbox + Image */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id, item.type as "book" | "series")}
                          className="w-5 h-5 border-2 rounded cursor-pointer text-beige-700 border-beige-300 focus:ring-2 focus:ring-beige-500"
                          aria-label={`Select ${item.title}`}
                        />
                        <div className="relative group">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="object-cover w-24 h-32"
                          />
                        </div>
                      </div>

                      {/* Column 2: Product Info */}
                      <div className="flex flex-col justify-start">
                        <Link to={`/product/${item.id}`}>
                          <h2 className="mb-1 text-base font-bold text-beige-900 line-clamp-2 hover:text-beige-700 transition-colors cursor-pointer">
                            {item.title}
                          </h2>
                        </Link>
                        <p className="mb-1 text-lg font-semibold text-beige-700">
                          ${item.price.toFixed(2)}
                        </p>
                        {item.categoryName && (
                          <p className="mb-1 text-xs text-beige-500">
                            Category: {item.categoryName}
                          </p>
                        )}

                        <p className="mb-2 text-xs text-beige-500">
                          Stock: {item.stockQuantity}
                        </p>

                        {/* Quantity Input */}
                        <div className="flex flex-row gap-2">
                          <label className="text-sm font-medium text-beige-600 items-center flex">
                            Quantity:
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleButtonQuantityChange(
                                  item.id,
                                  item.type as "book" | "series",
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="flex items-center justify-center w-7 h-7 transition-all duration-200 border rounded-lg border-beige-300 text-beige-700 hover:bg-beige-50 hover:border-beige-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stockQuantity}
                              value={displayQuantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  item.type as "book" | "series",
                                  e.target.value,
                                  item.stockQuantity
                                )
                              }
                              onBlur={() =>
                                handleQuantityBlur(
                                  item.id,
                                  item.type as "book" | "series",
                                  item.quantity
                                )
                              }
                              className="w-16 px-2 py-1 text-center border-0 outline-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              aria-label="Item quantity"
                            />
                            <button
                              onClick={() =>
                                handleButtonQuantityChange(
                                  item.id,
                                  item.type as "book" | "series",
                                  Math.min(item.quantity + 1, item.stockQuantity)
                                )
                              }
                              disabled={item.quantity >= item.stockQuantity}
                              className="flex items-center justify-center w-7 h-7 transition-all duration-200 border rounded-lg border-beige-300 text-beige-700 hover:bg-beige-50 hover:border-beige-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          {item.quantity >= item.stockQuantity && (
                            <p className="text-xs text-red-500 whitespace-nowrap items-center">Max stock reached</p>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Remove Icon (top) + Total Price (bottom) */}
                      <div className="flex flex-col items-end justify-between">
                        {/* Remove Icon Button */}
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.type as "book" | "series")
                          }
                          className="p-2 text-red-500 transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-600 active:scale-95"
                          aria-label="Remove item from cart"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>

                        {/* Total Price */}
                        <p className="text-xl font-bold text-beige-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column - Order Summary */}
              <div className="sticky p-8 bg-white border shadow-lg top-24 rounded-2xl border-beige-100 lg:col-span-1 h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-beige-900">
                    Order Summary
                  </h2>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full text-beige-700 bg-beige-100">
                    {selectedCount} selected
                  </span>
                </div>

                {/* Selected Items List */}
                {selectedItems.length > 0 ? (
                  <>
                    <div className="pb-4 mb-4 space-y-3 border-b border-beige-100 max-h-60 overflow-y-auto">
                      {selectedItems.map((item) => (
                        <div
                          key={`summary-${item.type}-${item.id}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-beige-700">
                            {item.quantity} × {item.title}
                          </span>
                          <span className="font-semibold text-beige-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pb-4 mb-4 space-y-4 border-b border-beige-100">
                      <div className="flex justify-between text-beige-700">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>

                      {promotionDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span className="font-medium">
                            Promotion ({((promotionDiscount / subtotal) * 100).toFixed(0)}%)
                          </span>
                          <span className="font-semibold">
                            -${promotionDiscount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-beige-700">
                        <span className="font-medium">Delivery Charge</span>
                        <span className="font-semibold">
                          {shippingFee === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `$${shippingFee.toFixed(2)}`
                          )}
                        </span>
                      </div>

                      {subtotal < 50 && subtotal > 0 && (
                        <p className="text-xs text-beige-500">
                          💡 Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between py-4 mb-6 text-xl font-bold text-beige-900">
                      <span>Total</span>
                      <span className="text-2xl">${total.toFixed(2)}</span>
                    </div>

                    {/* Payment Buttons */}
                    <div className="space-y-3">
                      <Link to="/checkout">
                        <button className="w-full py-4 text-lg font-semibold text-white transition-all duration-300 transform shadow-md rounded-xl bg-beige-700 hover:bg-beige-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                          Place Order
                        </button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <p className="mb-2 text-beige-600">No items selected</p>
                    <p className="text-sm text-beige-500">
                      Select items to see order summary
                    </p>
                  </div>
                )}

                <Link to="/allbooks">
                  <button className="w-full py-3 mt-4 font-medium transition-colors border-2 rounded-xl text-beige-700 border-beige-300 hover:bg-beige-50">
                    ← Continue Shopping
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
