import { useState, useEffect } from "react";
import { FaBell, FaBroadcastTower, FaUser } from "react-icons/fa";
import {
  ManagementLayout,
  NewSortableHeader,
  SimpleTableHeader,
  NewPagination,
  SearchBar,
  FilterDropdown,
  TableCell,
  ActionButton,
  Modal,
  ModalActions,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";
import { notificationApi, usersApi } from "../../api";
import type {
  NotificationType,
  CreatePersonalNotificationRequest,
  CreateBroadcastNotificationRequest,
} from "../../api/endpoints/notification.api";
import type { User } from "../../types";

// Notification types
type NotificationRecord = {
  id: number;
  content: string;
  type: string;
  targetRole: string;
  recipientName?: string;
  createdAt: string;
  readCount?: number;
  totalCount?: number;
};

type SortField = "id" | "readStatus" | "createdAt";
type TypeFilter = "all" | "personal" | "broadcast";
type RoleFilter = "all" | "customer" | "staff" | "admin";

interface NotificationManagementProps {
  noLayout?: boolean; // When true, renders without ManagementLayout wrapper (for use in StaffLayout)
}

export function NotificationManagement({ noLayout = false }: NotificationManagementProps = {}) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortField, setSortField] = useState<SortField | null>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    content: "",
    targetUserId: "",
    userRole: "customer" as "customer" | "staff" | "admin",
  });

  const [broadcastForm, setBroadcastForm] = useState({
    content: "",
    targetRole: "customer" as "customer" | "staff" | "admin",
  });

  const [editForm, setEditForm] = useState({
    content: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [customers, staffs, apiNotifications] = await Promise.all([
        usersApi.getCustomers(),
        usersApi.getStaffs(),
        notificationApi.getAll(),
      ]);
      setUsers([...customers, ...staffs]);

      // Transform API notifications to NotificationRecord format
      const allUsers = [...customers, ...staffs];
      const transformedNotifications: NotificationRecord[] = apiNotifications.map((notif) => {
        const isPersonal = notif.type.includes("PERSONAL");
        let targetRole = "System";
        if (notif.type.includes("CUSTOMERS")) targetRole = "Customer";
        else if (notif.type.includes("STAFFS")) targetRole = "Staff";
        else if (notif.type.includes("ADMINS")) targetRole = "Admin";

        // Find recipient name for personal notifications using userId from backend
        let recipientName: string | undefined;
        if (isPersonal && notif.userId) {
          const user = allUsers.find(u => u.id === notif.userId);
          if (user) {
            recipientName = `${user.name} (${user.email})`;
          } else {
            // If user not found in customers/staffs list, show userId as fallback
            recipientName = `User ${notif.userId}`;
          }
        }

        return {
          id: notif.id,
          content: notif.content,
          type: isPersonal ? "Personal" : "Broadcast",
          targetRole,
          createdAt: notif.createdAt,
          readCount: notif.read ? 1 : 0,
          totalCount: 1,
          readPercentage: notif.read ? 100 : 0,
          recipientName,
        };
      });

      // Group broadcast notifications by content + type + targetRole
      const groupedMap = new Map<string, NotificationRecord>();

      transformedNotifications.forEach((notif) => {
        if (notif.type === "Broadcast") {
          // Create unique key for grouping
          const key = `${notif.content}|${notif.type}|${notif.targetRole}`;

          if (groupedMap.has(key)) {
            // Add to existing group
            const existing = groupedMap.get(key)!;
            existing.readCount = (existing.readCount || 0) + (notif.readCount || 0);
            existing.totalCount = (existing.totalCount || 0) + (notif.totalCount || 0);
            // Keep the earliest createdAt
            if (new Date(notif.createdAt) < new Date(existing.createdAt)) {
              existing.createdAt = notif.createdAt;
            }
          } else {
            // First occurrence - add to map
            groupedMap.set(key, { ...notif });
          }
        } else {
          // Personal notifications - keep as-is with unique key
          const key = `personal|${notif.id}`;
          groupedMap.set(key, notif);
        }
      });

      // Convert map to array
      const groupedNotifications = Array.from(groupedMap.values());

      setNotifications(groupedNotifications);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleCreatePersonal = async () => {
    try {
      if (!personalForm.content.trim() || !personalForm.targetUserId) {
        alert("Please fill all required fields!");
        return;
      }

      let type: NotificationType;
      if (personalForm.userRole === "customer") {
        type = "FOR_CUSTOMERS_PERSONAL";
      } else if (personalForm.userRole === "staff") {
        type = "FOR_STAFFS_PERSONAL";
      } else {
        type = "FOR_ADMINS_PERSONAL";
      }

      const data: CreatePersonalNotificationRequest = {
        content: personalForm.content.trim(),
        type,
        targetUserId: personalForm.targetUserId,
      };

      await notificationApi.createPersonal(data);

      alert("Personal notification sent successfully!");
      setShowPersonalModal(false);
      resetPersonalForm();

      // Reload notifications from API
      await loadAllData();
    } catch (error) {
      console.error("Error creating personal notification:", error);
      alert("Failed to send notification");
    }
  };

  const handleCreateBroadcast = async () => {
    try {
      if (!broadcastForm.content.trim()) {
        alert("Content is required!");
        return;
      }

      let type: NotificationType;
      if (broadcastForm.targetRole === "customer") {
        type = "FOR_CUSTOMERS";
      } else if (broadcastForm.targetRole === "staff") {
        type = "FOR_STAFFS";
      } else {
        type = "FOR_ADMINS";
      }

      const data: CreateBroadcastNotificationRequest = {
        content: broadcastForm.content.trim(),
        type,
      };

      const recipients = await notificationApi.createBroadcast(data);
      const count = Array.isArray(recipients) ? recipients.length : 0;

      alert(`Broadcast notification sent to ${count} users!`);
      setShowBroadcastModal(false);
      resetBroadcastForm();

      // Reload notifications from API
      await loadAllData();
    } catch (error) {
      console.error("Error creating broadcast notification:", error);
      alert("Failed to send broadcast");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification record?")) {
      return;
    }

    try {
      await notificationApi.adminDelete(id);
      alert("Notification deleted successfully!");

      // Reload notifications from API
      await loadAllData();
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };

  const resetPersonalForm = () => {
    setPersonalForm({
      content: "",
      targetUserId: "",
      userRole: "customer",
    });
  };

  const resetBroadcastForm = () => {
    setBroadcastForm({
      content: "",
      targetRole: "customer",
    });
  };

  const openEditModal = (notification: NotificationRecord) => {
    setSelectedNotification(notification);
    setEditForm({
      content: notification.content,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedNotification || !editForm.content.trim()) {
      alert("Content is required!");
      return;
    }

    try {
      let type: NotificationType;
      if (selectedNotification.targetRole === "Customer") {
        type = selectedNotification.type === "Personal" ? "FOR_CUSTOMERS_PERSONAL" : "FOR_CUSTOMERS";
      } else if (selectedNotification.targetRole === "Staff") {
        type = selectedNotification.type === "Personal" ? "FOR_STAFFS_PERSONAL" : "FOR_STAFFS";
      } else {
        type = selectedNotification.type === "Personal" ? "FOR_ADMINS_PERSONAL" : "FOR_ADMINS";
      }

      await notificationApi.update(selectedNotification.id, {
        content: editForm.content.trim(),
        type,
      });

      alert("Notification updated successfully!");
      setShowEditModal(false);
      await loadAllData();
    } catch (error) {
      console.error("Error updating notification:", error);
      alert("Failed to update notification");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort
  let filteredNotifications = notifications.filter((notif) => {
    const matchSearch = searchTerm === "" ||
      notif.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === "all" || notif.type.toLowerCase() === typeFilter;
    const matchRole = roleFilter === "all" || notif.targetRole.toLowerCase() === roleFilter;

    return matchSearch && matchType && matchRole;
  });

  // Sort
  if (sortField) {
    filteredNotifications = [...filteredNotifications].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === "id") {
        aValue = a.id;
        bValue = b.id;
      } else if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortField === "readStatus") {
        // Sort by read percentage
        aValue = ((a.readCount || 0) / (a.totalCount || 1)) * 100;
        bValue = ((b.readCount || 0) / (b.totalCount || 1)) * 100;
      } else {
        return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredUsers = users.filter((user) => {
    if (personalForm.userRole === "customer") {
      return user.roles?.includes("CUSTOMER");
    } else if (personalForm.userRole === "staff") {
      return user.roles?.includes("STAFF");
    } else {
      return user.roles?.includes("ADMIN");
    }
  });

  const content = (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-beige-900">
              Notification Management
            </h1>
            <p className="mt-1 text-sm text-beige-600">
              Total: {filteredNotifications.length} notifications
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPersonalModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <FaUser />
              Send Personal
            </button>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-colors rounded-lg bg-purple-600 hover:bg-purple-700 shadow-sm"
            >
              <FaBroadcastTower />
              Broadcast
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4 p-4 mb-4 bg-white border rounded-lg shadow-sm sm:flex-row sm:items-end border-beige-200">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by content or recipient..."
            />
          </div>
          <div className="flex gap-4 shrink-0">
            <FilterDropdown
              label="Type"
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as TypeFilter)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Personal", value: "personal" },
                { label: "Broadcast", value: "broadcast" },
              ]}
            />
            <FilterDropdown
              label="Target Role"
              value={roleFilter}
              onChange={(value) => setRoleFilter(value as RoleFilter)}
              options={[
                { label: "All Roles", value: "all" },
                { label: "Customer", value: "customer" },
                { label: "Staff", value: "staff" },
                { label: "Admin", value: "admin" },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white border rounded-lg shadow-sm border-beige-200">
          <table className="w-full">
            <thead className="border-b-2 bg-beige-100 border-beige-200">
              <tr>
                <NewSortableHeader
                  label="No"
                  sortKey="id"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Content" />
                <SimpleTableHeader label="Type" />
                <SimpleTableHeader label="Target Role" />
                <SimpleTableHeader label="Recipient" />
                <NewSortableHeader
                  label="Read Status"
                  sortKey="readStatus"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Sent At"
                  sortKey="createdAt"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Actions" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-beige-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-beige-600">
                    Loading notifications...
                  </td>
                </tr>
              ) : paginatedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-beige-600">
                    No notifications found
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notification) => (
                  <tr key={notification.id} className="transition-colors hover:bg-beige-50">
                    <TableCell className="text-center">
                      {notification.id}
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-2">{notification.content}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${notification.type === "Personal"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                          }`}
                      >
                        {notification.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${notification.targetRole === "Customer"
                          ? "bg-blue-100 text-blue-800"
                          : notification.targetRole === "Staff"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {notification.targetRole}
                      </span>
                    </TableCell>
                    <TableCell>
                      {notification.recipientName || (
                        <span className="italic text-beige-400">All {notification.targetRole}s</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div>
                        {notification.readCount}/{notification.totalCount}
                        <div className="text-xs text-beige-500">
                          ({Math.round(((notification.readCount || 0) / (notification.totalCount || 1)) * 100)}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(notification.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <ActionButton
                          icon="view"
                          title="View Details"
                          variant="view"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowViewModal(true);
                          }}
                        />
                        <ActionButton
                          icon="edit"
                          title="Edit"
                          variant="edit"
                          onClick={() => openEditModal(notification)}
                        />
                        <ActionButton
                          icon="delete"
                          title="Delete"
                          variant="danger"
                          onClick={() => handleDelete(notification.id)}
                        />
                      </div>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <NewPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredNotifications.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newValue) => {
                setItemsPerPage(newValue);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedNotification && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Notification Details"
          maxWidth="lg"
        >
          <ViewDetailsContainer>
            <ViewDetailsGrid>
              <ViewDetailsRow label="Type" value={selectedNotification.type} />
              <ViewDetailsRow label="Target Role" value={selectedNotification.targetRole} />
              <ViewDetailsRow label="Content" value={selectedNotification.content} />
              <ViewDetailsRow
                label="Read Status"
                value={`${selectedNotification.readCount}/${selectedNotification.totalCount} users (${Math.round(
                  ((selectedNotification.readCount || 0) / (selectedNotification.totalCount || 1)) * 100
                )}%)`}
              />
              <ViewDetailsRow label="Sent At" value={formatDate(selectedNotification.createdAt)} />
            </ViewDetailsGrid>
          </ViewDetailsContainer>
          <ModalActions onCancel={() => setShowViewModal(false)} cancelText="Close" />
        </Modal>
      )}

      {/* Personal Notification Modal */}
      {showPersonalModal && (
        <Modal
          isOpen={showPersonalModal}
          onClose={() => {
            setShowPersonalModal(false);
            resetPersonalForm();
          }}
          title="Send Personal Notification"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="userRole" className="block mb-2 text-sm font-semibold text-beige-800">User Role</label>
              <select
                id="userRole"
                value={personalForm.userRole}
                onChange={(e) => {
                  setPersonalForm({
                    ...personalForm,
                    userRole: e.target.value as "customer" | "staff" | "admin",
                    targetUserId: "",
                  });
                }}
                className="w-full p-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="recipientSelect" className="block mb-2 text-sm font-semibold text-beige-800">Select Recipient</label>
              <select
                id="recipientSelect"
                value={personalForm.targetUserId}
                onChange={(e) => setPersonalForm({ ...personalForm, targetUserId: e.target.value })}
                className="w-full p-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
              >
                <option value="">-- Select User --</option>
                {filteredUsers.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-beige-800">Message Content</label>
              <textarea
                value={personalForm.content}
                onChange={(e) => setPersonalForm({ ...personalForm, content: e.target.value })}
                className="w-full p-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                rows={4}
                placeholder="Enter notification message..."
              />
            </div>
          </div>
          <ModalActions
            onConfirm={handleCreatePersonal}
            onCancel={() => {
              setShowPersonalModal(false);
              resetPersonalForm();
            }}
            confirmText="Send Notification"
            cancelText="Cancel"
          />
        </Modal>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <Modal
          isOpen={showBroadcastModal}
          onClose={() => {
            setShowBroadcastModal(false);
            resetBroadcastForm();
          }}
          title="Broadcast Notification"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="targetRole" className="block mb-2 text-sm font-semibold text-beige-800">Target Role Group</label>
              <select
                id="targetRole"
                value={broadcastForm.targetRole}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    targetRole: e.target.value as "customer" | "staff" | "admin",
                  })
                }
                className="w-full p-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
              >
                <option value="customer">All Customers</option>
                <option value="staff">All Staff</option>
                <option value="admin">All Admins</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-beige-800">Announcement Content</label>
              <textarea
                value={broadcastForm.content}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                className="w-full p-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                rows={4}
                placeholder="Enter announcement message..."
              />
            </div>
          </div>
          <ModalActions
            onConfirm={handleCreateBroadcast}
            onCancel={() => {
              setShowBroadcastModal(false);
              resetBroadcastForm();
            }}
            confirmText="Send to All"
            cancelText="Cancel"
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNotification && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Notification"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="editType" className="block mb-2 text-sm font-semibold text-beige-800">Type</label>
              <input
                id="editType"
                type="text"
                value={selectedNotification.type}
                disabled
                title="Notification Type"
                className="w-full p-2 border rounded-lg bg-beige-50 border-beige-300 text-beige-600"
              />
            </div>

            <div>
              <label htmlFor="editTargetRole" className="block mb-2 text-sm font-semibold text-beige-800">Target Role</label>
              <input
                id="editTargetRole"
                type="text"
                value={selectedNotification.targetRole}
                disabled
                title="Target Role"
                className="w-full p-2 border rounded-lg bg-beige-50 border-beige-300 text-beige-600"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-beige-800">Content</label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ content: e.target.value })}
                className="w-full p-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                rows={4}
                placeholder="Enter notification content..."
              />
            </div>
          </div>
          <ModalActions
            onConfirm={handleUpdate}
            onCancel={() => setShowEditModal(false)}
            confirmText="Update"
            cancelText="Cancel"
          />
        </Modal>
      )}
    </>
  );

  return noLayout ? content : <ManagementLayout>{content}</ManagementLayout>;
}
