import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { categoriesApi, promotionApi } from "../../api";
import type { SupCategory } from "../../types";
import type { PromotionResponse } from "../../types/api/promotion.types";

interface PromotionFormData {
  content: string;
  percentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
  subCategoryIds: number[];
}

export function Promotion() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [categories, setCategories] = useState<SupCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"content">("content");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResponse | null>(
    null
  );

  // Form states
  const [formData, setFormData] = useState<PromotionFormData>({
    content: "",
    percentage: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
    subCategoryIds: [],
  });

  // Load promotions and categories
  useEffect(() => {
    loadPromotions();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.sup.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionApi.getAll();
      setPromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      alert("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted promotions
  const filteredPromotions = useMemo(() => {
    let filtered = promotions;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.content.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a.content.toLowerCase();
      const bVal = b.content.toLowerCase();

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [promotions, searchTerm, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleAddPromotion = async () => {
    if (!formData.content.trim()) {
      alert("Please enter promotion description");
      return;
    }

    if (formData.percentage <= 0) {
      alert("Discount percentage must be greater than 0");
      return;
    }

    if (formData.percentage > 100) {
      alert("Discount percentage cannot exceed 100%");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert("End date must be after start date");
      return;
    }

    try {
      await promotionApi.create(formData);
      alert("Promotion created successfully!");
      setShowAddModal(false);
      resetForm();
      await loadPromotions();
    } catch (error) {
      console.error("Failed to create promotion:", error);
      alert("Failed to create promotion");
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion || !formData.content.trim()) {
      alert("Please enter promotion description");
      return;
    }

    if (formData.percentage <= 0) {
      alert("Discount percentage must be greater than 0");
      return;
    }

    if (formData.percentage > 100) {
      alert("Discount percentage cannot exceed 100%");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert("End date must be after start date");
      return;
    }

    try {
      await promotionApi.update(selectedPromotion.id, formData);
      alert("Promotion updated successfully!");
      setShowEditModal(false);
      setSelectedPromotion(null);
      resetForm();
      await loadPromotions();
    } catch (error) {
      console.error("Failed to update promotion:", error);
      alert("Failed to update promotion");
    }
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;

    // API doesn't have delete, so we deactivate instead
    try {
      await promotionApi.setInactive(selectedPromotion.id);
      alert("Promotion deactivated successfully!");
      setShowDeleteModal(false);
      setSelectedPromotion(null);
      await loadPromotions();
    } catch (error) {
      console.error("Failed to deactivate promotion:", error);
      alert("Failed to deactivate promotion");
    }
  };

  const handleToggleActive = async (promotion: PromotionResponse) => {
    try {
      if (promotion.active) {
        await promotionApi.setInactive(promotion.id);
      } else {
        await promotionApi.setActive(promotion.id);
      }
      await loadPromotions();
    } catch (error) {
      console.error("Failed to toggle promotion status:", error);
      alert("Failed to update promotion status");
    }
  };



  const openEditModal = async (promotion: PromotionResponse) => {
    try {
      // Load subcategories for this promotion (may return 400 if none assigned)
      let subCategoryIds: number[] = [];
      try {
        const subCategories = await promotionApi.getPromotionSubCategories(promotion.id);
        subCategoryIds = subCategories.map(sc => sc.id);
      } catch {
        // Promotion doesn't have sub-categories yet
        subCategoryIds = [];
      }

      setSelectedPromotion(promotion);
      setFormData({
        content: promotion.content,
        percentage: promotion.percentage,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        active: promotion.active,
        subCategoryIds,
      });
      setShowEditModal(true);
    } catch (error) {
      console.error("Failed to load promotion details:", error);
      alert("Failed to load promotion details");
    }
  };

  const openDeleteModal = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      content: "",
      percentage: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      subCategoryIds: [],
    });
  };



  return (
    <div className="min-h-screen p-6 bg-beige-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-beige-900 font-heading">
          Promotion Management
        </h1>
        <p className="mt-1 text-beige-600">
          Create and manage promotional campaigns
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute transform -translate-y-1/2 left-3 top-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
              />
            </div>
          </div>

          {/* Add Button */}
          <div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-600 hover:bg-beige-700"
            >
              <FaPlus />
              Add Promotion
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm text-beige-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 text-sm border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
            aria-label="Sort by"
          >
            <option value="content">Description</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1 text-sm border rounded-lg border-beige-300 hover:bg-beige-50"
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-beige-100 border-beige-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-left text-beige-900">
                  #
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-beige-900">
                  Description
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-beige-900">
                  Discount
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-beige-900">
                  Period
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-beige-900">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-beige-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-beige-500">
                    Loading promotions...
                  </td>
                </tr>
              ) : paginatedPromotions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-beige-500"
                  >
                    No promotions found
                  </td>
                </tr>
              ) : (
                paginatedPromotions.map((promotion, index) => (
                  <tr key={promotion.id} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="max-w-md px-4 py-3 text-sm text-beige-900">
                      {promotion.content}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-beige-900">
                      {promotion.percentage}%
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      <div className="text-xs">
                        <div>{new Date(promotion.startDate).toLocaleDateString()}</div>
                        <div className="text-beige-500">to</div>
                        <div>{new Date(promotion.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {promotion.active ? (
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(promotion)}
                          className={
                            promotion.active
                              ? "text-green-600 hover:text-green-800"
                              : "text-gray-600 hover:text-gray-800"
                          }
                          title={promotion.active ? "Deactivate" : "Activate"}
                        >
                          {promotion.active ? (
                            <FaToggleOn size={20} />
                          ) : (
                            <FaToggleOff size={20} />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(promotion)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(promotion)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-beige-50 border-beige-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-beige-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 text-sm border rounded border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-beige-600">
              entries (Total: {filteredPromotions.length})
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded border-beige-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-beige-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-sm border rounded border-beige-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Add New Promotion
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Promotion Description *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    rows={3}
                    placeholder="e.g., Summer Sale - Get 20% off on all fiction books"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: parseInt(e.target.value) || 0,
                      })
                    }
                    title="Discount percentage"
                    placeholder="Enter discount percentage (0-100)"
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    title="Select start date for promotion"
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    title="Select end date for promotion"
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Apply To Sub-Categories
                  </label>
                  <div className="p-3 space-y-2 overflow-y-auto border rounded-lg max-h-64 border-beige-300">
                    {categories.map((mainCat) => (
                      <div key={mainCat.id} className="space-y-1">
                        <div className="text-xs font-semibold uppercase text-beige-600">
                          {mainCat.name}
                        </div>
                        {mainCat.subCategories && mainCat.subCategories.map((subCat) => (
                          <label
                            key={subCat.id}
                            className="flex items-center gap-2 p-2 ml-4 rounded hover:bg-beige-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.subCategoryIds.includes(subCat.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    subCategoryIds: [...formData.subCategoryIds, subCat.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    subCategoryIds: formData.subCategoryIds.filter(
                                      (id) => id !== subCat.id
                                    ),
                                  });
                                }
                              }}
                              className="rounded border-beige-300 text-beige-600 focus:ring-beige-500"
                            />
                            <span className="text-sm text-beige-700">
                              {subCat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-beige-500">
                    Select sub-categories to apply this promotion. Leave empty to apply to all products.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="rounded border-beige-300 text-beige-600 focus:ring-beige-500"
                    />
                    <span className="text-sm text-beige-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-beige-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg border-beige-300 hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPromotion}
                className="px-4 py-2 text-white rounded-lg bg-beige-600 hover:bg-beige-700"
              >
                Add Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promotion Modal */}
      {showEditModal && selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Edit Promotion
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Promotion Description *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    rows={3}
                    placeholder="e.g., Summer Sale - Get 20% off on all fiction books"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: parseInt(e.target.value) || 0,
                      })
                    }
                    title="Discount percentage"
                    placeholder="Enter discount percentage (0-100)"
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    title="Select start date for promotion"
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    title="Select end date for promotion"
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-beige-700">
                    Apply To Sub-Categories
                  </label>
                  <div className="p-3 space-y-2 overflow-y-auto border rounded-lg max-h-64 border-beige-300">
                    {categories.map((mainCat) => (
                      <div key={mainCat.id} className="space-y-1">
                        <div className="text-xs font-semibold uppercase text-beige-600">
                          {mainCat.name}
                        </div>
                        {mainCat.subCategories && mainCat.subCategories.map((subCat) => (
                          <label
                            key={subCat.id}
                            className="flex items-center gap-2 p-2 ml-4 rounded hover:bg-beige-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.subCategoryIds.includes(subCat.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    subCategoryIds: [...formData.subCategoryIds, subCat.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    subCategoryIds: formData.subCategoryIds.filter(
                                      (id) => id !== subCat.id
                                    ),
                                  });
                                }
                              }}
                              className="rounded border-beige-300 text-beige-600 focus:ring-beige-500"
                            />
                            <span className="text-sm text-beige-700">
                              {subCat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-beige-500">
                    Select sub-categories to apply this promotion. Leave empty to apply to all products.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="rounded border-beige-300 text-beige-600 focus:ring-beige-500"
                    />
                    <span className="text-sm text-beige-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-beige-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPromotion(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg border-beige-300 hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPromotion}
                className="px-4 py-2 text-white rounded-lg bg-beige-600 hover:bg-beige-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Promotion Modal */}
      {showDeleteModal && selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Delete Promotion
              </h2>
            </div>
            <div className="p-6">
              <p className="mb-4 text-beige-700">
                Are you sure you want to deactivate this promotion? This will set its status to inactive.
              </p>
              <p className="p-3 mb-4 border rounded-lg bg-beige-50 border-beige-200">
                <strong>{selectedPromotion.content}</strong>
              </p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-beige-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPromotion(null);
                }}
                className="px-4 py-2 border rounded-lg border-beige-300 hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePromotion}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

