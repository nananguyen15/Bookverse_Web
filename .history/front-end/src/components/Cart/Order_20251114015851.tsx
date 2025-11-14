import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../layout/Footer/Footer";
import { orderApi } from "../../api";
import type { OrderResponse } from "../../types";

export function Order() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const orderData = await orderApi.getOrderById(parseInt(orderId));
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to load order:", error);
        alert("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-beige-50">
          <div className="text-center">
            <p className="text-beige-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-beige-50">
          <div className="text-center">
            <p className="text-beige-600">Order not found.</p>
            <Link to="/" className="mt-4 text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-beige-50">
        <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 mb-4 text-green-600 bg-green-100 rounded-full">
              <svg
                className="w-12 h-12"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-beige-900">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-beige-600">
              Thank you for your order! Your books are on their way.
            </p>
          </div>

          <div className="py-6 my-6 border-t border-b border-beige-200">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="space-y-3 text-sm text-beige-700">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span>#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Items:</span>
                <span>{order.orderItems.map((item) => item.bookTitle).join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Delivery Time:</span>
                <span>3-5 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Address:</span>
                <span className="text-right">{order.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment:</span>
                <span>
                  {order.payment.method === "COD" ? "Cash on Delivery" : "VNPay"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="flex items-center justify-center w-full py-3 font-semibold text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
            >
              Back to Home
            </Link>
            <button className="w-full py-3 font-semibold text-red-500 transition-colors border-2 border-red-500 rounded-lg hover:bg-red-500 hover:text-white">
              Track Order
            </button>
          </div>

          <div className="flex justify-between mt-6 text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              Need Help? Contact Us
            </a>
            <a href="#" className="text-blue-600 hover:underline">
              Reorder This
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
