import { useState, useEffect } from "react";
import { authorsApi } from "../../api";
import type { Author, Book } from "../../types";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUndo,
  FaEye,
  FaCheck,
  FaTimes,
  FaBook,
} from "react-icons/fa";
import {
  Modal,
  ModalActions,
  AuthorForm,
  type AuthorFormData,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
export function AuthorManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
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
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);

  // Form state
  const [formData, setFormData] = useState<AuthorFormData>({
    name: "",
    biography: "",
    image: "",
  });

  // Load authors
  useEffect(() => {
    loadAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      let data: Author[];

      if (statusFilter === "active") {
        data = await authorsApi.getActive();
      } else if (statusFilter === "inactive") {
        data = await authorsApi.getInactive();
      } else {
        data = await authorsApi.getAll();
      }

      setAuthors(data);
    } catch (error) {
      console.error("Error loading authors:", error);
      alert("Không thể tải danh sách tác giả");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredAuthors = authors
    .filter((author) => {
      const matchSearch =
        author.name.toLowerCase().includes(searchTerm.toLowerCase());
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
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const paginatedAuthors = filteredAuthors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleCreate = async () => {
    try {
      // Trim and validate name
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên tác giả không được để trống!");
        return;
      }
      
      // Prepare clean data
      const createData: any = {
        name: trimmedName,
      };
      
      if (formData.biography && formData.biography.trim()) {
        createData.biography = formData.biography.trim();
      }
      
      if (formData.image && formData.image.trim()) {
        createData.image = formData.image.trim();
      }
      
      await authorsApi.create(createData);
      alert("Tạo tác giả thành công!");
      setShowCreateModal(false);
      resetForm();
      loadAuthors();
    } catch (error: any) {
      console.error("Error creating author:", error);
      console.error("Error response:", error.response?.data);
      alert(`Không thể tạo tác giả: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAuthor) return;

    try {
      console.log("📝 Updating author:", selectedAuthor.id);
      console.log("📋 Form data (raw):", formData);
      
      // Trim and validate name
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên tác giả không được để trống!");
        return;
      }
      
      // Send all fields (backend might require all fields)
      const updateData = {
        name: trimmedName,
        biography: formData.biography ? formData.biography.trim() : null,
        image: formData.image ? formData.image.trim() : null,
      };
      
      console.log("🔄 Sending update data:", JSON.stringify(updateData, null, 2));
      
      const result = await authorsApi.update(selectedAuthor.id, updateData);
      console.log("✅ Update success:", result);
      
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      resetForm();
      await loadAuthors();
    } catch (error: any) {
      console.error("❌ Error updating author:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Request data was:", {
        name: formData.name.trim(),
        biography: formData.biography || null,
        image: formData.image || null,
      });
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`Không thể cập nhật tác giả: ${errorMsg}`);
    }
  };

  const handleToggleStatus = async (author: Author) => {
    try {
      if (author.active) {
        await authorsApi.deactivate(author.id);
        alert("Đã ẩn tác giả!");
      } else {
        await authorsApi.activate(author.id);
        alert("Đã kích hoạt lại tác giả!");
      }
      loadAuthors();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const handleViewBooks = async (author: Author) => {
    try {
      setSelectedAuthor(author);
      const books = await authorsApi.getBooksByAuthorId(author.id);
      setAuthorBooks(books);
      setShowBooksModal(true);
    } catch (error) {
      console.error("Error loading books:", error);
      alert("Không thể tải danh sách sách của tác giả");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      biography: "",
      image: "",
    });
    setSelectedAuthor(null);
  };

  const openEditModal = (author: Author) => {
    setSelectedAuthor(author);
    setFormData({
      name: author.name,
      biography: author.biography || "",
      image: author.image || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (author: Author) => {
    setSelectedAuthor(author);
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
          <h1 className="text-3xl font-bold text-beige-900">Quản Lý Tác Giả</h1>
          <p className="mt-1 text-sm text-beige-600">
            Tổng số: {filteredAuthors.length} tác giả
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Thêm Tác Giả
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white rounded-lg shadow md:grid-cols-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên tác giả..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            title="Tìm kiếm tác giả"
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
                Image
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Author Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Description
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
            {paginatedAuthors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No authors found
                </td>
              </tr>
            ) : (
              paginatedAuthors.map((author) => (
                <tr
                  key={author.id}
                  className="transition-colors hover:bg-beige-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={transformImageUrl(author.image) || FALLBACK_IMAGES.author}
                      alt={author.name}
                      className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.author;
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{author.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate" title={author.biography || "No description"}>
                      {author.biography || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {author.active ? (
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
                        onClick={() => openViewModal(author)}
                        className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleViewBooks(author)}
                        className="p-2 text-purple-600 transition-colors rounded hover:bg-purple-50"
                        title="Xem sách"
                      >
                        <FaBook />
                      </button>
                      <button
                        onClick={() => openEditModal(author)}
                        className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(author)}
                        className={`p-2 rounded transition-colors ${
                          author.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={author.active ? "Ẩn" : "Kích hoạt"}
                      >
                        {author.active ? <FaTrash /> : <FaUndo />}
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
                  {Math.min(currentPage * itemsPerPage, filteredAuthors.length)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{filteredAuthors.length}</span> kết
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
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Author"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <AuthorForm formData={formData} onUpdate={setFormData} isEdit={false} />
          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Author"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedAuthor}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Author"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <AuthorForm formData={formData} onUpdate={setFormData} isEdit={true} />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Author"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal && !!selectedAuthor}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAuthor(null);
        }}
        title="Author Details"
        maxWidth="2xl"
      >
        {selectedAuthor && (
          <ViewDetailsContainer>
            {selectedAuthor.image && (
              <div className="flex justify-center mb-4">
                <img
                  src={transformImageUrl(selectedAuthor.image) || FALLBACK_IMAGES.author}
                  alt={selectedAuthor.name}
                  className="object-cover w-32 h-32 border-2 border-gray-300 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.author;
                  }}
                />
              </div>
            )}
            <ViewDetailsGrid columns={1}>
              <ViewDetailsRow
                label="Name"
                value={<span className="text-xl font-bold">{selectedAuthor.name}</span>}
              />
              <ViewDetailsRow
                label="Status"
                value={
                  selectedAuthor.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Hidden</span>
                  )
                }
              />
              {selectedAuthor.biography && (
                <ViewDetailsRow label="Biography" value={selectedAuthor.biography} />
              )}
            </ViewDetailsGrid>
          </ViewDetailsContainer>
        )}
      </Modal>

      {/* Books Modal */}
      {showBooksModal && selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Sách của {selectedAuthor.name}
            </h2>
            {authorBooks.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                Chưa có sách nào của tác giả này
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {authorBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 transition-shadow border rounded-lg hover:shadow-md"
                  >
                    <img
                      src={transformImageUrl(book.image) || FALLBACK_IMAGES.book}
                      alt={book.title}
                      className="object-cover w-full h-48 mb-2 rounded"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.book;
                      }}
                    />
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(book.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowBooksModal(false);
                  setSelectedAuthor(null);
                  setAuthorBooks([]);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
