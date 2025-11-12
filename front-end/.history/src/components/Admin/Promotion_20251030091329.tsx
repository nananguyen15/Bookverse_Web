import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

interface Promotion {
  id: string;
  name: string;
  description: string;
  applyTo: string[]; // Array of category IDs or ["all"]
  discountType: "percentage" | "fixed";
  discountValue: number;
  active: boolean;
}

export function Promotion() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  // Form states
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: "",
    description: "",
    applyTo: ["all"],
    discountType: "percentage",
    discountValue: 0,
    active: true,
  });

  // Load promotions and categories
  useEffect(() => {
    loadPromotions();
    loadCategories();
  }, []);

  const loadPromotions = () => {
    const promotionsData = JSON.parse(
      localStorage.getItem("promotions") || "[]"
    );
    setPromotions(promotionsData);
  };

  const loadCategories = () => {
    const categoriesData = JSON.parse(
      localStorage.getItem("adminCategories") || "[]"
    );
    setCategories(categoriesData);
  };

  const savePromotions = (updatedPromotions: Promotion[]) => {
    localStorage.setItem("promotions", JSON.stringify(updatedPromotions));
    setPromotions(updatedPromotions);
  };

  // Filtered and sorted promotions
  const filteredPromotions = useMemo(() => {
    let filtered = promotions;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [promotions, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleAddPromotion = () => {
    if (!formData.name) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.discountValue! <= 0) {
      alert("Discount value must be greater than 0");
      return;
    }

    if (
      formData.discountType === "percentage" &&
      formData.discountValue! > 100
    ) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    const newPromotion: Promotion = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      description: formData.description || "",
      applyTo: formData.applyTo || ["all"],
      discountType: formData.discountType!,
      discountValue: formData.discountValue!,
      active: formData.active ?? true,
    };

    const updatedPromotions = [...promotions, newPromotion];
    savePromotions(updatedPromotions);

    // Create notification
    const applyToText =
      newPromotion.applyTo.includes("all")
        ? "all products"
        : `${newPromotion.applyTo.length} ${newPromotion.applyTo.length === 1 ? 'category' : 'categories'}`;

    createNotification(
      `New Promotion: ${newPromotion.name}`,
      `${newPromotion.name} - ${
        newPromotion.discountType === "percentage"
          ? newPromotion.discountValue + "%"
          : "$" + newPromotion.discountValue
      } off on ${applyToText}.`,
      "promotion"
    );

    setShowAddModal(false);
    resetForm();
  };

  const handleEditPromotion = () => {
    if (!selectedPromotion || !formData.name) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.discountValue! <= 0) {
      alert("Discount value must be greater than 0");
      return;
    }

    if (
      formData.discountType === "percentage" &&
      formData.discountValue! > 100
    ) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    const updatedPromotions = promotions.map((p) =>
      p.id === selectedPromotion.id
        ? {
            ...p,
            name: formData.name!,
            description: formData.description || "",
            applyTo: formData.applyTo || ["all"],
            discountType: formData.discountType!,
            discountValue: formData.discountValue!,
            active: formData.active ?? true,
          }
        : p
    );

    savePromotions(updatedPromotions);
    setShowEditModal(false);
    setSelectedPromotion(null);
    resetForm();
  };

  const handleDeletePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.filter(
      (p) => p.id !== selectedPromotion.id
    );
    savePromotions(updatedPromotions);
    setShowDeleteModal(false);
    setSelectedPromotion(null);
  };

  const handleToggleActive = (promotion: Promotion) => {
    const updatedPromotions = promotions.map((p) =>
      p.id === promotion.id ? { ...p, active: !p.active } : p
    );
    savePromotions(updatedPromotions);
  };

  const createNotification = (
    title: string,
    description: string,
    type: string
  ) => {
    const notifications = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    notifications.unshift({
      id: Date.now().toString(),
      title,
      description,
      createdAt: new Date().toISOString(),
      type,
    });
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  };

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      applyTo: promotion.applyTo,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      active: promotion.active,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      applyTo: ["all"],
      discountType: "percentage",
      discountValue: 0,
      active: true,
    });
  };

  const getCategoryName = (categoryId: string) => {
    if (categoryId === "all") return "All Products";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const getDiscountDisplay = (promotion: Promotion) => {
    if (promotion.discountType === "percentage") {
      return `${promotion.discountValue}%`;
    } else {
      return `$${promotion.discountValue.toFixed(2)}`;
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return promotion.active && now >= start && now <= end;
  };

  return (
    <div className="p-6 bg-beige-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-beige-900 font-heading">
          Promotion Management
        </h1>
        <p className="text-beige-600 mt-1">
          Create and manage promotional campaigns
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
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
              className="w-full bg-beige-600 hover:bg-beige-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus />
              Add Promotion
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex gap-4 items-center">
          <span className="text-sm text-beige-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
            aria-label="Sort by"
          >
            <option value="name">Name</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm hover:bg-beige-50"
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Apply To
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Discount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedPromotions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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
                    <td className="px-4 py-3 text-sm font-medium text-beige-900">
                      {promotion.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {getCategoryName(promotion.applyTo)}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 max-w-xs truncate">
                      {promotion.description || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-beige-900">
                      {getDiscountDisplay(promotion)}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {new Date(promotion.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {isPromotionActive(promotion) ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : promotion.active ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Scheduled
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
        <div className="bg-beige-50 px-4 py-3 border-t border-beige-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-beige-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-beige-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
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
              className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-beige-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Add New Promotion
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    placeholder="e.g., Summer Sale 2024"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    rows={3}
                    placeholder="Describe this promotion..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Apply To
                  </label>
                  <select
                    value={formData.applyTo}
                    onChange={(e) =>
                      setFormData({ ...formData, applyTo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="all">All Products</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      formData.discountType === "percentage" ? "100" : undefined
                    }
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
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
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPromotion}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Add Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promotion Modal */}
      {showEditModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Edit Promotion
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Apply To
                  </label>
                  <select
                    value={formData.applyTo}
                    onChange={(e) =>
                      setFormData({ ...formData, applyTo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="all">All Products</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      formData.discountType === "percentage" ? "100" : undefined
                    }
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                    required
                  />
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
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPromotion(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPromotion}
                className="px-4 py-2 bg-beige-600 text-white rounded-lg hover:bg-beige-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Promotion Modal */}
      {showDeleteModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Delete Promotion
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to delete the promotion{" "}
                <strong>{selectedPromotion.name}</strong>? This action cannot be
                undone.
              </p>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPromotion(null);
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePromotion}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
