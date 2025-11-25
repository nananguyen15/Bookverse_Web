import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen, FaCheckCircle, FaStar } from "react-icons/fa";
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
    PENDING: "Chờ xác nhận",
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    DELIVERING: "Đang giao",
    DELIVERED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    RETURNED: "Đã trả",
  };

  return (
    <div className="flex items-center justify-between mt-6 px-4">
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
    navigate(`/complete-payment/${order.orderId}`);
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
  const isPaymentPending = order.paymentMethod === "VNPAY" && order.paymentStatus === "PENDING";

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm border-beige-100 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-beige-900">Đơn hàng #{order.id}</h3>
            <OrderStatusBadge status={order.status} />
            {order.payment.method === "VNPAY" && (
              <PaymentStatusBadge status={order.payment.status} />
            )}
          </div>
          <p className="text-2xl font-bold text-beige-900 mb-2">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(order.totalAmount)}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Link
            to={`/order/${order.id}`}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-beige-700 hover:bg-beige-800 transition-colors"
          >
            Xem chi tiết
          </Link>
          {isPaymentPending && (
            <button
              onClick={handleCompletePayment}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors animate-pulse"
            >
              Tiếp tục thanh toán
            </button>
          )}
          {canCancelOrder(order.status) && !isPaymentPending && (
            <button
              onClick={() => onCancelOrder(order)}
              className="px-5 py-2.5 text-sm font-semibold border-2 rounded-lg text-red-600 bg-white border-red-300 hover:bg-red-50 transition-colors"
            >
              Hủy đơn hàng
            </button>
          )}
          {canChangeAddress(order.status) && !isPaymentPending && (
            <button
              onClick={() => navigate(`/order/${order.id}/change-address`)}
              className="px-5 py-2.5 text-sm font-semibold border-2 rounded-lg text-beige-700 bg-white border-beige-300 hover:bg-beige-50 transition-colors"
            >
              Đổi địa chỉ
            </button>
          )}
          {order.status === "DELIVERED" && (
            <>
              <button
                onClick={handleBuyAgain}
                disabled={buyingAgain}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-beige-600 hover:bg-beige-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buyingAgain ? "Adding..." : "Buy It Again"}
              </button>
              <button
                onClick={handleReview}
                className="flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <FaStar className="mr-1" /> Review
              </button>
            </>
          )}
        </div>
      </div>

      {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
        <OrderStatusIndicator status={order.status} paymentMethod={order.payment.method} />
      )}

      <div className="pt-4 mt-4 border-t border-beige-100">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-beige-700">
          <span className="font-medium">{getTotalOrderItems(order)} sản phẩm</span>
          <span>•</span>
          <span className="font-medium">
            {order.payment.method === "VNPAY" ? "VNPay" : "Tiền mặt khi nhận hàng"}
          </span>
          <span>•</span>
          <span>Đặt hàng: {formatOrderDate(order.createdAt)}</span>
          {order.cancelReason && (
            <>
              <span>•</span>
              <span className="text-red-600">Lý do hủy: {order.cancelReason}</span>
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
        setShowRefundModal(true);
      } else {
        alert("Đơn hàng đã được hủy thành công");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(
        err.response?.data?.message ||
          "Không thể hủy đơn hàng. Vui lòng thử lại."
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
        orderAmount={orderToCancel?.totalAmount || 0}
      />
    </div>
  );
}
