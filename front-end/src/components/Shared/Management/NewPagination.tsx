import { useState } from "react";

interface NewPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function NewPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: NewPaginationProps) {
  const [goToPage, setGoToPage] = useState("");

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setGoToPage("");
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-beige-50 px-4 py-3 border-t border-beige-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left: Showing entries dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-beige-700">Showing</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-1.5 bg-white border border-beige-300 text-beige-800 text-sm rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 shadow-sm hover:border-beige-400 transition-colors"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-beige-700">entries</span>
      </div>

      {/* Right: Pagination + Go to page */}
      <div className="flex items-center gap-4">
        {/* Pagination - only show if more than 1 page */}
        {totalPages > 1 && (
          <div className="flex items-center -space-x-px">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-3 h-9 text-beige-800 bg-white border border-beige-200 hover:bg-beige-50 hover:text-beige-900 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white font-medium text-sm"
            >
              Previous
            </button>

            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="flex items-center justify-center w-9 h-9 text-beige-600 bg-white border border-beige-200 font-medium text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`flex items-center justify-center w-9 h-9 border font-medium text-sm transition-colors ${currentPage === page
                        ? "text-white bg-beige-700 border-beige-700 hover:bg-beige-800"
                        : "text-beige-800 bg-white border-beige-200 hover:bg-beige-50 hover:text-beige-900"
                      }`}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center px-3 h-9 text-beige-800 bg-white border border-beige-200 hover:bg-beige-50 hover:text-beige-900 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Go to page */}
        {totalPages > 1 && (
          <form onSubmit={handleGoToPage} className="flex items-center gap-2">
            <span className="text-sm text-beige-700">Go to</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              placeholder={currentPage.toString()}
              className="w-16 px-2.5 py-1.5 bg-white border border-beige-300 text-beige-800 text-sm rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 shadow-sm hover:border-beige-400 transition-colors text-center"
            />
            <span className="text-sm text-beige-700">page</span>
            <button
              type="submit"
              className="px-3 py-1.5 text-white bg-beige-700 hover:bg-beige-800 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
