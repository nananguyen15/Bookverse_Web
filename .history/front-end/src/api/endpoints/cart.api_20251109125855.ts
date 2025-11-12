import { apiClient } from "../client";
import { ApiResponse } from "../../types/api/common.types";
import {
  CartResponse,
  AddToCartRequest,
  CartItemUpdateRequest,
} from "../../types/api/cart.types";

const CART_ENDPOINT = "/api/carts";

export const cartApi = {
  /**
   * Get all carts (Admin only)
   */
  getAllCarts: async (): Promise<CartResponse[]> => {
    const response = await apiClient.get<ApiResponse<CartResponse[]>>(
      CART_ENDPOINT
    );
    return response.data.result;
  },

  /**
   * Get cart by user ID (Admin/Staff)
   */
  getCartByUserId: async (userId: string): Promise<CartResponse> => {
    const response = await apiClient.get<ApiResponse<CartResponse>>(
      `${CART_ENDPOINT}/${userId}`
    );
    return response.data.result;
  },

  /**
   * Get current user's cart
   */
  getMyCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get<ApiResponse<CartResponse>>(
      `${CART_ENDPOINT}/myCart`
    );
    return response.data.result;
  },

  /**
   * Add 1 item to cart (increment quantity by 1)
   */
  addOneToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post<ApiResponse<CartResponse>>(
      `${CART_ENDPOINT}/myCart/add-1-to-cart`,
      data
    );
    return response.data.result;
  },

  /**
   * Remove 1 item from cart (decrement quantity by 1)
   */
  removeOneFromCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post<ApiResponse<CartResponse>>(
      `${CART_ENDPOINT}/myCart/remove-1-from-cart`,
      data
    );
    return response.data.result;
  },

  /**
   * Clear an item completely from cart
   */
  clearAnItem: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post<ApiResponse<CartResponse>>(
      `${CART_ENDPOINT}/myCart/clear-an-item`,
      data
    );
    return response.data.result;
  },

  /**
   * Update item quantity directly
   */
  // updateItemQuantity: async (
  //   data: CartItemUpdateRequest
  // ): Promise<CartResponse> => {
  //   const response = await apiClient.put<ApiResponse<CartResponse>>(
  //     `${CART_ENDPOINT}/myCart/update-item-quantity`,
  //     data
  //   );
  //   return response.data.result;
  // },
};
