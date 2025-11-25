import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { booksApi, authorsApi, publishersApi, categoriesApi, promotionApi } from "../../api";
import type { Book, Author, Publisher, SubCategory, SupCategory } from "../../types";
import type { PromotionResponse } from "../../types/api/promotion.types";
import { FaExclamationTriangle, FaFileExport, FaChevronDown } from "react-icons/fa";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
import { formatDateToDDMMYYYY } from "../../utils/bookHelpers";
import { useAuth } from "../../contexts/AuthContext";
import {
  ManagementLayout,
  ManagementPageLayout,
  NewSortableHeader,
  SimpleTableHeader,
  NewPagination,
  SearchBar,
  FilterDropdown,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  Modal,
  ModalActions,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
  BookForm,
  type BookFormData,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "no" | "id" | "title" | "price" | "promoPrice" | "publishedDate" | "stock" | "author" | "publisher";

export function BookManagementNew() {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith("/staff");
  const { userRole } = useAuth();
  const isAdmin = userRole === "ADMIN";

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [subCategoryPromotions, setSubCategoryPromotions] = useState<Record<number, PromotionResponse | null>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [sortField, setSortField] = useState<SortField | null>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load all data
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.export-dropdown') && showExportMenu) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      console.log("📖 Loading book data with statusFilter:", statusFilter);

      const [authorsData, publishersData, categoriesData, supCategoriesData, promotionsData] = await Promise.all([
        authorsApi.getAll(),
        publishersApi.getAll(),
        categoriesApi.sub.getAll(),
        categoriesApi.sup.getAll(),
        promotionApi.getActive(),
      ]);

      console.log("✅ Loaded supporting data:", {
        authors: authorsData.length,
        publishers: publishersData.length,
        categories: categoriesData.length,
        supCategories: supCategoriesData.length,
        promotions: promotionsData.length
      });

      let booksData: Book[];
      if (statusFilter === "active") {
        console.log("📖 Fetching active books...");
        booksData = await booksApi.getActive();
      } else if (statusFilter === "inactive") {
        console.log("📖 Fetching inactive books...");
        booksData = await booksApi.getInactive();
      } else {
        console.log("📖 Fetching all books...");
        booksData = await booksApi.getAll();
      }

      console.log("✅ Loaded books:", booksData.length);

      // Enrich books with names, handling inactive items
      const enrichedBooks = booksData.map((book) => {
        const author = authorsData.find((a) => a.id === book.authorId);
        const publisher = publishersData.find((p) => p.id === book.publisherId);
        const category = categoriesData.find((c) => c.id === book.categoryId);
        const supCategory = category ? supCategoriesData.find((s) => s.id === category.supCategoryId) : null;

        return {
          ...book,
          authorName: author ? (author.active ? author.name : "Unknown") : "N/A",
          publisherName: publisher ? (publisher.active ? publisher.name : "Unknown") : "N/A",
          categoryName: category?.name || "N/A",
          // Mark if dependencies are inactive
          hasInactiveAuthor: author ? !author.active : false,
          hasInactivePublisher: publisher ? !publisher.active : false,
          hasInactiveCategory: category ? !category.active : false,
          hasInactiveSupCategory: supCategory ? !supCategory.active : false,
        };
      });

      setBooks(enrichedBooks);
      setAuthors(authorsData);
      setPublishers(publishersData);
      setCategories(categoriesData);
      setSupCategories(supCategoriesData);
      setPromotions(promotionsData);

      // Load promotions for each sub-category
      await loadSubCategoryPromotions(promotionsData, categoriesData);
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown; status?: number }; message?: string; config?: { url?: string } };
      console.error("❌ Error loading data:", error);
      console.error("📄 Full response data:", JSON.stringify(err.response?.data, null, 2));
      console.error("🔍 Error status:", err.response?.status);
      console.error("🔍 Error URL:", err.config?.url);

      const responseData = err.response?.data as { message?: string; error?: string } | undefined;
      const errorMsg = responseData?.message || responseData?.error || err.message || "Failed to load books";
      alert(`Failed to load books: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategoryPromotions = async (
    promotionsData: PromotionResponse[],
    categoriesData: SubCategory[]
  ) => {
    const subCatPromos: Record<number, PromotionResponse | null> = {};

    // First, load all promotion sub-categories once (batch fetch)
    const promotionSubCatsCache: Record<number, SubCategory[]> = {};
    await Promise.all(
      promotionsData.map(async (promo) => {
        try {
          const subCats = await promotionApi.getPromotionSubCategories(promo.id);
          promotionSubCatsCache[promo.id] = subCats;
        } catch {
          // Promotion doesn't have sub-categories (backend returns 400)
          promotionSubCatsCache[promo.id] = [];
        }
      })
    );

    // For each sub-category, find active promotion using cached data
    for (const subCat of categoriesData) {
      let foundPromo: PromotionResponse | null = null;

      // Check each promotion using cached sub-categories
      for (const promo of promotionsData) {
        const subCats = promotionSubCatsCache[promo.id] || [];
        if (subCats.some(sc => sc.id === subCat.id)) {
          // Check if promotion is currently active (within date range)
          const now = new Date();
          const start = new Date(promo.startDate);
          const end = new Date(promo.endDate);
          if (now >= start && now <= end && promo.active) {
            foundPromo = promo;
            break;
          }
        }
      }

      subCatPromos[subCat.id] = foundPromo;
    }

    setSubCategoryPromotions(subCatPromos);
  };

  // Calculate promotional price
  const getPromotionalPrice = (book: Book): { originalPrice: number; promoPrice: number | null; percentage: number | null } => {
    const promotion = subCategoryPromotions[book.categoryId];
    if (!promotion) {
      return { originalPrice: book.price, promoPrice: null, percentage: null };
    }

    const discount = book.price * (promotion.percentage / 100);
    const promoPrice = book.price - discount;

    return {
      originalPrice: book.price,
      promoPrice: promoPrice,
      percentage: promotion.percentage
    };
  };

  // Filter and sort
  const filteredBooks = books
    .filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.authorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.publisherName || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === "all" || book.categoryId === categoryFilter;

      return matchSearch && matchCategory;
    })
    .map((book, index) => ({ ...book, originalIndex: index }))
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "no":
          aVal = a.originalIndex;
          bVal = b.originalIndex;
          break;
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "price":
          aVal = a.price;
          bVal = b.price;
          break;
        case "promoPrice":
          // Sort by promotional price if exists, otherwise use original price
          aVal = getPromotionalPrice(a).promoPrice ?? a.price;
          bVal = getPromotionalPrice(b).promoPrice ?? b.price;
          break;
        case "stock":
          aVal = a.stockQuantity;
          bVal = b.stockQuantity;
          break;
        case "publishedDate":
          aVal = new Date(a.publishedDate).getTime();
          bVal = new Date(b.publishedDate).getTime();
          break;
        case "author":
          aVal = (a.authorName || "").toLowerCase();
          bVal = (b.authorName || "").toLowerCase();
          break;
        case "publisher":
          aVal = (a.publisherName || "").toLowerCase();
          bVal = (b.publisherName || "").toLowerCase();
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sort handler
  const handleSort = (key: SortField) => {
    if (sortField === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(key);
      setSortOrder("asc");
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ["No", "ID", "Title", "Author", "Publisher", "Price", "Stock", "Published Date", "Status"];
    const rows = filteredBooks.map((book, index) => [
      index + 1,
      book.id,
      `"${book.title}"`,
      `"${book.authorName || 'Unknown'}"`,
      `"${book.publisherName || 'Unknown'}"`,
      book.price,
      book.stockQuantity,
      formatDateToDDMMYYYY(book.publishedDate),
      book.active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    downloadFile(csvContent, "books.csv", "text/csv");
  };

  const exportToJSON = () => {
    const data = filteredBooks.map((book, index) => ({
      no: index + 1,
      id: book.id,
      title: book.title,
      author: book.authorName || "Unknown",
      publisher: book.publisherName || "Unknown",
      price: book.price,
      stock: book.stockQuantity,
      publishedDate: formatDateToDDMMYYYY(book.publishedDate),
      status: book.active ? "Active" : "Inactive",
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, "books.json", "application/json");
  };

  const exportToTXT = () => {
    const content = filteredBooks.map((book, index) =>
      `${index + 1}. ${book.title}\n` +
      `   Author: ${book.authorName || 'Unknown'}\n` +
      `   Publisher: ${book.publisherName || 'Unknown'}\n` +
      `   Price: $${book.price}\n` +
      `   Stock: ${book.stockQuantity}\n` +
      `   Published: ${formatDateToDDMMYYYY(book.publishedDate)}\n` +
      `   Status: ${book.active ? 'Active' : 'Inactive'}\n`
    ).join("\n");

    downloadFile(content, "books.txt", "text/plain");
  };

  const exportToSQL = () => {
    const sqlStatements = filteredBooks.map(book =>
      `INSERT INTO books (id, title, author_id, publisher_id, price, stock_quantity, published_date, active) ` +
      `VALUES (${book.id}, '${book.title.replace(/'/g, "''")}', ${book.authorId}, ${book.publisherId}, ${book.price}, ${book.stockQuantity}, '${book.publishedDate}', ${book.active ? 1 : 0});`
    ).join("\n");

    const sqlContent = `-- Books Export\n-- Generated on ${new Date().toLocaleString()}\n\n${sqlStatements}`;
    downloadFile(sqlContent, "books.sql", "application/sql");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CRUD handlers
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
    setImageFile(null);
    setSelectedBook(null);
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      description: book.description || "",
      price: book.price,
      authorId: book.authorId,
      publisherId: book.publisherId,
      categoryId: book.categoryId,
      stockQuantity: book.stockQuantity,
      publishedDate: book.publishedDate,
      image: book.image || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (book: Book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        alert("Book title is required!");
        return;
      }

      if (formData.authorId === 0) {
        alert("Please select an author!");
        return;
      }

      if (formData.publisherId === 0) {
        alert("Please select a publisher!");
        return;
      }

      if (formData.categoryId === 0) {
        alert("Please select a category!");
        return;
      }

      if (!formData.publishedDate) {
        alert("Published date is required!");
        return;
      }

      if (formData.price <= 0) {
        alert("Price must be greater than 0!");
        return;
      }

      console.log("📚 Creating book with data:", formData);
      console.log("📷 Image file:", imageFile);

      await booksApi.create({ ...formData, imageFile });
      alert("Book created successfully");
      setShowCreateModal(false);
      resetForm();
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      console.error("Error creating book:", err);
      console.error("Response data:", err.response?.data);

      const backendMessage = err.response?.data?.message || err.response?.data?.error || '';
      let errorMessage = "Failed to create book: ";

      if (backendMessage) {
        errorMessage += backendMessage;
      } else {
        errorMessage += err.message || 'Internal Server Error';
      }

      alert(errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBook) return;

    try {
      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        alert("Book title is required!");
        return;
      }

      if (formData.authorId === 0) {
        alert("Please select an author!");
        return;
      }

      if (formData.publisherId === 0) {
        alert("Please select a publisher!");
        return;
      }

      if (formData.categoryId === 0) {
        alert("Please select a category!");
        return;
      }

      if (!formData.publishedDate) {
        alert("Published date is required!");
        return;
      }

      if (formData.price <= 0) {
        alert("Price must be greater than 0!");
        return;
      }

      await booksApi.update(selectedBook.id, { ...formData, imageFile });
      alert("Book updated successfully");
      setShowEditModal(false);
      resetForm();
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      console.error("Error updating book:", err);
      console.error("Response data:", err.response?.data);

      const backendMessage = err.response?.data?.message || err.response?.data?.error || '';
      let errorMessage = "Failed to update book: ";

      if (backendMessage) {
        errorMessage += backendMessage;
      } else {
        errorMessage += err.message || 'Internal Server Error';
      }

      alert(errorMessage);
    }
  };

  const handleToggleStatus = async (book: Book) => {
    const action = book.active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this book?`)) return;

    try {
      console.log(`🔄 Attempting to ${action} book:`, book.id);
      if (book.active) {
        await booksApi.deactivate(book.id);
        console.log(`✅ Successfully deactivated book:`, book.id);
      } else {
        await booksApi.activate(book.id);
        console.log(`✅ Successfully activated book:`, book.id);
      }
      await loadAllData();
    } catch (error) {
      console.error(`❌ Error ${action} book:`, error);
      const err = error as {
        response?: {
          data?: {
            message?: string;
            code?: number;
          };
          status?: number;
        };
        message?: string;
      };

      let errorMessage = `Failed to ${action} book`;

      if (err.response?.status === 403) {
        errorMessage = `⛔ Access Denied: You don't have permission to ${action} books. Only ADMIN users can perform this action.`;
      } else if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err.response?.status) {
        errorMessage += `: HTTP ${err.response.status}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }

      console.error("❌ Error details:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        code: err.response?.data?.code,
      });

      alert(errorMessage);
    }
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading...</p>
        </div>
      </div>
    );

    return isStaffRoute ? loadingContent : <ManagementLayout>{loadingContent}</ManagementLayout>;
  }

  const content = (
    <>
      <ManagementPageLayout
        title="Book Management"
        totalCount={filteredBooks.length}
        entityName="books"
        onAddClick={() => setShowCreateModal(true)}
        addButtonLabel="Add Book"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, author, publisher..."
          />
        }
        filterBar={
          <>
            <FilterDropdown
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <FilterDropdown
              label="Category"
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value === "all" ? "all" : Number(value));
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Categories" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />
          </>
        }
        exportButton={
          <div className="relative export-dropdown">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 transition-colors bg-white border rounded-lg shadow-sm text-beige-700 border-beige-300 hover:bg-beige-50"
            >
              <FaFileExport className="w-4 h-4" />
              <span>Export</span>
              <FaChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 z-10 w-48 mt-2 bg-white border rounded-lg shadow-lg border-beige-200">
                <button
                  onClick={() => {
                    exportToCSV();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left transition-colors rounded-t-lg hover:bg-beige-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    exportToJSON();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left transition-colors hover:bg-beige-50"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    exportToTXT();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left transition-colors hover:bg-beige-50"
                >
                  Export as TXT
                </button>
                <button
                  onClick={() => {
                    exportToSQL();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left transition-colors rounded-b-lg hover:bg-beige-50"
                >
                  Export as SQL
                </button>
              </div>
            )}
          </div>
        }
        table={
          <table className="w-full">
            <thead className="border-b bg-beige-100 border-beige-200">
              <tr>
                <NewSortableHeader
                  label="No"
                  sortKey="no"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Cover" />
                <NewSortableHeader
                  label="Title"
                  sortKey="title"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Author"
                  sortKey="author"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Publisher"
                  sortKey="publisher"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Price"
                  sortKey="price"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <NewSortableHeader
                  label="Promo Price"
                  sortKey="promoPrice"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <NewSortableHeader
                  label="Stock"
                  sortKey="stock"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="center"
                />
                <NewSortableHeader
                  label="Published Date"
                  sortKey="publishedDate"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="center"
                />
                <SimpleTableHeader label="Status" align="center" />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedBooks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-beige-500">
                    No books found
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((book) => (
                  <tr key={book.id} className="transition-colors hover:bg-beige-50">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {book.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <img
                        src={transformImageUrl(book.image) || FALLBACK_IMAGES.book}
                        alt={book.title}
                        className="object-cover w-12 h-16 border rounded border-beige-200"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGES.book;
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={book.title}>
                        <TableCellText className="font-medium">
                          {book.title}
                        </TableCellText>
                      </div>
                      {(book.hasInactiveCategory || book.hasInactiveSupCategory) && (
                        <div className="flex items-center gap-1 mt-1">
                          <FaExclamationTriangle className="text-xs text-red-500" />
                          <span className="text-xs text-red-600">Category Inactive - Hidden from customers</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {book.hasInactiveAuthor && (
                          <FaExclamationTriangle className="text-yellow-500" title="Author is inactive" />
                        )}
                        <TableCellText variant="secondary">{book.authorName}</TableCellText>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {book.hasInactivePublisher && (
                          <FaExclamationTriangle className="text-yellow-500" title="Publisher is inactive" />
                        )}
                        <TableCellText variant="secondary">{book.publisherName}</TableCellText>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <TableCellText className="font-semibold text-beige-700">
                        ${book.price.toFixed(2)}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="right">
                      {(() => {
                        const { promoPrice, originalPrice, percentage } = getPromotionalPrice(book);
                        if (promoPrice !== null) {
                          return (
                            <div className="flex flex-col items-end gap-0.5">
                              <TableCellText className="text-base font-bold text-green-600">
                                ${promoPrice.toFixed(2)}
                              </TableCellText>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-400 line-through">
                                  ${originalPrice.toFixed(2)}
                                </span>
                                <span className="px-1.5 py-0.5 text-xs font-semibold text-white bg-green-500 rounded">
                                  -{percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <TableCellText variant="secondary" className="text-xs italic">
                            No promo
                          </TableCellText>
                        );
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-1">
                        {book.stockQuantity <= 5 && book.stockQuantity > 0 && (
                          <FaExclamationTriangle className="text-yellow-500" title="Low stock" />
                        )}
                        {book.stockQuantity === 0 && (
                          <FaExclamationTriangle className="text-red-500" title="Out of stock" />
                        )}
                        <TableCellText
                          className={
                            book.stockQuantity === 0
                              ? "text-red-600 font-semibold"
                              : book.stockQuantity <= 5
                                ? "text-yellow-600 font-semibold"
                                : ""
                          }
                        >
                          {book.stockQuantity}
                        </TableCellText>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <TableCellText variant="secondary">
                        {formatDateToDDMMYYYY(book.publishedDate)}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge active={book.active} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(book)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditModal(book)}
                          icon="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleToggleStatus(book)}
                          icon={book.active ? "deactivate" : "activate"}
                          title={book.active ? "Deactivate" : "Activate"}
                          variant={book.active ? "danger" : "success"}
                        />
                      </ActionButtonGroup>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        }
        pagination={
          <NewPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredBooks.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        }
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Book"
        maxWidth="2xl"
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
            onImageUpload={setImageFile}
            authors={authors}
            publishers={publishers}
            categories={categories}
            isEdit={false}
          />
          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Book"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Book"
        maxWidth="2xl"
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
            onImageUpload={setImageFile}
            authors={authors}
            publishers={publishers}
            categories={categories}
            isEdit={true}
          />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Book"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedBook(null);
        }}
        title="Book Details"
        maxWidth="2xl"
      >
        {selectedBook && (
          <>
            <ViewDetailsContainer>
              <div className="flex justify-center col-span-2 mb-4">
                <img
                  src={transformImageUrl(selectedBook.image) || FALLBACK_IMAGES.book}
                  alt={selectedBook.title}
                  className="object-cover w-48 h-64 border-4 rounded-lg shadow-lg border-beige-200"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.book;
                  }}
                />
              </div>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Title" value={selectedBook.title} />
                <ViewDetailsRow
                  label="Price"
                  value={
                    <span className="text-lg font-semibold text-beige-700">
                      ${selectedBook.price.toFixed(2)}
                    </span>
                  }
                />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Author" value={selectedBook.authorName || "N/A"} />
                <ViewDetailsRow label="Publisher" value={selectedBook.publisherName || "N/A"} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Category" value={selectedBook.categoryName || "N/A"} />
                <ViewDetailsRow
                  label="Stock"
                  value={
                    <span
                      className={
                        selectedBook.stockQuantity === 0
                          ? "text-red-600 font-semibold"
                          : selectedBook.stockQuantity <= 5
                            ? "text-yellow-600 font-semibold"
                            : "text-green-600 font-semibold"
                      }
                    >
                      {selectedBook.stockQuantity} units
                    </span>
                  }
                />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Published Date"
                  value={formatDateToDDMMYYYY(selectedBook.publishedDate)}
                />
                <ViewDetailsRow
                  label="Status"
                  value={
                    selectedBook.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )
                  }
                />
              </ViewDetailsGrid>

              {selectedBook.description && (
                <div className="col-span-2 mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-beige-700">Description</h4>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {selectedBook.description}
                  </p>
                </div>
              )}
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedBook(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );

  return isStaffRoute ? content : <ManagementLayout>{content}</ManagementLayout>;
}
