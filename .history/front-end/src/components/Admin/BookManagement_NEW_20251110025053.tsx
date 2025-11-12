import { useState, useEffect } from "react";
import { booksApi, authorsApi, publishersApi, categoriesApi } from "../../api";
import type { Book, Author, Publisher, SubCategory } from "../../types";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUndo,
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "title" | "price" | "publishedDate";

export function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    authorId: 0,
    publisherId: 0,
    categoryId: 0,
    stockQuantity: 0,
    publishedDate: "",
    image: "",
  });

  // Load all data
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load books based on status filter
      let booksData: Book[];
      if (statusFilter === "active") {
        booksData = await booksApi.getActive();
      } else if (statusFilter === "inactive") {
        booksData = await booksApi.getInactive();
      } else {
        booksData = await booksApi.getAll();
      }

      // Load supporting data
      const [authorsData, publishersData, categoriesData] = await Promise.all([
        authorsApi.getActive(),
        publishersApi.getActive(),
        categoriesApi.sub.getActive(),
      ]);

      setBooks(booksData);
      setAuthors(authorsData);
      setPublishers(publishersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredBooks = books
    .filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisherName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory =
        categoryFilter === "all" || book.categoryId === categoryFilter;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "title":
          aVal = a.title;
          bVal = b.title;
          break;
        case "price":
          aVal = a.price;
          bVal = b.price;
          break;
        case "publishedDate":
          aVal = new Date(a.publishedDate).getTime();
          bVal = new Date(b.publishedDate).getTime();
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleCreate = async () => {
    try {
      await booksApi.create(formData);
      alert("Tạo sách thành công!");
      setShowCreateModal(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Error creating book:", error);
      alert("Không thể tạo sách");
    }
  };

  const handleUpdate = async () => {
    if (!selectedBook) return;

    try {
      await booksApi.update(selectedBook.id, formData);
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Không thể cập nhật sách");
    }
  };

  const handleToggleStatus = async (book: Book) => {
    try {
      if (book.active) {
        await booksApi.deactivate(book.id);
        alert("Đã ẩn sách!");
      } else {
        await booksApi.activate(book.id);
        alert("Đã kích hoạt lại sách!");
      }
      loadAllData();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      authorId: 0,
      publisherId: 0,
      categoryId: 0,
      stockQuantity: 0,
      publishedDate: "",
      image: "",
    });
    setSelectedBook(null);
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      description: book.description,
      price: book.price,
      authorId: book.authorId,
      publisherId: book.publisherId,
      categoryId: book.categoryId,
      stockQuantity: book.stockQuantity,
      publishedDate: book.publishedDate,
      image: book.image,
    });
    setShowEditModal(true);
  };

  const openViewModal = (book: Book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
          <h1 className="text-3xl font-bold text-beige-900">Quản Lý Sách</h1>
          <p className="mt-1 text-sm text-beige-600">
            Tổng số: {filteredBooks.length} sách
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Thêm Sách
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white rounded-lg shadow md:grid-cols-5">
        {/* Search */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sách, tác giả, NXB..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
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
          <option value="active">Đang bán</option>
          <option value="inactive">Đã ẩn</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(
              e.target.value === "all" ? "all" : Number(e.target.value)
            );
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Lọc theo danh mục"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Sort Field */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Sắp xếp theo trường"
        >
          <option value="title">Sắp xếp theo tên</option>
          <option value="price">Sắp xếp theo giá</option>
          <option value="publishedDate">Sắp xếp theo ngày xuất bản</option>
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
                Ảnh
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Tên sách
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Tác giả
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                Giá
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                Tồn kho
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
            {paginatedBooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy sách nào
                </td>
              </tr>
            ) : (
              paginatedBooks.map((book) => (
                <tr key={book.id} className="transition-colors hover:bg-beige-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="object-cover w-16 h-20 rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/img/book/default-book.jpg";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">
                      {book.categoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{book.authorName}</div>
                    <div className="text-sm text-gray-500">
                      {book.publisherName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {formatPrice(book.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {book.stockQuantity === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                        <FaExclamationTriangle className="w-3 h-3" /> Hết hàng
                      </span>
                    ) : book.stockQuantity < 10 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                        <FaExclamationTriangle className="w-3 h-3" />{" "}
                        {book.stockQuantity}
                      </span>
                    ) : (
                      <span className="text-gray-900">{book.stockQuantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {book.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        <FaCheck className="w-3 h-3" /> Đang bán
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
                        onClick={() => openViewModal(book)}
                        className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(book)}
                        className={`p-2 rounded transition-colors ${
                          book.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={book.active ? "Ẩn sách" : "Kích hoạt"}
                      >
                        {book.active ? <FaTrash /> : <FaUndo />}
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
                  {Math.min(currentPage * itemsPerPage, filteredBooks.length)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{filteredBooks.length}</span> kết quả
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Thêm Sách Mới
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
                  Tên sách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Nhập tên sách"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Nhập mô tả sách"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tác giả <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.authorId}
                    onChange={(e) =>
                      setFormData({ ...formData, authorId: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    aria-label="Chọn tác giả"
                  >
                    <option value={0}>Chọn tác giả</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Nhà xuất bản <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.publisherId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publisherId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    aria-label="Chọn nhà xuất bản"
                  >
                    <option value={0}>Chọn NXB</option>
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id}>
                        {pub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    aria-label="Chọn danh mục"
                  >
                    <option value={0}>Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0"
                    title="Giá sách"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0"
                    title="Số lượng tồn kho"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Ngày xuất bản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.publishedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publishedDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    URL ảnh bìa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  Tạo Sách
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

      {/* Edit Modal - Similar to Create but with pre-filled data */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chỉnh Sửa Sách
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
                  Tên sách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tác giả
                  </label>
                  <select
                    value={formData.authorId}
                    onChange={(e) =>
                      setFormData({ ...formData, authorId: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    aria-label="Chọn tác giả"
                  >
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Nhà xuất bản
                  </label>
                  <select
                    value={formData.publisherId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publisherId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    aria-label="Chọn nhà xuất bản"
                  >
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id}>
                        {pub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Danh mục
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    aria-label="Chọn danh mục"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Giá
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0"
                    title="Giá sách"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="0"
                    title="Số lượng tồn kho"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Ngày xuất bản
                  </label>
                  <input
                    type="date"
                    value={formData.publishedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publishedDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    title="Ngày xuất bản"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    URL ảnh bìa
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    placeholder="https://..."
                    title="URL ảnh bìa sách"
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
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chi Tiết Sách
            </h2>
            <div className="space-y-4">
              <div className="flex gap-6">
                <img
                  src={selectedBook.image}
                  alt={selectedBook.title}
                  className="object-cover w-48 h-64 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/img/book/default-book.jpg";
                  }}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Tên sách</p>
                    <p className="text-xl font-bold">{selectedBook.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tác giả</p>
                      <p className="font-medium">{selectedBook.authorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nhà xuất bản</p>
                      <p className="font-medium">{selectedBook.publisherName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Danh mục</p>
                      <p className="font-medium">{selectedBook.categoryName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày xuất bản</p>
                      <p className="font-medium">
                        {formatDate(selectedBook.publishedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Giá</p>
                      <p className="text-lg font-bold text-beige-700">
                        {formatPrice(selectedBook.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tồn kho</p>
                      <p className="font-medium">
                        {selectedBook.stockQuantity === 0 ? (
                          <span className="text-red-600">Hết hàng</span>
                        ) : (
                          `${selectedBook.stockQuantity} cuốn`
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <p className="font-medium">
                      {selectedBook.active ? (
                        <span className="text-green-600">Đang bán</span>
                      ) : (
                        <span className="text-gray-600">Đã ẩn</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mô tả</p>
                <p className="mt-1 text-gray-900">{selectedBook.description}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedBook(null);
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
