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
    name: "",
    description: "",
    discountPercentage: 0,
    startDate: "",
    endDate: "",
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
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      alert("Discount percentage must be between 1-100%");
      return;
    }

    try {
      await promotionApi.create({
        name: formData.name,
        description: formData.description,
        discountPercentage: formData.discountPercentage,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      await fetchPromotions();
      setShowCreateModal(false);
      setFormData({ name: "", description: "", discountPercentage: 0, startDate: "", endDate: "" });
      alert("Promotion created successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Unable to create promotion");
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return;
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      alert("Discount percentage must be between 1-100%");
      return;
    }

    try {
      await promotionApi.update(selectedPromotion.id, {
        name: formData.name,
        description: formData.description,
        discountPercentage: formData.discountPercentage,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      await fetchPromotions();
      setShowEditModal(false);
      setSelectedPromotion(null);
      setFormData({ name: "", description: "", discountPercentage: 0, startDate: "", endDate: "" });
      alert("Promotion updated successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Unable to update promotion");
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", description: "", discountPercentage: 10, startDate: "", endDate: "" });
    setShowCreateModal(true);
  };

  const openEditModal = (promotion: PromotionResponse) => {
    setSelectedPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description || "",
      discountPercentage: promotion.discountPercentage,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
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
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          p.discountPercentage.toString().includes(term) ||
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
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "percent":
          aVal = a.discountPercentage;
          bVal = b.discountPercentage;
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
                      {promotion.name}
                    </div>
                    {promotion.description && (
                      <div className="text-sm text-brown-600 mt-1">
                        {promotion.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-red-600">
                      -{promotion.discountPercentage}%
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
                        Đang hoạt động
                      </span>
                    )}
                    {status === "scheduled" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Sắp diễn ra
                      </span>
                    )}
                    {status === "expired" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Đã hết hạn
                      </span>
                    )}
                    {status === "inactive" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Đã tắt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(promotion)}
                        className="text-blue-600 hover:text-blue-900 p-2"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(promotion)}
                        className="text-brown-600 hover:text-brown-900 p-2"
                        title="Chỉnh sửa"
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
                        title={promotion.active ? "Tắt khuyến mãi" : "Bật khuyến mãi"}
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
              ? "Không tìm thấy khuyến mãi nào phù hợp."
              : "Chưa có khuyến mãi nào. Nhấn 'Tạo khuyến mãi mới' để thêm."}
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-brown-900 flex items-center gap-2">
                <FaPlus /> Tạo khuyến mãi mới
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Tên khuyến mãi * <span className="text-red-600">(Bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="VD: Giảm giá mùa hè"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  rows={3}
                  placeholder="Mô tả chi tiết về khuyến mãi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Phần trăm giảm giá (%) * <span className="text-red-600">(1-100%)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Ngày bắt đầu * <span className="text-red-600">(Bắt buộc)</span>
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
                    Ngày kết thúc * <span className="text-red-600">(Bắt buộc)</span>
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
                  setFormData({ name: "", description: "", discountPercentage: 0, startDate: "", endDate: "" });
                }}
                className="px-6 py-2 border border-brown-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePromotion}
                disabled={!formData.name.trim() || !formData.startDate || !formData.endDate || formData.discountPercentage <= 0}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaPlus /> Tạo khuyến mãi
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
                <FaEdit /> Chỉnh sửa khuyến mãi
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  ID Khuyến mãi
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
                  Tên khuyến mãi * <span className="text-red-600">(Bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="VD: Giảm giá mùa hè"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  rows={3}
                  placeholder="Mô tả chi tiết về khuyến mãi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Phần trăm giảm giá (%) * <span className="text-red-600">(1-100%)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Ngày bắt đầu * <span className="text-red-600">(Bắt buộc)</span>
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
                    Ngày kết thúc * <span className="text-red-600">(Bắt buộc)</span>
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
                  setShowEditModal(false);
                  setSelectedPromotion(null);
                  setFormData({ name: "", description: "", discountPercentage: 0, startDate: "", endDate: "" });
                }}
                className="px-6 py-2 border border-brown-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleEditPromotion}
                disabled={!formData.name.trim() || !formData.startDate || !formData.endDate || formData.discountPercentage <= 0}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaEdit /> Lưu thay đổi
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
                <FaEye /> Chi tiết khuyến mãi
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    ID Khuyến mãi
                  </label>
                  <p className="text-brown-900 font-mono bg-beige-50 px-3 py-2 rounded">
                    #{selectedPromotion.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="bg-beige-50 px-3 py-2 rounded">
                    {getPromotionStatus(selectedPromotion) === "active" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Đang hoạt động
                      </span>
                    )}
                    {getPromotionStatus(selectedPromotion) === "scheduled" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Sắp diễn ra
                      </span>
                    )}
                    {getPromotionStatus(selectedPromotion) === "expired" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Đã hết hạn
                      </span>
                    )}
                    {getPromotionStatus(selectedPromotion) === "inactive" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Đã tắt
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Tên khuyến mãi
                </label>
                <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded font-medium">
                  {selectedPromotion.name}
                </p>
              </div>
              {selectedPromotion.description && (
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Mô tả
                  </label>
                  <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded whitespace-pre-wrap">
                    {selectedPromotion.description}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Phần trăm giảm giá
                </label>
                <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                  <span className="text-2xl font-bold text-red-600">
                    -{selectedPromotion.discountPercentage}%
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                    {formatDate(selectedPromotion.startDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                    {formatDate(selectedPromotion.endDate)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Trạng thái hoạt động
                </label>
                <p className="text-brown-900 bg-beige-50 px-3 py-2 rounded">
                  {selectedPromotion.active ? "✓ Đang bật" : "✗ Đã tắt"}
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
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedPromotion);
                }}
                className="px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 font-medium flex items-center gap-2"
              >
                <FaEdit /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
