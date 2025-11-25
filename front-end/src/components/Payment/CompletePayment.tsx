import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderApi, paymentApi } from "../../api";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import type { OrderResponse } from "../../types/api/order.types";

export function CompletePayment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        const orderData = await orderApi.getOrderById(parseInt(orderId));

        // Verify order is pending payment
        if (orderData.payment.status !== "PENDING" || orderData.payment.method !== "VNPAY") {
          setError("This order does not require payment completion");
          setLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleCompletePayment = async () => {
    if (!order) return;

    try {
      setProcessing(true);

      console.log("🔄 Retry Payment Flow Started");
      console.log("📋 Order ID:", order.id);

      // Step 1: Get payment ID from order
      const paymentId = order.payment?.id;
      if (!paymentId) {
        throw new Error('Payment ID not found in order');
      }

      console.log("🆔 Payment ID:", paymentId);

      // Step 2: Store paymentId in localStorage
      localStorage.setItem("pendingPaymentId", paymentId.toString());
      console.log("💾 Saved paymentId to localStorage:", paymentId);

      // Step 3: Create VNPay payment URL (only send amount)
      const paymentUrl = await paymentApi.createVNPayUrl({
        amount: order.totalAmount,
      });

      console.log("✅ VNPay URL received:", paymentUrl);

      if (!paymentUrl || typeof paymentUrl !== 'string') {
        throw new Error('Invalid payment URL received from server');
      }

      // Step 4: Redirect to VNPay payment page
      // After payment, VNPay will redirect to: http://localhost:5173/order-confirmed
      console.log("🔄 Redirecting to VNPay...");
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("❌ Failed to create payment:", err);
      alert("Could not create VNPay payment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-beige-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-beige-200 border-t-beige-700 animate-spin"></div>
            <p className="text-xl font-medium text-beige-700">Loading order...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-beige-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-beige-900 mb-2">Error</h2>
            <p className="text-beige-600 mb-6">{error || "Order not found"}</p>
            <button
              onClick={() => navigate("/profile/orders")}
              className="px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-beige-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-beige-700 to-beige-600 px-6 py-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
              <p className="text-beige-100">Order #{order.id}</p>
            </div>

            {/* Order Summary */}
            <div className="p-6 border-b border-beige-100">
              <h2 className="text-xl font-bold text-beige-900 mb-4">Order Summary</h2>

              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-beige-900">{item.bookTitle}</p>
                      <p className="text-sm text-beige-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-beige-700">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-beige-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-beige-900">Total Amount</span>
                  <span className="text-2xl text-beige-700">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-6 bg-orange-50 border-b border-orange-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">Payment Pending</h3>
                  <p className="text-sm text-orange-700">
                    Your order has been created but payment is incomplete.
                    Click the button below to complete your VNPay payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6 border-b border-beige-100">
              <h3 className="font-semibold text-beige-900 mb-2">Delivery Address</h3>
              <p className="text-beige-700">{order.address}</p>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50">
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/profile/orders")}
                  className="flex-1 px-6 py-3 border-2 border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Pay with VNPay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">Secure Payment</p>
                <p className="text-sm text-blue-700">
                  You will be redirected to VNPay's secure payment gateway.
                  Your payment information is encrypted and protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
