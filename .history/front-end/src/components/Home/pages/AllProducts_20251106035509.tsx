import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilterSidebar } from "../../Search/FilterSidebar";
import { ProductCard } from "../../Search/ProductCard";
import { booksApi } from "../../../api";
import type { Book } from "../../../types";
import { Navbar } from "../../layout/Navbar/Navbar";
import { Footer } from "../../layout/Footer/Footer";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";

type SortOption = "all" | "newest" | "price-low" | "price-high";

type FilterState = {
  categories: number[];
  priceRange: { min: number; max: number };
  publishers: string[];
  type: string[];
};

type ProductItem = Book & { type: "book" };

type AllProductsProps = {
  defaultType: "book" | "series";
};

export function AllProducts({ defaultType }: AllProductsProps) {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>("all");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 0 },
    publishers: [],
    type: [defaultType],
  });

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await booksApi.getActive();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Combine books - only books for now (series will be added later)
  const allProducts = useMemo(
    () => books.map((book) => ({ ...book, type: "book" as const })),
    [books]
  );

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result: ProductItem[] = [...allProducts];

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((product) => {
        const categoryId = product.categoryId;
        return filters.categories.includes(categoryId);
      });
    }

    // Apply publisher filter (mock, since data doesn't have publisher names)
    if (filters.publishers.length > 0) {
      result = result.filter(() => {
        // Mock: assume some products match publishers
        return true;
      });
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter((product) => {
        return filters.type.includes(product.type);
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

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          const aDate = new Date(a.publishedDate || 0);
          const bDate = new Date(b.publishedDate || 0);
          return bDate.getTime() - aDate.getTime();
        });
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, filters, sortBy]);

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 0 },
      publishers: [],
      type: [defaultType],
    });
  };

  const handleAddToCart = (id: string | number) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    // Determine type based on the product
    const product = allProducts.find((p) => String(p.id) === String(id));
    if (product) {
      addToCart(String(id), product.type, 1);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-16 py-8 bg-beige-50">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-beige-500">
            Showing {filteredAndSortedProducts.length} {defaultType}s
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <span>⚡</span>
              Quick Sort
            </button>

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
                onClick={() => setSortBy("popular")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "popular"
                    ? "bg-beige-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "newest"
                    ? "bg-beige-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Most New
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={`${product.type}-${product.id}`}
                    id={product.id}
                    title={product.title}
                    author={
                      (product as Book).authorId ||
                      (product as Series).author_id?.toString() ||
                      "Unknown Author"
                    }
                    price={product.price}
                    image={product.image || "/placeholder-book.jpg"}
                    type={product.type}
                    onAddToCart={handleAddToCart}
                    description={product.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
