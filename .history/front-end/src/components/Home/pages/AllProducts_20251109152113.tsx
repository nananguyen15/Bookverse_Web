import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FilterSidebar } from "../../Search/FilterSidebar";
import { BookCard } from "../BookCard";
import { Pagination } from "../../Pagination/Pagination";
import { booksApi, authorsApi, publishersApi } from "../../../api";
import type { Book } from "../../../types";
import { Navbar } from "../../layout/Navbar/Navbar";
import { Footer } from "../../layout/Footer/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { mapBooksWithNames } from "../../../utils/bookHelpers";

type SortOption =
  | "all"
  | "newest"
  | "price-low"
  | "price-high"
  | "popular"
  | "oldest"
  | "title";

type FilterState = {
  categories: number[];
  priceRange: { min: number; max: number };
  publishers: string[];
  type: string[];
  authors?: number[];
  availableOnly?: boolean;
};

type ProductItem = Book & { type: "book" };

type AllProductsProps = {
  defaultType: "book" | "series";
};

export function AllProducts({ defaultType }: AllProductsProps) {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [inactiveBooks, setInactiveBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 0 },
    publishers: [],
    type: [defaultType],
    authors: [],
    availableOnly: false,
  });

  // Initialize filters from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("categories");
    if (categoryParam) {
      const categoryIds = categoryParam.split(",").map(Number);
      setFilters((prev) => ({ ...prev, categories: categoryIds }));
    }
  }, [searchParams]);

  // Fetch books from API with sorting
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        let booksData: Book[];

        // Fetch sorted data from backend
        switch (sortBy) {
          case "title":
            booksData = await booksApi.sortByTitle();
            break;
          case "price-low":
            booksData = await booksApi.sortByPriceAsc();
            break;
          case "price-high":
            booksData = await booksApi.sortByPriceDesc();
            break;
          case "oldest":
            booksData = await booksApi.sortByOldest();
            break;
          case "newest":
            booksData = await booksApi.sortByNewest();
            break;
          default:
            booksData = await booksApi.getActive();
            break;
        }

        const [authorsData, publishersData, inactiveBooksData] =
          await Promise.all([
            authorsApi.getActive(),
            publishersApi.getActive(),
            booksApi.getInactive(),
          ]);

        // Map books with author/publisher names and fix image paths
        const booksWithNames = mapBooksWithNames(
          booksData,
          authorsData,
          publishersData
        );

        const inactiveBooksWithNames = mapBooksWithNames(
          inactiveBooksData,
          authorsData,
          publishersData
        );

        setBooks(booksWithNames);
        setInactiveBooks(inactiveBooksWithNames);
        setCurrentPage(1); // Reset to first page when sort changes
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [sortBy]); // Re-fetch when sortBy changes

  // Combine active + inactive books (active first)
  const allProducts = useMemo(
    () => [
      ...books.map((book) => ({
        ...book,
        type: "book" as const,
        isActive: true,
      })),
      ...inactiveBooks.map((book) => ({
        ...book,
        type: "book" as const,
        isActive: false,
      })),
    ],
    [books, inactiveBooks]
  );

  // Filter products (no sorting here since backend handles it)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((product) => {
        const categoryId = product.categoryId;
        return filters.categories.includes(categoryId);
      });
    }

    // Apply author filter
    if (filters.authors && filters.authors.length > 0) {
      result = result.filter((product) => {
        return filters.authors?.includes(product.authorId);
      });
    }

    // Apply publisher filter
    if (filters.publishers.length > 0) {
      result = result.filter((product) => {
        return filters.publishers.includes(product.publisherName || "");
      });
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter((product) => {
        return filters.type.includes(product.type);
      });
    }

    // Apply availability filter
    if (filters.availableOnly) {
      result = result.filter((product) => {
        return product.stock > 0;
      });
    }

    // Apply price filter
    if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
      result = result.filter((product) => {
        const price = product.price;
        const min = filters.priceRange.min || 0;
        const max = filters.priceRange.max || Infinity;
        return price >= min && price <= max;
      });
    }

    return result;
  }, [allProducts, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 0 },
      publishers: [],
      type: [defaultType],
      authors: [],
      availableOnly: false,
    });
  };

  const handleAddToCart = (bookId: string) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    addToCart(bookId, "book", 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-16 py-8 bg-beige-50">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-beige-500">
            Showing {paginatedProducts.length} of {filteredProducts.length}{" "}
            {defaultType}s
            {filteredProducts.length > itemsPerPage &&
              ` (Page ${currentPage} of ${totalPages})`}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "all"
                    ? "bg-beige-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "newest"
                    ? "bg-beige-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "oldest"
                    ? "bg-beige-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Oldest
              </button>
              <button
                onClick={() => setSortBy("title")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "title"
                    ? "bg-beige-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                A-Z
              </button>

              <div className="relative">
                <select
                  aria-label="Sort by price"
                  value={
                    sortBy === "price-low"
                      ? "price-low"
                      : sortBy === "price-high"
                      ? "price-high"
                      : ""
                  }
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 pr-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:bg-gray-50"
                >
                  <option value="">Price</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <span className="absolute text-gray-500 transform -translate-y-1/2 pointer-events-none right-3 top-1/2">
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Filter Sidebar */}
          <div className="col-span-3">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onClearAll={handleClearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="col-span-9">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="py-12 text-center">
                  <p className="text-beige-600">Đang tải sách...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-beige-600">Không tìm thấy sách nào.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
                    {paginatedProducts.map((product) => (
                      <BookCard
                        key={`book-${product.id}`}
                        book={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
