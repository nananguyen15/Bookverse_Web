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



