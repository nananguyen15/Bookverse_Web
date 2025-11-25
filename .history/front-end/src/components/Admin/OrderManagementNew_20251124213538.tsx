import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { orderApi, notificationApi, paymentApi } from "../../api";
import type { OrderResponse, OrderStatus, PaymentStatus } from "../../types";
import {
  ManagementLayout,
  ManagementPageLayout,
  NewSortableHeader,
  SimpleTableHeader,
  NewPagination,
  SearchBar,
  FilterDropdown,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  Modal,
  ModalActions,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  OrderStatusUpdate,
} from "../Order";
import {
  formatOrderDate,
  getTotalOrderItems,
  getNextAllowedStatuses,
} from "../../utils/orderHelpers";

type SortField = "no" | "id" | "date" | "total" | "customer" | "payment";

export function OrderManagementNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const isStaffRoute = location.pathname.startsWith("/staff");

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [sortField, setSortField] = useState<SortField | null>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [cancelReason, setCancelReason] = useState("");

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderApi.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      alert("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredOrders = orders
    .filter((order) => {
      const matchSearch =
        order.id.toString().includes(searchTerm) ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || order.status === statusFilter;
      const matchPayment = paymentFilter === "all" || order.payment?.status === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    })
    .map((order, index) => ({ ...order, originalIndex: index }))
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "no":
          aVal = a.originalIndex;
          bVal = b.originalIndex;
          break;
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "date":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "total":
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case "customer":
          aVal = a.userName.toLowerCase();
          bVal = b.userName.toLowerCase();
          break;
        case "payment":
          aVal = a.payment?.status || "PENDING";
          bVal = b.payment?.status || "PENDING";
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sort handler
  const handleSort = (key: SortField) => {
    if (sortField === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(key);
      setSortOrder("asc");
    }
  };

  // Handlers
  const openViewModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const openEditStatusModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setShowEditStatusModal(true);
  };

  const openCancelModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      // Update order status to CANCELLED
      await orderApi.updateOrder(selectedOrder.id, {
        status: "CANCELLED",
        address: selectedOrder.address,
      });

      // Send notification to customer
      try {
        await notificationApi.createPersonal({
          content: `Your order #${selectedOrder.id} has been cancelled. Reason: ${cancelReason}`,
          type: "FOR_CUSTOMERS_PERSONAL",
          targetUserId: selectedOrder.userId,
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
        // Continue even if notification fails
      }

      // Reload orders
      await loadOrders();

      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancelReason("");
      alert("Order cancelled successfully! Customer has been notified.");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const handleMarkRefunded = async () => {
    if (!selectedOrder || !selectedOrder.payment) return;

    try {
      await paymentApi.markPaymentRefunded(selectedOrder.payment.id);

      // Send notification to customer
      try {
        await notificationApi.createPersonal({
          content: `Your refund for order #${selectedOrder.id} (${selectedOrder.totalAmount.toFixed(2)}) has been processed successfully.`,
          type: "FOR_CUSTOMERS_PERSONAL",
          targetUserId: selectedOrder.userId,
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      // Reload orders
      await loadOrders();

      setShowRefundModal(false);
      setSelectedOrder(null);
      alert("Payment marked as refunded successfully!");
    } catch (error) {
      console.error("Failed to mark payment as refunded:", error);
      alert("Failed to mark payment as refunded. Please try again.");
    }
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading...</p>
        </div>
      </div>
    );

    return isStaffRoute ? loadingContent : <ManagementLayout>{loadingContent}</ManagementLayout>;
  }

  const content = (
    <>
      <ManagementPageLayout
        title="Order Management"
        totalCount={filteredOrders.length}
        entityName="orders"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by order ID, customer..."
          />
        }
        filterBar={
          <div className="flex gap-3">
            <FilterDropdown
              label="Order Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as "all" | OrderStatus);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Status" },
                { value: "PENDING", label: "Pending" },
                { value: "PENDING_PAYMENT", label: "Pending Payment" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "PROCESSING", label: "Processing" },
                { value: "DELIVERING", label: "Delivering" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "RETURNED", label: "Returned" },
              ]}
            />
            <FilterDropdown
              label="Payment Status"
              value={paymentFilter}
              onChange={(value) => {
                setPaymentFilter(value as "all" | PaymentStatus);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Payment" },
                { value: "PENDING", label: "Pending" },
                { value: "SUCCESS", label: "Paid" },
                { value: "FAILED", label: "Failed" },
                { value: "REFUNDING", label: "Refunding" },
                { value: "REFUNDED", label: "Refunded" },
              ]}
            />
          </div>
        }
        table={
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <NewSortableHeader
                  label="No"
                  sortKey="no"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Order ID"
                  sortKey="id"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Customer"
                  sortKey="customer"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Order Date"
                  sortKey="date"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Total"
                  sortKey="total"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <SimpleTableHeader label="Payment Method" align="center" />
                <NewSortableHeader
                  label="Payment Status"
                  sortKey="payment"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="center"
                />
                <SimpleTableHeader label="Order Status" align="center" />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-beige-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-beige-50 transition-colors">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {order.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <div>
                        <TableCellText className="font-medium">#{order.id}</TableCellText>
                        {order.cancelReason && (
                          <TableCellText variant="secondary" className="text-xs text-red-600 mt-1">
                            Cancelled: {order.cancelReason.substring(0, 30)}{order.cancelReason.length > 30 ? '...' : ''}
                          </TableCellText>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TableCellText>{order.userName}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">
                        {formatOrderDate(order.createdAt)}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="right">
                      <TableCellText className="font-semibold text-beige-700">
                        ${order.totalAmount.toFixed(2)}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <TableCellText variant="secondary" className="text-xs">
                        {order.payment?.method === "VNPAY" ? "VNPay" : "COD"}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <PaymentStatusBadge status={order.payment?.status || "PENDING"} />
                    </TableCell>
                    <TableCell align="center">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(order)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditStatusModal(order)}
                          icon="edit"
                          title="Update Status"
                        />
                        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                          <ActionButton
                            onClick={() => openCancelModal(order)}
                            icon="cancel"
                            title="Cancel Order"
                          />
                        )}
                        {order.payment?.status === "REFUNDING" && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowRefundModal(true);
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Mark as Refunded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </ActionButtonGroup>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        }
        pagination={
          <NewPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredOrders.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        }
      />

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedOrder(null);
        }}
        title={`Order #${selectedOrder?.id || ""}`}
        maxWidth="3xl"
      >
        {selectedOrder && (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="Order ID" value={`#${selectedOrder.id}`} />
                <ViewDetailsRow label="Customer" value={selectedOrder.userName} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Order Date"
                  value={new Date(selectedOrder.createdAt).toLocaleString()}
                />
                <ViewDetailsRow label="Status" value={<OrderStatusBadge status={selectedOrder.status} />} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Payment Method"
                  value={selectedOrder.payment?.method === "VNPAY" ? "VNPay" : "Cash on Delivery"}
                />
                <ViewDetailsRow
                  label="Payment Status"
                  value={<PaymentStatusBadge status={selectedOrder.payment?.status || "PENDING"} />}
                />
              </ViewDetailsGrid>

              {selectedOrder.cancelReason && (
                <div className="col-span-2 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Cancellation Reason</h4>
                  <p className="text-gray-700 text-sm">{selectedOrder.cancelReason}</p>
                </div>
              )}

              {selectedOrder.address && (
                <div className="col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-beige-700 mb-2">Shipping Address</h4>
                  <p className="text-gray-700 text-sm">{selectedOrder.address}</p>
                </div>
              )}

              <div className="col-span-2 mt-4">
                <h4 className="text-sm font-semibold text-beige-700 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-beige-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.bookTitle}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-beige-700">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <ViewDetailsGrid>
                <div className="col-span-2 flex justify-end pt-4 border-t">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-beige-700">
                      Total: ${selectedOrder.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </ViewDetailsGrid>
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Edit Status Modal with OrderStatusUpdate component */}
      <Modal
        isOpen={showEditStatusModal}
        onClose={() => {
          setShowEditStatusModal(false);
          setSelectedOrder(null);
        }}
        title={`Update Status - Order #${selectedOrder?.id || ""}`}
        maxWidth="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-4 bg-beige-50 border border-beige-200 rounded-lg">
              <ViewDetailsGrid>
                <ViewDetailsRow label="Customer" value={selectedOrder.userName} />
                <ViewDetailsRow 
                  label="Total" 
                  value={`$${selectedOrder.totalAmount.toFixed(2)}`} 
                />
                <ViewDetailsRow 
                  label="Current Status" 
                  value={<OrderStatusBadge status={selectedOrder.status} />} 
                />
                <ViewDetailsRow 
                  label="Payment" 
                  value={<PaymentStatusBadge status={selectedOrder.payment?.status || "PENDING"} />} 
                />
              </ViewDetailsGrid>
            </div>

            <OrderStatusUpdate
              orderId={selectedOrder.id}
              currentStatus={selectedOrder.status}
              onUpdate={async () => {
                await loadOrders();
                setShowEditStatusModal(false);
                setSelectedOrder(null);
              }}
            />

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setShowEditStatusModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal with Reason */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedOrder(null);
          setCancelReason("");
        }}
        title={`Cancel Order #${selectedOrder?.id || ""}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCancelOrder();
          }}
        >
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> Cancelling this order will notify the customer.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <p className="text-gray-900 font-medium">{selectedOrder?.userName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Total
              </label>
              <p className="text-gray-900 font-medium">
                ${selectedOrder?.totalAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500 min-h-[100px]"
                required
                placeholder="e.g., Out of stock, Payment not confirmed, Customer request, etc."
                title="Enter cancellation reason"
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be sent to the customer in a notification.
              </p>
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowCancelModal(false);
              setSelectedOrder(null);
              setCancelReason("");
            }}
            confirmText="Cancel Order & Notify Customer"
            cancelText="Go Back"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Mark Payment as Refunded Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedOrder(null);
        }}
        title="Mark Payment as Refunded"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Confirmation:</strong> This action will mark the payment as refunded and notify the customer.
            </p>
          </div>

          {selectedOrder && (
            <>
              <ViewDetailsGrid>
                <ViewDetailsRow label="Order ID" value={`#${selectedOrder.id}`} />
                <ViewDetailsRow label="Customer" value={selectedOrder.userName} />
                <ViewDetailsRow 
                  label="Refund Amount" 
                  value={<span className="text-lg font-bold text-green-600">${selectedOrder.totalAmount.toFixed(2)}</span>} 
                />
                <ViewDetailsRow 
                  label="Payment Status" 
                  value={<PaymentStatusBadge status={selectedOrder.payment?.status || "PENDING"} />} 
                />
              </ViewDetailsGrid>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Please Confirm:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>The refund has been processed in your payment system</li>
                  <li>The customer will be notified via email/notification</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </>
          )}

          <ModalActions
            onCancel={() => {
              setShowRefundModal(false);
              setSelectedOrder(null);
            }}
            onConfirm={handleMarkRefunded}
            confirmText="Confirm Refund Completed"
            cancelText="Cancel"
          />
        </div>
      </Modal>
    </>
  );

  return isStaffRoute ? content : <ManagementLayout>{content}</ManagementLayout>;
}