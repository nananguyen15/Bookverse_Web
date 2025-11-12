import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaBook,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";
import { updateCategoryBooksCount } from "../../utils/initAdminData";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null; // null = main category
  booksCount: number;
}

export function CateManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<Partial<Category>>({});

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "main" | "sub">("all");
  const [sortBy, setSortBy] = useState<"name" | "books">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categories, searchTerm, filterType, sortBy, sortOrder]);

  const loadCategories = () => {
    updateCategoryBooksCount();
    const saved = JSON.parse(localStorage.getItem("adminCategories") || "[]");
    setCategories(saved);
  };

  const applyFilters = () => {
    let result = [...categories];

    // Search filter
    if (searchTerm) {
      result = result.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType === "main") {
      result = result.filter((cat) => cat.parentId === null);
    } else if (filterType === "sub") {
      result = result.filter((cat) => cat.parentId !== null);
    }

    // Sort
    result.sort((a, b) => {
      let compareA, compareB;

      if (sortBy === "name") {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else {
        compareA = a.booksCount;
        compareB = b.booksCount;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    setFilteredCategories(result);
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: String(Date.now()),
      name: formData.name || "",
      slug: (formData.name || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      description: formData.description || "",
      parentId: formData.parentId || null,
      booksCount: 0,
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem("adminCategories", JSON.stringify(updated));

    setShowAddModal(false);
    setFormData({});
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;

    const updated = categories.map((cat) =>
      cat.id === selectedCategory.id
        ? {
            ...cat,
            ...formData,
            slug: (formData.name || cat.name)
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          }
        : cat
    );

    setCategories(updated);
    localStorage.setItem("adminCategories", JSON.stringify(updated));

    setShowEditModal(false);
    setSelectedCategory(null);
    setFormData({});
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    // Check if category has books
    if (selectedCategory.booksCount > 0) {
      alert(
        `Cannot delete category "${selectedCategory.name}" because it has ${selectedCategory.booksCount} book(s). Please reassign or delete those books first.`
      );
      return;
    }

    // Check if main category has subcategories
    if (selectedCategory.parentId === null) {
      const hasSubcategories = categories.some(
        (cat) => cat.parentId === selectedCategory.id
      );
      if (hasSubcategories) {
        alert(
          `Cannot delete main category "${selectedCategory.name}" because it has subcategories. Please delete subcategories first.`
        );
        return;
      }
    }

    const updated = categories.filter((cat) => cat.id !== selectedCategory.id);
    setCategories(updated);
    localStorage.setItem("adminCategories", JSON.stringify(updated));

    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData(category);
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleViewBooks = (categoryId: string) => {
    // Navigate to books page with filter
    navigate(`/admin/books?category=${categoryId}`);
  };

  const getMainCategories = () => {
    return categories.filter((cat) => cat.parentId === null);
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "Main Category";
    return categories.find((c) => c.id === catId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-beige-900">
            Manage Categories
          </h2>
          <p className="text-beige-600 mt-1">
            Manage categories and subcategories
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({});
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors shadow-sm"
        >
          <FaPlus />
          <span className="font-medium">Add Category</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "main" | "sub")
              }
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
            >
              <option value="all">All Categories</option>
              <option value="main">Main Categories Only</option>
              <option value="sub">Subcategories Only</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "books")}
                className="flex-1 px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
              >
                <option value="name">Name</option>
                <option value="books">Books Count</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
              >
                <option value="asc">↑</option>
                <option value="desc">↓</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-beige-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Parent Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Books Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-beige-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-beige-900">
                      {category.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {category.parentId === null ? (
                          <FaFolderOpen className="text-beige-600" />
                        ) : (
                          <FaFolder className="text-beige-400" />
                        )}
                        <span className="font-medium text-beige-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          category.parentId === null
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {category.parentId === null ? "Main" : "Sub"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-beige-700">
                      {getCategoryName(category.parentId)}
                    </td>
                    <td className="px-4 py-4">
                      {category.booksCount > 0 ? (
                        <button
                          onClick={() => handleViewBooks(category.id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-beige-700 bg-beige-100 rounded-lg hover:bg-beige-200 transition-colors"
                        >
                          <FaBook />
                          {category.booksCount}
                        </button>
                      ) : (
                        <span className="text-sm text-beige-500">0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-beige-700 max-w-xs truncate">
                      {category.description}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-beige-500"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-beige-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-beige-900">
                {showAddModal ? "Add New Category" : "Edit Category"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setFormData({});
                }}
                className="text-beige-500 hover:text-beige-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  placeholder="Enter category name"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Parent Category (Optional)
                </label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                >
                  <option value="">None (Main Category)</option>
                  {getMainCategories().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-beige-500">
                  Leave empty to create a main category
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  placeholder="Enter category description"
                />
              </div>
            </div>

            <div className="border-t border-beige-200 px-6 py-4 flex items-center justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setFormData({});
                }}
                className="px-6 py-2 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddCategory : handleEditCategory}
                className="px-6 py-2 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors font-medium"
              >
                {showAddModal ? "Add Category" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-center text-beige-900">
                Delete Category
              </h3>
              <p className="mt-2 text-center text-beige-600">
                Are you sure you want to delete "{selectedCategory.name}"?
                {selectedCategory.booksCount > 0 && (
                  <span className="block mt-2 font-medium text-red-600">
                    This category has {selectedCategory.booksCount} book(s)!
                  </span>
                )}
              </p>
            </div>
            <div className="px-6 py-4 bg-beige-50 flex items-center justify-end gap-4 rounded-b-lg">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                className="px-6 py-2 border border-beige-300 text-beige-700 rounded-lg hover:bg-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
