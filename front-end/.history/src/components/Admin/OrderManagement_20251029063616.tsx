import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEye, FaEdit, FaTimes, FaDownload } from "react-icons/fa";

type OrderStatus = "Preparing" | "Confirmed" | "Picked up" | "Delivered" | "Cancelled";

interface OrderItem {
  id: number | string;
  title: string;
  quantity: number;
  price: number;
  coverImage?: string;
}

interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  summary: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  paymentMethod: string;
  shippingInfo?: {
    fullName?: string;
    phone?: string;
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
  estimatedDelivery?: string;
  cancelReason?: string;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("Preparing");
  const [cancelReason, setCancelReason] = useState("");

  // Load orders from localStorage
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const ordersData = JSON.parse(localStorage.getItem("orders") || "[]");
    
    // Normalize orders with customer info
    const normalizedOrders = ordersData.map((order: Order) => ({
      orderId: order.orderId || Date.now().toString(),
      customerId: order.customerId || "",
      customerName: order.customerName || "Unknown Customer",
      customerEmail: order.customerEmail || "",
      orderDate: order.orderDate || new Date().toISOString(),
      status: order.status || "Preparing",
      items: order.items || [],
      summary: order.summary || { subtotal: 0, shipping: 0, total: 0 },
      paymentMethod: order.paymentMethod || "Cash",
      shippingInfo: order.shippingInfo || {},
      estimatedDelivery: order.estimatedDelivery || "",
      cancelReason: order.cancelReason || "",
    }));

    setOrders(normalizedOrders);
  };

  const saveOrders = (updatedOrders: Order[]) => {
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          o.customerEmail.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortBy === "date") {
        aVal = new Date(a.orderDate).getTime();
        bVal = new Date(b.orderDate).getTime();
      } else {
        aVal = a.summary.total;
        bVal = b.summary.total;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleEditStatus = () => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map((o) =>
      o.orderId === selectedOrder.orderId ? { ...o, status: newStatus } : o
    );

    saveOrders(updatedOrders);
    setShowEditStatusModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = () => {
    if (!selectedOrder || !cancelReason.trim()) {
      alert("Please provide a reason for cancelling this order");
      return;
    }

    const updatedOrders = orders.map((o) =>
      o.orderId === selectedOrder.orderId
        ? { ...o, status: "Cancelled" as const, cancelReason }
        : o
    );

    saveOrders(updatedOrders);
    
    // Create notification
    createNotification(
      `Order Cancelled`,
      `Order #${selectedOrder.orderId} has been cancelled. Reason: ${cancelReason}`,
      "order_action"
    );

    setShowCancelModal(false);
    setSelectedOrder(null);
    setCancelReason("");
  };

  const createNotification = (title: string, description: string, type: string) => {
    const notifications = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    notifications.unshift({
      id: Date.now().toString(),
      title,
      description,
      createdAt: new Date().toISOString(),
      type,
    });
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const openEditStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowEditStatusModal(true);
  };

  const openCancelModal = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Preparing":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      case "Picked up":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAddress = (shippingInfo: Order["shippingInfo"]) => {
    if (!shippingInfo) return "N/A";
    const parts = [
      shippingInfo.street,
      shippingInfo.ward,
      shippingInfo.district,
      shippingInfo.province,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : shippingInfo.address || "N/A";
  };

  const exportOrders = () => {
    const dataStr = JSON.stringify(filteredOrders, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-beige-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-beige-900 font-heading">
          Order Management
        </h1>
        <p className="text-beige-600 mt-1">
          Manage and monitor all customer orders
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer name, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="Preparing">Preparing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Picked up">Picked up</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Export Button */}
          <div>
            <button
              onClick={exportOrders}
              className="w-full bg-beige-600 hover:bg-beige-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload />
              Export Orders
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex gap-4 items-center">
          <span className="text-sm text-beige-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
            aria-label="Sort by"
          >
            <option value="date">Date</option>
            <option value="total">Total Amount</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm hover:bg-beige-50"
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-beige-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm font-medium text-beige-900">
                      #{order.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {order.customerEmail}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-beige-900">
                      ${order.summary.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {order.status !== "Cancelled" && order.status !== "Delivered" && (
                          <>
                            <button
                              onClick={() => openEditStatusModal(order)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit Status"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openCancelModal(order)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Order"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-beige-50 px-4 py-3 border-t border-beige-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-beige-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-beige-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-beige-600">
              entries (Total: {filteredOrders.length})
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-beige-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Order Details - #{selectedOrder.orderId}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-beige-900 mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.customerName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.customerEmail}
                    </p>
                    {selectedOrder.shippingInfo?.phone && (
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedOrder.shippingInfo.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-beige-900 mb-3">
                    Order Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Order Date:</span>{" "}
                      {new Date(selectedOrder.orderDate).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Payment Method:</span>{" "}
                      {selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                    {selectedOrder.estimatedDelivery && (
                      <p>
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {selectedOrder.estimatedDelivery}
                      </p>
                    )}
                    {selectedOrder.cancelReason && (
                      <p>
                        <span className="font-medium text-red-600">Cancel Reason:</span>{" "}
                        {selectedOrder.cancelReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-beige-900 mb-3">
                    Shipping Address
                  </h3>
                  <p className="text-sm text-beige-700">
                    {formatAddress(selectedOrder.shippingInfo)}
                  </p>
                </div>

                {/* Order Items */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-beige-900 mb-3">
                    Order Items
                  </h3>
                  <div className="border border-beige-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-beige-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-beige-900">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-beige-900">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-beige-900">
                            Price
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-beige-900">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-beige-900">
                              {item.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-beige-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-beige-900">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-beige-900">
                              ${(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-2">
                  <div className="bg-beige-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${selectedOrder.summary.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${selectedOrder.summary.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-beige-300 pt-2">
                        <span>Total:</span>
                        <span>${selectedOrder.summary.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Update Order Status
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Update status for Order <strong>#{selectedOrder.orderId}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                >
                  <option value="Preparing">Preparing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Picked up">Picked up</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditStatusModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStatus}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Cancel Order
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to cancel Order{" "}
                <strong>#{selectedOrder.orderId}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  rows={3}
                  placeholder="Please provide a reason for cancelling this order..."
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
