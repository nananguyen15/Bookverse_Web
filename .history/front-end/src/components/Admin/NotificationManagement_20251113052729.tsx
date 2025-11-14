import { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaBell,
  FaTag,
  FaUser,
  FaStar,
  FaTrash,
  FaEdit,
  FaEye,
  FaPlus,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

type SortField = "id" | "title" | "type" | "createdAt";
type SortOrder = "asc" | "desc";

interface AdminNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: "promotion" | "user_action" | "review_delete" | "order_action";
}

export function NotificationManagement() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | AdminNotification["type"]
  >("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "user_action" as AdminNotification["type"],
  });

  // Load notifications
  useEffect(() => {
    loadNotifications();

    // Set up interval to refresh notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const notificationsData = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    setNotifications(notificationsData);
  };

  const saveNotifications = (updatedNotifications: AdminNotification[]) => {
    localStorage.setItem(
      "adminNotifications",
      JSON.stringify(updatedNotifications)
    );
    setNotifications(updatedNotifications);
  };

  // Filtered and sorted notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.id.toLowerCase().includes(term) ||
          n.title.toLowerCase().includes(term) ||
          n.description.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case "id":
          aVal = a.id.toLowerCase();
          bVal = b.id.toLowerCase();
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [notifications, searchTerm, typeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <FaSort className="inline ml-1 text-beige-400" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1 text-beige-600" />
    ) : (
      <FaSortDown className="inline ml-1 text-beige-600" />
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, itemsPerPage]);

  const handleDeleteNotification = () => {
    if (!selectedNotification) return;

    const updatedNotifications = notifications.filter(
      (n) => n.id !== selectedNotification.id
    );
    saveNotifications(updatedNotifications);
    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  const handleCreateNotification = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newNotification: AdminNotification = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      createdAt: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);
    setShowCreateModal(false);
    setFormData({ title: "", description: "", type: "user_action" });
  };

  const handleEditNotification = () => {
    if (!selectedNotification) return;
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const updatedNotifications = notifications.map((n) =>
      n.id === selectedNotification.id
        ? { ...n, title: formData.title, description: formData.description, type: formData.type }
        : n
    );
    saveNotifications(updatedNotifications);
    setShowEditModal(false);
    setSelectedNotification(null);
    setFormData({ title: "", description: "", type: "user_action" });
  };

  const openCreateModal = () => {
    setFormData({ title: "", description: "", type: "user_action" });
    setShowCreateModal(true);
  };

  const openEditModal = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      description: notification.description,
      type: notification.type,
    });
    setShowEditModal(true);
  };

  const openViewModal = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all notifications? This action cannot be undone."
      )
    ) {
      saveNotifications([]);
    }
  };

  const openDeleteModal = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const getTypeIcon = (type: AdminNotification["type"]) => {
    switch (type) {
      case "promotion":
        return <FaTag className="text-purple-600" />;
      case "user_action":
        return <FaUser className="text-blue-600" />;
      case "review_delete":
        return <FaStar className="text-yellow-600" />;
      case "order_action":
        return <FaBell className="text-green-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: AdminNotification["type"]) => {
    switch (type) {
      case "promotion":
        return "Promotion";
      case "user_action":
        return "User Action";
      case "review_delete":
        return "Review Deleted";
      case "order_action":
        return "Order Action";
      default:
        return "Other";
    }
  };

  const getTypeColor = (type: AdminNotification["type"]) => {
    switch (type) {
      case "promotion":
        return "bg-purple-100 text-purple-800";
      case "user_action":
        return "bg-blue-100 text-blue-800";
      case "review_delete":
        return "bg-yellow-100 text-yellow-800";
      case "order_action":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 bg-beige-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-beige-900 font-heading">
            Notification Management
          </h1>
          <p className="text-beige-600 mt-1">
            Create and manage all system notifications
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Create Notification
          </button>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search by ID, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="promotion">Promotions</option>
              <option value="user_action">User Actions</option>
              <option value="review_delete">Review Deletions</option>
              <option value="order_action">Order Actions</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-beige-600">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  #
                </th>
                <th
                  onClick={() => handleSort("id")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  ID {getSortIcon("id")}
                </th>
                <th
                  onClick={() => handleSort("type")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Type {getSortIcon("type")}
                </th>
                <th
                  onClick={() => handleSort("title")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Title {getSortIcon("title")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Description
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Created At {getSortIcon("createdAt")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FaBell className="mx-auto text-6xl text-beige-300 mb-4" />
                    <p className="text-beige-500 text-lg">
                      No notifications found
                    </p>
                    <p className="text-beige-400 text-sm mt-2">
                      {searchTerm || typeFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Click 'Create Notification' to add a new notification"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notification, index) => (
                  <tr key={notification.id} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 font-mono">
                      {notification.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-beige-900">
                      {notification.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-700 max-w-md">
                      <p className="line-clamp-2">{notification.description}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      <div>
                        <p>{formatRelativeTime(notification.createdAt)}</p>
                        <p className="text-xs text-beige-500">
                          {new Date(notification.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(notification)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(notification)}
                          className="text-brown-600 hover:text-brown-800 p-2"
                          title="Edit Notification"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(notification)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete Notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedNotifications.length > 0 && (
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
                entries (Total: {filteredNotifications.length})
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900 flex items-center gap-2">
                <FaPlus /> Create New Notification
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as AdminNotification["type"] })
                  }
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                >
                  <option value="user_action">User Action</option>
                  <option value="promotion">Promotion</option>
                  <option value="review_delete">Review Delete</option>
                  <option value="order_action">Order Action</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  rows={4}
                  placeholder="Enter notification description"
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: "", description: "", type: "user_action" });
                }}
                className="px-6 py-2 border border-beige-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                disabled={!formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaPlus /> Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {showEditModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900 flex items-center gap-2">
                <FaEdit /> Edit Notification
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Notification ID
                </label>
                <input
                  type="text"
                  value={selectedNotification.id}
                  disabled
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg bg-gray-100 text-gray-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as AdminNotification["type"] })
                  }
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                >
                  <option value="user_action">User Action</option>
                  <option value="promotion">Promotion</option>
                  <option value="review_delete">Review Delete</option>
                  <option value="order_action">Order Action</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  rows={4}
                  placeholder="Enter notification description"
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedNotification(null);
                  setFormData({ title: "", description: "", type: "user_action" });
                }}
                className="px-6 py-2 border border-beige-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditNotification}
                disabled={!formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaEdit /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Notification Modal */}
      {showViewModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900 flex items-center gap-2">
                <FaEye /> Notification Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Notification ID
                  </label>
                  <p className="text-beige-900 font-mono bg-beige-50 px-3 py-2 rounded">
                    {selectedNotification.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Type
                  </label>
                  <div className="flex items-center gap-2 bg-beige-50 px-3 py-2 rounded">
                    {getTypeIcon(selectedNotification.type)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        selectedNotification.type
                      )}`}
                    >
                      {getTypeLabel(selectedNotification.type)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Title
                </label>
                <p className="text-beige-900 bg-beige-50 px-3 py-2 rounded font-medium">
                  {selectedNotification.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Description
                </label>
                <p className="text-beige-900 bg-beige-50 px-3 py-2 rounded whitespace-pre-wrap">
                  {selectedNotification.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Created At
                  </label>
                  <p className="text-beige-900 bg-beige-50 px-3 py-2 rounded">
                    {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Relative Time
                  </label>
                  <p className="text-beige-900 bg-beige-50 px-3 py-2 rounded">
                    {formatRelativeTime(selectedNotification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedNotification(null);
                }}
                className="px-6 py-2 border border-beige-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedNotification);
                }}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Notification Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Delete Notification
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to delete this notification?
              </p>
              <div className="bg-beige-50 p-4 rounded-lg">
                <p className="font-medium text-beige-900">
                  {selectedNotification.title}
                </p>
                <p className="text-sm text-beige-700 mt-2">
                  {selectedNotification.description}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNotification}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
