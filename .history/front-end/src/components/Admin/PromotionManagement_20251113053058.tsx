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
      setError("Không thể tải danh sách khuyến mãi. Vui lòng thử lại.");
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
          "Không thể cập nhật trạng thái. Vui lòng thử lại."
      );
    }
  };

  const handleCreatePromotion = async () => {
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      alert("Phần trăm giảm giá phải từ 1-100%");
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
      alert("Tạo khuyến mãi thành công!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Không thể tạo khuyến mãi");
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return;
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      alert("Phần trăm giảm giá phải từ 1-100%");
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
      alert("Cập nhật khuyến mãi thành công!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Không thể cập nhật khuyến mãi");
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
          Quản lý khuyến mãi
        </h2>
        <button
          onClick={openCreateModal}
          className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Tạo khuyến mãi mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-beige-50 p-4 rounded-lg space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, tên, mô tả, % giảm giá, ngày..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-brown-700 font-medium">Lọc theo trạng thái:</span>
          {[
            { value: "all", label: "Tất cả" },
            { value: "active", label: "Đang hoạt động" },
            { value: "scheduled", label: "Sắp diễn ra" },
            { value: "expired", label: "Đã hết hạn" },
            { value: "inactive", label: "Đã tắt" },
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
        Hiển thị {filteredPromotions.length} / {promotions.length} khuyến mãi
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
                Tên khuyến mãi {getSortIcon("name")}
              </th>
              <th 
                onClick={() => handleSort("percent")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                Giảm giá {getSortIcon("percent")}
              </th>
              <th 
                onClick={() => handleSort("startDate")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                Ngày bắt đầu {getSortIcon("startDate")}
              </th>
              <th 
                onClick={() => handleSort("endDate")}
                className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider cursor-pointer hover:bg-beige-200"
              >
                Ngày kết thúc {getSortIcon("endDate")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Hành động
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => {
                        /* TODO: View details */
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => {
                        /* TODO: Open edit modal */
                      }}
                      className="text-brown-600 hover:text-brown-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() =>
                        handleToggleActive(promotion.id, promotion.active)
                      }
                      className={`${
                        promotion.active
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {promotion.active ? "Tắt" : "Bật"}
                    </button>
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
              : "Không có khuyến mãi nào."}
          </div>
        )}
      </div>
    </div>
  );
}
