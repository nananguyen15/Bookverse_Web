import { useState, useEffect } from "react";
import { publishersApi } from "../../api";
import type { Publisher } from "../../types";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUndo,
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import {
  Modal,
  ModalActions,
  PublisherForm,
  type PublisherFormData,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";

export function PublisherManagement() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);

  // Form state
  const [formData, setFormData] = useState<PublisherFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    image: "",
  });

  // Load publishers
  useEffect(() => {
    loadPublishers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadPublishers = async () => {
    try {
      setLoading(true);
      let data: Publisher[];

      if (statusFilter === "active") {
        data = await publishersApi.getActive();
      } else if (statusFilter === "inactive") {
        data = await publishersApi.getInactive();
      } else {
        data = await publishersApi.getAll();
      }

      setPublishers(data);
    } catch (error) {
      console.error("Error loading publishers:", error);
      alert("Không thể tải danh sách nhà xuất bản");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredPublishers = publishers
    .filter((publisher) => {
      const matchSearch =
        publisher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publisher.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publisher.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      const aVal = a.name;
      const bVal = b.name;

      if (sortOrder === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage);
  const paginatedPublishers = filteredPublishers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleCreate = async () => {
    try {
      await publishersApi.create(formData);
      alert("Tạo nhà xuất bản thành công!");
      setShowCreateModal(false);
      resetForm();
      loadPublishers();
    } catch (error) {
      console.error("Error creating publisher:", error);
      alert("Không thể tạo nhà xuất bản");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPublisher) return;

    try {
      await publishersApi.update(selectedPublisher.id, formData);
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      resetForm();
      loadPublishers();
    } catch (error) {
      console.error("Error updating publisher:", error);
      alert("Không thể cập nhật nhà xuất bản");
    }
  };

  const handleToggleStatus = async (publisher: Publisher) => {
    try {
      if (publisher.active) {
        await publishersApi.deactivate(publisher.id);
        alert("Đã ẩn nhà xuất bản!");
      } else {
        await publishersApi.activate(publisher.id);
        alert("Đã kích hoạt lại nhà xuất bản!");
      }
      loadPublishers();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      image: "",
    });
    setSelectedPublisher(null);
  };

  const openEditModal = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setFormData({
      name: publisher.name,
      address: publisher.address || "",
      phone: publisher.phone || "",
      email: publisher.email || "",
      image: publisher.image || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-beige-900">Quản Lý Nhà Xuất Bản</h1>
          <p className="mt-1 text-sm text-beige-600">
            Tổng số: {filteredPublishers.length} nhà xuất bản
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Thêm Nhà Xuất Bản
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white rounded-lg shadow md:grid-cols-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, địa chỉ, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            title="Tìm kiếm nhà xuất bản"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã ẩn</option>
        </select>
      </div>

      {/* Sort Order Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 text-sm transition-colors border rounded-lg border-beige-300 hover:bg-beige-50"
        >
          {sortOrder === "asc" ? "Tăng dần ↑" : "Giảm dần ↓"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-beige-100">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Tên nhà xuất bản
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Địa chỉ
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPublishers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy nhà xuất bản nào
                </td>
              </tr>
            ) : (
              paginatedPublishers.map((publisher) => (
                <tr
                  key={publisher.id}
                  className="transition-colors hover:bg-beige-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{publisher.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{publisher.address || "—"}</div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {publisher.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        <FaCheck className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                        <FaTimes className="w-3 h-3" /> Đã ẩn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openViewModal(publisher)}
                        className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {/* removed books button - publisher API has no getBooksByPublisherId */}
                      <button
                        onClick={() => openEditModal(publisher)}
                        className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(publisher)}
                        className={`p-2 rounded transition-colors ${
                          publisher.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={publisher.active ? "Ẩn" : "Kích hoạt"}
                      >
                        {publisher.active ? <FaTrash /> : <FaUndo />}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredPublishers.length)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{filteredPublishers.length}</span> kết
                quả
              </p>
            </div>
            <div>
              <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                >
                  ‹
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                        currentPage === pageNum
                          ? "z-10 bg-beige-600 border-beige-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Thêm Nhà Xuất Bản Mới
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên nhà xuất bản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="NXB Kim Đồng"
                  title="Tên nhà xuất bản"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Số nhà, đường, quận, thành phố"
                  title="Địa chỉ"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0123 456 789"
                    title="Số điện thoại"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="contact@example.com"
                    title="Email"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  Tạo Nhà Xuất Bản
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPublisher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chỉnh Sửa Nhà Xuất Bản
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên nhà xuất bản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="NXB Kim Đồng"
                  title="Tên nhà xuất bản"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Số nhà, đường, quận, thành phố"
                  title="Địa chỉ"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0123 456 789"
                    title="Số điện thoại"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="contact@example.com"
                    title="Email"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  Cập Nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPublisher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chi Tiết Nhà Xuất Bản
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tên nhà xuất bản</p>
                <p className="text-xl font-bold">{selectedPublisher.name}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-medium">{selectedPublisher.address || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-medium">{selectedPublisher.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedPublisher.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-medium">
                    {selectedPublisher.active ? (
                      <span className="text-green-600">Đang hoạt động</span>
                    ) : (
                      <span className="text-gray-600">Đã ẩn</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPublisher(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* books modal removed - publishersApi has no books endpoint */}
    </div>
  );
}
