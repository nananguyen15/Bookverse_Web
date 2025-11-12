import { useState, useEffect } from "react";
import { booksApi, authorsApi, publishersApi, categoriesApi } from "../../api";
import type { Book, Author, Publisher, SubCategory } from "../../types";
import { FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
import {
  TableHeader,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  FilterBar,
  Pagination,
  Modal,
  ModalActions,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
  BookForm,
  type BookFormData,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "id" | "title" | "price" | "publishedDate" | "stock";

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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form state
  const [formData, setFormData] = useState<BookFormData>({
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

      // Load supporting data first
      const [authorsData, publishersData, categoriesData] = await Promise.all([
        authorsApi.getAll(),
        publishersApi.getAll(),
        categoriesApi.sub.getAll(),
      ]);

      // Load books based on status filter
      let booksData: Book[];
      if (statusFilter === "active") {
        booksData = await booksApi.getActive();
      } else if (statusFilter === "inactive") {
        booksData = await booksApi.getInactive();
      } else {
        booksData = await booksApi.getAll();
      }

      // Enrich books with author, publisher, and category names
      const enrichedBooks = booksData.map(book => ({
        ...book,
        authorName: authorsData.find(a => a.id === book.authorId)?.name || "N/A",
        publisherName: publishersData.find(p => p.id === book.publisherId)?.name || "N/A",
        categoryName: categoriesData.find(c => c.id === book.categoryId)?.name || "N/A",
      }));

      setBooks(enrichedBooks);
      setAuthors(authorsData);
      setPublishers(publishersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data");
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
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
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
        case "stock":
          aVal = a.stockQuantity;
          bVal = b.stockQuantity;
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
      // Validate published date
      if (formData.publishedDate) {
        const selectedDate = new Date(formData.publishedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if date is valid (e.g., not 31/02, 32/01, etc.)
        if (isNaN(selectedDate.getTime())) {
          alert("Invalid date! Please enter a valid date.");
          return;
        }

        // Check if date format matches input (catch invalid dates like 31/02)
        const [year, month, day] = formData.publishedDate.split('-').map(Number);
        if (selectedDate.getFullYear() !== year || 
            selectedDate.getMonth() + 1 !== month || 
            selectedDate.getDate() !== day) {
          alert("Invalid date! February only has 28-29 days, and some months have 30 days.");
          return;
        }

        // Cannot be in the future
        if (selectedDate > today) {
          alert("Published date cannot be in the future!");
          return;
        }
      }

      // Add active field (default true for new books)
      const createData = {
        ...formData,
        active: true,
      };

      await booksApi.create(createData);
      alert("Book created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Error creating book:", error);
      alert("Failed to create book");
    }
  };

  const handleUpdate = async () => {
    if (!selectedBook) return;

    try {
      // Validate published date
      if (formData.publishedDate) {
        const selectedDate = new Date(formData.publishedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if date is valid
        if (isNaN(selectedDate.getTime())) {
          alert("Invalid date! Please enter a valid date.");
          return;
        }

        // Check if date format matches input (catch invalid dates like 31/02)
        const [year, month, day] = formData.publishedDate.split('-').map(Number);
        if (selectedDate.getFullYear() !== year || 
            selectedDate.getMonth() + 1 !== month || 
            selectedDate.getDate() !== day) {
          alert("Invalid date! February only has 28-29 days, and some months have 30 days.");
          return;
        }

        // Cannot be in the future
        if (selectedDate > today) {
          alert("Published date cannot be in the future!");
          return;
        }
      }

      // Must include active field to prevent null constraint error
      const updateData = {
        ...formData,
        active: selectedBook.active, // Keep current active status
      };

      await booksApi.update(selectedBook.id, updateData);
      alert("Book updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Failed to update book");
    }
  };

  const handleToggleStatus = async (book: Book) => {
    try {
      if (book.active) {
        await booksApi.deactivate(book.id);
        alert("Book hidden successfully!");
      } else {
        await booksApi.activate(book.id);
        alert("Book activated successfully!");
      }
      loadAllData();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to change status");
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
          <h1 className="text-3xl font-bold text-beige-900">Book Management</h1>
          <p className="mt-1 text-sm text-beige-600">
            Total: {filteredBooks.length} books
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Add Book
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by title, author, publisher..."
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value as StatusFilter);
          setCurrentPage(1);
        }}
        statusOptions={[
          { value: "all", label: "All Statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Hidden" }
        ]}
        sortField={sortField}
        onSortFieldChange={(value) => setSortField(value as SortField)}
        sortOptions={[
          { value: "id", label: "ID" },
          { value: "title", label: "Title" },
          { value: "price", label: "Price" },
          { value: "publishedDate", label: "Published Date" },
          { value: "stock", label: "Stock" }
        ]}
        sortOrder={sortOrder}
        onSortOrderChange={(value) => setSortOrder(value as "asc" | "desc")}
        customFilters={
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(
                e.target.value === "all" ? "all" : Number(e.target.value)
              );
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-beige-100">
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Image</TableHeader>
              <TableHeader>Title</TableHeader>
              <TableHeader>Author</TableHeader>
              <TableHeader>Publisher</TableHeader>
              <TableHeader>Sub Category</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader align="center">Stock</TableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedBooks.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                  No books found
                </td>
              </tr>
            ) : (
              paginatedBooks.map((book) => (
                <tr key={book.id} className="transition-colors hover:bg-beige-50">
                  <TableCell>
                    <TableCellText>#{book.id}</TableCellText>
                  </TableCell>
                  <TableCell>
                    {book.image && book.image.trim() !== "" ? (
                      <img
                        src={transformImageUrl(book.image) || FALLBACK_IMAGES.book}
                        alt={book.title}
                        className="object-cover w-12 h-16 rounded"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGES.book;
                        }}
                      />
                    ) : (
                      <img
                        src="/img/book/b1.webp"
                        alt={book.title}
                        className="object-cover w-12 h-16 rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <TableCellText className="font-medium">{book.title}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText>{book.authorName || "N/A"}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText>{book.publisherName || "N/A"}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText variant="secondary">{book.categoryName || "N/A"}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText variant="secondary" className="max-w-xs truncate">
                      {book.description || "-"}
                    </TableCellText>
                  </TableCell>
                  <TableCell>
                    <TableCellText className="font-medium">{formatPrice(book.price)}</TableCellText>
                  </TableCell>
                  <TableCell align="center">
                    {book.stockQuantity === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                        <FaExclamationTriangle className="w-3 h-3" /> Out of stock
                      </span>
                    ) : book.stockQuantity < 10 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                        <FaExclamationTriangle className="w-3 h-3" /> {book.stockQuantity}
                      </span>
                    ) : (
                      <TableCellText>{book.stockQuantity}</TableCellText>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge
                      active={book.active}
                      activeText="Active"
                      inactiveText="Hidden"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtonGroup>
                      <ActionButton
                        icon="view"
                        onClick={() => openViewModal(book)}
                        title="View details"
                      />
                      <ActionButton
                        icon="edit"
                        onClick={() => openEditModal(book)}
                        title="Edit"
                      />
                      <ActionButton
                        icon={book.active ? "deactivate" : "activate"}
                        onClick={() => handleToggleStatus(book)}
                        variant={book.active ? "danger" : "success"}
                        title={book.active ? "Hide book" : "Activate"}
                      />
                    </ActionButtonGroup>
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination and Items Per Page */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            aria-label="Items per page"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredBooks.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Book"
        maxWidth="3xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <BookForm
            formData={formData}
            onUpdate={setFormData}
            isEdit={false}
            authors={authors}
            publishers={publishers}
            categories={categories}
          />
          <ModalActions
            onConfirm={() => handleCreate()}
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Book"
            cancelText="Cancel"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedBook}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Book"
        maxWidth="3xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <BookForm
            formData={formData}
            onUpdate={setFormData}
            isEdit={true}
            authors={authors}
            publishers={publishers}
            categories={categories}
          />
          <ModalActions
            onConfirm={() => handleUpdate()}
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Book"
            cancelText="Cancel"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal && !!selectedBook}
        onClose={() => {
          setShowViewModal(false);
          setSelectedBook(null);
        }}
        title="Book Details"
        maxWidth="3xl"
      >
        {selectedBook && (
          <ViewDetailsContainer>
            <div className="flex gap-6">
              <img
                src={transformImageUrl(selectedBook.image) || FALLBACK_IMAGES.book}
                alt={selectedBook.title}
                className="object-cover w-48 h-64 rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGES.book;
                }}
              />
              <div className="flex-1 space-y-3">
                <ViewDetailsRow label="Title" value={<span className="text-xl font-bold">{selectedBook.title}</span>} />
                <ViewDetailsGrid columns={2}>
                  <ViewDetailsRow label="Author" value={selectedBook.authorName} />
                  <ViewDetailsRow label="Publisher" value={selectedBook.publisherName} />
                </ViewDetailsGrid>
                <ViewDetailsGrid columns={2}>
                  <ViewDetailsRow label="Category" value={selectedBook.categoryName} />
                  <ViewDetailsRow label="Published Date" value={formatDate(selectedBook.publishedDate)} />
                </ViewDetailsGrid>
                <ViewDetailsGrid columns={2}>
                  <ViewDetailsRow label="Price" value={<span className="text-lg font-bold text-beige-700">{formatPrice(selectedBook.price)}</span>} />
                  <ViewDetailsRow
                    label="Stock"
                    value={selectedBook.stockQuantity === 0 ? (
                      <span className="text-red-600">Out of stock</span>
                    ) : (
                      `${selectedBook.stockQuantity} copies`
                    )}
                  />
                </ViewDetailsGrid>
                <ViewDetailsRow
                  label="Status"
                  value={selectedBook.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Hidden</span>
                  )}
                />
              </div>
            </div>
            <ViewDetailsRow label="Description" value={selectedBook.description} />
          </ViewDetailsContainer>
        )}
      </Modal>
    </div>
  );
}
