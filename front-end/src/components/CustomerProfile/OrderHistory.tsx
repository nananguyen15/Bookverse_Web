import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen, FaCheckCircle, FaStar } from "react-icons/fa";
import { CancelOrderModal } from "./CancelOrderModal";
import { orderApi } from "../../api";
import { useCart } from "../../contexts/CartContext";

type OrderStatus =
  | "PENDING"           // COD: Pending approval
  | "PENDING_PAYMENT"   // VNPay: Waiting for payment
  | "CONFIRMED"         // Approved by staff/admin
  | "PREPARING"         // Being prepared
  | "DELIVERING"        // Out for delivery
  | "DELIVERED"         // Completed
  | "CANCELLED"         // Cancelled
  | "RETURNED";         // Returned

interface OrderItem {
  id: number | string;
  bookId: number;
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
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED";
  shippingInfo?: {
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  estimatedDelivery?: string;
}

const OrderStatusIndicator = ({ status, paymentMethod }: { status: OrderStatus; paymentMethod: string }) => {
  // For COD: PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> DELIVERED
  // For VNPay: PENDING (or PENDING_PAYMENT) -> CONFIRMED -> PREPARING -> DELIVERING -> DELIVERED
  const isVNPay = paymentMethod === "VNPAY";

  // Define the status progression based on payment method
  const statuses: OrderStatus[] = isVNPay
    ? ["PENDING_PAYMENT", "CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED"]
    : ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED"];

  // For VNPay orders, treat "PENDING" as "PENDING_PAYMENT"
  let currentStatus = status;
  if (isVNPay && status === "PENDING") {
    currentStatus = "PENDING_PAYMENT";
  }

  const currentIndex = statuses.indexOf(currentStatus);

  // Map status to display names
  const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    PENDING_PAYMENT: "Pending Payment",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    DELIVERING: "Delivering",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
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
  order: Order;
  onCancelOrder: (orderId: string) => void;
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
            <h3 className="text-lg font-bold text-beige-900">Order #{order.orderId}</h3>
            {/* Order Status Badge */}
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === "PENDING" && order.paymentMethod === "VNPAY" ? "bg-orange-100 text-orange-800" :
                order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                  order.status === "PENDING_PAYMENT" ? "bg-orange-100 text-orange-800" :
                    order.status === "CONFIRMED" ? "bg-purple-100 text-purple-800" :
                      order.status === "PREPARING" ? "bg-blue-100 text-blue-800" :
                        order.status === "DELIVERING" ? "bg-indigo-100 text-indigo-800" :
                          order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                            order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
              }`}>
              {order.status === "PENDING" && order.paymentMethod === "VNPAY" ? "PENDING PAYMENT" :
                order.status === "PENDING_PAYMENT" ? "PENDING PAYMENT" :
                  order.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-beige-900 mb-2">
            ${order.summary.total.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Link
            to={`/order/${order.orderId}`}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-beige-700 hover:bg-beige-800 transition-colors"
          >
            View Details
          </Link>
          {isPaymentPending && (
            <button
              onClick={handleCompletePayment}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors animate-pulse"
            >
              Continue Payment
            </button>
          )}
          {(order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "PREPARING") && !isPaymentPending && (
            <button
              onClick={() => onCancelOrder(order.orderId)}
              className="px-5 py-2.5 text-sm font-semibold border-2 rounded-lg text-beige-700 bg-white border-beige-300 hover:bg-beige-50 transition-colors"
            >
              Cancel Order
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
        <OrderStatusIndicator status={order.status} paymentMethod={order.paymentMethod} />
      )}

      <div className="pt-4 mt-4 border-t border-beige-100">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-beige-700">
          <span className="font-medium">{order.items.length} Items</span>
          <span>•</span>
          <span className="font-medium">
            {order.paymentMethod === "VNPAY" ? "VNPay" : order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
          </span>
          <span>•</span>
          <span>Ordered {new Date(order.orderDate).toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}</span>
        </div>
      </div>
    </div>
  );
};

export function OrderHistory() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log("🔄 Loading orders...");
        const myOrders = await orderApi.getMyOrders();
        console.log("✅ Orders received:", myOrders);

        // Transform API response to match component's Order interface
        const transformedOrders = myOrders.map(order => {
          console.log("📦 Transforming order:", order);
          return {
            orderId: order.id.toString(),
            orderDate: order.createdAt,
            status: order.status as OrderStatus,
            items: order.orderItems?.map(item => ({
              id: item.id,
              bookId: item.bookId,
              title: item.bookTitle,
              quantity: item.quantity,
              price: item.price,
            })) || [],
            summary: {
              total: order.totalAmount,
            },
            paymentMethod: order.payment?.method || "Unknown",
            paymentStatus: order.payment?.status as "PENDING" | "SUCCESS" | "FAILED" | undefined,
            shippingInfo: {
              address: order.address,
            },
          };
        });
        console.log("✅ Transformed orders:", transformedOrders);
        setOrders(transformedOrders);
      } catch (error) {
        console.error("❌ Failed to load orders:", error);
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        console.error("Error details:", err.response?.data || err.message);
      }
    };

    loadOrders();
  }, []);

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async (_reason: string, details: string) => {
    if (orderToCancel) {
      try {
        await orderApi.cancelMyOrder(parseInt(orderToCancel));
        // Update local state
        const updatedOrders = orders.map((order) =>
          order.orderId === orderToCancel
            ? {
              ...order,
              status: "CANCELLED" as OrderStatus,
              cancelReason: details,
            }
            : order
        );
        setOrders(updatedOrders);
        alert(`Order ${orderToCancel} has been cancelled.\nReason: ${details}`);
      } catch (error) {
        console.error("Failed to cancel order:", error);
        alert("Failed to cancel order. Please try again.");
      }
    }
    setCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const upcomingOrders = orders.filter((o) =>
    ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "PREPARING", "DELIVERING"].includes(o.status)
  );
  const previousOrders = orders.filter((o) =>
    ["DELIVERED", "CANCELLED", "RETURNED"].includes(o.status)
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
            key={order.orderId}
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
      />
    </div>
  );
}
