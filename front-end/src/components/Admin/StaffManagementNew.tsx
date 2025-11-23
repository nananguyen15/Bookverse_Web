import { useState, useEffect } from "react";
import { usersApi } from "../../api";
import type { User } from "../../types";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
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
  StatusBadge,
  Modal,
  ModalActions,
  UserForm,
  type UserFormData,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "no" | "name" | "username" | "email";

export function StaffManagementNew() {
  const [staffs, setStaffs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        const activeUsers = await usersApi.getActive();
        data = activeUsers.filter((u) => u.roles.includes("STAFF"));
      } else if (statusFilter === "inactive") {
        const inactiveUsers = await usersApi.getInactive();
        data = inactiveUsers.filter((u) => u.roles.includes("STAFF"));
      } else {
        data = await usersApi.getStaffs();
      }

      setStaffs(data);
    } catch (error) {
      console.error("Error loading staffs:", error);
      alert("Unable to load staff list");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredStaffs = staffs
    .filter((staff) => {
      const matchSearch =
        (staff.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .map((staff, index) => ({ ...staff, originalIndex: index }))
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "no":
          aVal = a.originalIndex;
          bVal = b.originalIndex;
          break;
        case "name":
          aVal = a.name || "";
          bVal = b.name || "";
          break;
        case "username":
          aVal = a.username || "";
          bVal = b.username || "";
          break;
        case "email":
          aVal = a.email || "";
          bVal = b.email || "";
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
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedStaffs = filteredStaffs.slice(
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

  // CRUD handlers
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
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
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleCreate = async () => {
    try {
      if (!formData.username || !formData.username.trim()) {
        alert("Username must not be empty!");
        return;
      }

      if (formData.username.trim().length < 8) {
        alert("Username must be at least 8 characters long!");
        return;
      }

      if (formData.username.trim().length > 32) {
        alert("Username must not exceed 32 characters!");
        return;
      }

      // Validate username format: only letters, numbers, and underscores
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username.trim())) {
        alert("Username can only contain letters, numbers, and underscores (_)!");
        return;
      }

      if (!formData.email || !formData.email.trim()) {
        alert("Email must not be empty!");
        return;
      }

      if (!formData.password || !formData.password.trim()) {
        alert("Password must not be empty!");
        return;
      }

      // Validate password format: 8-16 characters, only letters, numbers, and underscores
      const passwordRegex = /^[a-zA-Z0-9_]{8,16}$/;
      if (!passwordRegex.test(formData.password.trim())) {
        alert("Password must be 8-16 characters long and contain only letters, numbers, and underscores (_)!");
        return;
      }

      // Validate phone number: must be exactly 10 digits, start with 0, second digit 3-9
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^0[3-9]\d{8}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
          alert("Phone number must be 10 digits, start with 0, and second digit must be 3-9 (e.g., 0912345678)!");
          return;
        }
      }

      const createData: Record<string, unknown> = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        name: formData.name ? formData.name.trim() : "",
        phone: formData.phone ? formData.phone.trim() : "",
        address: formData.address ? formData.address.trim() : "",
        active: true,
        roles: ["STAFF"],
      };

      if (imageFile) {
        createData.imageFile = imageFile;
      }

      await usersApi.create(createData);
      alert("Staff created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadStaffs();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error creating staff:", err);

      let errorMessage = "Failed to create staff: ";
      const apiMessage = err.response?.data?.message || err.message || '';

      // Parse error message to identify which field failed
      if (apiMessage.toLowerCase().includes('username')) {
        errorMessage += "Username is invalid or already exists. Please check:\n- Must be 8-32 characters\n- Only letters, numbers, and underscores allowed";
      } else if (apiMessage.toLowerCase().includes('email')) {
        errorMessage += "Email is invalid or already exists. Please enter a valid email address";
      } else if (apiMessage.toLowerCase().includes('password')) {
        errorMessage += "Password is invalid. Must be at least 8 characters";
      } else {
        errorMessage += apiMessage || 'Unknown error';
      }

      alert(errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      // Validate phone number if provided: must be exactly 10 digits, start with 0, second digit 3-9
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^0[3-9]\d{8}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
          alert("Phone number must be 10 digits, start with 0, and second digit must be 3-9 (e.g., 0912345678)!");
          return;
        }
      }

      await usersApi.update(selectedUser.id, { ...formData, imageFile });
      alert("Staff updated successfully");
      setShowEditModal(false);
      resetForm();
      loadStaffs();
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Failed to update staff");
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this staff member?`)) return;

    try {
      if (user.active) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.activate(user.id);
      }
      loadStaffs();
    } catch (error) {
      console.error(`Error ${action} staff:`, error);
      alert(`Failed to ${action} staff member`);
    }
  };

  const handleChangeRole = async (user: User) => {
    try {
      const isCurrentlyCustomer = user.roles.includes("CUSTOMER");
      if (isCurrentlyCustomer) {
        await usersApi.changeRole(user.id, "STAFF");
      } else {
        await usersApi.changeRole(user.id, "CUSTOMER");
      }
      alert("Role changed successfully");
      setShowRoleModal(false);
      setSelectedUser(null);
      loadStaffs();
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Failed to change role");
    }
  };

  if (loading) {
    return (
      <ManagementLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
            <p className="mt-4 text-beige-600">Loading...</p>
          </div>
        </div>
      </ManagementLayout>
    );
  }

  return (
    <ManagementLayout>
      <ManagementPageLayout
        title="Staff Management"
        totalCount={filteredStaffs.length}
        entityName="staff members"
        onAddClick={() => setShowCreateModal(true)}
        addButtonLabel="Add Staff"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, username, or email..."
          />
        }
        filterBar={
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as StatusFilter);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
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
                <SimpleTableHeader label="Avatar" />
                <NewSortableHeader
                  label="Username"
                  sortKey="username"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Email"
                  sortKey="email"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Phone" />
                <SimpleTableHeader label="Address" />
                <SimpleTableHeader label="Status" align="center" />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedStaffs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-beige-500">
                    No staff members found
                  </td>
                </tr>
              ) : (
                paginatedStaffs.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-beige-50 transition-colors">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {staffMember.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <img
                        src={transformImageUrl(staffMember.image) || FALLBACK_IMAGES.user}
                        alt={staffMember.name}
                        className="object-cover w-10 h-10 border-2 border-beige-200 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGES.user;
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TableCellText className="font-medium">{staffMember.username}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText>{staffMember.name}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">{staffMember.email}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">{staffMember.phone || "—"}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={staffMember.address}>
                        <TableCellText variant="secondary">
                          {staffMember.address || "—"}
                        </TableCellText>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge active={staffMember.active} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(staffMember)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditModal(staffMember)}
                          icon="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => {
                            setSelectedUser(staffMember);
                            setShowRoleModal(true);
                          }}
                          icon="role"
                          title="Change Role"
                        />
                        <ActionButton
                          onClick={() => handleToggleStatus(staffMember)}
                          icon={staffMember.active ? "deactivate" : "activate"}
                          title={staffMember.active ? "Deactivate" : "Activate"}
                          variant={staffMember.active ? "danger" : "success"}
                        />
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
            totalItems={filteredStaffs.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        }
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Staff"
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
            showPassword={true}
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
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Staff"
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
            showPassword={true}
            showImageUpload={true}
          />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Staff"
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
                <ViewDetailsRow label="Avatar" value="" />
                <div className="col-span-2 flex justify-center">
                  <img
                    src={transformImageUrl(selectedUser.image) || FALLBACK_IMAGES.user}
                    alt={selectedUser.name}
                    className="object-cover w-32 h-32 border-4 border-beige-200 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGES.user;
                    }}
                  />
                </div>
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Username" value={selectedUser.username} />
                <ViewDetailsRow label="Name" value={selectedUser.name || "—"} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Email" value={selectedUser.email} />
                <ViewDetailsRow label="Phone" value={selectedUser.phone || "—"} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
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
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="Change Role"
        maxWidth="md"
      >
        {selectedUser && (
          <>
            <p className="mb-4 text-gray-600">
              Are you sure you want to change the role of{" "}
              <span className="font-medium">{selectedUser.name}</span> from{" "}
              <span className="font-medium">
                {selectedUser.roles.includes("CUSTOMER") ? "Customer" : "Staff"}
              </span>{" "}
              to{" "}
              <span className="font-medium text-beige-700">
                {selectedUser.roles.includes("CUSTOMER") ? "Staff" : "Customer"}
              </span>
              ?
            </p>
            <ModalActions
              onConfirm={() => handleChangeRole(selectedUser)}
              onCancel={() => {
                setShowRoleModal(false);
                setSelectedUser(null);
              }}
              confirmText="Confirm"
              cancelText="Cancel"
            />
          </>
        )}
      </Modal>
    </ManagementLayout>
  );
}
