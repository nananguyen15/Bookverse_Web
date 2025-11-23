import { FaSearch } from "react-icons/fa";
import { ReactNode } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <FaSearch className="w-4 h-4 text-beige-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-beige-300 rounded-lg text-beige-900 placeholder-beige-400 focus:ring-2 focus:ring-beige-500 focus:border-beige-500 transition-colors text-sm"
      />
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}

export function FilterDropdown({ label, value, onChange, options }: FilterDropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-beige-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 border border-beige-300 rounded-lg text-beige-900 focus:ring-2 focus:ring-beige-500 focus:border-beige-500 transition-colors text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FilterBarLayoutProps {
  searchBar: ReactNode;
  filters?: ReactNode;
}

export function FilterBarLayout({ searchBar, filters }: FilterBarLayoutProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search takes more space */}
        <div className="md:col-span-8">{searchBar}</div>

        {/* Filters on the right */}
        {filters && (
          <div className="md:col-span-4 flex flex-col sm:flex-row gap-4">{filters}</div>
        )}
      </div>
    </div>
  );
}
