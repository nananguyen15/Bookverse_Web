import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import { orderApi } from "../../api";
import type { OrderResponse } from "../../types";

export function Order() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const orderData = await orderApi.getOrderById(parseInt(orderId));
        setOrder(orderData);

        // Debug: Log order data to check cancelReason
        console.log("📦 Order loaded:", orderData);
        console.log("❌ Cancel Reason:", orderData.cancelReason);
        console.log("📊 Order Status:", orderData.status);
      } catch (error) {
        console.error("Failed to load order:", error);
        alert("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const handleCompletePayment = () => {
    if (orderId) {
      navigate(`/complete-payment/${orderId}`);
    }
  };

  const isPaymentPending = order?.payment?.method === "VNPAY" && order?.payment?.status === "PENDING";

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-beige-50">
          <div className="text-center">
            <p className="text-beige-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-beige-50">
          <div className="text-center">
            <p className="text-beige-600">Order not found.</p>
            <Link to="/" className="mt-4 text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 px-4 py-12 bg-beige-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-beige-900">
              Order ID : {order.id}
            </h1>
            <p className="mt-2 text-sm text-beige-600">
              {new Date(order.createdAt).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
              }`}>
              {order.status}
            </span>
          </div>

          {/* Cancel Reason - Show if order is cancelled */}
          {order.status === 'CANCELLED' && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Order Cancelled</h3>
                  <p className="text-sm text-red-800">
                    <strong>Reason:</strong> {order.cancelReason || "This order has been cancelled."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-beige-100">
                <h2 className="mb-4 text-xl font-bold text-beige-900">Order Items</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={item.id} className={`flex items-start justify-between pb-4 ${index < order.orderItems.length - 1 ? 'border-b border-beige-100' : ''}`}>
                      <div className="flex-1">
                        <h3 className="font-medium text-beige-900 mb-1">{item.bookTitle}</h3>
                        <p className="text-sm text-beige-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-beige-900">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-beige-600">each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Books - Only show for DELIVERED orders */}
              {order.status === 'DELIVERED' && (
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-sm border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FaStar className="text-yellow-500 text-2xl" />
                    <h2 className="text-xl font-bold text-amber-900">Review Your Books</h2>
                  </div>
                  <p className="text-sm text-amber-700 mb-4">
                    Share your thoughts! Click on any book below to leave a review.
                  </p>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/book/${item.bookId}#review`)}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-yellow-300 hover:border-yellow-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                            <FaStar className="text-yellow-600 text-lg" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-beige-900 group-hover:text-amber-700 transition-colors">
                              {item.bookTitle}
                            </h3>
                            <p className="text-xs text-beige-600">Click to review this book</p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-beige-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-beige-100">
                <h2 className="mb-4 text-xl font-bold text-beige-900">Delivery Address</h2>
                <p className="text-beige-700 leading-relaxed">{order.address}</p>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-beige-100">
                <h2 className="mb-4 text-xl font-bold text-beige-900">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-beige-600">Subtotal</span>
                    <span className="font-semibold text-beige-900">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-beige-600">Shipping</span>
                    <span className="font-semibold text-beige-900">$5.00</span>
                  </div>
                  <div className="pt-3 border-t border-beige-200">
                    <div className="flex justify-between">
                      <span className="font-bold text-beige-900">Total</span>
                      <span className="text-2xl font-bold text-beige-900">
                        ${(order.totalAmount + 5).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-beige-100">
                <h2 className="mb-4 text-xl font-bold text-beige-900">Payment</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-beige-600">Method</span>
                    <span className="font-semibold text-beige-900">
                      {order.payment?.method === "VNPAY" ? "VNPay" : order.payment?.method === "COD" ? "Cash on Delivery" : "Unknown"}
                    </span>
                  </div>
                  {order.payment && isPaymentPending && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-orange-900">Payment Pending</p>
                          <p className="text-xs text-orange-700 mt-1">Please complete your payment to process this order.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isPaymentPending && (
                  <button
                    onClick={handleCompletePayment}
                    className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Complete Payment
                  </button>
                )}
                <Link
                  to="/profile/orders"
                  className="block w-full py-3 font-semibold text-center text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  View All Orders
                </Link>
                <Link
                  to="/"
                  className="block w-full py-3 font-semibold text-center transition-colors border-2 rounded-lg text-beige-700 border-beige-700 hover:bg-beige-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
