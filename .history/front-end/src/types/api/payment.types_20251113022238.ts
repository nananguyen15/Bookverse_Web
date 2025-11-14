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
  vnp_SecureHash?: string; // Secure hash
};

/**
 * Payment Creation Request
 */
export type CreatePaymentRequest = {
  amount: number; // Amount in VND
  orderInfo: string; // Order description
  returnUrl?: string; // Return URL after payment
};

/**
 * Payment Creation Response (Payment URL)
 */
export type CreatePaymentResponse = {
  paymentUrl: string; // URL to redirect to VNPay
};

/**
 * Payment Status
 */
export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

/**
 * Payment Record (for displaying payment info)
 */
export type PaymentRecord = {
  id?: string;
  amount: number;
  bankCode: string;
  bankTranNo: string;
  payDate: string;
  orderInfo: string;
  responseCode: string;
  transactionNo: string;
  status: PaymentStatus;
  createdAt?: string;
};
