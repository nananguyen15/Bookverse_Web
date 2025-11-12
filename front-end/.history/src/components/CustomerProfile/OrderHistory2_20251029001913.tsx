import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaCheckCircle, FaStar } from "react-icons/fa";
import { CancelOrderModal } from "./CancelOrderModal";

type OrderStatus = "Confirmed" | "Preparing" | "Picked up" | "Delivered" | "Cancelled";

interface OrderItem {
  id: number | string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  summary: {
    total: number;
  };
  paymentMethod: string;
  shippingInfo?: {
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  estimatedDelivery?: string;
}

const OrderStatusIndicator = ({ status }: { status: OrderStatus }) => {
  const statuses: OrderStatus[] = ["Confirmed", "Preparing", "Picked up", "Delivered"];
  const currentIndex = statuses.indexOf(status);

  return (
    <div className="flex items-center mt-4">
      {statuses.map((s, index) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index <= currentIndex ? "bg-beige-700" : "bg-gray-300"
              }`}
            >
              <FaCheckCircle className="text-white" size={14} />
            </div>
            <p className={`mt-1 text-xs ${index <= currentIndex ? "text-beige-900" : "text-gray-500"}`}>{s}</p>
          </div>
          {index < statuses.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                index < currentIndex ? "bg-beige-700" : "bg-gray-300"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

const OrderCard = ({ order, onCancelOrder }: { order: Order; onCancelOrder: (orderId: string) => void }) => {
  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm border-beige-200">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-beige-900">Order #{order.orderId}</h3>
          <p className="text-lg font-semibold text-beige-700">${order.summary.total.toFixed(2)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/order/${order.orderId}`}
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-beige-700 hover:bg-beige-800"
          >
            Order Details
          </Link>
          {order.status === "Preparing" && (
            <button
              onClick={() => onCancelOrder(order.orderId)}
              className="px-4 py-2 text-sm font-medium border rounded-md text-beige-700 bg-white border-beige-300 hover:bg-beige-50"
            >
              Cancel Order
            </button>
          )}
          {order.status === "Delivered" && (
            <>
              <button className="px-4 py-2 text-sm font-medium text-white rounded-md bg-beige-600 hover:bg-beige-700">
                Buy It Again
              </button>
              <Link
                to="/profile/reviews"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                <FaStar className="mr-1" /> Review
              </Link>
            </>
          )}
        </div>
      </div>

      {order.status !== "Cancelled" && <OrderStatusIndicator status={order.status} />}

      <div className="pt-4 mt-4 text-sm border-t text-beige-700 border-beige-200">
        <p>
          {order.items.length} Items • {order.paymentMethod} • Ordered{" "}
          {new Date(order.orderDate).toLocaleString()}
          {order.estimatedDelivery && ` • Est. Delivery: ${order.estimatedDelivery}`}
        </p>
      </div>
    </div>
  );
};

export function OrderHistory() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  // Load orders from localStorage
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(storedOrders);
  }, []);

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = (_reason: string, details: string) => {
    if (orderToCancel) {
      const updatedOrders = orders.map((order) =>
        order.orderId === orderToCancel
          ? { ...order, status: "Cancelled" as OrderStatus, cancelReason: details }
          : order
      );
      setOrders(updatedOrders);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      alert(`Order ${orderToCancel} has been cancelled.\nReason: ${details}`);
    }
    setCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const upcomingOrders = orders.filter((o) =>
    ["Confirmed", "Preparing", "Picked up"].includes(o.status)
  );
  const previousOrders = orders.filter((o) =>
    ["Delivered", "Cancelled"].includes(o.status)
  );
  const scheduledOrders = orders.filter(
    (o) => new Date(o.orderDate) > new Date() && o.status === "Confirmed"
  );

  const renderOrders = () => {
    let ordersToRender: Order[] = [];
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
        <div className="py-12 text-center text-beige-600">
          <FaBoxOpen className="mx-auto mb-4 text-4xl text-beige-400" />
          <p>No orders in this category yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {ordersToRender.map((order) => (
          <OrderCard key={order.orderId} order={order} onCancelOrder={handleCancelOrder} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Orders</h2>
      <div className="mb-6 border-b border-beige-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab("Upcoming")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Upcoming"
                ? "border-beige-700 text-beige-900"
                : "border-transparent text-beige-600 hover:text-beige-900 hover:border-beige-300"
            }`}
          >
            Upcoming Orders ({upcomingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("Previous")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Previous"
                ? "border-beige-700 text-beige-900"
                : "border-transparent text-beige-600 hover:text-beige-900 hover:border-beige-300"
            }`}
          >
            Previous Orders ({previousOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("Scheduled")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Scheduled"
                ? "border-beige-700 text-beige-900"
                : "border-transparent text-beige-600 hover:text-beige-900 hover:border-beige-300"
            }`}
          >
            Scheduled Orders ({scheduledOrders.length})
          </button>
        </nav>
      </div>

      <div>{renderOrders()}</div>

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelOrder}
        orderId={orderToCancel || ""}
      />
    </div>
  );
}
