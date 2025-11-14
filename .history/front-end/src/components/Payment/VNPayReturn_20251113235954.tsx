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
      } catch (err) {
        setError("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.");
        console.error("Payment processing error:", err);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brown-600 mx-auto mb-4"></div>
          <p className="text-brown-600 font-medium">
            Đang xử lý thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (error || !paymentResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-brown-800 mb-4">
              Thanh toán thất bại
            </h2>
            <p className="text-brown-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/cart")}
              className="bg-brown-600 text-white px-6 py-2 rounded-lg hover:bg-brown-700 transition-colors"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = paymentApi.isPaymentSuccessful(
    paymentResult.responseCode
  );
  const amount = paymentApi.formatVNPayAmount(paymentResult.amount.toString());
  const payDate = paymentApi.formatVNPayDate(paymentResult.payDate);

  return (
    <div className="flex items-center justify-center min-h-screen bg-beige-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="text-center mb-6">
          {isSuccess ? (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-brown-800 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-brown-600">
                Cảm ơn bạn đã mua hàng tại BookVerse
              </p>
            </>
          ) : (
            <>
              <div className="text-red-500 text-5xl mb-4">✕</div>
              <h2 className="text-2xl font-bold text-brown-800 mb-2">
                Thanh toán không thành công
              </h2>
              <p className="text-brown-600">
                Giao dịch của bạn không được hoàn tất
              </p>
            </>
          )}
        </div>

        {/* Payment Invoice/Receipt */}
        <div className="border-t border-b border-beige-300 py-6 mb-6">
          <h3 className="font-semibold text-brown-800 mb-4 text-lg">
            Thông tin giao dịch
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-brown-600">Mã giao dịch:</span>
              <span className="font-medium text-brown-800">
                {paymentResult.transactionNo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Số tiền:</span>
              <span className="font-medium text-brown-800">
                {amount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Ngân hàng:</span>
              <span className="font-medium text-brown-800">
                {paymentResult.bankCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Mã giao dịch ngân hàng:</span>
              <span className="font-medium text-brown-800">
                {paymentResult.bankTranNo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Thời gian:</span>
              <span className="font-medium text-brown-800">{payDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Nội dung:</span>
              <span className="font-medium text-brown-800">
                {paymentResult.orderInfo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Trạng thái:</span>
              <span
                className={`font-medium ${
                  isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {isSuccess ? "Thành công" : "Thất bại"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {isSuccess ? (
            <>
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 bg-brown-600 text-white px-6 py-3 rounded-lg hover:bg-brown-700 transition-colors font-medium"
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 border border-brown-600 text-brown-600 px-6 py-3 rounded-lg hover:bg-beige-50 transition-colors font-medium"
              >
                Về trang chủ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 bg-brown-600 text-white px-6 py-3 rounded-lg hover:bg-brown-700 transition-colors font-medium"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 border border-brown-600 text-brown-600 px-6 py-3 rounded-lg hover:bg-beige-50 transition-colors font-medium"
              >
                Về trang chủ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
