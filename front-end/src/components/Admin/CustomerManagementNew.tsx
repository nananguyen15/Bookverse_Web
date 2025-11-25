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

export function CustomerManagementNew() {
  const [customers, setCustomers] = useState<User[]>([]);
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

  // Load customers
  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      let data: User[];

      if (statusFilter === "active") {
        const activeUsers = await usersApi.getActive();
        data = activeUsers.filter((u) => u.roles.includes("CUSTOMER"));
      } else if (statusFilter === "inactive") {
        const inactiveUsers = await usersApi.getInactive();
        data = inactiveUsers.filter((u) => u.roles.includes("CUSTOMER"));
      } else {
        data = await usersApi.getCustomers();
      }

      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Failed to load customer list");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredCustomers = customers
    .map((customer, index) => ({ ...customer, originalIndex: index }))
    .filter((customer) => {
      const matchSearch =
        (customer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      // Helper function for string comparison
      const sortString = (strA: string, strB: string) => {
        const compareResult = strA.localeCompare(strB);
        return sortOrder === "asc" ? compareResult : -compareResult;
      };

      switch (sortField) {
        case "no": {
          const aVal = a.originalIndex;
          const bVal = b.originalIndex;
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        case "name":
          return sortString(a.name || "", b.name || "");
        case "username":
          return sortString(a.username || "", b.username || "");
        case "email":
          return sortString(a.email || "", b.email || "");
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
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

  const handleCreate = async () => {
    try {
      if (!formData.username || !formData.username.trim()) {
        alert("Username must not be empty!");
        return;
      }

      if (formData.username.trim().length < 8 || formData.username.trim().length > 32) {
        alert("Username must be 8-32 characters long!");
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

      await usersApi.create({
        ...formData,
        imageFile: imageFile || undefined,
        roles: ["CUSTOMER"]
      });
      alert("Customer created successfully");
      setShowCreateModal(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer");
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

      console.log("🔄 UPDATE Customer - FormData:", formData);
      console.log("🖼️ Image File:", imageFile);

      await usersApi.update(selectedUser.id, {
        ...formData,
        imageFile: imageFile || undefined
      });
      alert("Customer updated successfully");
      setShowEditModal(false);
      resetForm();
      loadCustomers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error updating customer:", err);

      let errorMessage = "Failed to update customer: ";
      const apiMessage = err.response?.data?.message || err.message || '';

      if (apiMessage.toLowerCase().includes('email')) {
        errorMessage += "Email is invalid. Please enter a valid email address";
      } else if (apiMessage.toLowerCase().includes('password')) {
        errorMessage += "Password is invalid. Must be at least 8 characters";
      } else {
        errorMessage += apiMessage || 'Unknown error';
      }

      alert(errorMessage);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
      if (user.active) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.activate(user.id);
      }
      loadCustomers();
    } catch (error) {
      console.error(`Error ${action} customer:`, error);
      alert(`Failed to ${action} customer`);
    }
  };

  const handleChangeRole = async (user: User) => {
    try {
      const isCurrentlyStaff = user.roles.includes("STAFF");
      if (isCurrentlyStaff) {
        await usersApi.changeRole(user.id, "CUSTOMER");
      } else {
        await usersApi.changeRole(user.id, "STAFF");
      }
      alert("Role changed successfully");
      setShowRoleModal(false);
      setSelectedUser(null);
      loadCustomers();
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
        title="Customer Management"
        totalCount={filteredCustomers.length}
        entityName="customers"
        onAddClick={() => setShowCreateModal(true)}
        addButtonLabel="Add Customer"
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
            <thead className="border-b bg-beige-100 border-beige-200">
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
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-beige-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-beige-50">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {customer.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <img
                        src={transformImageUrl(customer.image) || FALLBACK_IMAGES.user}
                        alt={customer.name}
                        className="object-cover w-10 h-10 border-2 rounded-full border-beige-200"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGES.user;
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TableCellText className="font-medium">{customer.username}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText>{customer.name}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">{customer.email}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">{customer.phone || "—"}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={customer.address}>
                        <TableCellText variant="secondary">
                          {customer.address || "—"}
                        </TableCellText>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge active={customer.active} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(customer)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditModal(customer)}
                          icon="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => {
                            setSelectedUser(customer);
                            setShowRoleModal(true);
                          }}
                          icon="role"
                          title="Change Role"
                        />
                        <ActionButton
                          onClick={() => handleToggleStatus(customer)}
                          icon={customer.active ? "deactivate" : "activate"}
                          title={customer.active ? "Deactivate" : "Activate"}
                          variant={customer.active ? "danger" : "success"}
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
            totalItems={filteredCustomers.length}
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
        title="Add New Customer"
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
            confirmText="Create Customer"
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
        title="Edit Customer"
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
            confirmText="Update Customer"
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
        title="Customer Details"
      >
        {selectedUser && (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="Avatar" value="" />
                <div className="flex justify-center col-span-2">
                  <img
                    src={transformImageUrl(selectedUser.image) || FALLBACK_IMAGES.user}
                    alt={selectedUser.name}
                    className="object-cover w-32 h-32 border-4 rounded-full border-beige-200"
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
                  value={selectedUser.roles.includes("STAFF") ? "Staff" : "Customer"}
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
                {selectedUser.roles.includes("STAFF") ? "Staff" : "Customer"}
              </span>{" "}
              to{" "}
              <span className="font-medium text-beige-700">
                {selectedUser.roles.includes("STAFF") ? "Customer" : "Staff"}
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
