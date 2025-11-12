import React from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";

export function OrderConfirmation() {
  const { orderId } = useParams();

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center bg-beige-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-xl">
          <FaCheckCircle className="mx-auto mb-4 text-6xl text-green-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Order Placed Successfully!
          </h1>
          <p className="mb-6 text-gray-600">
            Thank you for your purchase. Your order is being processed.
          </p>
          <p className="mb-1 text-lg font-semibold text-gray-700">
            Order ID: <span className="font-mono text-indigo-600">{orderId}</span>
          </p>
          <p className="mb-8 text-sm text-gray-500">
            You will receive an email confirmation shortly.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/profile/orders"
              className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
