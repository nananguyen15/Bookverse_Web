import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { categoriesApi, promotionApi, booksApi } from "../../api";
import type { SubCategory, SupCategory } from "../../types";
import type { PromotionResponse, UpdatePromotionRequest } from "../../types/api/promotion.types";
import { FaExclamationTriangle } from "react-icons/fa";
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

type StatusFilter = "all" | "active" | "inactive";
type SortField = "no" | "id" | "name" | "supCategory";

// Extended type for enriched data
interface EnrichedSubCategory extends SubCategory {
  originalIndex: number;
  supCategoryName?: string;
  hasInactiveSupCategory?: boolean;
}

export function SubCategoryManagementNew() {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith("/staff");

  const [categories, setCategories] = useState<EnrichedSubCategory[]>([]);
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [subCategoryPromotions, setSubCategoryPromotions] = useState<Record<number, PromotionResponse | null>>({});
  const [allPromotions, setAllPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [supFilter, setSupFilter] = useState<number | "all">("all");
  const [sortField, setSortField] = useState<SortField | null>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EnrichedSubCategory | null>(null);
  const [activeBooksCount, setActiveBooksCount] = useState<number>(0);
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supCategoryId: 0,
    promotionId: 0, // 0 = no promotion
  });

  // Load data
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [supData, subData, promotionsData, allPromotionsData] = await Promise.all([
        categoriesApi.sup.getAll(),
        statusFilter === "active"
          ? categoriesApi.sub.getActive()
          : statusFilter === "inactive"
            ? categoriesApi.sub.getInactive()
            : categoriesApi.sub.getAll(),
        promotionApi.getActive(),
        promotionApi.getAll(), // Load all promotions for dropdown
      ]);

      // Enrich categories with parent category names and original index
      const enrichedCategories: EnrichedSubCategory[] = subData.map((cat, index) => {
        const supCategory = supData.find((s) => s.id === cat.supCategoryId);
        return {
          ...cat,
          supCategoryName: supCategory?.name || "N/A",
          hasInactiveSupCategory: supCategory ? !supCategory.active : false,
          originalIndex: index,
        };
      });

      setSupCategories(supData.filter((s) => s.active));
      setCategories(enrichedCategories);
      setAllPromotions(allPromotionsData);

      // Load promotions for each sub-category
      await loadSubCategoryPromotions(promotionsData, subData);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Unable to load category list");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to assign sub-category to promotion
  const assignSubCategoryToPromotion = async (subCategoryId: number, promotionId: number) => {
    if (promotionId === 0) return; // No promotion selected

    try {
      // Get current promotion details
      const promotion = await promotionApi.getById(promotionId);
      let currentSubCats: SubCategory[] = [];
      try {
        currentSubCats = await promotionApi.getPromotionSubCategories(promotionId);
      } catch {
        // Promotion doesn't have sub-categories yet (backend returns 400)
        currentSubCats = [];
      }

      // Check if sub-category already in promotion
      if (currentSubCats.some(sc => sc.id === subCategoryId)) {
        return; // Already assigned
      }

      // Add new sub-category ID to the list
      const updatedSubCategoryIds = [...currentSubCats.map(sc => sc.id), subCategoryId];

      // Update promotion with new sub-category list
      const updateData: UpdatePromotionRequest = {
        content: promotion.content,
        percentage: promotion.percentage,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        active: promotion.active,
        subCategoryIds: updatedSubCategoryIds,
      };

      await promotionApi.update(promotionId, updateData);
    } catch (error) {
      console.error("Error assigning sub-category to promotion:", error);
      throw error;
    }
  };

  // Helper function to remove sub-category from old promotion
  const removeSubCategoryFromPromotion = async (subCategoryId: number, promotionId: number) => {
    if (promotionId === 0) return;

    try {
      const promotion = await promotionApi.getById(promotionId);
      let currentSubCats: SubCategory[] = [];
      try {
        currentSubCats = await promotionApi.getPromotionSubCategories(promotionId);
      } catch {
        // Promotion doesn't have sub-categories yet
        currentSubCats = [];
      }

      // Remove sub-category ID from list
      const updatedSubCategoryIds = currentSubCats
        .filter(sc => sc.id !== subCategoryId)
        .map(sc => sc.id);

      const updateData: UpdatePromotionRequest = {
        content: promotion.content,
        percentage: promotion.percentage,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        active: promotion.active,
        subCategoryIds: updatedSubCategoryIds,
      };

      await promotionApi.update(promotionId, updateData);
    } catch (error) {
      console.error("Error removing sub-category from promotion:", error);
      throw error;
    }
  };

  const loadSubCategoryPromotions = async (
    promotionsData: PromotionResponse[],
    categoriesData: SubCategory[]
  ) => {
    const subCatPromos: Record<number, PromotionResponse | null> = {};

    // Batch fetch all promotion sub-categories with silent error handling
    const promotionSubCatsCache: Record<number, number[]> = {};
    await Promise.all(
      promotionsData.map(async (promo) => {
        try {
          const subCats = await promotionApi.getPromotionSubCategories(promo.id);
          promotionSubCatsCache[promo.id] = subCats.map(sc => sc.id);
        } catch {
          // Promotion doesn't have sub-categories (backend returns 400)
          promotionSubCatsCache[promo.id] = [];
        }
      })
    );

    // For each sub-category, find active promotion
    for (const subCat of categoriesData) {
      let foundPromo: PromotionResponse | null = null;

      // Check each promotion
      for (const promo of promotionsData) {
        const subCatIds = promotionSubCatsCache[promo.id] || [];
        if (subCatIds.includes(subCat.id)) {
          // Check if promotion is currently active (within date range)
          const now = new Date();
          const start = new Date(promo.startDate);
          const end = new Date(promo.endDate);
          if (now >= start && now <= end && promo.active) {
            foundPromo = promo;
            break;
          }
        }
      }

      subCatPromos[subCat.id] = foundPromo;
    }

    setSubCategoryPromotions(subCatPromos);
  };

  // Filter and sort
  const filteredCategories = categories
    .filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchSup = supFilter === "all" || cat.supCategoryId === supFilter;

      return matchSearch && matchSup;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "no":
          aVal = a.originalIndex ?? 0;
          bVal = b.originalIndex ?? 0;
          break;
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "supCategory":
          aVal = (a.supCategoryName || "").toLowerCase();
          bVal = (b.supCategoryName || "").toLowerCase();
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
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
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
      description: "",
      supCategoryId: 0,
      promotionId: 0,
    });
    setSelectedCategory(null);
  };

  const openEditModal = async (category: EnrichedSubCategory) => {
    setSelectedCategory(category);

    // Find current promotion for this sub-category
    let currentPromotionId = 0;
    const currentPromo = subCategoryPromotions[category.id];
    if (currentPromo) {
      currentPromotionId = currentPromo.id;
    }

    setFormData({
      name: category.name,
      description: category.description || "",
      supCategoryId: category.supCategoryId,
      promotionId: currentPromotionId,
    });
    setShowEditModal(true);
  };

  const openViewModal = async (category: EnrichedSubCategory) => {
    setShowViewModal(true);
    setModalLoading(true);

    try {
      // Load full details from API
      const [fullDetails, activeBooks] = await Promise.all([
        categoriesApi.sub.getById(category.id),
        categoriesApi.sub.getActiveBooks(category.id),
      ]);

      // Enrich with parent category name from existing data
      const supCategory = supCategories.find((s) => s.id === fullDetails.supCategoryId);
      const enrichedDetails: EnrichedSubCategory = {
        ...fullDetails,
        supCategoryName: supCategory?.name || "N/A",
        hasInactiveSupCategory: supCategory ? !supCategory.active : false,
        originalIndex: category.originalIndex,
      };

      setSelectedCategory(enrichedDetails);
      setActiveBooksCount(activeBooks.length);
    } catch (error) {
      console.error("Error loading category details:", error);
      // Fallback to existing data
      setSelectedCategory(category);
      setActiveBooksCount(0);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Category name is required!");
        return;
      }

      // Validate name: only letters, spaces, and numbers
      const nameRegex = /^[a-zA-Z0-9\s]+$/;
      if (!nameRegex.test(trimmedName)) {
        alert("Category name can only contain letters, numbers, and spaces!");
        return;
      }

      if (!formData.supCategoryId || formData.supCategoryId === 0) {
        alert("Please select a parent category!");
        return;
      }

      const createData: Record<string, string | number | boolean> = {
        name: trimmedName,
        supCategoryId: formData.supCategoryId,
        active: true,
      };

      if (formData.description && formData.description.trim()) {
        createData.description = formData.description.trim();
      }

      const newSubCategory = await categoriesApi.sub.create(createData);

      // If promotion selected, assign sub-category to it
      if (formData.promotionId > 0) {
        try {
          await assignSubCategoryToPromotion(newSubCategory.id, formData.promotionId);
        } catch (error) {
          console.error("Failed to assign promotion, but sub-category was created:", error);
        }
      }

      alert("Category created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error creating category:", err);
      alert(`Failed to create category: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Category name is required!");
        return;
      }

      // Validate name: only letters and spaces (no numbers, no special characters)
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(trimmedName)) {
        alert("Category name can only contain letters and spaces (no numbers or special characters)!");
        return;
      }

      if (!formData.supCategoryId || formData.supCategoryId === 0) {
        alert("Please select a parent category!");
        return;
      }

      const updateData: Record<string, string | number> = {
        name: trimmedName,
        supCategoryId: formData.supCategoryId,
      };

      if (formData.description && formData.description.trim()) {
        updateData.description = formData.description.trim();
      }

      await categoriesApi.sub.update(selectedCategory.id, updateData);

      // Handle promotion changes
      const oldPromotionId = subCategoryPromotions[selectedCategory.id]?.id || 0;
      const newPromotionId = formData.promotionId;

      if (oldPromotionId !== newPromotionId) {
        try {
          // Remove from old promotion if exists
          if (oldPromotionId > 0) {
            await removeSubCategoryFromPromotion(selectedCategory.id, oldPromotionId);
          }

          // Add to new promotion if selected
          if (newPromotionId > 0) {
            await assignSubCategoryToPromotion(selectedCategory.id, newPromotionId);
          }
        } catch (error) {
          console.error("Failed to update promotion assignment:", error);
          alert("Category updated, but failed to update promotion. Please try again.");
        }
      }

      alert("Category updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error updating category:", err);
      alert(`Failed to update category: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleStatus = async (category: SubCategory) => {
    const action = category.active ? "deactivate" : "activate";

    // If deactivating, warn about books that will be hidden
    if (category.active) {
      try {
        const allBooks = await booksApi.getAll();
        const affectedBooks = allBooks.filter(book => book.categoryId === category.id && book.active);

        let warningMessage = `Are you sure you want to deactivate "${category.name}"?\n\n`;
        if (affectedBooks.length > 0) {
          warningMessage += `⚠️ This will hide ${affectedBooks.length} book(s) from customers.\n`;
          warningMessage += `Books will not be visible in the store.`;
        }

        if (!window.confirm(warningMessage)) return;
      } catch (error) {
        console.error("Error loading books info:", error);
        if (!window.confirm(`Are you sure you want to ${action} this category?`)) return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to ${action} this category?`)) return;
    }

    try {
      if (category.active) {
        await categoriesApi.sub.deactivate(category.id);
      } else {
        await categoriesApi.sub.activate(category.id);
      }
      loadAllData();
    } catch (error) {
      console.error(`Error ${action} category:`, error);
      alert(`Failed to ${action} category`);
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

    return isStaffRoute ? loadingContent : <ManagementLayout>{loadingContent}</ManagementLayout>;
  }

  const content = (
    <ManagementPageLayout
      title="Sub Category Management"
      totalCount={filteredCategories.length}
      entityName="sub categories"
      onAddClick={() => setShowCreateModal(true)}
      addButtonLabel="Add Sub Category"
      searchBar={
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          placeholder="Search by name or description..."
        />
      }
      filterBar={
        <div className="flex flex-col sm:flex-row gap-4 w-full">
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
          <FilterDropdown
            label="Parent Category"
            value={supFilter}
            onChange={(value) => {
              setSupFilter(value === "all" ? "all" : Number(value));
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Parents" },
              ...supCategories.map((sup) => ({
                value: sup.id,
                label: sup.name,
              })),
            ]}
          />
        </div>
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
              <NewSortableHeader
                label="Parent Category"
                sortKey="supCategory"
                currentSort={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SimpleTableHeader label="Description" />
              <SimpleTableHeader label="Promotion" align="center" />
              <SimpleTableHeader label="Status" align="center" />
              <SimpleTableHeader label="Actions" align="center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            {paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-beige-500">
                  No categories found
                </td>
              </tr>
            ) : (
              paginatedCategories.map((subCat) => (
                <tr key={subCat.id} className="hover:bg-beige-50 transition-colors">
                  <TableCell>
                    <TableCellText className="font-semibold text-beige-700">
                      {subCat.originalIndex + 1}
                    </TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText className="font-medium">{subCat.name}</TableCellText>
                    {subCat.hasInactiveSupCategory && (
                      <div className="flex items-center gap-1 mt-1">
                        <FaExclamationTriangle className="text-red-500 text-xs" />
                        <span className="text-xs text-red-600">Parent Category Inactive - Hidden from customers</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {subCat.hasInactiveSupCategory && (
                        <FaExclamationTriangle className="text-red-500" title="Parent category is inactive" />
                      )}
                      <TableCellText variant="secondary">
                        {subCat.supCategoryName}
                      </TableCellText>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TableCellText variant="secondary" className="max-w-md truncate">
                      {subCat.description || "No description"}
                    </TableCellText>
                  </TableCell>
                  <TableCell align="center">
                    {subCategoryPromotions[subCat.id] ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                          {subCategoryPromotions[subCat.id]!.percentage}% OFF
                        </span>
                        <span className="text-xs text-gray-500">
                          {subCategoryPromotions[subCat.id]!.content}
                        </span>
                      </div>
                    ) : (
                      <TableCellText variant="secondary" className="text-xs">
                        No promotion
                      </TableCellText>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge active={subCat.active} />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtonGroup>
                      <ActionButton
                        onClick={() => openViewModal(subCat)}
                        icon="view"
                        title="View Details"
                      />
                      <ActionButton
                        onClick={() => openEditModal(subCat)}
                        icon="edit"
                        title="Edit"
                      />
                      <ActionButton
                        onClick={() => handleToggleStatus(subCat)}
                        icon={subCat.active ? "deactivate" : "activate"}
                        title={subCat.active ? "Deactivate" : "Activate"}
                        variant={subCat.active ? "danger" : "success"}
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
          totalItems={filteredCategories.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
        />
      }
    />
  );

  return (
    <>
      {isStaffRoute ? content : <ManagementLayout>{content}</ManagementLayout>}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Sub Category"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supCategoryId}
                onChange={(e) =>
                  setFormData({ ...formData, supCategoryId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              >
                <option value={0}>-- Select Parent Category --</option>
                {supCategories.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <select
                value={formData.promotionId}
                onChange={(e) =>
                  setFormData({ ...formData, promotionId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              >
                <option value={0}>-- No Promotion --</option>
                {allPromotions
                  .filter(promo => promo.active)
                  .map((promo) => {
                    const start = new Date(promo.startDate).toLocaleDateString();
                    const end = new Date(promo.endDate).toLocaleDateString();
                    return (
                      <option key={promo.id} value={promo.id}>
                        {promo.percentage}% OFF - {promo.content} ({start} - {end})
                      </option>
                    );
                  })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a promotion to apply discount to this category's books
              </p>
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Sub Category"
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
        title="Edit Sub Category"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supCategoryId}
                onChange={(e) =>
                  setFormData({ ...formData, supCategoryId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              >
                <option value={0}>-- Select Parent Category --</option>
                {supCategories.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <select
                value={formData.promotionId}
                onChange={(e) =>
                  setFormData({ ...formData, promotionId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              >
                <option value={0}>-- No Promotion --</option>
                {allPromotions
                  .filter(promo => promo.active)
                  .map((promo) => {
                    const start = new Date(promo.startDate).toLocaleDateString();
                    const end = new Date(promo.endDate).toLocaleDateString();
                    return (
                      <option key={promo.id} value={promo.id}>
                        {promo.percentage}% OFF - {promo.content} ({start} - {end})
                      </option>
                    );
                  })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Change promotion assignment for this category
              </p>
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Sub Category"
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
          setSelectedCategory(null);
          setActiveBooksCount(0);
        }}
        title="Sub Category Details"
        maxWidth="lg"
      >
        {modalLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading details...</div>
          </div>
        ) : selectedCategory ? (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="ID" value={`#${selectedCategory.id}`} />
                <ViewDetailsRow
                  label="Status"
                  value={
                    selectedCategory.active ? (
                      <span className="text-green-600 font-semibold">● Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">● Inactive</span>
                    )
                  }
                />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Name" value={selectedCategory.name} />
                <ViewDetailsRow
                  label="Parent Category"
                  value={
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.supCategoryName || "N/A"}</span>
                      {selectedCategory.hasInactiveSupCategory && (
                        <span className="text-red-500" title="Parent category is inactive">
                          <FaExclamationTriangle className="inline" />
                        </span>
                      )}
                    </div>
                  }
                />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Active Books"
                  value={
                    <span className="font-semibold text-beige-700">
                      {activeBooksCount} {activeBooksCount === 1 ? 'book' : 'books'}
                    </span>
                  }
                />
                <ViewDetailsRow
                  label="Promotion"
                  value={
                    subCategoryPromotions[selectedCategory.id] ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {subCategoryPromotions[selectedCategory.id]!.percentage}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-500">No active promotion</span>
                    )
                  }
                />
              </ViewDetailsGrid>

              {selectedCategory.description && (
                <div className="col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-beige-700 mb-2">Description</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedCategory.description}
                  </p>
                </div>
              )}
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCategory(null);
                  setActiveBooksCount(0);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}
