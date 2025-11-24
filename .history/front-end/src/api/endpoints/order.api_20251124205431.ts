import apiClient from "../client";
import type {
  ApiResponse,
  OrderResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  ChangeAddressRequest,
  CancelOrderRequest,
  OrderStatus,
} from "../../types";

const ORDERS_ENDPOINT = "/orders";

export const orderApi = {
  // GET /api/orders - Get all orders
  getAllOrders: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `${ORDERS_ENDPOINT}`
    );
    return response.data.result;
  },

  // GET /api/orders/{id} - Get order by ID
  getOrderById: async (id: number): Promise<OrderResponse> => {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(
      `${ORDERS_ENDPOINT}/${id}`
    );
    return response.data.result;
  },

  // GET /api/orders/status/{status} - Get orders by status
  getOrdersByStatus: async (status: OrderStatus): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `${ORDERS_ENDPOINT}/status/${status}`
    );
    return response.data.result;
  },

  // GET /api/orders/myOrders - Get current user's orders
  getMyOrders: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `${ORDERS_ENDPOINT}/myOrders`
    );
    return response.data.result;
  },

  // POST /api/orders/create - Create new order
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<ApiResponse<OrderResponse>>(
      `${ORDERS_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  // PUT /api/orders/update/{id} - Update order
  updateOrder: async (
    id: number,
    data: UpdateOrderRequest
  ): Promise<OrderResponse> => {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `${ORDERS_ENDPOINT}/update/${id}`,
      data
    );
    return response.data.result;
  },

  // PUT /api/orders/myOrders/cancel/{id} - Cancel user's order
  cancelMyOrder: async (id: number): Promise<OrderResponse> => {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `${ORDERS_ENDPOINT}/myOrders/cancel/${id}`
    );
    return response.data.result;
  },

  // PUT /api/orders/myOrders/change-address/{id} - Change order address
  changeMyOrderAddress: async (
    id: number,
    data: ChangeAddressRequest
  ): Promise<OrderResponse> => {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `${ORDERS_ENDPOINT}/myOrders/change-address/${id}`,
      data
    );
    return response.data.result;
  },
};
