import { useState } from "react";
import { categories } from "../../data/categories";

type FilterState = {
  categories: number[];
  priceRange: { min: number; max: number };
  discount: string[];
  condition: string[];
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
    discount: true,
    condition: false,
    price: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleDiscountToggle = (discount: string) => {
    const newDiscounts = filters.discount.includes(discount)
      ? filters.discount.filter((d) => d !== discount)
      : [...filters.discount, discount];
    onFilterChange({ ...filters, discount: newDiscounts });
  };

  const handleConditionToggle = (condition: string) => {
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter((c) => c !== condition)
      : [...filters.condition, condition];
    onFilterChange({ ...filters, condition: newConditions });
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

      {/* Discount */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("discount")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Discount</span>
          <span>{expandedSections.discount ? "−" : "+"}</span>
        </button>
        {expandedSections.discount && (
          <div className="space-y-2">
            {["20% or more", "30% or more", "50% or more"].map((discount) => (
              <label
                key={discount}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.discount.includes(discount)}
                  onChange={() => handleDiscountToggle(discount)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{discount}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Condition */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("condition")}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          <span>Condition</span>
          <span>{expandedSections.condition ? "−" : "+"}</span>
        </button>
        {expandedSections.condition && (
          <div className="space-y-2">
            {["New", "Used - Like New", "Used - Good"].map((condition) => (
              <label
                key={condition}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.condition.includes(condition)}
                  onChange={() => handleConditionToggle(condition)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{condition}</span>
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
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceRange: {
                    ...filters.priceRange,
                    min: Number(e.target.value),
                  },
                })
              }
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceRange: {
                    ...filters.priceRange,
                    max: Number(e.target.value),
                  },
                })
              }
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
