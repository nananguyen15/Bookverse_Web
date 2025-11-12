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
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "name" | "username" | "email";

export function CustomerManagement() {
  const [customers, setCustomers] = useState<User[]>([]);
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
        const [activeUsers] = await Promise.all([usersApi.getActive()]);
        data = activeUsers.filter(u => u.roles.includes("CUSTOMER"));
      } else if (statusFilter === "inactive") {
        const [inactiveUsers] = await Promise.all([usersApi.getInactive()]);
        data = inactiveUsers.filter(u => u.roles.includes("CUSTOMER"));
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
    .filter((customer) => {
      const matchSearch =
        (customer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (sortField) {
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

      if (sortOrder === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleCreate = async () => {
    try {
      await usersApi.create({
        ...formData,
        roles: ["CUSTOMER"],
      });
      alert("Customer created successfully!");
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
      await usersApi.update(selectedUser.id, formData);
      alert("Customer updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.active) {
        await usersApi.deactivate(user.id);
        alert("Account deactivated successfully!");
      } else {
        await usersApi.activate(user.id);
        alert("Account activated successfully!");
      }
      loadCustomers();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to change status");
    }
  };

  const handleChangeRole = async (user: User) => {
    try {
      await usersApi.changeRole(user.id);
      const newRole = user.roles.includes("STAFF") ? "Customer" : "Staff";
      alert(`Changed to ${newRole} successfully!`);
      setShowRoleModal(false);
      loadCustomers();
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Failed to change role");
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
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-beige-600">
            Tổng số: {filteredCustomers.length} khách hàng
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Thêm Khách Hàng
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
              <TableHeader>Avatar</TableHeader>
              <TableHeader>Username</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-beige-50">
                  <TableCell>
                    <img
                      src={customer.image || "/img/avatar/default-avatar.jpg"}
                      alt={customer.name}
                      className="object-cover w-10 h-10 border-2 border-gray-200 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "/img/avatar/default-avatar.jpg";
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
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCustomers.length}
        onPageChange={setCurrentPage}
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
            isEdit={false}
          />
          <ModalActions
            onConfirm={() => handleCreate()}
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Customer"
            cancelText="Cancel"
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
            isEdit={true}
          />
          <ModalActions
            onConfirm={() => handleUpdate()}
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update"
            cancelText="Cancel"
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
    </div>
  );
}
