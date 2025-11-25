import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentApi, orderApi } from "../../api/endpoints";
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
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Extract orderId from vnp_TxnRef (backend puts random number here, but we can get orderId from vnp_OrderInfo)
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpOrderInfo = searchParams.get("vnp_OrderInfo"); // Format: "Thanh toan don hang:12345678"
        const vnpTxnRef = searchParams.get("vnp_TxnRef"); // This is the random transaction reference

        console.log('🔍 VNPay Return Parameters:');
        console.log('   Response Code:', vnpResponseCode);
        console.log('   Order Info:', vnpOrderInfo);
        console.log('   TxnRef:', vnpTxnRef);

        // Since backend doesn't store orderId in vnp_TxnRef, we need to find the order
        // The order was just created, so we can get the latest pending order
        // Or extract from vnp_OrderInfo if backend includes orderId there
        
        // For now, extract orderId from vnp_OrderInfo (format: "Thanh toan don hang:ORDERID")
        let orderId: number | null = null;
        if (vnpOrderInfo) {
          const match = vnpOrderInfo.match(/:(\d+)/);
          if (match) {
            orderId = parseInt(match[1]);
            console.log('📋 Extracted OrderId from OrderInfo:', orderId);
          }
        }

        if (!orderId) {
          console.error('❌ Could not extract orderId from payment info');
          setError("Invalid order reference. Please check your orders.");
          setLoading(false);
          return;
        }

        // Get order details to get the payment ID
        const order = await orderApi.getOrderById(orderId);
        console.log('📦 Order details:', order);

        if (!order.payment || !order.payment.id) {
          console.error('❌ Order has no payment record');
          setError("Payment record not found for this order.");
          setLoading(false);
          return;
        }

        const paymentId = order.payment.id;
        console.log('💳 Payment ID:', paymentId);

        // If payment successful (response code 00), mark payment as done
        if (vnpResponseCode === "00") {
          try {
            console.log('✅ Payment successful, marking as done...');
            const payment = await paymentApi.markPaymentDone(paymentId);
            
            console.log('✅ Payment marked as SUCCESS:', payment);
            setOrderId(order.id);

            // Create payment record for display
            setPaymentResult({
              amount: payment.amount,
              bankCode: searchParams.get("vnp_BankCode") || "",
              bankTranNo: searchParams.get("vnp_BankTranNo") || "",
              payDate: searchParams.get("vnp_PayDate") || "",
              orderInfo: vnpOrderInfo || "",
              responseCode: vnpResponseCode || "",
              transactionNo: searchParams.get("vnp_TransactionNo") || "",
              status: "SUCCESS",
            });
          } catch (err) {
            console.error("❌ Failed to mark payment as done:", err);
            setError("Failed to confirm payment. Please contact support with order #" + orderId);
          }
        } else {
          console.warn('⚠️ Payment failed with response code:', vnpResponseCode);
          // Payment failed - just display the info, don't update payment status
          setPaymentResult({
            amount: parseFloat(searchParams.get("vnp_Amount") || "0") / 100,
            bankCode: searchParams.get("vnp_BankCode") || "",
            bankTranNo: searchParams.get("vnp_BankTranNo") || "",
            payDate: searchParams.get("vnp_PayDate") || "",
            orderInfo: vnpOrderInfo || "",
            responseCode: vnpResponseCode || "",
            transactionNo: searchParams.get("vnp_TransactionNo") || "",
            status: "FAILED",
          });
          setOrderId(orderId);
        }
      } catch (err) {
        console.error("❌ Payment processing error:", err);
        setError("An error occurred while processing payment. Please check your orders or contact support.");
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
              <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full ${isSuccess ? "bg-green-100" : "bg-red-100"
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
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
                      onClick={() => orderId ? navigate(`/order/${orderId}`) : navigate("/profile/orders")}
                      className="flex-1 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                    >
                      {orderId ? "View Order" : "View My Orders"}
                    </button>
                    <button
                      onClick={() => navigate("/")}
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
                      onClick={() => navigate("/payment")}
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
