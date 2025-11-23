import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";
import { HiLightBulb } from "react-icons/hi";

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
  } = cartDetails;
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [outOfStockWarning, setOutOfStockWarning] = useState(false);

  // Calculate allSelected only for available items (not out of stock)
  const availableItems = itemsWithDetails.filter((item) => item.stockQuantity > 0);
  const allSelected = availableItems.length > 0 &&
    availableItems.every((item) => item.selected);

  // Auto-deselect out of stock items
  useEffect(() => {
    const hasOutOfStock = itemsWithDetails.some(
      (item) => item.stockQuantity <= 0 && item.selected
    );
    if (hasOutOfStock) {
      itemsWithDetails.forEach((item) => {
        if (item.stockQuantity <= 0 && item.selected) {
          toggleSelectItem(item.id, item.type as "book" | "series");
        }
      });
      setOutOfStockWarning(true);
      setTimeout(() => setOutOfStockWarning(false), 5000);
    }
  }, [itemsWithDetails, toggleSelectItem]);

  const handleQuantityChange = async (
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

    try {
      await updateQuantity(id, type, validQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleQuantityBlur = async (
    id: string,
    type: "book" | "series",
    currentQuantity: number
  ) => {
    const key = `${type}-${id}`;
    const inputValue = quantityInputs[key];

    if (!inputValue || inputValue === "") {
      // Reset to current quantity if empty
      setQuantityInputs({ ...quantityInputs, [key]: currentQuantity.toString() });
      try {
        await updateQuantity(id, type, currentQuantity);
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    }
  };

  const handleButtonQuantityChange = async (
    id: string,
    type: "book" | "series",
    newQuantity: number
  ) => {
    const key = `${type}-${id}`;
    setQuantityInputs({ ...quantityInputs, [key]: newQuantity.toString() });
    try {
      await updateQuantity(id, type, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="px-4 py-12 grow bg-linear-to-br from-beige-50 via-white to-beige-100 sm:px-6 lg:px-8">
        <div className="pb-12 mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 text-center">
            {outOfStockWarning && (
              <div className="p-4 mb-6 border-l-4 border-red-500 rounded-lg bg-red-50 animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">
                    Some items are out of stock and have been deselected from your order.
                  </p>
                </div>
              </div>
            )}
            <h1 className="mb-2 text-4xl font-bold text-beige-900">
              Shopping Cart
            </h1>
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
              <div className="min-h-0 space-y-4 lg:col-span-2">
                {/* Select All Bar */}
                <div className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-xl border-beige-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      title="Select all available items"
                      className="w-5 h-5 border-2 rounded cursor-pointer text-beige-700 border-beige-300 focus:ring-2 focus:ring-beige-500"
                    />
                    <span className="font-medium text-beige-900">
                      Select All ({selectedCount}/{availableItems.length})
                    </span>
                    {itemsWithDetails.length > availableItems.length && (
                      <span className="text-xs text-red-600">
                        ({itemsWithDetails.length - availableItems.length} out of stock)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await removeSelectedItems();
                      } catch (error) {
                        console.error("Failed to remove selected items:", error);
                      }
                    }}
                    disabled={selectedCount === 0}
                    className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-beige-700 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove Selected
                  </button>
                </div>

                {/* Cart Items */}
                {itemsWithDetails
                  .sort((a, b) => {
                    // Sort: in-stock items first, out-of-stock items last
                    const aOutOfStock = a.stockQuantity <= 0;
                    const bOutOfStock = b.stockQuantity <= 0;
                    if (aOutOfStock === bOutOfStock) return 0;
                    return aOutOfStock ? 1 : -1;
                  })
                  .map((item) => {
                    const key = `${item.type}-${item.id}`;
                    const displayQuantity = quantityInputs[key] !== undefined
                      ? quantityInputs[key]
                      : item.quantity.toString();
                    const isOutOfStock = item.stockQuantity <= 0;

                    return (
                      <div
                        key={key}
                        className={`grid grid-cols-3 gap-4 p-4 transition-all duration-300 border shadow-sm rounded-xl relative ${isOutOfStock
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : item.selected
                            ? "bg-white border-beige-300 hover:shadow-md"
                            : "bg-white border-beige-100 hover:shadow-md"
                          }`}
                      >
                        {/* Out of Stock Badge - Left side */}
                        {/* {isOutOfStock && (
                        <div className="absolute z-10 top-2 left-2">
                          <div className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 border border-red-300 rounded-full">
                            <FaExclamationTriangle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </div>
                        </div>
                      )} */}
                        {/* Remove Button - Top right, always visible */}
                        <button
                          onClick={async () => {
                            try {
                              await removeFromCart(item.id, item.type as "book" | "series");
                            } catch (error) {
                              console.error("Failed to remove item:", error);
                            }
                          }}
                          className="absolute z-10 p-2 text-red-500 transition-all duration-200 bg-white border border-red-200 rounded-full shadow-sm top-2 right-2 hover:bg-red-50 hover:text-red-600 active:scale-95"
                          aria-label="Remove item from cart"
                          title="Remove from cart"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                        {/* Column 1: Checkbox + Image */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelectItem(item.id, item.type as "book" | "series")}
                            disabled={isOutOfStock}
                            className={`w-5 h-5 border-2 rounded text-beige-700 border-beige-300 focus:ring-2 focus:ring-beige-500 ${isOutOfStock ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                              }`}
                            aria-label={`Select ${item.title}`}
                            title={isOutOfStock ? "Cannot select out of stock items" : ""}
                          />
                          <div className="relative group">
                            {item.image && item.image !== "/placeholder-book.jpg" ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                onError={(e) => {
                                  console.error("Failed to load image:", item.image);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                                className={`object-cover w-24 h-32 rounded-md border border-beige-200 bg-gray-100 ${isOutOfStock ? "grayscale" : ""
                                  }`}
                              />
                            ) : null}
                            <div className={`${item.image && item.image !== "/placeholder-book.jpg" ? 'hidden' : ''} w-24 h-32 rounded-md border border-beige-200 bg-linear-to-br from-beige-100 to-beige-200 flex items-center justify-center`}>
                              <svg className="w-12 h-12 text-beige-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Product Info */}
                        <div className="flex flex-col justify-start">
                          <Link to={`/${item.type}/${item.id}/${item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}>
                            <h2 className="mb-1 text-base font-bold transition-colors cursor-pointer text-beige-900 line-clamp-2 hover:text-beige-700">
                              {item.title}
                            </h2>
                          </Link>
                          <div className="mb-1">
                            <span className="text-lg font-semibold text-beige-700">
                              ${item.price.toFixed(2)}
                            </span>
                            {item.originalPrice && item.promotionPercentage && (
                              <>
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                                <span className="ml-2 text-xs font-medium text-green-600">
                                  ({item.promotionPercentage}%)
                                </span>
                              </>
                            )}
                          </div>
                          {item.categoryName && (
                            <p className="mb-1 text-xs text-beige-500">
                              Category: {item.categoryName}
                            </p>
                          )}

                          <p className={`mb-2 text-xs ${isOutOfStock ? "text-red-600 font-semibold" : "text-beige-500"
                            }`}>
                            Stock: {isOutOfStock ? "Out of Stock" : item.stockQuantity}
                          </p>

                          {/* Quantity Input */}
                          {isOutOfStock ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-400">Quantity:</span>
                              <div className="px-3 py-1 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-lg">
                                Not available
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-row items-center gap-2">
                              <label className="text-sm font-medium text-beige-600">
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
                                  className="flex items-center justify-center transition-all duration-200 border rounded-lg w-7 h-7 border-beige-300 text-beige-700 hover:bg-beige-50 hover:border-beige-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  className="w-10 px-2 py-1 text-center border-0 outline-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                  className="flex items-center justify-center transition-all duration-200 border rounded-lg w-7 h-7 border-beige-300 text-beige-700 hover:bg-beige-50 hover:border-beige-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>
                              {item.quantity >= item.stockQuantity && (
                                <p className="flex items-center text-xs text-red-500 whitespace-nowrap">Max stock reached</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Column 3: Total Price (right aligned) */}
                        <div className="flex flex-col items-end justify-end">
                          {/* Total Price */}
                          <p className={`text-xl font-bold ${isOutOfStock ? "text-gray-400 line-through" : "text-beige-900"
                            }`}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky p-8 bg-white border shadow-lg top-24 rounded-2xl border-beige-100 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
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
                      <div className="pb-4 mb-4 space-y-3 overflow-y-auto border-b border-beige-100 max-h-60">
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

                        {promotionDiscount > 0 ? (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium">
                              Promotion ({((promotionDiscount / subtotal) * 100).toFixed(0)}%)
                            </span>
                            <span className="font-semibold">
                              -${promotionDiscount.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-gray-400">
                            <span className="font-medium">
                              Promotion (%)
                            </span>
                            <span className="font-semibold">
                              -$0.00
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
                          <p className="flex items-center gap-1 text-xs text-beige-500">
                            <HiLightBulb className="w-4 h-4 text-yellow-500" />
                            <span>Add ${(50 - subtotal).toFixed(2)} more for free shipping!</span>
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between py-4 mb-6 text-xl font-bold text-beige-900">
                        <span className="font-heading">Total</span>
                        <span className="text-2xl">${total.toFixed(2)}</span>
                      </div>

                      {/* Payment Buttons */}
                      <div className="space-y-3">
                        <Link to="/order">
                          <button
                            className="w-full py-4 text-lg font-semibold text-white transition-all duration-300 transform shadow-md rounded-xl bg-beige-700 hover:bg-beige-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                            disabled={selectedItems.length === 0}
                          >
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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
