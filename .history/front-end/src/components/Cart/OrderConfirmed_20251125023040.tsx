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

      // Step 2: Check if this is a VNPay callback (has vnp_ResponseCode and vnp_TxnRef)
      if (vnp_ResponseCode && vnp_TxnRef) {
        console.log("✅ VNPay callback detected - Processing payment...");

        try {
          // Step 3: Extract paymentId from vnp_TxnRef
          const paymentId = parseInt(vnp_TxnRef, 10);

          if (isNaN(paymentId)) {
            throw new Error("Invalid payment ID from VNPay callback");
          }

          console.log("💳 Payment ID from callback:", paymentId);

          // Step 4: Check if payment was successful
          if (vnp_ResponseCode === "00") {
            console.log("✅ Payment successful - Marking as done...");

            // Step 5: Mark payment as done (SUCCESS)
            const result = await paymentApi.markPaymentDone(paymentId);

            console.log("✅ Payment marked as done:", result);
            console.log("💰 Payment Status:", result.status, "(should be SUCCESS)");

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
