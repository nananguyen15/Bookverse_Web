import { useState, useEffect, useMemo } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBan, FaUndo } from "react-icons/fa";

interface Address {
  province: string;
  district: string;
  ward: string;
  street: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: Address;
  avatarUrl?: string;
  role: "customer" | "staff" | "admin";
  status: "active" | "blocked" | "deleted";
  blockReason?: string;
  deleteReason?: string;
  createdAt: string;
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked" | "deleted">("all");
  const [sortBy, setSortBy] = useState<"id" | "username" | "createdAt">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    address: {
      province: "",
      district: "",
      ward: "",
      street: "",
    },
    avatarUrl: "",
    role: "customer",
    status: "active",
  });
  const [blockReason, setBlockReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  // Load customers from localStorage
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const customerUsers = users.filter((u: User) => u.role === "customer");
    
    // Add missing fields for existing users
    const normalizedCustomers = customerUsers.map((c: User) => ({
      id: c.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: c.username,
      email: c.email,
      fullName: c.fullName || c.username,
      phone: c.phone || "",
      address: c.address || {
        province: "",
        district: "",
        ward: "",
        street: "",
      },
      avatarUrl: c.avatarUrl || "",
      role: "customer" as const,
      status: c.status || "active",
      blockReason: c.blockReason || "",
      deleteReason: c.deleteReason || "",
      createdAt: c.createdAt || new Date().toISOString(),
    }));

    setCustomers(normalizedCustomers);
  };

  const saveCustomers = (updatedCustomers: User[]) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const otherUsers = allUsers.filter((u: User) => u.role !== "customer");
    const newUsers = [...otherUsers, ...updatedCustomers];
    localStorage.setItem("users", JSON.stringify(newUsers));
    setCustomers(updatedCustomers);
  };

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.username.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.fullName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (sortBy === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleAddCustomer = () => {
    if (!formData.username || !formData.email || !formData.fullName) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if username or email already exists
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (allUsers.some((u: User) => u.username === formData.username)) {
      alert("Username already exists");
      return;
    }
    if (allUsers.some((u: User) => u.email === formData.email)) {
      alert("Email already exists");
      return;
    }

    const newCustomer: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: formData.username!,
      email: formData.email!,
      fullName: formData.fullName!,
      phone: formData.phone || "",
      address: formData.address || {
        province: "",
        district: "",
        ward: "",
        street: "",
      },
      avatarUrl: formData.avatarUrl || "",
      role: "customer",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const updatedCustomers = [...customers, newCustomer];
    saveCustomers(updatedCustomers);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer || !formData.username || !formData.email || !formData.fullName) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if username or email already exists (excluding current user)
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (
      allUsers.some(
        (u: User) => u.username === formData.username && u.id !== selectedCustomer.id
      )
    ) {
      alert("Username already exists");
      return;
    }
    if (
      allUsers.some(
        (u: User) => u.email === formData.email && u.id !== selectedCustomer.id
      )
    ) {
      alert("Email already exists");
      return;
    }

    const updatedCustomers = customers.map((c) =>
      c.id === selectedCustomer.id
        ? {
            ...c,
            username: formData.username!,
            email: formData.email!,
            fullName: formData.fullName!,
            phone: formData.phone || "",
            address: formData.address || c.address,
            avatarUrl: formData.avatarUrl || c.avatarUrl,
          }
        : c
    );

    saveCustomers(updatedCustomers);
    setShowEditModal(false);
    setSelectedCustomer(null);
    resetForm();
  };

  const handleBlockCustomer = () => {
    if (!selectedCustomer || !blockReason.trim()) {
      alert("Please provide a reason for blocking this customer");
      return;
    }

    const updatedCustomers = customers.map((c) =>
      c.id === selectedCustomer.id
        ? { ...c, status: "blocked" as const, blockReason }
        : c
    );

    saveCustomers(updatedCustomers);
    
    // Create notification for customer
    createNotification(
      `Account Blocked`,
      `Your account has been blocked. Reason: ${blockReason}`,
      "user_action"
    );

    setShowBlockModal(false);
    setSelectedCustomer(null);
    setBlockReason("");
  };

  const handleUnblockCustomer = (customer: User) => {
    const updatedCustomers = customers.map((c) =>
      c.id === customer.id
        ? { ...c, status: "active" as const, blockReason: "" }
        : c
    );

    saveCustomers(updatedCustomers);
  };

  const handleDeleteCustomer = () => {
    if (!selectedCustomer || !deleteReason.trim()) {
      alert("Please provide a reason for deleting this customer");
      return;
    }

    const updatedCustomers = customers.map((c) =>
      c.id === selectedCustomer.id
        ? { ...c, status: "deleted" as const, deleteReason }
        : c
    );

    saveCustomers(updatedCustomers);
    
    // Create notification for customer
    createNotification(
      `Account Deleted`,
      `Your account has been deleted. Reason: ${deleteReason}`,
      "user_action"
    );

    setShowDeleteModal(false);
    setSelectedCustomer(null);
    setDeleteReason("");
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

  const openEditModal = (customer: User) => {
    setSelectedCustomer(customer);
    setFormData({
      username: customer.username,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      avatarUrl: customer.avatarUrl,
    });
    setShowEditModal(true);
  };

  const openBlockModal = (customer: User) => {
    setSelectedCustomer(customer);
    setBlockReason("");
    setShowBlockModal(true);
  };

  const openDeleteModal = (customer: User) => {
    setSelectedCustomer(customer);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      address: {
        province: "",
        district: "",
        ward: "",
        street: "",
      },
      avatarUrl: "",
      role: "customer",
      status: "active",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "deleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [address.street, address.ward, address.district, address.province].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  return (
    <div className="p-6 bg-beige-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-beige-900 font-heading">
          Customer Management
        </h1>
        <p className="text-beige-600 mt-1">
          Manage and monitor all customer accounts
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
                placeholder="Search by name, username, or email..."
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
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Add Button */}
          <div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="w-full bg-beige-600 hover:bg-beige-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus />
              Add Customer
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex gap-4 items-center">
          <span className="text-sm text-beige-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
          >
            <option value="id">ID</option>
            <option value="username">Username</option>
            <option value="createdAt">Created Date</option>
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
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Avatar
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Created At
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
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-beige-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {customer.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      {customer.avatarUrl ? (
                        <img
                          src={customer.avatarUrl}
                          alt={customer.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-beige-200 flex items-center justify-center text-beige-600 font-semibold">
                          {customer.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {customer.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {customer.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {customer.phone || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 max-w-xs truncate">
                      {formatAddress(customer.address)}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {customer.status === "active" ? (
                          <>
                            <button
                              onClick={() => openBlockModal(customer)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Block"
                            >
                              <FaBan />
                            </button>
                            <button
                              onClick={() => openDeleteModal(customer)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : customer.status === "blocked" ? (
                          <>
                            <button
                              onClick={() => handleUnblockCustomer(customer)}
                              className="text-green-600 hover:text-green-800"
                              title="Unblock"
                            >
                              <FaUndo />
                            </button>
                            <button
                              onClick={() => openDeleteModal(customer)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : null}
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
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-beige-600">
              entries (Total: {filteredCustomers.length})
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Add New Customer
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-beige-900 mb-2">
                    Address
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    value={formData.address?.province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, province: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.address?.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, district: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Ward
                  </label>
                  <input
                    type="text"
                    value={formData.address?.ward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, ward: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    value={formData.address?.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, street: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Edit Customer
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-beige-900 mb-2">
                    Address
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    value={formData.address?.province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, province: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.address?.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, district: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Ward
                  </label>
                  <input
                    type="text"
                    value={formData.address?.ward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, ward: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    value={formData.address?.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address!, street: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCustomer}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Customer Modal */}
      {showBlockModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Block Customer
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to block{" "}
                <strong>{selectedCustomer.fullName}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  rows={3}
                  placeholder="Please provide a reason for blocking this customer..."
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedCustomer(null);
                  setBlockReason("");
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockCustomer}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Block Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Delete Customer
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>{selectedCustomer.fullName}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  rows={3}
                  placeholder="Please provide a reason for deleting this customer..."
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCustomer(null);
                  setDeleteReason("");
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
