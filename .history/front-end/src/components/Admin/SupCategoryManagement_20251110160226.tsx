import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUndo, FaCheck, FaTimes, FaSearch, FaSort } from "react-icons/fa";
import { categoriesApi } from "../../api";
import type { SupCategory, SupCategoryCreateRequest, SupCategoryUpdateRequest } from "../../types/api/category.types";

type StatusFilter = "all" | "active" | "inactive";
type SortOrder = "asc" | "desc";

export function SupCategoryManagement() {
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSup, setSelectedSup] = useState<SupCategory | null>(null);

  // Form data
  const [supFormData, setSupFormData] = useState<SupCategoryCreateRequest>({
    name: "",
    slug: "",
  });

  useEffect(() => {
    loadSupCategories();
  }, []);

  const loadSupCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.sup.getAll();
      setSupCategories(response || []);
    } catch (error) {
      console.error("Error loading sup categories:", error);
      alert("Failed to load parent categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supFormData.name.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      await categoriesApi.sup.create(supFormData);
      alert("Parent category created successfully!");
      setShowCreateModal(false);
      setSupFormData({ name: "", slug: "" });
      loadSupCategories();
    } catch (error) {
      console.error("Error creating sup category:", error);
      alert("Failed to create parent category");
    }
  };

  const handleUpdateSup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSup) return;

    try {
      await categoriesApi.sup.update(selectedSup.id, supFormData as SupCategoryUpdateRequest);
      alert("Parent category updated successfully!");
      setShowEditModal(false);
      setSelectedSup(null);
      setSupFormData({ name: "", slug: "" });
      loadSupCategories();
    } catch (error) {
      console.error("Error updating sup category:", error);
      alert("Failed to update parent category");
    }
  };

  const handleToggleSupStatus = async (sup: SupCategory) => {
    try {
      if (sup.active) {
        await categoriesApi.sup.deactivate(sup.id);
        alert("Parent category hidden successfully!");
      } else {
        await categoriesApi.sup.activate(sup.id);
        alert("Parent category activated successfully!");
      }
      loadSupCategories();
    } catch (error) {
      console.error("Error toggling sup status:", error);
      alert("Failed to change status");
    }
  };

  const openCreateModal = () => {
    setSupFormData({ name: "", slug: "" });
    setShowCreateModal(true);
  };

  const openEditModal = (sup: SupCategory) => {
    setSelectedSup(sup);
    setSupFormData({
      name: sup.name,
      slug: sup.slug || "",
    });
    setShowEditModal(true);
  };

  const getFilteredData = () => {
    let filtered = [...supCategories];

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((s) => s.active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((s) => !s.active);
    }

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by name
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredData = getFilteredData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Category Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage parent categories for organizing books
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-600 hover:bg-beige-700"
        >
          <FaPlus /> Add Parent Category
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            title="Search category"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Filter by status"
          title="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>

        {/* Sort */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          title="Toggle sort order"
        >
          <FaSort /> {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-beige-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No parent categories found
                  </td>
                </tr>
              ) : (
                filteredData.map((sup) => (
                  <tr key={sup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      #{sup.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {sup.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {sup.slug || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sup.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          <FaCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                          <FaTimes className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sup)}
                          className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleSupStatus(sup)}
                          className={`p-2 rounded transition-colors ${
                            sup.active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={sup.active ? "Hide" : "Activate"}
                        >
                          {sup.active ? <FaTrash /> : <FaUndo />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">Add Parent Category</h2>
            <form onSubmit={handleCreateSup} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supFormData.name}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Enter category name"
                  title="Category name"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={supFormData.slug}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="category-slug"
                  title="URL-friendly slug"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-600 hover:bg-beige-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">Edit Parent Category</h2>
            <form onSubmit={handleUpdateSup} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supFormData.name}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Enter category name"
                  title="Category name"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={supFormData.slug}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="category-slug"
                  title="URL-friendly slug"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-600 hover:bg-beige-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSup(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
