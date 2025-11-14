import { useState, useEffect, useCallback, useMemo } from "react";
import { promotionApi } from "../../api/endpoints";
import type { PromotionResponse } from "../../types/api/promotion.types";
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaEye, FaTimes } from "react-icons/fa";

type SortField = "id" | "name" | "percent" | "startDate" | "endDate";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "active" | "scheduled" | "expired" | "inactive";

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResponse | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    content: "",
    percentage: 0,
    startDate: "",
    endDate: "",
    subCategoryIds: [] as number[],
  });

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promotionApi.getAll();
      setPromotions(data);
    } catch (err: unknown) {
      setError("Unable to load promotions. Please try again.");
      console.error("Error fetching promotions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      if (currentActive) {
        await promotionApi.setInactive(id);
      } else {
        await promotionApi.setActive(id);
      }
      await fetchPromotions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(
        error.response?.data?.message ||
          "Unable to update status. Please try again."
      );
    }
  };

  const handleCreatePromotion = async () => {
    if (!formData.content.trim() || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
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
      await fetchPromotions();
      setShowCreateModal(false);
      setFormData({ content: "", percentage: 0, startDate: "", endDate: "", subCategoryIds: [] });
      alert("Promotion created successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Unable to create promotion");
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return;
    if (!formData.content.trim() || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
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
      await fetchPromotions();
      setShowEditModal(false);
      setSelectedPromotion(null);
      setFormData({ content: "", percentage: 0, startDate: "", endDate: "", subCategoryIds: [] });
      alert("Promotion updated successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Unable to update promotion");
    }
  };

  const openCreateModal = () => {
    setFormData({ content: "", percentage: 10, startDate: "", endDate: "", subCategoryIds: [] });
    setShowCreateModal(true);
  };

  const openEditModal = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setFormData({
      content: promotion.content,
      percentage: promotion.percentage,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      subCategoryIds: [],
    });
    setShowEditModal(true);
  };

  const openViewModal = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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

  // Filtered and sorted promotions
  const filteredPromotions = useMemo(() => {
    let filtered = [...promotions];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        return (
          p.id.toString().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          p.percentage.toString().includes(term) ||
          formatDate(p.startDate).includes(term) ||
          formatDate(p.endDate).includes(term)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => getPromotionStatus(p) === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
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
        default:
          aVal = a.id;
          bVal = b.id;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [promotions, searchTerm, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="inline ml-1 text-brown-400" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1 text-brown-600" />
    ) : (
      <FaSortDown className="inline ml-1 text-brown-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brown-800">
          Promotion Management
        </h2>
        <button
          onClick={openCreateModal}
          className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Create New Promotion
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-beige-50 p-4 rounded-lg space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="Search by ID, name, description, discount %, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-brown-700 font-medium">Filter by status:</span>
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "scheduled", label: "Scheduled" },
            { value: "expired", label: "Expired" },
            { value: "inactive", label: "Inactive" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value as StatusFilter)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? "bg-brown-600 text-white"
                  : "bg-white text-brown-700 hover:bg-brown-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-brown-600">
        Showing {filteredPromotions.length} / {promotions.length} promotions
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-beige-200">
          <thead className="bg-beige-100">
            <tr>
              <th 
                onClick={() => handleSort("id")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                ID {getSortIcon("id")}
              </th>
              <th 
                onClick={() => handleSort("name")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                Promotion Name {getSortIcon("name")}
              </th>
              <th 
                onClick={() => handleSort("percent")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                Discount {getSortIcon("percent")}
              </th>
              <th 
                onClick={() => handleSort("startDate")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                Start Date {getSortIcon("startDate")}
              </th>
              <th 
                onClick={() => handleSort("endDate")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                End Date {getSortIcon("endDate")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-beige-200">
            {filteredPromotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              return (
                <tr key={promotion.id} className="hover:bg-beige-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-800 font-medium">
                    #{promotion.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-brown-800">
                      {promotion.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-red-600">
                      -{promotion.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-700">
                    {formatDate(promotion.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-700">
                    {formatDate(promotion.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {status === "active" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {status === "scheduled" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    )}
                    {status === "expired" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Expired
                      </span>
                    )}
                    {status === "inactive" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(promotion)}
                        className="text-blue-600 hover:text-blue-900 p-2"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(promotion)}
                        className="text-brown-600 hover:text-brown-900 p-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          handleToggleActive(promotion.id, promotion.active)
                        }
                        className={`p-2 ${
                          promotion.active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        title={promotion.active ? "Deactivate Promotion" : "Activate Promotion"}
                      >
                        {promotion.active ? <FaTimes /> : "✓"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPromotions.length === 0 && (
          <div className="text-center py-12 text-brown-600">
            {searchTerm || statusFilter !== "all"
              ? "No promotions found matching the criteria."
              : "No promotions yet. Click 'Create New Promotion' to add one."}
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-brown-900 flex items-center gap-2">
                <FaPlus /> Create New Promotion
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Promotion Content * <span className="text-red-600">(Required)</span>
                </label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="e.g., Summer Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Discount Percentage (%) * <span className="text-red-600">(1-100%)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Start Date * <span className="text-red-600">(Required)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    End Date * <span className="text-red-600">(Required)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ content: "", percentage: 0, startDate: "", endDate: "", subCategoryIds: [] });
                }}
                className="px-6 py-2 border border-brown-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePromotion}
                disabled={!formData.content.trim() || !formData.startDate || !formData.endDate || formData.percentage <= 0}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaPlus /> Create Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promotion Modal */}
      {showEditModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-brown-900 flex items-center gap-2">
                <FaEdit /> Edit Promotion
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Promotion ID
                </label>
                <input
                  type="text"
                  value={selectedPromotion.id}
                  disabled
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg bg-gray-100 text-gray-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Promotion Content * <span className="text-red-600">(Required)</span>
                </label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="e.g., Summer Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Discount Percentage (%) * <span className="text-red-600">(1-100%)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Start Date * <span className="text-red-600">(Required)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    title="Select promotion start date"
                    className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    End Date * <span className="text-red-600">(Required)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    title="Select promotion end date"
                    className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPromotion(null);
                  setFormData({ content: "", percentage: 0, startDate: "", endDate: "", subCategoryIds: [] });
                }}
                className="px-6 py-2 border border-brown-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPromotion}
                disabled={!formData.content.trim() || !formData.startDate || !formData.endDate || formData.percentage <= 0}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaEdit /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Promotion Modal */}
      {showViewModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-brown-900 flex items-center gap-2">
                <FaEye /> Promotion Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Promotion ID
                  </label>
                  <p className="text-brown-900 font-mono bg-beige-50 px-3 py-2 rounded">
                    #{selectedPromotion.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Status
                  </label>
                  <div className="bg-beige-50 px-3 py-2 rounded">
                    {getPromotionStatus(selectedPromotion) === "active" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {getPromotionStatus(selectedPromotion) === "scheduled" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    )}
                    {getPromotionStatus(selectedPromotion) === "expired" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Expired
                      </span>
                    )}
                    {getPromotionStatus(selectedPromotion) === "inactive" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Promotion Content
                </label>
                <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded font-medium">
                  {selectedPromotion.content}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Discount Percentage
                </label>
                <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                  <span className="text-2xl font-bold text-red-600">
                    -{selectedPromotion.percentage}%
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Start Date
                  </label>
                  <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                    {formatDate(selectedPromotion.startDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    End Date
                  </label>
                  <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                    {formatDate(selectedPromotion.endDate)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Active Status
                </label>
                <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                  {selectedPromotion.active ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPromotion(null);
                }}
                className="px-6 py-2 border border-brown-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedPromotion);
                }}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
