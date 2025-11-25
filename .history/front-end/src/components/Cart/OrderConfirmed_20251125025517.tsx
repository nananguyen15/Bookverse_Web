import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import { paymentApi } from "../../api";

export function OrderConfirmed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orderId } = useParams<{ orderId?: string }>(); // Get orderId from URL params
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false); // Prevent double processing

  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

    // If orderId is in URL params, this is the final success page (already processed)
    if (orderId) {
      console.log("✅ Order confirmed page with orderId:", orderId);
      if (isMounted) {
        setPaymentSuccess(true);
        setPaymentProcessed(true);
        setProcessing(false);
      }
      return;
    }

    // Prevent processing multiple times (React Strict Mode issue)
    if (hasProcessed) {
      console.log("⏭️ Payment already processed, skipping...");
      return;
    }

    const processPayment = async () => {
      // Step 1: Read URL parameters from VNPay callback
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
      const vnp_TxnRef = searchParams.get("vnp_TxnRef"); // Contains paymentId

      console.log("📍 OrderConfirmed page loaded");
      console.log("🔍 VNPay Response Code:", vnp_ResponseCode);
      console.log("🔍 VNPay TxnRef (paymentId):", vnp_TxnRef);

      // Step 2: Check if this is a VNPay callback (has vnp_ResponseCode)
      if (vnp_ResponseCode) {
        console.log("✅ VNPay callback detected - Processing payment...");

        try {
          // Step 3: Try multiple ways to get paymentId
          let paymentId: number | null = null;

          // Method 1: Try from vnp_TxnRef (if backend uses it)
          if (vnp_TxnRef) {
            const txnRefPaymentId = parseInt(vnp_TxnRef, 10);
            if (!isNaN(txnRefPaymentId) && txnRefPaymentId > 0) {
              console.log("💳 Trying Payment ID from vnp_TxnRef:", txnRefPaymentId);
              paymentId = txnRefPaymentId;
            }
          }

          // Method 2: Try from localStorage (fallback)
          if (!paymentId) {
            const storedPaymentId = localStorage.getItem('vnpay_pending_payment_id');
            if (storedPaymentId) {
              const localStoragePaymentId = parseInt(storedPaymentId, 10);
              if (!isNaN(localStoragePaymentId)) {
                console.log("💳 Using Payment ID from localStorage:", localStoragePaymentId);
                paymentId = localStoragePaymentId;
              }
            }
          }

          if (!paymentId) {
            throw new Error("Payment ID not found - tried vnp_TxnRef and localStorage");
          }

          console.log("✅ Final Payment ID to use:", paymentId);

          // Step 4: Check if payment was successful
          if (vnp_ResponseCode === "00") {
            console.log("✅ Payment successful - Marking as done...");

            try {
              // Step 5: Mark payment as done (SUCCESS)
              const result = await paymentApi.markPaymentDone(paymentId);

              console.log("✅ Payment marked as done:", result);
              console.log("💰 Payment Status:", result.status, "(should be SUCCESS)");

              // Clear localStorage after successful processing
              localStorage.removeItem('vnpay_pending_payment_id');
              localStorage.removeItem('vnpay_pending_order_id');

              // Step 6: Redirect to order-confirmed page with orderId
              const orderId = result.orderId;
              if (orderId) {
                console.log("🔄 Redirecting to /order-confirmed/" + orderId);
                navigate(`/order-confirmed/${orderId}`, { replace: true });
              } else {
                // Fallback: show success message on current page
                if (isMounted) {
                  setPaymentSuccess(true);
                  setPaymentProcessed(true);
                  setHasProcessed(true);
                }
              }
            } catch (markError) {
              // Payment might already be marked as done - try to get payment info
              console.warn("⚠️ Failed to mark payment as done, checking payment status...");
              const err = markError as { response?: { data?: any }; message?: string };
              console.error("📋 Error details:", err.response?.data || err.message);

              try {
                // Try to get payment info to check if already processed
                const paymentInfo = await paymentApi.getPaymentById(paymentId);
                console.log("📋 Payment info retrieved:", paymentInfo);

                if (paymentInfo.status === "SUCCESS" && paymentInfo.orderId) {
                  console.log("✅ Payment already processed, redirecting to order page...");
                  // Clear localStorage
                  localStorage.removeItem('vnpay_pending_payment_id');
                  localStorage.removeItem('vnpay_pending_order_id');
                  navigate(`/order-confirmed/${paymentInfo.orderId}`, { replace: true });
                } else {
                  throw new Error("Payment not successful or no order ID");
                }
              } catch (getError) {
                console.error("❌ Failed to retrieve payment info:", getError);
                if (isMounted) {
                  setPaymentSuccess(false);
                  setPaymentProcessed(true);
                  setHasProcessed(true);
                }
              }
            }
          } else {
            // Payment failed
            console.log("❌ VNPay payment failed. Response code:", vnp_ResponseCode);
            if (isMounted) {
              setPaymentSuccess(false);
              setPaymentProcessed(true);
              setHasProcessed(true);
            }
          }
        } catch (error) {
          console.error("❌ Failed to process VNPay callback:", error);
          const err = error as { response?: { data?: any }; message?: string };
          console.error("📋 Error details:", err.response?.data || err.message);
          if (isMounted) {
            setPaymentSuccess(false);
            setPaymentProcessed(true);
            setHasProcessed(true);
          }
        }
      } else {
        // No VNPay callback - this is COD order
        console.log("✅ COD order confirmed (no VNPay callback)");
        if (isMounted) {
          setPaymentSuccess(true);
          setPaymentProcessed(true);
          setHasProcessed(true);
        }
      }

      if (isMounted) setProcessing(false);
    };

    processPayment();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [searchParams, hasProcessed, navigate, orderId]);

  if (processing) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-beige-50">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-t-4 rounded-full animate-spin border-beige-300 border-t-beige-700"></div>
            <p className="mt-4 text-lg text-beige-700">Processing payment...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {paymentProcessed && paymentSuccess ? (
            <>
              {/* Success State */}
              <div className="p-8 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="mb-4 text-3xl font-bold text-beige-900">
                  Order Confirmed!
                </h1>
                <p className="mb-6 text-lg text-beige-700">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => navigate("/profile/orders")}
                    className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 font-semibold transition-colors border-2 rounded-lg text-beige-700 border-beige-700 hover:bg-beige-50"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Failed State */}
              <div className="p-8 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="mb-4 text-3xl font-bold text-beige-900">
                  Payment Failed
                </h1>
                <p className="mb-6 text-lg text-beige-700">
                  Unfortunately, your payment could not be processed. Please try again.
                </p>
                <div className="p-4 mb-6 border-l-4 border-red-500 rounded-lg bg-red-50">
                  <p className="text-sm text-red-700">
                    Your order was created but the payment was not completed. You can retry the payment from your order history.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => navigate("/profile/orders")}
                    className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 font-semibold transition-colors border-2 rounded-lg text-beige-700 border-beige-700 hover:bg-beige-50"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
