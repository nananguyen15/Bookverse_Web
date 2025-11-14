import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentApi } from "../../api/endpoints";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import type { PaymentRecord } from "../../types/api/payment.types";

export function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Extract all VNPay parameters from URL
        const vnpParams = {
          vnp_Amount: searchParams.get("vnp_Amount") || "",
          vnp_BankCode: searchParams.get("vnp_BankCode") || "",
          vnp_BankTranNo: searchParams.get("vnp_BankTranNo") || "",
          vnp_PayDate: searchParams.get("vnp_PayDate") || "",
          vnp_OrderInfo: searchParams.get("vnp_OrderInfo") || "",
          vnp_ResponseCode: searchParams.get("vnp_ResponseCode") || "",
          vnp_TransactionNo: searchParams.get("vnp_TransactionNo") || "",
          vnp_TxnRef: searchParams.get("vnp_TxnRef") || undefined,
          vnp_SecureHash: searchParams.get("vnp_SecureHash") || undefined,
        };

        // Call backend to process and save payment
        const result = await paymentApi.handleVNPayReturn(vnpParams);
        setPaymentResult(result);

        // If payment successful, save pending order to orders list
        if (paymentApi.isPaymentSuccessful(result.responseCode)) {
          const pendingOrder = localStorage.getItem("pendingOrder");
          if (pendingOrder) {
            const order = JSON.parse(pendingOrder);
            const orders = JSON.parse(localStorage.getItem("orders") || "[]");
            orders.push(order);
            localStorage.setItem("orders", JSON.stringify(orders));
            localStorage.removeItem("pendingOrder"); // Clear pending order
          }
        } else {
          // Payment failed, remove pending order
          localStorage.removeItem("pendingOrder");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi xử lý thanh toán. Please try again.");
        console.error("Payment processing error:", err);
        // Clear pending order on error
        localStorage.removeItem("pendingOrder");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-beige-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-beige-700 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg font-medium text-beige-700">Verifying payment...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !paymentResult) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
          <div className="max-w-2xl p-8 mx-auto text-center bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-red-600">Payment Failed</h1>
            <p className="mb-6 text-beige-600">{error || "Payment verification failed"}</p>
            <button
              onClick={() => navigate("/cart")}
              className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            >
              Return to Cart
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isSuccess = paymentApi.isPaymentSuccessful(paymentResult.responseCode);
  const amount = paymentApi.formatVNPayAmount(paymentResult.amount.toString());
  const payDate = paymentApi.formatVNPayDate(paymentResult.payDate);

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
            {/* Header */}
            <div className={`p-8 text-center ${isSuccess ? "bg-green-50" : "bg-red-50"}`}>
              <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}>
                {isSuccess ? (
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h1 className={`mb-2 text-3xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                {isSuccess ? "Payment Successful!" : "Payment Failed"}
              </h1>
              <p className="text-lg text-beige-600">
                {isSuccess
                  ? "Your order has been confirmed and payment processed successfully."
                  : "Your payment could not be processed. Please try again."}
              </p>
            </div>

            {/* Payment Details */}
            <div className="p-8">
              <h2 className="mb-6 text-xl font-bold text-beige-900">Payment Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-beige-100">
                  <span className="font-medium text-beige-600">Transaction ID</span>
                  <span className="font-semibold text-beige-900">{paymentResult.transactionNo}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-beige-100">
                  <span className="font-medium text-beige-600">Order Info</span>
                  <span className="font-semibold text-beige-900">{paymentResult.orderInfo}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-beige-100">
                  <span className="font-medium text-beige-600">Amount</span>
                  <span className="text-xl font-bold text-beige-900">
                    {amount.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-beige-100">
                  <span className="font-medium text-beige-600">Bank Code</span>
                  <span className="font-semibold text-beige-900">{paymentResult.bankCode}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-beige-100">
                  <span className="font-medium text-beige-600">Bank Transaction</span>
                  <span className="font-semibold text-beige-900">{paymentResult.bankTranNo}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-beige-100">
                  <span className="font-medium text-beige-600">Payment Time</span>
                  <span className="font-semibold text-beige-900">{payDate}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-beige-600">Status</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {isSuccess ? "Success" : "Failed"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {isSuccess ? (
                  <>
                    <button
                      onClick={() => navigate("/my-orders")}
                      className="flex-1 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                    >
                      View My Orders
                    </button>
                    <button
                      onClick={() => navigate("/allbooks")}
                      className="flex-1 px-6 py-3 font-semibold transition-colors border-2 rounded-lg text-beige-700 border-beige-700 hover:bg-beige-50"
                    >
                      Continue Shopping
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/cart")}
                      className="flex-1 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                    >
                      Return to Cart
                    </button>
                    <button
                      onClick={() => navigate("/order")}
                      className="flex-1 px-6 py-3 font-semibold transition-colors border-2 rounded-lg text-beige-700 border-beige-700 hover:bg-beige-50"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
