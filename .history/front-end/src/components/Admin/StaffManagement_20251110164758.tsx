import { useState, useEffect } from "react";
import { usersApi } from "../../api";
import type { User } from "../../types";
import { FaPlus } from "react-icons/fa";
import {
  TableHeader,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  FilterBar,
  Pagination,
  Modal,
  ModalActions,
  UserForm,
  type UserFormData,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "name" | "username" | "email";

export function StaffManagement() {
  const [staffs, setStaffs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });

  // Load staffs
  useEffect(() => {
    loadStaffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadStaffs = async () => {
    try {
      setLoading(true);
      let data: User[];
      
      if (statusFilter === "active") {
        const [activeUsers] = await Promise.all([usersApi.getActive()]);
        data = activeUsers.filter(u => u.roles.includes("STAFF"));
      } else if (statusFilter === "inactive") {
        const [inactiveUsers] = await Promise.all([usersApi.getInactive()]);
        data = inactiveUsers.filter(u => u.roles.includes("STAFF"));
      } else {
        data = await usersApi.getStaffs();
      }
      
      setStaffs(data);
    } catch (error) {
      console.error("Error loading staffs:", error);
      alert("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredStaffs = staffs
    .filter((staff) => {
      const matchSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "username":
          aVal = a.username;
          bVal = b.username;
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
      }

      if (sortOrder === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleCreate = async () => {
    try {
      await usersApi.create({
        ...formData,
        roles: ["STAFF"],
      });
      alert("Tạo nhân viên thành công!");
      setShowCreateModal(false);
      resetForm();
      loadStaffs();
    } catch (error) {
      console.error("Error creating staff:", error);
      alert("Không thể tạo nhân viên");
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      await usersApi.update(selectedUser.id, formData);
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      resetForm();
      loadStaffs();
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Không thể cập nhật nhân viên");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.active) {
        await usersApi.deactivate(user.id);
        alert("Đã khóa tài khoản nhân viên!");
      } else {
        await usersApi.activate(user.id);
        alert("Đã kích hoạt lại tài khoản nhân viên!");
      }
      loadStaffs();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const handleChangeRole = async (user: User) => {
    try {
      await usersApi.changeRole(user.id);
      const newRole = user.roles.includes("CUSTOMER") ? "Staff" : "Customer";
      alert(`Đã chuyển thành ${newRole}!`);
      setShowRoleModal(false);
      loadStaffs();
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Không thể thay đổi vai trò");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      name: user.name,
      phone: user.phone || "",
      address: user.address || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-beige-900">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-beige-600">
            Total: {filteredStaffs.length} staff members
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Add Staff
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, username, or email..."
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value as StatusFilter);
          setCurrentPage(1);
        }}
        statusOptions={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" }
        ]}
        sortField={sortField}
        onSortFieldChange={(value) => setSortField(value as SortField)}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "username", label: "Username" },
          { value: "email", label: "Email" }
        ]}
        sortOrder={sortOrder}
        onSortOrderChange={(value) => setSortOrder(value as "asc" | "desc")}
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-beige-100">
            <tr>
              <TableHeader>Username</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStaffs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No staff members found
                </td>
              </tr>
            ) : (
              paginatedStaffs.map((staff) => (
                <tr
                  key={staff.id}
                  className="transition-colors hover:bg-beige-50"
                >
                  <TableCell>
                    <TableCellText className="font-medium">
                      {staff.username}
                    </TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText>{staff.name}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText variant="secondary">{staff.email}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText variant="secondary">
                      {staff.phone || "—"}
                    </TableCellText>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge active={staff.active} />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtonGroup>
                      <ActionButton
                        icon="view"
                        onClick={() => openViewModal(staff)}
                        title="View Details"
                      />
                      <ActionButton
                        icon="edit"
                        onClick={() => openEditModal(staff)}
                        title="Edit"
                      />
                      <ActionButton
                        icon="role"
                        onClick={() => {
                          setSelectedUser(staff);
                          setShowRoleModal(true);
                        }}
                        title="Change Role"
                      />
                      <ActionButton
                        icon={staff.active ? "deactivate" : "activate"}
                        onClick={() => handleToggleStatus(staff)}
                        variant={staff.active ? "danger" : "success"}
                        title={staff.active ? "Deactivate" : "Activate"}
                      />
                    </ActionButtonGroup>
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredStaffs.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Thêm Nhân Viên Mới
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="username123"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên đầy đủ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="Địa chỉ"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  Tạo Nhân Viên
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chỉnh Sửa Nhân Viên
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                    title="Username không thể chỉnh sửa"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mật khẩu mới (để trống nếu không đổi)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên đầy đủ
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="Địa chỉ"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  Cập Nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chi Tiết Nhân Viên
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tên đầy đủ</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-medium">{selectedUser.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-medium">{selectedUser.address || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vai trò</p>
                  <p className="font-medium">
                    {selectedUser.roles.includes("CUSTOMER") ? "Khách hàng" : "Nhân viên"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-medium">
                    {selectedUser.active ? (
                      <span className="text-green-600">Đang hoạt động</span>
                    ) : (
                      <span className="text-red-600">Đã khóa</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-beige-900">
              Đổi Vai Trò
            </h2>
            <p className="mb-4 text-gray-600">
              Bạn có chắc muốn đổi vai trò của{" "}
              <span className="font-medium">{selectedUser.name}</span> từ{" "}
              <span className="font-medium">
                {selectedUser.roles.includes("CUSTOMER") ? "Khách hàng" : "Nhân viên"}
              </span>{" "}
              thành{" "}
              <span className="font-medium text-beige-700">
                {selectedUser.roles.includes("CUSTOMER") ? "Nhân viên" : "Khách hàng"}
              </span>
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleChangeRole(selectedUser)}
                className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
              >
                Xác Nhận
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
