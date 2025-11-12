import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { booksApi } from "../../api";
import type { Book } from "../../types";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";

export function Cart() {
  const { cart, isLoading, error, updateItemQuantity, clearItem, cartTotal } =
    useCart();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [editingQuantity, setEditingQuantity] = useState<{
    [key: number]: string;
  }>({});
  const [bookDetails, setBookDetails] = useState<{ [key: number]: Book }>({});
  const [loadingImages, setLoadingImages] = useState(true);

  // Calculate selected items total
  const selectedTotal =
    cart?.cartItems
      ?.filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.subtotal, 0) || 0;

  const selectedItemsCount = selectedItems.size;

  // Fetch book details for all items in cart
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!cart?.cartItems || cart.cartItems.length === 0) {
        setLoadingImages(false);
        return;
      }

      setLoadingImages(true);
      const details: { [key: number]: Book } = {};

      // Fetch all book details in parallel
      await Promise.all(
        cart.cartItems.map(async (item) => {
          try {
            const book = await booksApi.getById(item.bookId);
            details[item.bookId] = book;
            console.log(`✅ Loaded book ${item.bookId}:`, book.image);
          } catch (err) {
            console.error(`❌ Failed to fetch book ${item.bookId}:`, err);
          }
        })
      );

      setBookDetails(details);
      setLoadingImages(false);
      console.log("📚 All book details loaded:", details);
    };

    // Only fetch if we don't have details yet
    const needsFetch = cart?.cartItems?.some(
      (item) => !bookDetails[item.bookId]
    );
    if (needsFetch) {
      fetchBookDetails();
    }
  }, [cart?.cartItems?.length]); // Only re-fetch when items count changes

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
        <div className="mx-auto max-w-7xl">
          {/* Header with title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-beige-900">Your Cart</h1>
              {!isEmpty && (
                <span className="text-sm text-beige-600">
                  {selectedItems.size}/{cartItems.length} items selected
                </span>
              )}
            </div>
          </div>

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
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="space-y-4 lg:col-span-2">
                {/* Select All + Remove Selected - Fixed Height */}
                <div className="flex items-center justify-between h-16 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === cartItems.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded cursor-pointer text-beige-700 focus:ring-beige-500"
                    />
                    <span className="font-semibold text-beige-900">
                      Select All ({cartItems.length} items)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveSelected}
                    disabled={selectedItems.size === 0}
                    className={`px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg ${
                      selectedItems.size > 0
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Remove Selected {selectedItems.size > 0 && `(${selectedItems.size})`}
                  </button>
                </div>

                {/* Cart Items List */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-lg shadow-sm"
                  >
                    {/* Checkbox - Centered */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 rounded cursor-pointer text-beige-700 focus:ring-beige-500"
                      />
                    </div>

                    {/* Book Image */}
                    <Link
                      to={`/book/${item.bookId}/philosophers-stone`}
                      className="flex-shrink-0"
                    >
                      {loadingImages && !bookDetails[item.bookId] ? (
                        <div className="flex items-center justify-center w-24 h-32 bg-gray-200 rounded-md">
                          <span className="text-xs text-gray-500">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <img
                          src={
                            bookDetails[item.bookId]?.image?.replace(
                              "/src/assets",
                              ""
                            ) || "/img/book/placeholder.png"
                          }
                          alt={item.bookTitle}
                          className="object-cover w-24 h-32 transition-opacity rounded-md hover:opacity-80"
                          onError={(e) => {
                            console.log(
                              "❌ Image load failed:",
                              e.currentTarget.src
                            );
                            e.currentTarget.src = "/img/book/placeholder.png";
                          }}
                          onLoad={() => {
                            console.log(
                              "✅ Image loaded:",
                              bookDetails[item.bookId]?.image
                            );
                          }}
                        />
                      )}
                    </Link>

                    {/* Item Details */}
                    <div className="flex-grow">
                      <Link
                        to={`/book/${item.bookId}/philosophers-stone`}
                        className="block hover:text-beige-700"
                      >
                        <h2 className="font-bold text-beige-900">
                          {item.bookTitle}
                        </h2>
                      </Link>
                      <p className="mt-1 text-sm text-beige-600">
                        Price: ${item.price.toFixed(2)}
                      </p>
                      {/* Quantity + Remove in same row */}
                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                item.bookId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 transition-colors hover:bg-beige-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={
                              editingQuantity[item.id] !== undefined
                                ? editingQuantity[item.id]
                                : item.quantity
                            }
                            onChange={(e) =>
                              handleQuantityInputChange(item.id, e.target.value)
                            }
                            onBlur={() => handleQuantityBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-16 px-2 py-1 text-center border-x focus:outline-none focus:ring-2 focus:ring-beige-500"
                          />
                          <button
                            onClick={() =>
                              updateItemQuantity(item.bookId, item.quantity + 1)
                            }
                            className="px-3 py-1 transition-colors hover:bg-beige-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Right side: Quantity Controls + Price + Remove */}
                      <div className="flex flex-col items-end justify-between gap-3">
                        {/* Price */}
                        <p className="text-lg font-bold text-beige-900">
                          ${item.subtotal.toFixed(2)}
                        </p>

                        {/* Remove Button */}
                        <button
                          onClick={() => clearItem(item.bookId)}
                          className="text-sm font-medium text-red-500 transition-colors hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-6 bg-white rounded-lg shadow-sm lg:col-span-1 h-fit">
                <h2 className="mb-4 text-xl font-bold text-beige-900">
                  Order Summary
                </h2>

                {selectedItemsCount === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-beige-600">
                      Please select items to checkout
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-beige-600">
                        <span>Selected Items</span>
                        <span>{selectedItemsCount} item(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${selectedTotal.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${selectedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Link to="/checkout">
                      <button className="w-full py-3 mt-6 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800">
                        Place Order
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
