import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishedDate: string;
  categoryId: string;
  promotionId?: string;
  originalPrice: number;
  discountedPrice?: number;
  description: string;
  coverImage: string;
  stockQuantity: number;
  status: "In Stock" | "Out of Stock" | "Archived";
}

interface Category {
  id: string;
  name: string;
}

interface Promotion {
  id: string;
  name: string;
  discountValue: number;
}

export function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Book>>({});

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"id" | "price" | "date">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpToPage, setJumpToPage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [books, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  const loadData = () => {
    // Load books from localStorage
    const savedBooks = JSON.parse(localStorage.getItem("adminBooks") || "[]");
    setBooks(savedBooks);

    // Load categories
    const savedCategories = JSON.parse(
      localStorage.getItem("adminCategories") || "[]"
    );
    setCategories(savedCategories);

    // Load promotions
    const savedPromotions = JSON.parse(
      localStorage.getItem("adminPromotions") || "[]"
    );
    setPromotions(savedPromotions);
  };

  const applyFilters = () => {
    let result = [...books];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.publisher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter((book) => book.categoryId === filterCategory);
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((book) => book.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "id":
          compareA = parseInt(a.id);
          compareB = parseInt(b.id);
          break;
        case "price":
          compareA = a.discountedPrice || a.originalPrice;
          compareB = b.discountedPrice || b.originalPrice;
          break;
        case "date":
          compareA = new Date(a.publishedDate).getTime();
          compareB = new Date(b.publishedDate).getTime();
          break;
        default:
          compareA = a.id;
          compareB = b.id;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    setFilteredBooks(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddBook = () => {
    const newBook: Book = {
      id: String(Date.now()),
      title: formData.title || "",
      author: formData.author || "",
      publisher: formData.publisher || "",
      publishedDate:
        formData.publishedDate || new Date().toISOString().split("T")[0],
      categoryId: formData.categoryId || "",
      promotionId: formData.promotionId,
      originalPrice: formData.originalPrice || 0,
      discountedPrice: formData.discountedPrice,
      description: formData.description || "",
      coverImage: formData.coverImage || "",
      stockQuantity: formData.stockQuantity || 0,
      status:
        formData.stockQuantity && formData.stockQuantity > 0
          ? "In Stock"
          : "Out of Stock",
    };

    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    localStorage.setItem("adminBooks", JSON.stringify(updatedBooks));

    setShowAddModal(false);
    setFormData({});
  };

  const handleEditBook = () => {
    if (!selectedBook) return;

    const updatedBooks = books.map((book) =>
      book.id === selectedBook.id
        ? {
            ...book,
            ...formData,
            status:
              formData.stockQuantity !== undefined
                ? formData.stockQuantity > 0
                  ? "In Stock"
                  : "Out of Stock"
                : book.status,
          }
        : book
    );

    setBooks(updatedBooks);
    localStorage.setItem("adminBooks", JSON.stringify(updatedBooks));

    setShowEditModal(false);
    setSelectedBook(null);
    setFormData({});
  };

  const handleDeleteBook = () => {
    if (!selectedBook) return;

    const updatedBooks = books.filter((book) => book.id !== selectedBook.id);
    setBooks(updatedBooks);
    localStorage.setItem("adminBooks", JSON.stringify(updatedBooks));

    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData(book);
    setShowEditModal(true);
  };

  const openDeleteModal = (book: Book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpToPage("");
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "N/A";
  };

  const getPromotionName = (promotionId?: string) => {
    if (!promotionId) return "None";
    return promotions.find((p) => p.id === promotionId)?.name || "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-beige-900">Manage Books</h2>
          <p className="text-beige-600 mt-1">Manage and monitor all books</p>
        </div>
        <button
          onClick={() => {
            setFormData({});
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors shadow-sm"
        >
          <FaPlus />
          <span className="font-medium">Add Book</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search by name, author, publisher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "id" | "price" | "date")
              }
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
            >
              <option value="id">ID</option>
              <option value="price">Price</option>
              <option value="date">Published Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
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
                  Cover
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-beige-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {currentBooks.length > 0 ? (
                currentBooks.map((book, index) => (
                  <tr
                    key={book.id}
                    className="hover:bg-beige-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-beige-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-beige-900">
                      {book.id}
                    </td>
                    <td className="px-4 py-4">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded border border-beige-200"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-beige-200 rounded flex items-center justify-center text-beige-500 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-beige-900 max-w-xs truncate">
                        {book.title}
                      </div>
                      <div className="text-xs text-beige-500 mt-1">
                        {book.publisher}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-beige-700">
                      {book.author}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-beige-100 text-beige-700">
                        {getCategoryName(book.categoryId)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-beige-900">
                        ${book.discountedPrice || book.originalPrice}
                      </div>
                      {book.discountedPrice && (
                        <div className="text-xs text-beige-500 line-through">
                          ${book.originalPrice}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-beige-700">
                      {book.stockQuantity}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          book.status === "In Stock"
                            ? "bg-green-100 text-green-700"
                            : book.status === "Out of Stock"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(book)}
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
                    colSpan={10}
                    className="px-4 py-12 text-center text-beige-500"
                  >
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBooks.length > 0 && (
          <div className="px-6 py-4 border-t border-beige-200 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-beige-600">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-beige-300 rounded-lg text-sm focus:ring-2 focus:ring-beige-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-beige-600">entries</span>
              </div>
              <div className="text-sm text-beige-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredBooks.length)} of{" "}
                {filteredBooks.length} entries
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-beige-300 rounded-lg text-sm font-medium text-beige-700 hover:bg-beige-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-beige-700 text-white"
                          : "border border-beige-300 text-beige-700 hover:bg-beige-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-beige-300 rounded-lg text-sm font-medium text-beige-700 hover:bg-beige-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

              {/* Jump to Page */}
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-beige-600">Go to:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                  className="w-16 px-2 py-1 border border-beige-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-beige-500"
                  placeholder={String(currentPage)}
                />
                <button
                  onClick={handleJumpToPage}
                  className="px-3 py-1 bg-beige-700 text-white rounded-lg text-sm font-medium hover:bg-beige-800"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-beige-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-beige-900">
                {showAddModal ? "Add New Book" : "Edit Book"}
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
              {/* ID Display (Edit only) */}
              {showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Book ID (Cannot be edited)
                  </label>
                  <input
                    type="text"
                    value={formData.id || ""}
                    disabled
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg bg-beige-50 text-beige-500 cursor-not-allowed"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  placeholder="Enter book title"
                />
              </div>

              {/* Author & Publisher */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.author || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Publisher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.publisher || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, publisher: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                    placeholder="Publisher name"
                  />
                </div>
              </div>

              {/* Published Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Published Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.publishedDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publishedDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Original Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountedPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountedPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Promotion */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Promotion (Optional)
                </label>
                <select
                  value={formData.promotionId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promotionId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                >
                  <option value="">No promotion</option>
                  {promotions.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name} (-{promo.discountValue}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  placeholder="Enter book description"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Cover Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                />
                {formData.coverImage && (
                  <div className="mt-4">
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-32 h-48 object-cover rounded border border-beige-200"
                    />
                  </div>
                )}
              </div>

              {/* Status (Edit only - Auto-calculated) */}
              {showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Status (Auto-calculated based on stock)
                  </label>
                  <select
                    value={formData.status || "In Stock"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "In Stock"
                          | "Out of Stock"
                          | "Archived",
                      })
                    }
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-beige-200 px-6 py-4 flex items-center justify-end gap-4">
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
                onClick={showAddModal ? handleAddBook : handleEditBook}
                className="px-6 py-2 bg-beige-700 text-white rounded-lg hover:bg-beige-800 transition-colors font-medium"
              >
                {showAddModal ? "Add Book" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-center text-beige-900">
                Delete Book
              </h3>
              <p className="mt-2 text-center text-beige-600">
                Are you sure you want to delete "{selectedBook.title}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-beige-50 flex items-center justify-end gap-4 rounded-b-lg">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBook(null);
                }}
                className="px-6 py-2 border border-beige-300 text-beige-700 rounded-lg hover:bg-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
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
