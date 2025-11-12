import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUndo, FaCheck, FaTimes, FaSearch, FaSort } from "react-icons/fa";
import { categoriesApi } from "../../api";
import type {
  SupCategory,
  SubCategory,
  SubCategoryCreateRequest,
  SubCategoryUpdateRequest,
} from "../../types/api/category.types";

type StatusFilter = "all" | "active" | "inactive";
type SortOrder = "asc" | "desc";

export function SubCategoryManagement() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [parentFilter, setParentFilter] = useState<number | "all">("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);

  // Form data
  const [subFormData, setSubFormData] = useState<CreateSubCategoryRequest>({
    supCategoryId: 0,
    name: "",
    description: "",
    slug: "",
  });

  useEffect(() => {
    loadAllCategories();
  }, []);

  const loadAllCategories = async () => {
    setLoading(true);
    try {
      const [subRes, supRes] = await Promise.all([
        categoriesApi.sub.getAll(),
        categoriesApi.sup.getAll(),
      ]);
      setSubCategories(subRes.data || []);
      setSupCategories(supRes.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim() || subFormData.supCategoryId === 0) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await categoriesApi.sub.create(subFormData);
      alert("Sub category created successfully!");
      setShowCreateModal(false);
      setSubFormData({ supCategoryId: 0, name: "", description: "", slug: "" });
      loadAllCategories();
    } catch (error) {
      console.error("Error creating sub category:", error);
      alert("Failed to create sub category");
    }
  };

  const handleUpdateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      await categoriesApi.sub.update(selectedSub.id, subFormData as UpdateSubCategoryRequest);
      alert("Sub category updated successfully!");
      setShowEditModal(false);
      setSelectedSub(null);
      setSubFormData({ supCategoryId: 0, name: "", description: "", slug: "" });
      loadAllCategories();
    } catch (error) {
      console.error("Error updating sub category:", error);
      alert("Failed to update sub category");
    }
  };

  const handleToggleSubStatus = async (sub: SubCategory) => {
    try {
      if (sub.active) {
        await categoriesApi.sub.deactivate(sub.id);
        alert("Sub category hidden successfully!");
      } else {
        await categoriesApi.sub.activate(sub.id);
        alert("Sub category activated successfully!");
      }
      loadAllCategories();
    } catch (error) {
      console.error("Error toggling sub status:", error);
      alert("Failed to change status");
    }
  };

  const openCreateModal = () => {
    setSubFormData({ supCategoryId: 0, name: "", description: "", slug: "" });
    setShowCreateModal(true);
  };

  const openEditModal = (sub: SubCategory) => {
    setSelectedSub(sub);
    setSubFormData({
      supCategoryId: sub.supCategoryId,
      name: sub.name,
      description: sub.description || "",
      slug: sub.slug || "",
    });
    setShowEditModal(true);
  };

  const getSupCategoryName = (supCategoryId: number) => {
    const sup = supCategories.find((s) => s.id === supCategoryId);
    return sup ? sup.name : "Unknown";
  };

  const getFilteredData = () => {
    let filtered = [...subCategories];

    // Filter by parent
    if (parentFilter !== "all") {
      filtered = filtered.filter((s) => s.supCategoryId === parentFilter);
    }

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
          <h1 className="text-3xl font-bold text-gray-900">Sub Category Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage sub categories under parent categories
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-600 hover:bg-beige-700"
        >
          <FaPlus /> Add Sub Category
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

        {/* Parent Filter */}
        <select
          value={parentFilter}
          onChange={(e) => setParentFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Filter by parent"
          title="Filter by parent category"
        >
          <option value="all">All Parents</option>
          {supCategories.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>

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
                  Parent Category
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Description
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No sub categories found
                  </td>
                </tr>
              ) : (
                filteredData.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      #{sub.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {sub.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                        {getSupCategoryName(sub.supCategoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {sub.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {sub.slug || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.active ? (
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
                          onClick={() => openEditModal(sub)}
                          className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleSubStatus(sub)}
                          className={`p-2 rounded transition-colors ${
                            sub.active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={sub.active ? "Hide" : "Activate"}
                        >
                          {sub.active ? <FaTrash /> : <FaUndo />}
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
            <h2 className="mb-4 text-2xl font-bold">Add Sub Category</h2>
            <form onSubmit={handleCreateSub} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={subFormData.supCategoryId}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      supCategoryId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  aria-label="Select parent category"
                  title="Select parent category"
                >
                  <option value={0}>-- Select Parent --</option>
                  {supCategories
                    .filter((s) => s.active)
                    .map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subFormData.name}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Enter category name"
                  title="Category name"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={subFormData.description}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Category description"
                  title="Category description"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={subFormData.slug}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, slug: e.target.value })
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
      {showEditModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">Edit Sub Category</h2>
            <form onSubmit={handleUpdateSub} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={subFormData.supCategoryId}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      supCategoryId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  aria-label="Select parent category"
                  title="Select parent category"
                >
                  {supCategories
                    .filter((s) => s.active)
                    .map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subFormData.name}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Enter category name"
                  title="Category name"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={subFormData.description}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Category description"
                  title="Category description"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={subFormData.slug}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, slug: e.target.value })
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
                    setSelectedSub(null);
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
