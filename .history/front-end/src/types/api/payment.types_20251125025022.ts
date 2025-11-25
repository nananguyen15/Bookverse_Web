// Payment API Types

/**
 * VNPay Return Parameters (from VNPay callback)
 */
export type VNPayReturnParams = {
  vnp_Amount: string; // Amount in VND (multiplied by 100)
  vnp_BankCode: string; // Bank code
  vnp_BankTranNo: string; // Bank transaction number
  vnp_PayDate: string; // Payment date (YYYYMMDDHHmmss)
  vnp_OrderInfo: string; // Order information
  vnp_ResponseCode: string; // Response code (00 = success)
  vnp_TransactionNo: string; // VNPay transaction number
  vnp_TxnRef?: string; // Transaction reference
  vnp_SecureHash?: string; // Secure hash for verification
};

/**
 * Payment Creation Request (for creating payment record)
 */
export type CreatePaymentRecordRequest = {
  orderId: number;
  method: "COD" | "VNPAY";
};

/**
 * VNPay URL Creation Request
 */
export type CreateVNPayUrlRequest = {
  amount: number; // Amount in USD (decimal)
  amountInVND: number; // Amount in VND (integer)
};

/**
 * Payment Creation Response (Payment URL)
 */
export type CreatePaymentResponse = {
  URL: string; // URL to redirect to VNPay (backend returns 'URL' in uppercase)
  status: string;
  message: string;
};

/**
 * Payment Status
 *
 * Use a string literal union instead of a runtime enum so the type is erasable.
 * Flow: PENDING → SUCCESS (paid) → REFUNDING (cancelled, waiting refund) → REFUNDED (refund completed)
 */
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDING" | "REFUNDED";

/**
 * Payment Response (from backend)
 */
export type PaymentResponse = {
  id: number;
  orderId: number;
  method: "COD" | "VNPAY";
  status: PaymentStatus;
  amount: number;
  paidAt: string; // ISO date string
  createdAt: string; // ISO date string
};

/**
 * Payment Record (for displaying payment info from VNPay callback)
 * Backend /api/payments/vnpay-return returns PaymentResponse, not a separate record type
 */
export type PaymentRecord = PaymentResponse & {
  bankCode?: string;
  bankTranNo?: string;
  payDate?: string;
  orderInfo?: string;
  responseCode?: string;
  transactionNo?: string;
};
