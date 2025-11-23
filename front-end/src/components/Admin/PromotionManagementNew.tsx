import { useState, useEffect } from "react";
import { promotionApi } from "../../api/endpoints";
import type { PromotionResponse } from "../../types/api/promotion.types";
import type { SubCategory } from "../../types/api/category.types";
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
} from "../Shared/Management";

type SortField = "no" | "id" | "name" | "percent" | "startDate" | "endDate" | "status";
type StatusFilter = "all" | "active" | "scheduled" | "expired" | "inactive";

export function PromotionManagementNew() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [promotionSubCats, setPromotionSubCats] = useState<Record<number, SubCategory[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField | null>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    content: "",
    percentage: 10,
    startDate: "",
    endDate: "",
    subCategoryIds: [] as number[],
  });

  // Load promotions
  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionApi.getAll();
      setPromotions(data);

      // Load sub-categories for each promotion (with error handling for promotions without sub-categories)
      const subCatsMap: Record<number, SubCategory[]> = {};
      await Promise.all(
        data.map(async (promotion) => {
          try {
            const subs = await promotionApi.getPromotionSubCategories(promotion.id);
            subCatsMap[promotion.id] = subs;
          } catch {
            // Promotion may not have sub-categories assigned yet (returns 400)
            subCatsMap[promotion.id] = [];
          }
        })
      );
      setPromotionSubCats(subCatsMap);
    } catch (error) {
      console.error("Error loading promotions:", error);
      alert("Unable to load promotions. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const getPromotionStatus = (promotion: PromotionResponse): StatusFilter => {
    if (!promotion.active) return "inactive";
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    if (now < start) return "scheduled";
    if (now > end) return "expired";
    return "active";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter and sort
  const filteredPromotions = promotions
    .filter((promotion) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        promotion.id.toString().includes(term) ||
        promotion.content.toLowerCase().includes(term) ||
        promotion.percentage.toString().includes(term);

      const matchStatus =
        statusFilter === "all" || getPromotionStatus(promotion) === statusFilter;

      return matchSearch && matchStatus;
    })
    .map((promotion, index) => ({ ...promotion, originalIndex: index }))
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
          aVal = a.content.toLowerCase();
          bVal = b.content.toLowerCase();
          break;
        case "percent":
          aVal = a.percentage;
          bVal = b.percentage;
          break;
        case "startDate":
          aVal = new Date(a.startDate).getTime();
          bVal = new Date(b.startDate).getTime();
          break;
        case "endDate":
          aVal = new Date(a.endDate).getTime();
          bVal = new Date(b.endDate).getTime();
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
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
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
      content: "",
      percentage: 10,
      startDate: "",
      endDate: "",
      subCategoryIds: [],
    });
    setSelectedPromotion(null);
  };

  const openEditModal = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setFormData({
      content: promotion.content,
      percentage: promotion.percentage,
      startDate: promotion.startDate.split("T")[0],
      endDate: promotion.endDate.split("T")[0],
      subCategoryIds: [],
    });
    setShowEditModal(true);
  };

  const openViewModal = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  const handleCreate = async () => {
    if (!formData.content.trim()) {
      alert("Promotion name is required!");
      return;
    }

    // Validate promotion name: must contain at least one letter
    const hasLetter = /[a-zA-Z]/.test(formData.content.trim());
    if (!hasLetter) {
      alert("Promotion name must contain at least one letter (cannot be only numbers or special characters)!");
      return;
    }

    if (!formData.startDate) {
      alert("Start date is required!");
      return;
    }

    if (!formData.endDate) {
      alert("End date is required!");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      alert("Start date cannot be in the past!");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date!");
      return;
    }

    if (formData.percentage <= 0 || formData.percentage > 100) {
      alert("Discount percentage must be between 1-100%");
      return;
    }

    try {
      await promotionApi.create({
        content: formData.content,
        percentage: formData.percentage,
        startDate: formData.startDate,
        endDate: formData.endDate,
        active: true,
        subCategoryIds: formData.subCategoryIds,
      });
      alert("Promotion created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadPromotions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error creating promotion:", err);
      alert(err.response?.data?.message || "Unable to create promotion");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPromotion) return;

    if (!formData.content.trim()) {
      alert("Promotion name is required!");
      return;
    }

    // Validate promotion name: must contain at least one letter
    const hasLetter = /[a-zA-Z]/.test(formData.content.trim());
    if (!hasLetter) {
      alert("Promotion name must contain at least one letter (cannot be only numbers or special characters)!");
      return;
    }

    if (!formData.startDate) {
      alert("Start date is required!");
      return;
    }

    if (!formData.endDate) {
      alert("End date is required!");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      alert("End date must be after start date!");
      return;
    }

    if (formData.percentage <= 0 || formData.percentage > 100) {
      alert("Discount percentage must be between 1-100%");
      return;
    }

    try {
      await promotionApi.update(selectedPromotion.id, {
        content: formData.content,
        percentage: formData.percentage,
        startDate: formData.startDate,
        endDate: formData.endDate,
        active: selectedPromotion.active,
      });
      alert("Promotion updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadPromotions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error updating promotion:", err);
      alert(err.response?.data?.message || "Unable to update promotion");
    }
  };

  const handleToggleStatus = async (promotion: PromotionResponse) => {
    const action = promotion.active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this promotion?`)) return;

    try {
      if (promotion.active) {
        await promotionApi.setInactive(promotion.id);
      } else {
        await promotionApi.setActive(promotion.id);
      }
      loadPromotions();
    } catch (error) {
      console.error(`Error ${action} promotion:`, error);
      alert(`Failed to ${action} promotion`);
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
        title="Promotion Management"
        totalCount={filteredPromotions.length}
        entityName="promotions"
        onAddClick={() => setShowCreateModal(true)}
        addButtonLabel="Add Promotion"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, percentage..."
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
              { value: "scheduled", label: "Scheduled" },
              { value: "expired", label: "Expired" },
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
                <NewSortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Discount"
                  sortKey="percent"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="center"
                />
                <NewSortableHeader
                  label="Start Date"
                  sortKey="startDate"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="End Date"
                  sortKey="endDate"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Sub-Categories" align="left" />
                <SimpleTableHeader label="Status" align="center" />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedPromotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-beige-500">
                    No promotions found
                  </td>
                </tr>
              ) : (
                paginatedPromotions.map((promotion) => (
                  <tr key={promotion.id} className="transition-colors hover:bg-beige-50">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {promotion.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText className="max-w-xs font-medium truncate">
                        {promotion.content}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <TableCellText className="font-semibold text-green-600">
                        {promotion.percentage}%
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">
                        {formatDate(promotion.startDate)}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">
                        {formatDate(promotion.endDate)}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap max-w-xs gap-1">
                        {promotionSubCats[promotion.id]?.length > 0 ? (
                          promotionSubCats[promotion.id].map((subCat) => (
                            <span
                              key={subCat.id}
                              className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full"
                            >
                              {subCat.name}
                            </span>
                          ))
                        ) : (
                          <TableCellText variant="secondary" className="text-xs">
                            No sub-categories
                          </TableCellText>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge active={promotion.active} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(promotion)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditModal(promotion)}
                          icon="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleToggleStatus(promotion)}
                          icon={promotion.active ? "deactivate" : "activate"}
                          title={promotion.active ? "Deactivate" : "Activate"}
                          variant={promotion.active ? "danger" : "success"}
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
            totalItems={filteredPromotions.length}
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
        title="Add New Promotion"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Promotion Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                title="Promotion content"
                placeholder="Enter promotion description"
                className="w-full px-3 py-2 border rounded-md border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Discount Percentage (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  required
                />
              </div>
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Promotion"
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
        title="Edit Promotion"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Promotion Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                title="Promotion name"
                placeholder="Enter promotion description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Discount Percentage (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  required
                />
              </div>
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Promotion"
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
          setSelectedPromotion(null);
        }}
        title="Promotion Details"
        maxWidth="lg"
      >
        {selectedPromotion && (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="ID" value={`#${selectedPromotion.id}`} />
                <ViewDetailsRow
                  label="Discount"
                  value={
                    <span className="text-lg font-semibold text-green-600">
                      {selectedPromotion.percentage}%
                    </span>
                  }
                />
              </ViewDetailsGrid>

              <div className="col-span-2 mt-2">
                <ViewDetailsRow label="Name" value={selectedPromotion.content} />
              </div>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Start Date"
                  value={formatDate(selectedPromotion.startDate)}
                />
                <ViewDetailsRow label="End Date" value={formatDate(selectedPromotion.endDate)} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Status"
                  value={
                    selectedPromotion.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )
                  }
                />
                <ViewDetailsRow
                  label="Current State"
                  value={
                    <span className="text-blue-600 capitalize">
                      {getPromotionStatus(selectedPromotion)}
                    </span>
                  }
                />
              </ViewDetailsGrid>
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPromotion(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </ManagementLayout>
  );
}
