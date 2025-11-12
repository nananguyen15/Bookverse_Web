import { useState, useMemo } from "react";
import { FilterSidebar } from "../../Search/FilterSidebar";
import { ProductCard } from "../../Search/ProductCard";
import { heroBookGroups } from "../../../data/books";
import { seriesData } from "../../../data/series";
import type { Book } from "../../../data/books";
import type { Series } from "../../../data/series";
import { Navbar } from "../../Navbar/Navbar";
import { Footer } from "../../Footer/Footer";

type SortOption = "all" | "popular" | "newest" | "price-low" | "price-high";

type FilterState = {
  categories: number[];
  priceRange: { min: number; max: number };
  publishers: string[];
  type: string[];
};

type ProductItem = (Book & { type: "book" }) | (Series & { type: "series" });

export function Allbooks() {
  const [sortBy, setSortBy] = useState<SortOption>("all");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 0 },
    publishers: [],
    type: [],
  });

  // Combine books and series - memoized to avoid recreation
  const allBooks = useMemo(() => heroBookGroups.flat(), []);
  const allProducts = useMemo(
    () => [
      ...allBooks.map((book) => ({ ...book, type: "book" as const })),
      ...seriesData.map((series) => ({ ...series, type: "series" as const })),
    ],
    [allBooks]
  );

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result: ProductItem[] = [...allProducts];

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((product) => {
        const categoryId = product.category_id;
        return filters.categories.includes(categoryId);
      });
    }

    // Apply publisher filter (mock, since data doesn't have publisher names)
    if (filters.publishers.length > 0) {
      result = result.filter((product) => {
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
      case "popular":
        result.sort((a, b) => {
          const aRating = (a as any).rating || 0;
          const bRating = (b as any).rating || 0;
          return bRating - aRating;
        });
        break;
      case "newest":
        result.sort((a, b) => {
          const aDate = new Date((a as any).published_date || 0);
          const bDate = new Date((b as any).published_date || 0);
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
      type: [],
    });
  };

  const handleAddToCart = (id: string | number) => {
    console.log("Add to cart:", id);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-16 py-8 bg-gray-50">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedProducts.length} products
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
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "popular"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === "newest"
                    ? "bg-blue-600 text-white"
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
                  originalPrice={product.price * 1.2}
                  image={product.image || "/placeholder-book.jpg"}
                  rating={Math.floor(Math.random() * 2) + 3}
                  reviewCount={Math.floor(Math.random() * 500) + 50}
                  discount={Math.floor(Math.random() * 30) + 10}
                  type={product.type}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
