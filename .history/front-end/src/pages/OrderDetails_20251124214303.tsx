import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaBox, FaTruck, FaMapMarkerAlt, FaCreditCard, FaStar } from "react-icons/fa";
import { orderApi } from "../api";
import type { OrderResponse } from "../types";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  CancelOrderModal,
  RefundNotificationModal,
} from "../components/Order";
import {
  canCancelOrder,
  canChangeAddress,
  requiresRefundNotification,
  formatOrderDate,
  getTotalOrderItems,
} from "../utils/orderHelpers";

// Timeline component showing order status progression
const OrderTimeline = ({ order }: { order: OrderResponse }) => {
  const isVNPay = order.payment?.method === "VNPAY";
  
  // Define status progression based on payment method
  const statuses = isVNPay
    ? ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "DELIVERING", "DELIVERED"]
    : ["PENDING", "CONFIRMED", "PROCESSING", "DELIVERING", "DELIVERED"];

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    PENDING_PAYMENT: "Pending Payment",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    DELIVERING: "Delivering",
    DELIVERED: "Delivered",
  };

  const statusIcons: Record<string, React.ReactElement> = {
    PENDING: <FaBox />,
    PENDING_PAYMENT: <FaCreditCard />,
    CONFIRMED: <FaCheckCircle />,
    PROCESSING: <FaBox />,
    DELIVERING: <FaTruck />,
    DELIVERED: <FaCheckCircle />,
  };

  // Handle cancelled/returned orders
  if (order.status === "CANCELLED" || order.status === "RETURNED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-center gap-3">
          <FaTimesCircle className="text-red-500 text-3xl" />
          <div>
            <h3 className="text-lg font-semibold text-red-700">
              Order {order.status === "CANCELLED" ? "Cancelled" : "Returned"}
            </h3>
            {order.cancelReason && (
              <p className="text-sm text-red-600 mt-1">Reason: {order.cancelReason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  let currentStatus = order.status;
  if (isVNPay && order.status === "PENDING") {
    currentStatus = "PENDING_PAYMENT";
  }

  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-lg border border-beige-200 p-6">
      <h3 className="text-lg font-semibold text-beige-900 mb-6">Order Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-beige-700 transition-all duration-500"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          />
        </div>

        {/* Timeline steps */}
        <div className="relative flex justify-between">
          {statuses.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status} className="flex flex-col items-center" style={{ flex: 1 }}>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${
                    isCompleted
                      ? "bg-beige-700 border-beige-700 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-beige-200 scale-110" : ""}`}
                >
                  <div className="text-2xl">{statusIcons[status]}</div>
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isCompleted ? "text-beige-900" : "text-gray-500"
                    }`}
                  >
                    {statusLabels[status]}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatOrderDate(order.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const orderData = await orderApi.getOrderById(Number(id));
      setOrder(orderData);
    } catch (error) {
      console.error("Failed to load order:", error);
      alert("Failed to load order details. Please try again.");
      navigate("/my-account/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (cancelReason: string) => {
    if (!order) return;

    try {
      const needsRefundNotification = requiresRefundNotification(order);

      await orderApi.cancelMyOrder(order.id, { cancelReason });
      await loadOrder();

      setCancelModalOpen(false);

      if (needsRefundNotification) {
        setShowRefundModal(true);
      } else {
        alert("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to cancel order. Please try again.");
    }
  };

  const handleCompletePayment = () => {
    navigate(`/complete-payment/${order?.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Order not found</p>
          <Link to="/my-account/orders" className="text-beige-700 hover:underline mt-2 inline-block">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentPending = order.payment?.method === "VNPAY" && order.payment?.status === "PENDING";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/my-account/orders"
            className="text-beige-700 hover:underline mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-beige-900">Order #{order.id}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              {order.payment?.method === "VNPAY" && (
                <PaymentStatusBadge status={order.payment.status} />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {isPaymentPending && (
            <button
              onClick={handleCompletePayment}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-semibold animate-pulse"
            >
              Complete Payment
            </button>
          )}
          {canCancelOrder(order.status) && !isPaymentPending && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-6 py-3 border-2 rounded-lg text-red-600 bg-white border-red-300 hover:bg-red-50 transition-colors font-semibold"
            >
              Cancel Order
            </button>
          )}
          {canChangeAddress(order.status) && !isPaymentPending && (
            <button
              onClick={() => navigate(`/order/${order.id}/change-address`)}
              className="px-6 py-3 border-2 rounded-lg text-beige-700 bg-white border-beige-300 hover:bg-beige-50 transition-colors font-semibold"
            >
              Change Address
            </button>
          )}
          {order.status === "DELIVERED" && (
            <button
              onClick={() => navigate(`/order/${order.id}/review`)}
              className="flex items-center gap-2 px-6 py-3 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
            >
              <FaStar /> Leave Review
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <OrderTimeline order={order} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-beige-200 p-6">
              <h3 className="text-lg font-semibold text-beige-900 mb-4">
                Order Items ({getTotalOrderItems(order)})
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="w-20 h-28 bg-gray-200 rounded overflow-hidden shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-beige-100">
                        <FaBox className="text-2xl text-beige-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.bookTitle}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-beige-700 text-lg">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ${order.orderItems.reduce((sum: number, item) => sum + item.quantity * item.price, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-200">
                  <span className="text-beige-900">Total</span>
                  <span className="text-beige-700">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information Sidebar */}
          <div className="space-y-4">
            {/* Payment Information */}
            <div className="bg-white rounded-lg border border-beige-200 p-6">
              <h3 className="text-lg font-semibold text-beige-900 mb-4 flex items-center gap-2">
                <FaCreditCard className="text-beige-700" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">
                    {order.payment?.method === "VNPAY" ? "VNPay" : "Cash on Delivery"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <div className="mt-1">
                    <PaymentStatusBadge status={order.payment?.status || "PENDING"} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-beige-700 text-xl">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border border-beige-200 p-6">
              <h3 className="text-lg font-semibold text-beige-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-beige-700" />
                Shipping Address
              </h3>
              <div>
                <p className="text-sm text-gray-600 mb-2">Deliver to:</p>
                <p className="text-gray-900 font-medium">{order.userName}</p>
                <p className="text-gray-700 mt-2">{order.address}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg border border-beige-200 p-6">
              <h3 className="text-lg font-semibold text-beige-900 mb-4">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{order.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        orderNumber={order.id}
      />

      <RefundNotificationModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        orderAmount={order.totalAmount}
      />
    </div>
  );
}
