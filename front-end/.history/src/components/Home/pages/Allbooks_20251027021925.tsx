// import { useState, useMemo } from "react";
// import { FilterSidebar } from "../../Search/FilterSidebar";
// import { ProductCard } from "../../Search/ProductCard";
// import { heroBookGroups } from "../../../data/books";
// import { seriesData } from "../../../data/series";
// import type { Book } from "../../../data/books";
// import type { Series } from "../../../data/series";
// import { Navbar } from "../../Navbar/Navbar";
// import { Footer } from "../../Footer/Footer";
import { AllProducts } from "./AllProducts";

// type SortOption = "all" | "popular" | "newest" | "price-low" | "price-high";

// type FilterState = {
//   categories: number[];
//   priceRange: { min: number; max: number };
//   publishers: string[];
//   type: string[];
// };

// type ProductItem = (Book & { type: "book" }) | (Series & { type: "series" });

export function Allbooks() {
  return <AllProducts defaultType="book" />;
}

// export function Allbooks() {
//   const [sortBy, setSortBy] = useState<SortOption>("all");
//   const [filters, setFilters] = useState<FilterState>({
//     categories: [],
//     priceRange: { min: 0, max: 0 },
//     publishers: [],
//     type: [],
//   });

//   // Combine books and series - memoized to avoid recreation
//   const allBooks = useMemo(() => heroBookGroups.flat(), []);
//   const allProducts = useMemo(
//     () => [
//       ...allBooks.map((book) => ({ ...book, type: "book" as const })),
//       ...seriesData.map((series) => ({ ...series, type: "series" as const })),
//     ],
//     [allBooks]
//   );

//   // Filter and sort products
//   const filteredAndSortedProducts = useMemo(() => {
//     let result: ProductItem[] = [...allProducts];

//     // Apply category filter
//     if (filters.categories.length > 0) {
//       result = result.filter((product) => {
//         const categoryId = product.category_id;
//         return filters.categories.includes(categoryId);
//       });
//     }

//     // Apply publisher filter (mock, since data doesn't have publisher names)
//     if (filters.publishers.length > 0) {
//       result = result.filter((product) => {
//         // Mock: assume some products match publishers
//         return true;
//       });
//     }

//     // Apply type filter
//     if (filters.type.length > 0) {
//       result = result.filter((product) => {
//         return filters.type.includes(product.type);
//       });
//     }

//     // Apply price filter
//     if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
//       result = result.filter((product) => {
//         const price = product.price;
//         const min = filters.priceRange.min || 0;
//         const max = filters.priceRange.max || Infinity;
//         return price >= min && price <= max;
//       });
//     }

//     // Apply sorting
//     switch (sortBy) {
//       case "popular":
//         result.sort((a, b) => {
//           const aRating = (a as any).rating || 0;
//           const bRating = (b as any).rating || 0;
//           return bRating - aRating;
//         });
//         break;
//       case "newest":
//         result.sort((a, b) => {
//           const aDate = new Date((a as any).published_date || 0);
//           const bDate = new Date((b as any).published_date || 0);
//           return bDate.getTime() - aDate.getTime();
//         });
//         break;
//       case "price-low":
//         result.sort((a, b) => a.price - b.price);
//         break;
//       case "price-high":
//         result.sort((a, b) => b.price - a.price);
//         break;
//       default:
//         break;
//     }


