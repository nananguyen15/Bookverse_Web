import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaCheckCircle, FaShippingFast, FaStar } from "react-icons/fa";

// Mock data - replace with actual API calls
const mockOrders = [
  {
    id: "BV-17292838",
    date: "2025-10-27T10:00:00Z",
    status: "Preparing",
    total: 213.0,
    items: [
      { id: 1, name: "Book A", quantity: 1 },
      { id: 2, name: "Book B", quantity: 1 },
    ],
    paymentMethod: "Cash on Delivery",
    deliveryEstimate: "25 mins",
  },
  {
    id: "BV-17292837",
    date: "2025-10-25T15:30:00Z",
    status: "Delivered",
    total: 150.5,
    items: [{ id: 3, name: "Book C", quantity: 1 }],
    paymentMethod: "Credit Card",
  },
  {
    id: "BV-17292836",
    date: "2025-10-22T09:00:00Z",
    status: "Cancelled",
    total: 88.0,
    items: [{ id: 4, name: "Book D", quantity: 2 }],
    paymentMethod: "Cash on Delivery",
  },
];

type OrderStatus = "Confirmed" | "Preparing" | "Picked up" | "Delivered" | "Cancelled";

const OrderStatusIndicator = ({ status }: { status: OrderStatus }) => {
  const statuses: OrderStatus[] = ["Confirmed", "Preparing", "Picked up", "Delivered"];
  const currentIndex = statuses.indexOf(status);

  return (
    <div className="flex items-center mt-4">
      {statuses.map((s, index) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index <= currentIndex ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <FaCheckCircle className="text-white" size={14} />
            </div>
            <p className={`mt-1 text-xs ${index <= currentIndex ? "text-gray-800" : "text-gray-500"}`}>{s}</p>
          </div>
          {index < statuses.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                index < currentIndex ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};


const OrderCard = ({ order }: { order: any }) => {
  const handleCancelOrder = (orderId: string) => {
    // Mock cancellation
    alert(`Order ${orderId} has been cancelled.`);
    // In a real app, you'd update the order status via an API call
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-gray-800">Order no #{order.id}</h3>
          <p className="text-lg font-semibold text-green-600">EGP {order.total.toFixed(2)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/order/${order.id}`}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Order Details
          </Link>
          {order.status === "Preparing" && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel Order
            </button>
          )}
           {order.status === "Delivered" && (
             <>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Buy It Again
              </button>
               <Link to="/profile/reviews" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600">
                <FaStar className="mr-1" /> Review
              </Link>
             </>
          )}
        </div>
      </div>
      
      {order.status !== "Cancelled" && <OrderStatusIndicator status={order.status} />}

      <div className="pt-4 mt-4 text-sm text-gray-600 border-t border-gray-200">
        <p>
          {order.items.length} Items • {order.paymentMethod} • Ordered{" "}
          {new Date(order.date).toLocaleString()}
          {order.deliveryEstimate && ` • Delivery within ${order.deliveryEstimate}`}
        </p>
      </div>
    </div>
  );
};

export function OrderHistory() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [orders, setOrders] = useState(mockOrders);

  const upcomingOrders = orders.filter(o => ["Confirmed", "Preparing", "Picked up"].includes(o.status));
  const previousOrders = orders.filter(o => ["Delivered", "Cancelled"].includes(o.status));
  // Assuming scheduled orders have a future date and a specific status
  const scheduledOrders = orders.filter(o => new Date(o.date) > new Date() && o.status === 'Scheduled');


  const renderOrders = () => {
    let ordersToRender = [];
    switch (activeTab) {
      case "Upcoming":
        ordersToRender = upcomingOrders;
        break;
      case "Previous":
        ordersToRender = previousOrders;
        break;
      case "Scheduled":
        ordersToRender = scheduledOrders;
        break;
      default:
        ordersToRender = [];
    }

    if (ordersToRender.length === 0) {
      return (
        <div className="py-12 text-center text-gray-500">
          <FaBoxOpen className="mx-auto mb-4 text-4xl text-gray-400" />
          <p>No orders in this category yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {ordersToRender.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-gray-900">My Orders</h2>
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab("Upcoming")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Upcoming"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Upcoming Orders ({upcomingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("Previous")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Previous"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Previous Orders ({previousOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("Scheduled")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Scheduled"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Scheduled Orders ({scheduledOrders.length})
          </button>
        </nav>
      </div>

      <div>{renderOrders()}</div>
    </div>
  );
}
