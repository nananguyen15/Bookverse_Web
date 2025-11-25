import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaStar,
  FaEye,
  FaCreditCard,
  FaBan,
  FaMapMarkerAlt,
  FaRedoAlt
} from "react-icons/fa";
import { orderApi } from "../../api";
import { useCart } from "../../contexts/CartContext";
import type { OrderResponse } from "../../types";
import {
  CancelOrderModal,
  RefundNotificationModal,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../Order";
import {
  canCancelOrder,
  canChangeAddress,
  requiresRefundNotification,
  formatOrderDate,
  getTotalOrderItems,
} from "../../utils/orderHelpers";

// Using OrderResponse type from types/api/order.types.ts

const OrderStatusIndicator = ({ status, paymentMethod }: { status: string; paymentMethod: string }) => {
  // For COD: PENDING -> CONFIRMED -> PROCESSING -> DELIVERING -> DELIVERED
  // For VNPay: PENDING (or PENDING_PAYMENT) -> CONFIRMED -> PROCESSING -> DELIVERING -> DELIVERED
  const isVNPay = paymentMethod === "VNPAY";

  // Define the status progression based on payment method
  const statuses = isVNPay
    ? ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "DELIVERING", "DELIVERED"]
    : ["PENDING", "CONFIRMED", "PROCESSING", "DELIVERING", "DELIVERED"];

  // For VNPay orders, treat "PENDING" as "PENDING_PAYMENT"
  let currentStatus = status;
  if (isVNPay && status === "PENDING") {
    currentStatus = "PENDING_PAYMENT";
  }

  const currentIndex = statuses.indexOf(currentStatus);

  // Map status to display names
  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    PENDING_PAYMENT: "Pending Payment",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    DELIVERING: "Delivering",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
  };

  return (
    <div className="flex items-center justify-between px-4 mt-6">
      {statuses.map((s, index) => (
        <div key={s} className={`flex items-center ${index < statuses.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${index <= currentIndex
                ? "bg-beige-700 border-beige-700"
                : "bg-white border-gray-300"
                }`}
            >
              <FaCheckCircle className={index <= currentIndex ? "text-white" : "text-gray-300"} size={16} />
            </div>
            <p
              className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${index <= currentIndex ? "text-beige-900" : "text-gray-500"
                }`}
            >
              {statusLabels[s]}
            </p>
          </div>
          {index < statuses.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-3 transition-colors ${index < currentIndex ? "bg-beige-700" : "bg-gray-300"
                }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

const OrderCard = ({
  order,
  onCancelOrder,
}: {
  order: OrderResponse;
  onCancelOrder: (order: OrderResponse) => void;
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [buyingAgain, setBuyingAgain] = useState(false);

  const handleCompletePayment = () => {
    // Redirect to complete payment page
    navigate(`/complete-payment/${order.id}`);
  };

  const handleBuyAgain = async () => {
    try {
      setBuyingAgain(true);

      let successCount = 0;
      let failedCount = 0;

      // Add all items from this order to cart
      for (const item of order.items) {
        try {
          await addToCart(String(item.bookId), "book", item.quantity);
          successCount++;
        } catch (error) {
          console.error(`Failed to add item ${item.bookId} to cart:`, error);
          failedCount++;
        }
      }

      if (successCount > 0) {
        // Navigate to cart page if at least one item was added
        navigate("/cart");
      } else {
        // All items failed to add
        alert("Failed to add items to cart. Please try again.");
      }

      if (failedCount > 0 && successCount > 0) {
        // Some items succeeded, some failed
        alert(`Added ${successCount} item(s) to cart. ${failedCount} item(s) could not be added (might be out of stock or inactive).`);
      }
    } catch (error) {
      console.error("Failed to add items to cart:", error);
      alert("Failed to add items to cart. Please try again.");
    } finally {
      setBuyingAgain(false);
    }
  };

  const handleReview = () => {
    // Navigate to order detail page to show all reviewable books
    navigate(`/order/${order.orderId}`);
  };

  // Determine if payment is pending
  const isPaymentPending = order.payment.method === "VNPAY" && order.payment.status === "PENDING";

  return (
    <div className="p-6 transition-shadow bg-white border rounded-lg shadow-sm border-beige-100 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-beige-900">Order #{order.id}</h3>
            <OrderStatusBadge status={order.status} />
            {order.payment.method === "VNPAY" && (
              <PaymentStatusBadge status={order.payment.status} />
            )}
          </div>
          <p className="mb-2 text-2xl font-bold text-beige-900">
            ${order.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/order/${order.id}`}
            className="p-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </Link>
          {isPaymentPending && (
            <button
              onClick={handleCompletePayment}
              className="p-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              title="Complete Payment"
            >
              <FaCreditCard className="w-4 h-4" />
            </button>
          )}
          {canCancelOrder(order.status) && (
            <button
              onClick={() => onCancelOrder(order)}
              className="p-2 text-red-600 transition-colors bg-white border border-red-300 rounded-lg hover:bg-red-50"
              title="Cancel Order"
            >
              <FaBan className="w-4 h-4" />
            </button>
          )}
          {canChangeAddress(order.status) && (
            <button
              onClick={() => navigate(`/order/${order.id}/change-address`)}
              className="p-2 transition-colors bg-white border rounded-lg text-beige-700 border-beige-300 hover:bg-beige-50"
              title="Change Address"
            >
              <FaMapMarkerAlt className="w-4 h-4" />
            </button>
          )}
          {order.status === "DELIVERED" && (
            <>
              <button
                onClick={handleBuyAgain}
                disabled={buyingAgain}
                className="p-2 text-white transition-colors rounded-lg bg-beige-600 hover:bg-beige-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={buyingAgain ? "Adding to cart..." : "Buy Again"}
              >
                <FaRedoAlt className="w-4 h-4" />
              </button>
              <button
                onClick={handleReview}
                className="p-2 text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
                title="Write Review"
              >
                <FaStar className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
        <OrderStatusIndicator status={order.status} paymentMethod={order.payment.method} />
      )}

      <div className="pt-4 mt-4 border-t border-beige-100">
        <div className="flex flex-wrap items-center text-sm gap-x-3 gap-y-1 text-beige-700">
          <span className="font-medium">{getTotalOrderItems(order)} item{getTotalOrderItems(order) !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span className="font-medium">
            {order.payment.method === "VNPAY" ? "VNPay" : "Cash on Delivery"}
          </span>
          <span>•</span>
          <span>Ordered: {formatOrderDate(order.createdAt)}</span>
          {order.cancelReason && (
            <>
              <span>•</span>
              <span className="text-red-600">Cancel reason: {order.cancelReason}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export function OrderHistory() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderResponse | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelledOrderAmount, setCancelledOrderAmount] = useState(0);

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log("🔄 Loading orders...");
        const myOrders = await orderApi.getMyOrders();
        console.log("✅ Orders received:", myOrders);

        // Orders are already in OrderResponse format from API
        console.log("✅ Orders loaded:", myOrders);
        setOrders(myOrders);
      } catch (error) {
        console.error("❌ Failed to load orders:", error);
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        console.error("Error details:", err.response?.data || err.message);
      }
    };

    loadOrders();
  }, []);

  const handleCancelOrder = (order: OrderResponse) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async (cancelReason: string) => {
    if (!orderToCancel) return;

    try {
      // Check if need to show refund notification before cancelling
      const needsRefundNotification = requiresRefundNotification(orderToCancel);

      // Cancel the order
      await orderApi.cancelMyOrder(orderToCancel.id, { cancelReason });

      // Reload orders to get updated data
      const myOrders = await orderApi.getMyOrders();
      setOrders(myOrders);

      setCancelModalOpen(false);

      // Show refund notification if needed
      if (needsRefundNotification) {
        // Save the order amount before clearing orderToCancel
        setCancelledOrderAmount(orderToCancel.totalAmount);
        setShowRefundModal(true);
      } else {
        alert("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(
        err.response?.data?.message ||
        "Failed to cancel order. Please try again."
      );
    } finally {
      setOrderToCancel(null);
    }
  };

  const upcomingOrders = orders.filter((o) =>
    ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "DELIVERING"].includes(o.status)
  );
  const previousOrders = orders.filter((o) =>
    ["DELIVERED", "CANCELLED", "RETURNED"].includes(o.status)
  );

  const renderOrders = () => {
    let ordersToRender: OrderResponse[] = [];
    switch (activeTab) {
      case "Upcoming":
        ordersToRender = upcomingOrders;
        break;
      case "Previous":
        ordersToRender = previousOrders;
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
          <OrderCard
            key={order.id}
            order={order}
            onCancelOrder={handleCancelOrder}
          />
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
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "Upcoming"
              ? "border-beige-700 text-beige-900"
              : "border-transparent text-beige-600 hover:text-beige-900 hover:border-beige-300"
              }`}
          >
            Upcoming Orders ({upcomingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("Previous")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "Previous"
              ? "border-beige-700 text-beige-900"
              : "border-transparent text-beige-600 hover:text-beige-900 hover:border-beige-300"
              }`}
          >
            Previous Orders ({previousOrders.length})
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
        orderNumber={orderToCancel?.id || 0}
      />

      <RefundNotificationModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        orderAmount={cancelledOrderAmount}
      />
    </div>
  );
}
