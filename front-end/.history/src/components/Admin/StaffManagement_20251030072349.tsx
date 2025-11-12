import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBan,
  FaUndo,
} from "react-icons/fa";

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
  password?: string;
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

export function StaffManagement() {
  const [staffs, setStaffs] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "blocked" | "deleted"
  >("all");
  const [sortBy, setSortBy] = useState<"id" | "username" | "createdAt">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: {
      province: "",
      district: "",
      ward: "",
      street: "",
    },
    avatarUrl: "",
    role: "staff",
    status: "active",
  });
  const [blockReason, setBlockReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  // Load staffs from localStorage
  useEffect(() => {
    loadStaffs();
  }, []);

  const loadStaffs = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const staffUsers = users.filter((u: User) => u.role === "staff");

    // Add missing fields for existing users
    const normalizedStaffs = staffUsers.map((s: User) => ({
      id:
        s.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: s.username,
      email: s.email,
      password: s.password,
      fullName: s.fullName || s.username,
      phone: s.phone || "",
      address: s.address || {
        province: "",
        district: "",
        ward: "",
        street: "",
      },
      avatarUrl: s.avatarUrl || "",
      role: "staff" as const,
      status: s.status || "active",
      blockReason: s.blockReason || "",
      deleteReason: s.deleteReason || "",
      createdAt: s.createdAt || new Date().toISOString(),
    }));

    setStaffs(normalizedStaffs);
  };

  const saveStaffs = (updatedStaffs: User[]) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const otherUsers = allUsers.filter((u: User) => u.role !== "staff");
    const newUsers = [...otherUsers, ...updatedStaffs];
    localStorage.setItem("users", JSON.stringify(newUsers));
    setStaffs(updatedStaffs);
  };

  // Filtered and sorted staffs
  const filteredStaffs = useMemo(() => {
    let filtered = staffs;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.username.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.fullName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
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
  }, [staffs, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleAddStaff = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.fullName ||
      !formData.password
    ) {
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

    const newStaff: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: formData.username!,
      email: formData.email!,
      password: formData.password!,
      fullName: formData.fullName!,
      phone: formData.phone || "",
      address: formData.address || {
        province: "",
        district: "",
        ward: "",
        street: "",
      },
      avatarUrl: formData.avatarUrl || "",
      role: "staff",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const updatedStaffs = [...staffs, newStaff];
    saveStaffs(updatedStaffs);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditStaff = () => {
    if (
      !selectedStaff ||
      !formData.username ||
      !formData.email ||
      !formData.fullName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if username or email already exists (excluding current user)
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (
      allUsers.some(
        (u: User) =>
          u.username === formData.username && u.id !== selectedStaff.id
      )
    ) {
      alert("Username already exists");
      return;
    }
    if (
      allUsers.some(
        (u: User) => u.email === formData.email && u.id !== selectedStaff.id
      )
    ) {
      alert("Email already exists");
      return;
    }

    const updatedStaffs = staffs.map((s) =>
      s.id === selectedStaff.id
        ? {
            ...s,
            username: formData.username!,
            email: formData.email!,
            password: formData.password || s.password,
            fullName: formData.fullName!,
            phone: formData.phone || "",
            address: formData.address || s.address,
            avatarUrl: formData.avatarUrl || s.avatarUrl,
          }
        : s
    );

    saveStaffs(updatedStaffs);
    setShowEditModal(false);
    setSelectedStaff(null);
    resetForm();
  };

  const handleBlockStaff = () => {
    if (!selectedStaff || !blockReason.trim()) {
      alert("Please provide a reason for blocking this staff");
      return;
    }

    const updatedStaffs = staffs.map((s) =>
      s.id === selectedStaff.id
        ? { ...s, status: "blocked" as const, blockReason }
        : s
    );

    saveStaffs(updatedStaffs);

    // Create notification
    createNotification(
      `Staff Account Blocked`,
      `Staff account ${selectedStaff.username} has been blocked. Reason: ${blockReason}`,
      "user_action"
    );

    setShowBlockModal(false);
    setSelectedStaff(null);
    setBlockReason("");
  };

  const handleUnblockStaff = (staff: User) => {
    const updatedStaffs = staffs.map((s) =>
      s.id === staff.id
        ? { ...s, status: "active" as const, blockReason: "" }
        : s
    );

    saveStaffs(updatedStaffs);
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff || !deleteReason.trim()) {
      alert("Please provide a reason for deleting this staff");
      return;
    }

    const updatedStaffs = staffs.map((s) =>
      s.id === selectedStaff.id
        ? { ...s, status: "deleted" as const, deleteReason }
        : s
    );

    saveStaffs(updatedStaffs);

    // Create notification
    createNotification(
      `Staff Account Deleted`,
      `Staff account ${selectedStaff.username} has been deleted. Reason: ${deleteReason}`,
      "user_action"
    );

    setShowDeleteModal(false);
    setSelectedStaff(null);
    setDeleteReason("");
  };

  const createNotification = (
    title: string,
    description: string,
    type: string
  ) => {
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

  const openEditModal = (staff: User) => {
    setSelectedStaff(staff);
    setFormData({
      username: staff.username,
      email: staff.email,
      password: "",
      fullName: staff.fullName,
      phone: staff.phone,
      address: staff.address,
      avatarUrl: staff.avatarUrl,
    });
    setShowEditModal(true);
  };

  const openBlockModal = (staff: User) => {
    setSelectedStaff(staff);
    setBlockReason("");
    setShowBlockModal(true);
  };

  const openDeleteModal = (staff: User) => {
    setSelectedStaff(staff);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: {
        province: "",
        district: "",
        ward: "",
        street: "",
      },
      avatarUrl: "",
      role: "staff",
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
    const parts = [
      address.street,
      address.ward,
      address.district,
      address.province,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  return (
    <div className="p-6 bg-beige-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-beige-900 font-heading">
          Staff Management
        </h1>
        <p className="text-beige-600 mt-1">
          Manage and monitor all staff accounts
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
              Add Staff
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
              {paginatedStaffs.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-beige-500"
                  >
                    No staff members found
                  </td>
                </tr>
              ) : (
                paginatedStaffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {staff.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      {staff.avatarUrl ? (
                        <img
                          src={staff.avatarUrl}
                          alt={staff.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-beige-200 flex items-center justify-center text-beige-600 font-semibold">
                          {staff.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {staff.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {staff.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {staff.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {staff.phone || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 max-w-xs truncate">
                      {formatAddress(staff.address)}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          staff.status
                        )}`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {staff.status === "active" ? (
                          <>
                            <button
                              onClick={() => openBlockModal(staff)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Block"
                            >
                              <FaBan />
                            </button>
                            <button
                              onClick={() => openDeleteModal(staff)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : staff.status === "blocked" ? (
                          <>
                            <button
                              onClick={() => handleUnblockStaff(staff)}
                              className="text-green-600 hover:text-green-800"
                              title="Unblock"
                            >
                              <FaUndo />
                            </button>
                            <button
                              onClick={() => openDeleteModal(staff)}
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
              entries (Total: {filteredStaffs.length})
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Add New Staff
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
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
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
                <div>
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
                        address: {
                          ...formData.address!,
                          province: e.target.value,
                        },
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
                        address: {
                          ...formData.address!,
                          district: e.target.value,
                        },
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
                        address: {
                          ...formData.address!,
                          street: e.target.value,
                        },
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
                onClick={handleAddStaff}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">Edit Staff</h2>
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
                    Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    placeholder="Leave blank to keep current password"
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
                <div>
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
                        address: {
                          ...formData.address!,
                          province: e.target.value,
                        },
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
                        address: {
                          ...formData.address!,
                          district: e.target.value,
                        },
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
                        address: {
                          ...formData.address!,
                          street: e.target.value,
                        },
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
                  setSelectedStaff(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStaff}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Staff Modal */}
      {showBlockModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">Block Staff</h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to block{" "}
                <strong>{selectedStaff.fullName}</strong>?
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
                  placeholder="Please provide a reason for blocking this staff..."
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedStaff(null);
                  setBlockReason("");
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockStaff}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Block Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Staff Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Delete Staff
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>{selectedStaff.fullName}</strong>?
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
                  placeholder="Please provide a reason for deleting this staff..."
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStaff(null);
                  setDeleteReason("");
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
