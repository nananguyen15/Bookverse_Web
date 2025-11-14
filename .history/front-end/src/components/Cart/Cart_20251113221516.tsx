import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import { FaShoppingCart } from "react-icons/fa";
import { paymentApi } from "../../api";

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
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleVNPayPayment = async () => {
    if (itemsWithDetails.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setPaymentLoading(true);
    try {
      // Create payment with VNPay
      const { paymentUrl } = await paymentApi.createPayment({
        amount: Math.round(total * 100), // Convert to cents and round
        orderInfo: `Thanh toan don hang BookVerse - ${itemsWithDetails.length} items`,
      });

      // Redirect to VNPay
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Could not create payment. Please try again.");
      setPaymentLoading(false);
    }
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
              {/* Cart Items */}
              <div className="space-y-4 lg:col-span-2">
                {itemsWithDetails.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex gap-6 p-6 transition-all duration-300 bg-white border shadow-sm rounded-xl border-beige-100 hover:shadow-md hover:border-beige-200"
                  >
                    <div className="relative shrink-0 group">
                      <img
                        src={item.image}
                        alt={item.}
                        className="object-cover transition-transform duration-300 w-28 h-36 rounded-lg group-hover:scale-105"
                      />
                      <div className="absolute inset-0 transition-opacity bg-black rounded-lg opacity-0 group-hover:opacity-5"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="mb-2 text-lg font-bold text-beige-900 line-clamp-2">{item.name}</h2>
                      <p className="mb-4 text-xl font-semibold text-beige-700">
                        ${item.price.toFixed(2)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-beige-600">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.type as "book" | "series",
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-lg border-beige-300 text-beige-700 hover:bg-beige-50 hover:border-beige-400 active:scale-95"
                          >
                            -
                          </button>
                          <span className="w-12 text-lg font-semibold text-center text-beige-900">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.type as "book" | "series",
                                item.quantity + 1
                              )
                            }
                            className="flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-lg border-beige-300 text-beige-700 hover:bg-beige-50 hover:border-beige-400 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <p className="text-2xl font-bold text-beige-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id, item.type as "book" | "series")}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-red-500 rounded-lg hover:bg-red-600 active:scale-95"
                      >
                        <span>🗑️</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="sticky p-8 bg-white border shadow-lg top-24 rounded-2xl border-beige-100 lg:col-span-1 h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-beige-900">
                    Order Summary
                  </h2>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full text-beige-700 bg-beige-100">
                    {itemsWithDetails.length} {itemsWithDetails.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="pb-4 mb-4 space-y-4 border-b border-beige-100">
                  <div className="flex justify-between text-beige-700">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Promotion (10%)</span>
                    <span className="font-semibold">-${promotionDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-beige-700">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="font-semibold">
                      {shippingFee === 0
                        ? <span className="text-green-600">Free</span>
                        : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between py-4 mb-6 text-xl font-bold text-beige-900">
                  <span>Total</span>
                  <span className="text-2xl">${total.toFixed(2)}</span>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-3">
                  <Link to="/checkout">
                    <button className="w-full py-4 text-lg font-semibold text-white transition-all duration-300 transform shadow-md rounded-xl bg-beige-700 hover:bg-beige-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                      🛒 Place Order
                    </button>
                  </Link>
                  
                  <button
                    onClick={handleVNPayPayment}
                    disabled={paymentLoading}
                    className="flex items-center justify-center w-full gap-3 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-600 shadow-md rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        <span>Pay with VNPay</span>
                      </>
                    )}
                  </button>
                  
                  <Link to="/allbooks">
                    <button className="w-full py-3 font-medium transition-colors border-2 rounded-xl text-beige-700 border-beige-300 hover:bg-beige-50">
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
    </>
  );
}
