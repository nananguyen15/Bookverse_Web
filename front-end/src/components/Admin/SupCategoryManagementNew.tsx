import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { categoriesApi, booksApi } from "../../api";
import type { SupCategory } from "../../types";
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
type SortField = "no" | "id" | "name";

// Extended type for enriched data
interface EnrichedSupCategory extends SupCategory {
  originalIndex: number;
}

export function SupCategoryManagementNew() {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith("/staff");

  const [categories, setCategories] = useState<EnrichedSupCategory[]>([]);
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
  const [selectedCategory, setSelectedCategory] = useState<SupCategory | null>(null);
  const [subCategoriesCount, setSubCategoriesCount] = useState<number>(0);
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
  });

  // Load data
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);

      let data: SupCategory[];
      if (statusFilter === "active") {
        data = await categoriesApi.sup.getActive();
      } else if (statusFilter === "inactive") {
        data = await categoriesApi.sup.getInactive();
      } else {
        data = await categoriesApi.sup.getAll();
      }

      // Add original index for 'No' column sorting
      const categoriesWithIndex = data.map((cat, index) => ({
        ...cat,
        originalIndex: index,
      }));

      setCategories(categoriesWithIndex);
    } catch (error) {
      console.error("Error loading super categories:", error);
      alert("Unable to load super category list");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredCategories = categories
    .filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
    });
    setSelectedCategory(null);
  };

  const openEditModal = (category: SupCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
    });
    setShowEditModal(true);
  };

  const openViewModal = async (category: SupCategory) => {
    setShowViewModal(true);
    setModalLoading(true);

    try {
      // Load full details from API
      const [fullDetails, subCategories] = await Promise.all([
        categoriesApi.sup.getById(category.id),
        categoriesApi.sup.getSubCategories(category.id),
      ]);

      setSelectedCategory(fullDetails);
      setSubCategoriesCount(subCategories.length);
    } catch (error) {
      console.error("Error loading category details:", error);
      // Fallback to existing data
      setSelectedCategory(category);
      setSubCategoriesCount(0);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Super category name is required!");
        return;
      }

      // Validate name: only letters and spaces (no numbers, no special characters)
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(trimmedName)) {
        alert("Category name can only contain letters and spaces (no numbers or special characters)!");
        return;
      }

      const createData = {
        name: trimmedName,
        active: true,
      };

      await categoriesApi.sup.create(createData);
      alert("Super category created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadCategories();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error creating super category:", err);
      alert(`Failed to create super category: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Super category name is required!");
        return;
      }

      // Validate name: only letters and spaces (no numbers, no special characters)
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(trimmedName)) {
        alert("Category name can only contain letters and spaces (no numbers or special characters)!");
        return;
      }

      const updateData = {
        name: trimmedName,
      };

      await categoriesApi.sup.update(selectedCategory.id, updateData);
      alert("Super category updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadCategories();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error updating super category:", err);
      alert(`Failed to update super category: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleStatus = async (category: SupCategory) => {
    const action = category.active ? "deactivate" : "activate";

    // If deactivating, warn about cascade effects
    if (category.active) {
      try {
        // Load sub-categories and books to count affected items
        const [allSubCats, allBooks] = await Promise.all([
          categoriesApi.sub.getAll(),
          booksApi.getAll(),
        ]);

        const affectedSubCats = allSubCats.filter(sc => sc.supCategoryId === category.id && sc.active);
        const affectedBooks = allBooks.filter(book =>
          affectedSubCats.some(sc => sc.id === book.categoryId) && book.active
        );

        let warningMessage = `Are you sure you want to deactivate "${category.name}"?\n\n`;
        warningMessage += `⚠️ This will also deactivate:\n`;
        warningMessage += `- ${affectedSubCats.length} sub-categories\n`;
        warningMessage += `- ${affectedBooks.length} books\n\n`;
        warningMessage += `These items will be hidden from customers.`;

        if (!window.confirm(warningMessage)) return;
      } catch (error) {
        console.error("Error loading cascade info:", error);
        if (!window.confirm(`Are you sure you want to ${action} this parent category?`)) return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to ${action} this parent category?`)) return;
    }

    try {
      if (category.active) {
        await categoriesApi.sup.deactivate(category.id);
      } else {
        await categoriesApi.sup.activate(category.id);
      }
      loadCategories();
    } catch (error) {
      console.error(`Error ${action} parent category:`, error);
      alert(`Failed to ${action} parent category`);
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
      title="Super Category Management"
      totalCount={filteredCategories.length}
      entityName="super categories"
      onAddClick={() => setShowCreateModal(true)}
      addButtonLabel="Add Super Category"
      searchBar={
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          placeholder="Search by super category name..."
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
              <SimpleTableHeader label="Status" align="center" />
              <SimpleTableHeader label="Actions" align="center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            {paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-beige-500">
                  No super categories found
                </td>
              </tr>
            ) : (
              paginatedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-beige-50 transition-colors">
                  <TableCell>
                    <TableCellText className="font-semibold text-beige-700">
                      {category.originalIndex + 1}
                    </TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText className="font-medium">{category.name}</TableCellText>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge active={category.active} />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtonGroup>
                      <ActionButton
                        onClick={() => openViewModal(category)}
                        icon="view"
                        title="View Details"
                      />
                      <ActionButton
                        onClick={() => openEditModal(category)}
                        icon="edit"
                        title="Edit"
                      />
                      <ActionButton
                        onClick={() => handleToggleStatus(category)}
                        icon={category.active ? "deactivate" : "activate"}
                        title={category.active ? "Deactivate" : "Activate"}
                        variant={category.active ? "danger" : "success"}
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
        title="Add New Super Category"
        maxWidth="md"
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
                Super Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                placeholder="e.g., Fiction, Non-Fiction, Science"
                required
              />
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Super Category"
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
        title="Edit Super Category"
        maxWidth="md"
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
                Super Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                required
              />
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Super Category"
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
          setSubCategoriesCount(0);
        }}
        title="Super Category Details"
        maxWidth="md"
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
                  label="Sub-Categories"
                  value={
                    <span className="font-semibold text-beige-700">
                      {subCategoriesCount} {subCategoriesCount === 1 ? 'category' : 'categories'}
                    </span>
                  }
                />
              </ViewDetailsGrid>
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCategory(null);
                  setSubCategoriesCount(0);
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
