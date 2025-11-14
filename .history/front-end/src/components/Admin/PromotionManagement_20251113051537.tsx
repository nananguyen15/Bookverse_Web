import { useState, useEffect, useCallback, useMemo } from "react";
import { promotionApi } from "../../api/endpoints";
import type { PromotionResponse } from "../../types/api/promotion.types";
import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const isPromotionActive = (promotion: PromotionResponse) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return promotion.active && now >= start && now <= end;
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
          onClick={() => {
            /* TODO: Open create modal */
          }}
          className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700 transition-colors"
        >
          + Tạo khuyến mãi mới
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 bg-beige-50 p-4 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-brown-600"
          />
          <span className="text-brown-700">Hiển thị khuyến mãi đã tắt</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-beige-200">
          <thead className="bg-beige-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Tên khuyến mãi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Giảm giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                Thời gian
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
            {promotions.map((promotion) => {
              const isActive = isPromotionActive(promotion);
              return (
                <tr key={promotion.id} className="hover:bg-beige-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-800">
                    {promotion.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brown-800">
                      {promotion.name}
                    </div>
                    {promotion.description && (
                      <div className="text-sm text-brown-600">
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
                    <div>{formatDate(promotion.startDate)}</div>
                    <div className="text-brown-500">
                      đến {formatDate(promotion.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isActive ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Đang hoạt động
                      </span>
                    ) : promotion.active ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Chưa bắt đầu/Đã hết hạn
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Đã tắt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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

        {promotions.length === 0 && (
          <div className="text-center py-12 text-brown-600">
            Không có khuyến mãi nào.
          </div>
        )}
      </div>
    </div>
  );
}
