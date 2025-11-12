import { FaSearch } from "react-icons/fa";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Optional filters
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  statusLabel?: string;
  
  sortField?: string;
  onSortFieldChange?: (value: string) => void;
  sortOptions?: FilterOption[];
  sortLabel?: string;
  
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (value: "asc" | "desc") => void;
  
  // Custom filters
  customFilters?: React.ReactNode;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  
  statusFilter,
  onStatusFilterChange,
  statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  statusLabel = "Status",
  
  sortField,
  onSortFieldChange,
  sortOptions,
  sortLabel = "Sort by",
  
  sortOrder,
  onSortOrderChange,
  
  customFilters,
}: FilterBarProps) {
  const filterCount = [
    statusFilter !== undefined,
    sortField !== undefined,
    sortOrder !== undefined,
    customFilters !== undefined,
  ].filter(Boolean).length;

  const gridCols = filterCount === 0 ? "grid-cols-1" : 
                   filterCount === 1 ? "md:grid-cols-2" :
                   filterCount === 2 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 gap-4 p-4 mb-6 bg-white rounded-lg shadow ${gridCols}`}>
      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
        />
      </div>

      {/* Status Filter */}
      {statusFilter !== undefined && onStatusFilterChange && (
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label={statusLabel}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Sort Field */}
      {sortField !== undefined && onSortFieldChange && sortOptions && (
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label={sortLabel}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Sort Order */}
      {sortOrder !== undefined && onSortOrderChange && (
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Sort order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      )}

      {/* Custom Filters */}
      {customFilters}
    </div>
  );
}
