import { useState, useEffect } from "react";
import { categoriesApi, authorsApi, publishersApi } from "../../api";
import type { SupCategory, SubCategory, Author, Publisher } from "../../types";

type FilterState = {
  categories: number[];
  priceRange: { min: number; max: number };
  publishers: string[];
  type: string[];
  authors?: number[];
  availableOnly?: boolean;
};

type FilterSidebarProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
};

export function FilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
}: FilterSidebarProps) {
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    author: false,
    publisher: false,
    availability: false,
    price: false,
  });

  const [expandedSupCategories, setExpandedSupCategories] = useState<Set<number>>(new Set());
  const [expandedAuthors, setExpandedAuthors] = useState(false);
  const [expandedPublishers, setExpandedPublishers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supCatData, subCatData, authorsData, publishersData] = await Promise.all([
          categoriesApi.sup.getActive(),
          categoriesApi.sub.getActive(),
          authorsApi.getActive(),
          publishersApi.getActive(),
        ]);
        setSupCategories(supCatData);
        setSubCategories(subCatData);
        setAuthors(authorsData);
        setPublishers(publishersData);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSupCategory = (supCategoryId: number) => {
    setExpandedSupCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(supCategoryId)) {
        newSet.delete(supCategoryId);
      } else {
        newSet.add(supCategoryId);
      }
      return newSet;
    });
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleAuthorToggle = (authorId: number) => {
    const newAuthors = filters.authors?.includes(authorId)
      ? (filters.authors || []).filter((id) => id !== authorId)
      : [...(filters.authors || []), authorId];
    onFilterChange({ ...filters, authors: newAuthors });
  };

  const handlePublisherToggle = (publisherName: string) => {
    const newPublishers = filters.publishers.includes(publisherName)
      ? filters.publishers.filter((p) => p !== publisherName)
      : [...filters.publishers, publisherName];
    onFilterChange({ ...filters, publishers: newPublishers });
  };

  const handleAvailableToggle = () => {
    onFilterChange({ ...filters, availableOnly: !filters.availableOnly });
  };

  const handlePriceChange = (field: "min" | "max", value: number) => {
    const newPriceRange = { ...filters.priceRange, [field]: value };
    // Validate: min <= max, and positive
    if (
      newPriceRange.min > 0 &&
      newPriceRange.max > 0 &&
      newPriceRange.min > newPriceRange.max
    ) {
      return; // Invalid, don't update
    }
    onFilterChange({ ...filters, priceRange: newPriceRange });
  };

  // Get sub-categories for a sup-category
  const getSubCategoriesForSup = (supCategoryId: number) => {
    return subCategories.filter((sub) => sub.supCategoryId === supCategoryId);
  };

  // Display limited authors/publishers initially
  const displayedAuthors = expandedAuthors ? authors : authors.slice(0, 5);
  const displayedPublishers = expandedPublishers ? publishers : publishers.slice(0, 5);

  return (
    <div className="w-64 p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filter</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-beige-600 hover:text-beige-800"
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Category</span>
          <span>{expandedSections.category ? "−" : "+"}</span>
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {categories.slice(0, 5).map((category) => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Publisher */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("publisher")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Publisher</span>
          <span>{expandedSections.publisher ? "−" : "+"}</span>
        </button>
        {expandedSections.publisher && (
          <div className="space-y-2">
            {publishers.map((publisher) => (
              <label
                key={publisher}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.publishers.includes(publisher)}
                  onChange={() => handlePublisherToggle(publisher)}
                  className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                />
                <span className="ml-2 text-sm text-gray-700">{publisher}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Type */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("type")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Type</span>
          <span>{expandedSections.type ? "−" : "+"}</span>
        </button>
        {expandedSections.type && (
          <div className="space-y-2">
            {["book", "series"].map((type) => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.type.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {type}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Price</span>
          <span>{expandedSections.price ? "−" : "+"}</span>
        </button>
        {expandedSections.price && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ""}
              onChange={(e) => handlePriceChange("min", Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
              min="0"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ""}
              onChange={(e) => handlePriceChange("max", Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
              min="0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
