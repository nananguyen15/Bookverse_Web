import { useState, useEffect } from "react";
import { usersApi } from "../../api";
import type { User } from "../../types";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
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
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
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

  // Image file state
  const [imageFile, setImageFile] = useState<File | null>(null);

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
      // Validate required fields
      if (!formData.username || !formData.username.trim()) {
        alert("Username không được để trống!");
        return;
      }

      // Validate username length (backend requires 8-32 characters)
      if (formData.username.trim().length < 8) {
        alert("Username phải có ít nhất 8 ký tự!");
        return;
      }

      if (formData.username.trim().length > 32) {
        alert("Username không được vượt quá 32 ký tự!");
        return;
      }

      if (!formData.email || !formData.email.trim()) {
        alert("Email không được để trống!");
        return;
      }

      // Prepare create data with default password and active status
      const createData: any = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: "Welcome123", // Default password
        name: formData.name ? formData.name.trim() : "",
        phone: formData.phone ? formData.phone.trim() : "",
        address: formData.address ? formData.address.trim() : "",
        active: true, // Default active for new staff
        roles: ["STAFF"],
      };

      // Handle image
      if (imageFile) {
        // User uploaded a file
        createData.imageFile = imageFile;
      } else if (formData.image && formData.image.trim()) {
        // User entered a URL/path
        createData.image = formData.image.trim();
      }

      await usersApi.create(createData);
      alert("Tạo nhân viên thành công!\nPassword mặc định: Welcome123");
      setShowCreateModal(false);
      resetForm();
      loadStaffs();
    } catch (error: any) {
      console.error("Error creating staff:", error);

      // Show specific error message if available
      const errorMessage = error.response?.data?.message || "Không thể tạo nhân viên";
      alert(errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      // Prepare update data - don't send username (backend doesn't allow username update)
      const updateData: any = {};

      // Only include fields if they have values
      if (formData.name && formData.name.trim()) {
        updateData.name = formData.name.trim();
      }

      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }

      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }

      // Handle image update
      if (imageFile) {
        // User uploaded a new file
        console.log("✅ Adding imageFile to update:", imageFile.name, imageFile.size);
        updateData.imageFile = imageFile;
      } else if (formData.image && formData.image.trim()) {
        // User entered a URL/path (no file upload)
        console.log("✅ Adding image URL to update:", formData.image);
        updateData.image = formData.image.trim();
      } else {
        console.log("⚠️ No image update");
      }

      console.log("📞 Phone value:", formData.phone);
      console.log("📤 Sending update data:", updateData);
      console.log("📤 updateData keys:", Object.keys(updateData));

      await usersApi.update(selectedUser.id, updateData);
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      resetForm();
      loadStaffs();
    } catch (error: any) {
      console.error("❌ Error updating staff:", error);
      console.error("❌ Error response:", error.response?.data);

      const errorMsg = error.response?.data?.message || error.message;
      alert(`Không thể cập nhật nhân viên: ${errorMsg}`);
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
      image: "",
    });
    setImageFile(null);
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
      image: user.image || "",
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
              <TableHeader>No.</TableHeader>
              <TableHeader>Avatar</TableHeader>
              <TableHeader>Username</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStaffs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No staff members found
                </td>
              </tr>
            ) : (
              paginatedStaffs.map((staff, index) => (
                <tr
                  key={staff.id}
                  className="transition-colors hover:bg-beige-50"
                >
                  <TableCell>
                    <TableCellText className="font-semibold text-gray-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCellText>
                  </TableCell>
                  <TableCell>
                    <img
                      src={transformImageUrl(staff.image) || FALLBACK_IMAGES.user}
                      alt={staff.name}
                      className="object-cover w-10 h-10 border-2 border-gray-200 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.user;
                      }}
                    />
                  </TableCell>
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
                  <TableCell>
                    <TableCellText variant="secondary" className="max-w-xs truncate" title={staff.address}>
                      {staff.address || "—"}
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
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Staff Member"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <UserForm
            formData={formData}
            onUpdate={setFormData}
            onImageUpload={setImageFile}
            isEdit={false}
            showPassword={false}
            showImageUpload={true}
          />
          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Staff"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedUser}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Staff Member"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <UserForm
            formData={formData}
            onUpdate={setFormData}
            onImageUpload={setImageFile}
            isEdit={true}
            showPassword={false}
            showImageUpload={true}
          />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        title="Staff Details"
      >
        {selectedUser && (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="Username" value={selectedUser.username} />
                <ViewDetailsRow label="Email" value={selectedUser.email} />
              </ViewDetailsGrid>

              <ViewDetailsGrid columns={1}>
                <ViewDetailsRow label="Full Name" value={selectedUser.name} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Phone" value={selectedUser.phone || "—"} />
                <ViewDetailsRow label="Address" value={selectedUser.address || "—"} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Role"
                  value={selectedUser.roles.includes("CUSTOMER") ? "Customer" : "Staff"}
                />
                <ViewDetailsRow
                  label="Status"
                  value={
                    selectedUser.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )
                  }
                />
              </ViewDetailsGrid>
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

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
