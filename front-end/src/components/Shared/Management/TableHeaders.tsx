import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface SortableTableHeaderProps<T extends string> {
  label: string;
  sortKey: T;
  currentSort: T | null;
  sortOrder: "asc" | "desc";
  onSort: (key: T) => void;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SortableTableHeader<T extends string>({
  label,
  sortKey,
  currentSort,
  sortOrder,
  onSort,
  align = "left",
  className = "",
}: SortableTableHeaderProps<T>) {
  const getSortIcon = () => {
    if (currentSort !== sortKey) {
      return <FaSort className="inline ml-1 text-beige-400" />;
    }
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1 text-beige-700" />
    ) : (
      <FaSortDown className="inline ml-1 text-beige-700" />
    );
  };

  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-4 py-3 ${alignClass} text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200 transition-colors select-none ${className}`}
    >
      {label} {getSortIcon()}
    </th>
  );
}

interface SimpleTableHeaderProps {
  label: string;
  align?: "left" | "center" | "right";
}

export function SimpleTableHeader({ label, align = "left" }: SimpleTableHeaderProps) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <th className={`px-4 py-3 ${alignClass} text-sm font-semibold text-beige-900`}>
      {label}
    </th>
  );
}
