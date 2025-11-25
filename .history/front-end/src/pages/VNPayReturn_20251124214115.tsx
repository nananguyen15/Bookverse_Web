import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { paymentApi } from "../api";

type PaymentResult = "processing" | "success" | "failed";

export function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult>("processing");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      // Get VNPay parameters from URL
      const responseCode = searchParams.get("vnp_ResponseCode");
      const txnRef = searchParams.get("vnp_TxnRef"); // This should be the payment ID
      const amount = searchParams.get("vnp_Amount");
      const orderInfo = searchParams.get("vnp_OrderInfo");
      const transactionNo = searchParams.get("vnp_TransactionNo");
      const bankCode = searchParams.get("vnp_BankCode");

      console.log("VNPay Return Parameters:", {
        responseCode,
        txnRef,
        amount,
        orderInfo,
        transactionNo,
        bankCode,
      });

      // Extract order ID from orderInfo or txnRef
      // Format might be like "Payment for order 123"
      let extractedOrderId = "";
      if (orderInfo) {
        const match = orderInfo.match(/order[:\s]+(\d+)/i);
        if (match) {
          extractedOrderId = match[1];
        }
      }
      if (!extractedOrderId && txnRef) {
        // Try to extract from txnRef if it's a number
        const numericMatch = txnRef.match(/\d+/);
        if (numericMatch) {
          extractedOrderId = numericMatch[0];
        }
      }
      setOrderId(extractedOrderId);

      // VNPay response codes:
      // 00: Success
      // 07: Suspicious transaction (blocked)
      // 09: Customer card not registered for internet banking
      // 10: Customer entered wrong card/account info multiple times
      // 11: Payment timeout
      // 12: Card is locked
      // 13: OTP verification failed
      // 24: Customer cancelled transaction
      // 51: Account balance insufficient
      // 65: Account exceeds daily transaction limit
      // 75: Payment bank is under maintenance
      // 79: Transaction exceeds payment limit
      // 99: Other errors

      if (responseCode === "00") {
        // Payment successful
        try {
          // Extract payment ID from txnRef (this should be the payment ID from backend)
          const paymentId = txnRef ? parseInt(txnRef.split("-")[0]) : 0;
          
          if (paymentId > 0) {
            // Call API to mark payment as done
            await paymentApi.markPaymentDone(paymentId);
            
            setResult("success");
            setMessage("Payment completed successfully! Your order is being processed.");
            
            // Redirect to order details after 3 seconds
            setTimeout(() => {
              if (extractedOrderId) {
                navigate(`/order/${extractedOrderId}`);
              } else {
                navigate("/my-account/orders");
              }
            }, 3000);
          } else {
            throw new Error("Invalid payment ID");
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          setResult("failed");
          setMessage("Payment was successful but there was an error updating the order. Please contact support.");
        }
      } else {
        // Payment failed
        setResult("failed");
        
        // Map error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          "07": "This transaction appears suspicious and has been blocked. Please contact your bank.",
          "09": "Your card is not registered for internet banking. Please enable it first.",
          "10": "Too many failed attempts. Please try again later.",
          "11": "Payment session timed out. Please try again.",
          "12": "Your card has been locked. Please contact your bank.",
          "13": "OTP verification failed. Please try again.",
          "24": "Transaction was cancelled by you.",
          "51": "Insufficient account balance. Please check your account.",
          "65": "Daily transaction limit exceeded. Please try again tomorrow.",
          "75": "Payment bank is currently under maintenance. Please try again later.",
          "79": "Transaction amount exceeds your payment limit.",
          "99": "An error occurred during payment processing.",
        };
        
        setMessage(
          errorMessages[responseCode || "99"] || 
          "Payment failed. Please try again or use a different payment method."
        );
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setResult("failed");
      setMessage("An unexpected error occurred. Please contact support if the issue persists.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Processing */}
          {result === "processing" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <FaSpinner className="text-blue-600 text-4xl animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your payment...
              </p>
            </div>
          )}

          {/* Success */}
          {result === "success" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="text-green-600 text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                {orderId && (
                  <button
                    onClick={() => navigate(`/order/${orderId}`)}
                    className="w-full px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors font-semibold"
                  >
                    View Order Details
                  </button>
                )}
                <button
                  onClick={() => navigate("/my-account/orders")}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  View All Orders
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full px-6 py-3 text-beige-700 hover:underline font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* Failed */}
          {result === "failed" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <FaTimesCircle className="text-red-600 text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>What to do next:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                  <li>Check your account balance</li>
                  <li>Verify your card is enabled for online payments</li>
                  <li>Try a different payment method</li>
                  <li>Contact your bank if the problem persists</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                {orderId && (
                  <button
                    onClick={() => navigate(`/complete-payment/${orderId}`)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Try Payment Again
                  </button>
                )}
                <button
                  onClick={() => navigate("/my-account/orders")}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full px-6 py-3 text-beige-700 hover:underline font-semibold"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {result !== "processing" && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Transaction ID: {searchParams.get("vnp_TransactionNo") || "N/A"}
              </p>
              {searchParams.get("vnp_Amount") && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  Amount: ${(parseInt(searchParams.get("vnp_Amount") || "0") / 100).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
