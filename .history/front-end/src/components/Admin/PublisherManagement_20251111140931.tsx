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
      // Trim and validate required fields
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên nhà xuất bản không được để trống!");
        return;
      }

      // Prepare clean data with active field
      const createData: any = {
        name: trimmedName,
        active: true, // Default active for new publisher
      };

      if (formData.address && formData.address.trim()) {
        createData.address = formData.address.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        createData.phone = formData.phone.trim();
      }
      if (formData.email && formData.email.trim()) {
        createData.email = formData.email.trim();
      }

      await publishersApi.create(createData);
      alert("Tạo nhà xuất bản thành công!");
      setShowCreateModal(false);
      resetForm();
      loadPublishers();
    } catch (error: any) {
      console.error("Error creating publisher:", error);
      console.error("Error response:", error.response?.data);
      alert(`Không thể tạo nhà xuất bản: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPublisher) return;

    try {
      // Trim and validate required fields
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên nhà xuất bản không được để trống!");
        return;
      }

      // Prepare clean data (without image, but MUST include active)
      const updateData: any = {
        name: trimmedName,
        active: selectedPublisher.active, // Keep current active status
      };

      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }

      await publishersApi.update(selectedPublisher.id, updateData);
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      resetForm();
      loadPublishers();
    } catch (error: any) {
      console.error("Error updating publisher:", error);
      console.error("Error response:", error.response?.data);
      alert(`Không thể cập nhật nhà xuất bản: ${error.response?.data?.message || error.message}`);
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
                Publisher Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Address
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPublishers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No publishers found
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
                        className={`p-2 rounded transition-colors ${publisher.active
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
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${currentPage === pageNum
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
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Publisher"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <PublisherForm formData={formData} onUpdate={setFormData} isEdit={false} />
          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Publisher"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedPublisher}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Publisher"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <PublisherForm formData={formData} onUpdate={setFormData} isEdit={true} />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Publisher"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal && !!selectedPublisher}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPublisher(null);
        }}
        title="Publisher Details"
        maxWidth="2xl"
      >
        {selectedPublisher && (
          <ViewDetailsContainer>
            <ViewDetailsGrid columns={1}>
              <ViewDetailsRow
                label="Name"
                value={<span className="text-xl font-bold">{selectedPublisher.name}</span>}
              />
              <ViewDetailsRow label="Address" value={selectedPublisher.address || "—"} />
              <ViewDetailsRow label="Phone" value={selectedPublisher.phone || "—"} />
              <ViewDetailsRow label="Email" value={selectedPublisher.email || "—"} />
              <ViewDetailsRow
                label="Status"
                value={
                  selectedPublisher.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Hidden</span>
                  )
                }
              />
            </ViewDetailsGrid>
          </ViewDetailsContainer>
        )}
      </Modal>
    </div>
  );
}
