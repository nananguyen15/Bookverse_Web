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
  const [priceError, setPriceError] = useState<string>("");

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    author: false,
    publisher: false,
    availability: false,
    price: false,
  });

  const [expandedSupCategories, setExpandedSupCategories] = useState<
    Set<number>
  >(new Set());
  const [expandedAuthors, setExpandedAuthors] = useState(false);
  const [expandedPublishers, setExpandedPublishers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supCatData, subCatData, authorsData, publishersData] =
          await Promise.all([
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

  // Get sub-categories for a sup-category
  const getSubCategoriesForSup = (supCategoryId: number) => {
    return subCategories.filter((sub) => sub.supCategoryId === supCategoryId);
  };

  const handleSupCategoryToggle = (supCategoryId: number) => {
    const subCats = getSubCategoriesForSup(supCategoryId);
    const subCatIds = subCats.map((sub) => sub.id);
    
    // Check if all sub-categories are already selected
    const allSubsSelected = subCatIds.every((id) =>
      filters.categories.includes(id)
    );

    let newCategories: number[];
    if (allSubsSelected) {
      // Uncheck: remove all sub-categories
      newCategories = filters.categories.filter(
        (id) => !subCatIds.includes(id)
      );
    } else {
      // Check: add all sub-categories (avoid duplicates)
      const existingIds = new Set(filters.categories);
      subCatIds.forEach((id) => existingIds.add(id));
      newCategories = Array.from(existingIds);
    }

    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleSubCategoryToggle = (subCategoryId: number) => {
    const newCategories = filters.categories.includes(subCategoryId)
      ? filters.categories.filter((id) => id !== subCategoryId)
      : [...filters.categories, subCategoryId];
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

  const handlePriceChange = (field: "min" | "max", value: string) => {
    // Clear error when user starts typing
    setPriceError("");

    // Allow empty string
    if (value === "") {
      const newPriceRange = { ...filters.priceRange, [field]: 0 };
      onFilterChange({ ...filters, priceRange: newPriceRange });
      return;
    }

    // Validate decimal number format (0.00-99.99)
    // Allow typing: numbers, one decimal point, up to 2 decimal places
    const decimalRegex = /^\d{0,2}(\.\d{0,2})?$/;
    
    if (!decimalRegex.test(value)) {
      return; // Don't update if format is invalid
    }

    const numValue = parseFloat(value);

    // Validate range: 0.00 to 99.99
    if (numValue < 0 || numValue > 99.99) {
      setPriceError("Price must be between 0.00 and 99.99");
      return;
    }

    const newPriceRange = { ...filters.priceRange, [field]: numValue };

    // Validate: min should be less than max (only if both are filled)
    if (
      newPriceRange.min > 0 &&
      newPriceRange.max > 0 &&
      newPriceRange.min > newPriceRange.max
    ) {
      setPriceError("Min price must be less than max price");
      return;
    }

    // Clear error if validation passed
    setPriceError("");
    onFilterChange({ ...filters, priceRange: newPriceRange });
  };

  // Get sub-categories for a sup-category
  const getSubCategoriesForSup = (supCategoryId: number) => {
    return subCategories.filter((sub) => sub.supCategoryId === supCategoryId);
  };

  // Display limited authors/publishers initially
  const displayedAuthors = expandedAuthors ? authors : authors.slice(0, 5);
  const displayedPublishers = expandedPublishers
    ? publishers
    : publishers.slice(0, 5);

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

      {/* Super Categories with Sub-Categories */}
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
            {supCategories.map((supCat) => {
              const subCats = getSubCategoriesForSup(supCat.id);
              const hasSubCategories = subCats.length > 0;
              const isExpanded = expandedSupCategories.has(supCat.id);
              
              // Check if all sub-categories are selected
              const subCatIds = subCats.map((sub) => sub.id);
              const allSubsSelected =
                hasSubCategories &&
                subCatIds.length > 0 &&
                subCatIds.every((id) => filters.categories.includes(id));

              return (
                <div key={supCat.id} className="space-y-1">
                  <div className="flex items-center">
                    {hasSubCategories && (
                      <button
                        onClick={() => toggleSupCategory(supCat.id)}
                        className="mr-1 text-gray-600 hover:text-gray-900"
                      >
                        {isExpanded ? "−" : "+"}
                      </button>
                    )}
                    <label className="flex items-center flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSubsSelected}
                        onChange={() => handleSupCategoryToggle(supCat.id)}
                        className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {supCat.name}
                      </span>
                    </label>
                  </div>

                  {/* Sub-categories */}
                  {hasSubCategories && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {subCats.map((subCat) => (
                        <label
                          key={subCat.id}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(subCat.id)}
                            onChange={() => handleSubCategoryToggle(subCat.id)}
                            className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            {subCat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Authors */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("author")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Author</span>
          <span>{expandedSections.author ? "−" : "+"}</span>
        </button>
        {expandedSections.author && (
          <div className="space-y-2">
            {displayedAuthors.map((author) => (
              <label
                key={author.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(filters.authors || []).includes(author.id)}
                  onChange={() => handleAuthorToggle(author.id)}
                  className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {author.name}
                </span>
              </label>
            ))}
            {authors.length > 5 && (
              <button
                onClick={() => setExpandedAuthors(!expandedAuthors)}
                className="text-sm text-beige-600 hover:text-beige-800"
              >
                {expandedAuthors ? "Show less" : `Show all (${authors.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Publishers */}
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
            {displayedPublishers.map((publisher) => (
              <label
                key={publisher.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.publishers.includes(publisher.name)}
                  onChange={() => handlePublisherToggle(publisher.name)}
                  className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {publisher.name}
                </span>
              </label>
            ))}
            {publishers.length > 5 && (
              <button
                onClick={() => setExpandedPublishers(!expandedPublishers)}
                className="text-sm text-beige-600 hover:text-beige-800"
              >
                {expandedPublishers
                  ? "Show less"
                  : `Show all (${publishers.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Availability</span>
          <span>{expandedSections.availability ? "−" : "+"}</span>
        </button>
        {expandedSections.availability && (
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availableOnly || false}
                onChange={handleAvailableToggle}
                className="w-4 h-4 border-gray-300 rounded text-beige-600 focus:ring-beige-500"
              />
              <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
            </label>
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                placeholder="0.00"
                value={filters.priceRange.min > 0 ? filters.priceRange.min : ""}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-beige-500 focus:border-beige-500 ${
                  priceError ? "border-red-300" : "border-gray-300"
                }`}
              />
              <span className="text-gray-500">−</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                placeholder="99.99"
                value={filters.priceRange.max > 0 ? filters.priceRange.max : ""}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-beige-500 focus:border-beige-500 ${
                  priceError ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {priceError && (
              <p className="text-xs text-red-600">{priceError}</p>
            )}
            <p className="text-xs text-gray-500">Range: $0.00 - $99.99</p>
          </div>
        )}
      </div>
    </div>
  );
}
