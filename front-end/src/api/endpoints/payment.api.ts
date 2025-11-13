import apiClient from "../client";
import type { ApiResponse } from "../../types/api/common.types";
import type {
  VNPayReturnParams,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentRecord,
} from "../../types/api/payment.types";

const PAYMENT_ENDPOINT = "/payments";

export const paymentApi = {
  /**
   * Create payment URL for VNPay
   * @param data Payment creation request
   * @returns Payment URL to redirect to VNPay
   */
  createPayment: async (
    data: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> => {
    const response = await apiClient.get<ApiResponse<CreatePaymentResponse>>(
      `${PAYMENT_ENDPOINT}/create`,
      { params: data }
    );
    return response.data.result;
  },

  /**
   * Handle VNPay return callback
   * This endpoint processes the payment result from VNPay
   * @param params VNPay return parameters from URL query
   * @returns Payment record with transaction details
   */
  handleVNPayReturn: async (
    params: VNPayReturnParams
  ): Promise<PaymentRecord> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      `${PAYMENT_ENDPOINT}/vnpay-return`,
      { params }
    );
    return response.data.result;
  },

  /**
   * Parse VNPay return URL parameters
   * Helper function to extract query parameters from URL
   * @param url Full URL with query parameters
   * @returns Parsed VNPay parameters
   */
  parseVNPayReturnUrl: (url: string): VNPayReturnParams => {
    const urlObj = new URL(url);
    const params: VNPayReturnParams = {
      vnp_Amount: urlObj.searchParams.get("vnp_Amount") || "",
      vnp_BankCode: urlObj.searchParams.get("vnp_BankCode") || "",
      vnp_BankTranNo: urlObj.searchParams.get("vnp_BankTranNo") || "",
      vnp_PayDate: urlObj.searchParams.get("vnp_PayDate") || "",
      vnp_OrderInfo: urlObj.searchParams.get("vnp_OrderInfo") || "",
      vnp_ResponseCode: urlObj.searchParams.get("vnp_ResponseCode") || "",
      vnp_TransactionNo: urlObj.searchParams.get("vnp_TransactionNo") || "",
      vnp_TxnRef: urlObj.searchParams.get("vnp_TxnRef") || undefined,
      vnp_SecureHash: urlObj.searchParams.get("vnp_SecureHash") || undefined,
    };
    return params;
  },

  /**
   * Check if payment was successful based on response code
   * @param responseCode VNPay response code
   * @returns true if payment was successful (00)
   */
  isPaymentSuccessful: (responseCode: string): boolean => {
    return responseCode === "00";
  },

  /**
   * Format VNPay amount (divide by 100 to get actual VND amount)
   * @param vnpAmount Amount string from VNPay (multiplied by 100)
   * @returns Actual amount in VND
   */
  formatVNPayAmount: (vnpAmount: string): number => {
    return parseInt(vnpAmount, 10) / 100;
  },

  /**
   * Format VNPay date (YYYYMMDDHHmmss to readable format)
   * @param vnpPayDate Date string from VNPay
   * @returns Formatted date string
   */
  formatVNPayDate: (vnpPayDate: string): string => {
    // Format: YYYYMMDDHHmmss -> YYYY-MM-DD HH:mm:ss
    const year = vnpPayDate.substring(0, 4);
    const month = vnpPayDate.substring(4, 6);
    const day = vnpPayDate.substring(6, 8);
    const hour = vnpPayDate.substring(8, 10);
    const minute = vnpPayDate.substring(10, 12);
    const second = vnpPayDate.substring(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },
};
