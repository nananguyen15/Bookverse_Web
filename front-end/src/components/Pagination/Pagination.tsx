import { useState } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const [goToPage, setGoToPage] = useState("");

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setGoToPage("");
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
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
    <nav
      aria-label="Page navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4"
    >
      {/* Page buttons */}
      <ul className="flex -space-x-px text-sm">
        <li>
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center justify-center text-beige-800 bg-white border border-beige-200 hover:bg-beige-50 hover:text-beige-900 shadow-sm font-medium leading-5 rounded-l-lg text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-beige-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Previous
          </button>
        </li>

        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="flex items-center justify-center text-beige-600 bg-white border border-beige-200 font-medium text-sm w-9 h-9">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`flex items-center justify-center border font-medium text-sm w-9 h-9 focus:outline-none focus:ring-2 focus:ring-beige-500 transition-colors ${currentPage === page
                  ? "text-white bg-beige-700 border-beige-700 hover:bg-beige-800"
                  : "text-beige-800 bg-white border-beige-200 hover:bg-beige-50 hover:text-beige-900 shadow-sm"
                  }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        <li>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center text-beige-800 bg-white border border-beige-200 hover:bg-beige-50 hover:text-beige-900 shadow-sm font-medium leading-5 rounded-r-lg text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-beige-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Next
          </button>
        </li>
      </ul>

      {/* Items per page & Go to page */}
      <div className="flex items-center gap-3">
        {/* Items per page dropdown */}
        <div className="w-32">
          <label htmlFor="items-per-page" className="sr-only">
            Items per page
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="block w-full px-3 py-2 bg-white border border-beige-200 text-beige-800 text-sm leading-5 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 shadow-sm hover:border-beige-300 transition-colors"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Go to page */}
        <form onSubmit={handleGoToPage} className="flex items-center gap-2">
          <label
            htmlFor="go-to-page"
            className="text-sm font-medium text-beige-800 shrink-0"
          >
            Go to
          </label>
          <input
            type="number"
            id="go-to-page"
            min="1"
            max={totalPages}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            className="bg-white w-14 border border-beige-200 text-beige-800 text-sm rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 px-2.5 py-2 shadow-sm hover:border-beige-300 transition-colors"
            placeholder={currentPage.toString()}
          />
          <span className="text-sm font-medium text-beige-800">page</span>
          <button
            type="submit"
            className="text-white bg-beige-700 hover:bg-beige-800 border border-transparent focus:ring-4 focus:ring-beige-300 shadow-sm font-medium leading-5 rounded-lg text-sm px-3 py-2 focus:outline-none transition-colors active:scale-95"
          >
            Go
          </button>
        </form>
      </div>
    </nav>
  );
}
