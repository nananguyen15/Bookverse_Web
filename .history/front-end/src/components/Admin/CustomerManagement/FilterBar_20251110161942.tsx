import { FaSearch } from "react-icons/fa";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "name" | "username" | "email";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
}: FilterBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white rounded-lg shadow md:grid-cols-4">
      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search by name, username, email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
        />
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Sort Field */}
      <select
        value={sortField}
        onChange={(e) => onSortFieldChange(e.target.value as SortField)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
      >
        <option value="name">Sort by Name</option>
        <option value="username">Sort by Username</option>
        <option value="email">Sort by Email</option>
      </select>

      {/* Sort Order */}
      <select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}
