import { useState } from "react";
import { categories } from "../../data/categories";

type FilterState = {
  categories: number[];
  priceRange: { min: number; max: number };
  publishers: string[];
  type: string[];
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
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    publisher: false,
    type: false,
    price: false,
  });

  const publishers = [
    "Penguin Random House",
    "HarperCollins",
    "Simon & Schuster",
    "Hachette",
    "Macmillan",
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePublisherToggle = (publisher: string) => {
    const newPublishers = filters.publishers.includes(publisher)
      ? filters.publishers.filter((p) => p !== publisher)
      : [...filters.publishers, publisher];
    onFilterChange({ ...filters, publishers: newPublishers });
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter((t) => t !== type)
      : [...filters.type, type];
    onFilterChange({ ...filters, type: newTypes });
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

  return (
    <div className="w-64 p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filter</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-800"
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
