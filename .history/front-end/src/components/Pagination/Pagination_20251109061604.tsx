import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const maxVisiblePages = 5;

  // Calculate range of pages to show
  const getPageRange = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageRange();

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-beige-700 border-beige-300 hover:bg-beige-100"
      >
        <BsChevronLeft />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {/* First page if not in range */}
        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-beige-700 border-beige-300 hover:bg-beige-100"
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="px-2 py-2 text-beige-500">...</span>
            )}
          </>
        )}

        {/* Visible page numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium transition-colors border rounded-lg ${
              currentPage === page
                ? "bg-beige-800 text-white border-beige-800"
                : "text-beige-700 border-beige-300 hover:bg-beige-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last page if not in range */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-2 py-2 text-beige-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-beige-700 border-beige-300 hover:bg-beige-100"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-beige-700 border-beige-300 hover:bg-beige-100"
      >
        Next
        <BsChevronRight />
      </button>
    </div>
  );
}
