import client from "../client";
import type { ApiResponse } from "../../types";

// ============== Types ==============

/**
 * Top customer statistics
 */
export type TopCustomerStats = {
  id: string;
  username: string;
  name: string;
  image: string;
  totalSpent: number;
};

/**
 * Top book statistics
 */
export type TopBookStats = {
  id: number;
  title: string;
  image: string;
  totalSold: number;
};

/**
 * Sales data point for time series
 */
export type SalesDataPoint = {
  date: string; // Format: "2025-11-25"
  totalSales: number;
};

/**
 * Order status breakdown
 */
export type OrderStatusStats = {
  pending: number;
  confirmed: number;
  processing: number;
  delivering: number;
  delivered: number;
  cancelled: number;
};

// ============== API Functions ==============

/**
 * Get total revenue from all delivered orders
 */
export const getTotalRevenue = async (): Promise<number> => {
  const response = await client.get<ApiResponse<number>>("/statistics/total-revenue");
  return response.data.result;
};

/**
 * Get total number of orders
 */
export const getTotalOrders = async (): Promise<number> => {
  const response = await client.get<ApiResponse<number>>("/statistics/total-orders");
  return response.data.result;
};

/**
 * Get total number of customers
 */
export const getTotalCustomers = async (): Promise<number> => {
  const response = await client.get<ApiResponse<number>>("/statistics/total-customers");
  return response.data.result;
};

/**
 * Get top 5 customers by total spending
 */
export const getTop5Customers = async (): Promise<TopCustomerStats[]> => {
  const response = await client.get<ApiResponse<TopCustomerStats[]>>("/statistics/top-5-customers");
  return response.data.result;
};

/**
 * Get top 5 books by total sold quantity
 */
export const getTop5Books = async (): Promise<TopBookStats[]> => {
  const response = await client.get<ApiResponse<TopBookStats[]>>("/statistics/top-5-books");
  return response.data.result;
};

/**
 * Get sales over time (daily sales data)
 */
export const getSalesOverTime = async (): Promise<SalesDataPoint[]> => {
  const response = await client.get<ApiResponse<SalesDataPoint[]>>("/statistics/sales-over-time");
  return response.data.result;
};

/**
 * Get orders over time (daily order count)
 * Note: Backend returns totalSales but it represents order count
 */
export const getOrdersOverTime = async (): Promise<SalesDataPoint[]> => {
  const response = await client.get<ApiResponse<SalesDataPoint[]>>("/statistics/orders-over-time");
  return response.data.result;
};

/**
 * Get order status breakdown
 */
export const getOrdersStatus = async (): Promise<OrderStatusStats> => {
  const response = await client.get<ApiResponse<OrderStatusStats>>("/statistics/orders-status");
  return response.data.result;
};

// ============== Exports ==============

export const statisticsApi = {
  getTotalRevenue,
  getTotalOrders,
  getTotalCustomers,
  getTop5Customers,
  getTop5Books,
  getSalesOverTime,
  getOrdersOverTime,
  getOrdersStatus,
};
