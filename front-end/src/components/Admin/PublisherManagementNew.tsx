import { useState, useEffect } from "react";
import { publishersApi } from "../../api";
import type { Publisher } from "../../types";
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
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
  PublisherForm,
  type PublisherFormData,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "no" | "id" | "name";

interface PublisherManagementNewProps {
  noLayout?: boolean; // When true, renders without ManagementLayout wrapper (for use in StaffLayout)
}

export function PublisherManagementNew({ noLayout = false }: PublisherManagementNewProps = {}) {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField | null>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);

  // Form state
  const [formData, setFormData] = useState<PublisherFormData>({
    name: "",
    address: "",
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
        (publisher.address || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .map((publisher, index) => ({ ...publisher, originalIndex: index }))
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "no":
          aVal = a.originalIndex;
          bVal = b.originalIndex;
          break;
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
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
  const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage);
  const paginatedPublishers = filteredPublishers.slice(
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
      name: "",
      address: "",
    });
    setSelectedPublisher(null);
  };

  const openEditModal = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setFormData({
      name: publisher.name,
      address: publisher.address || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setShowViewModal(true);
  };

  const handleCreate = async () => {
    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Publisher name is required!");
        return;
      }

      const createData: Record<string, string | boolean> = {
        name: trimmedName,
        active: true,
      };

      if (formData.address && formData.address.trim()) {
        createData.address = formData.address.trim();
      }

      await publishersApi.create(createData);
      alert("Publisher created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadPublishers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error creating publisher:", err);
      alert(`Failed to create publisher: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPublisher) return;

    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Publisher name is required!");
        return;
      }

      const updateData: Record<string, string | boolean> = {
        name: trimmedName,
        active: selectedPublisher.active,
      };

      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }

      await publishersApi.update(selectedPublisher.id, updateData);
      alert("Publisher updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadPublishers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error updating publisher:", err);
      alert(`Failed to update publisher: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleStatus = async (publisher: Publisher) => {
    const action = publisher.active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this publisher?`)) return;

    try {
      if (publisher.active) {
        await publishersApi.deactivate(publisher.id);
      } else {
        await publishersApi.activate(publisher.id);
      }
      loadPublishers();
    } catch (error) {
      console.error(`Error ${action} publisher:`, error);
      alert(`Failed to ${action} publisher`);
    }
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading...</p>
        </div>
      </div>
    );
    return noLayout ? loadingContent : <ManagementLayout>{loadingContent}</ManagementLayout>;
  }

  const content = (
    <>
      <ManagementPageLayout
        title="Publisher Management"
        totalCount={filteredPublishers.length}
        entityName="publishers"
        onAddClick={() => setShowCreateModal(true)}
        addButtonLabel="Add Publisher"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, address, email..."
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
                <NewSortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Address" />
                <SimpleTableHeader label="Status" align="center" />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedPublishers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-beige-500">
                    No publishers found
                  </td>
                </tr>
              ) : (
                paginatedPublishers.map((publisher, index) => (
                  <tr key={publisher.id} className="hover:bg-beige-50 transition-colors">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {publisher.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText className="font-medium">{publisher.name}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary" className="max-w-xs truncate">
                        {publisher.address || "N/A"}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge active={publisher.active} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(publisher)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditModal(publisher)}
                          icon="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleToggleStatus(publisher)}
                          icon={publisher.active ? "deactivate" : "activate"}
                          title={publisher.active ? "Deactivate" : "Activate"}
                          variant={publisher.active ? "danger" : "success"}
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
            totalItems={filteredPublishers.length}
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
        title="Add New Publisher"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <PublisherForm
            formData={formData}
            onUpdate={setFormData}
            isEdit={false}
          />
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
        isOpen={showEditModal}
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
          <PublisherForm
            formData={formData}
            onUpdate={setFormData}
            isEdit={true}
          />
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
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPublisher(null);
        }}
        title="Publisher Details"
        maxWidth="2xl"
      >
        {selectedPublisher && (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="Name" value={selectedPublisher.name} />
                <ViewDetailsRow
                  label="Status"
                  value={
                    selectedPublisher.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )
                  }
                />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Address" value={selectedPublisher.address || "N/A"} />
                <ViewDetailsRow label="Phone" value={selectedPublisher.phone || "N/A"} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Email" value={selectedPublisher.email || "N/A"} />
              </ViewDetailsGrid>
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPublisher(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );

  return noLayout ? content : <ManagementLayout>{content}</ManagementLayout>;
}
