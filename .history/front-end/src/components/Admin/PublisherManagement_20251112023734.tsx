import { useState, useEffect } from "react";
import { publishersApi } from "../../api";
import type { Publisher } from "../../types";
import { FaPlus } from "react-icons/fa";
import {
  TableHeader,
  SortableTableHeader,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  FilterBar,
  Pagination,
  Modal,
  ModalActions,
  PublisherForm,
  type PublisherFormData,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "id" | "name";

export function PublisherManagement() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
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
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);

  // Form state
  const [formData, setFormData] = useState<PublisherFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // Load publishers
  useEffect(() => {
    loadPublishers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadPublishers = async () => {
    try {
      setLoading(true);
      let data: Publisher[];

      if (statusFilter === "active") {
        data = await publishersApi.getActive();
      } else if (statusFilter === "inactive") {
        data = await publishersApi.getInactive();
      } else {
        data = await publishersApi.getAll();
      }

      setPublishers(data);
    } catch (error) {
      console.error("Error loading publishers:", error);
      alert("Unable to load publisher list");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredPublishers = publishers
    .filter((publisher) => {
      const matchSearch =
        publisher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publisher.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publisher.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage);
  const paginatedPublishers = filteredPublishers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sort handler
  const handleSort = (key: string) => {
    const newSortField = key as SortField;
    if (sortField === newSortField) {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as sort field and reset to ascending
      setSortField(newSortField);
      setSortOrder("asc");
    }
  };

  // Handlers
  const handleCreate = async () => {
    try {
      // Trim and validate required fields
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên nhà xuất bản không được để trống!");
        return;
      }

      // Prepare clean data with active field
      const createData: any = {
        name: trimmedName,
        active: true, // Default active for new publisher
      };

      if (formData.address && formData.address.trim()) {
        createData.address = formData.address.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        createData.phone = formData.phone.trim();
      }
      if (formData.email && formData.email.trim()) {
        createData.email = formData.email.trim();
      }

      await publishersApi.create(createData);
      alert("Publisher created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadPublishers();
    } catch (error: any) {
      console.error("Error creating publisher:", error);
      console.error("Error response:", error.response?.data);
      alert(`Unable to create publisher: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPublisher) return;

    try {
      // Trim and validate required fields
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên nhà xuất bản không được để trống!");
        return;
      }

      // Prepare clean data (without image, but MUST include active)
      const updateData: any = {
        name: trimmedName,
        active: selectedPublisher.active, // Keep current active status
      };

      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }

      await publishersApi.update(selectedPublisher.id, updateData);
      alert("Updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadPublishers();
    } catch (error: any) {
      console.error("Error updating publisher:", error);
      console.error("Error response:", error.response?.data);
      alert(`Unable to update publisher: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleToggleStatus = async (publisher: Publisher) => {
    try {
      if (publisher.active) {
        await publishersApi.deactivate(publisher.id);
        alert("Publisher has been hidden!");
      } else {
        await publishersApi.activate(publisher.id);
        alert("Publisher has been reactivated!");
      }
      loadPublishers();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Unable to change status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
    });
    setSelectedPublisher(null);
  };

  const openEditModal = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setFormData({
      name: publisher.name,
      address: publisher.address || "",
      phone: publisher.phone || "",
      email: publisher.email || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
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
          <h1 className="text-3xl font-bold text-beige-900">Quản Lý Nhà Xuất Bản</h1>
          <p className="mt-1 text-sm text-beige-600">
            Tổng số: {filteredPublishers.length} nhà xuất bản
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Add Publisher
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, address, or email..."
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value as StatusFilter);
          setCurrentPage(1);
        }}
        statusOptions={[
          { value: "all", label: "All Statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Hidden" }
        ]}
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-beige-100">
            <tr>
              <SortableTableHeader
                sortable
                sortKey="id"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                ID
              </SortableTableHeader>
              <SortableTableHeader
                sortable
                sortKey="name"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                Publisher Name
              </SortableTableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPublishers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No publishers found
                </td>
              </tr>
            ) : (
              paginatedPublishers.map((publisher) => (
                <tr
                  key={publisher.id}
                  className="transition-colors hover:bg-beige-50"
                >
                  <TableCell>
                    <TableCellText variant="secondary" className="font-mono text-xs">{publisher.id}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText className="font-medium">{publisher.name}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText variant="secondary">{publisher.address || "—"}</TableCellText>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge active={publisher.active} />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtonGroup>
                      <ActionButton
                        icon="view"
                        onClick={() => openViewModal(publisher)}
                        title="View Details"
                      />
                      <ActionButton
                        icon="edit"
                        onClick={() => openEditModal(publisher)}
                        title="Edit"
                      />
                      <ActionButton
                        icon={publisher.active ? "deactivate" : "activate"}
                        onClick={() => handleToggleStatus(publisher)}
                        variant={publisher.active ? "danger" : "success"}
                        title={publisher.active ? "Hide" : "Activate"}
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
        totalItems={filteredPublishers.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Publisher"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <PublisherForm formData={formData} onUpdate={setFormData} isEdit={false} />
          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Publisher"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedPublisher}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Publisher"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <PublisherForm formData={formData} onUpdate={setFormData} isEdit={true} />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Publisher"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal && !!selectedPublisher}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPublisher(null);
        }}
        title="Publisher Details"
        maxWidth="2xl"
      >
        {selectedPublisher && (
          <ViewDetailsContainer>
            <ViewDetailsGrid columns={1}>
              <ViewDetailsRow
                label="Name"
                value={<span className="text-xl font-bold">{selectedPublisher.name}</span>}
              />
              <ViewDetailsRow label="Address" value={selectedPublisher.address || "—"} />
              <ViewDetailsRow label="Phone" value={selectedPublisher.phone || "—"} />
              <ViewDetailsRow label="Email" value={selectedPublisher.email || "—"} />
              <ViewDetailsRow
                label="Status"
                value={
                  selectedPublisher.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Hidden</span>
                  )
                }
              />
            </ViewDetailsGrid>
          </ViewDetailsContainer>
        )}
      </Modal>
    </div>
  );
}
