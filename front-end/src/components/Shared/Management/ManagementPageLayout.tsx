import { ReactNode } from "react";

interface ManagementPageLayoutProps {
  title: string;
  totalCount: number;
  entityName: string;
  onAddClick?: () => void;
  addButtonLabel?: string;
  searchBar: ReactNode;
  filterBar?: ReactNode;
  exportButton?: ReactNode;
  table: ReactNode;
  pagination: ReactNode;
}

export function ManagementPageLayout({
  title,
  totalCount,
  entityName,
  onAddClick,
  addButtonLabel,
  searchBar,
  filterBar,
  exportButton,
  table,
  pagination,
}: ManagementPageLayoutProps) {
  return (
    <div className="p-6">
      {/* Row 1: Header với Title + Add Button */}
      <div className="flex items-start justify-between mb-6">
        {/* Column 1: Title + Total Count */}
        <div>
          <h1 className="text-3xl font-bold text-beige-900">{title}</h1>
          <p className="mt-1 text-sm text-beige-600">
            Total: {totalCount} {entityName}
          </p>
        </div>

        {/* Column 2: Add Button */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {addButtonLabel || `Add ${entityName.slice(0, -1)}`}
          </button>
        )}
      </div>

      {/* Row 2: Search & Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow items-end">
          {/* Search - takes more width */}
          <div className="flex-1 min-w-0">{searchBar}</div>

          {/* Filters - auto-divide columns based on content */}
          {filterBar && <div className="flex flex-col sm:flex-row gap-4 shrink-0">{filterBar}</div>}

          {/* Export Button */}
          {exportButton && <div className="shrink-0">{exportButton}</div>}
        </div>
      </div>

      {/* Row 3: Table */}
      <div className="mb-4 overflow-x-auto bg-white rounded-lg shadow">{table}</div>

      {/* Row 4: Pagination */}
      {pagination}
    </div>
  );
}
