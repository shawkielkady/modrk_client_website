import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Generates an array of page numbers with ellipsis for pagination navigation.
 */
function getPageNumbers(currentPage, lastPage) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const pages = [];
  pages.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);

  if (start > 2) {
    pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < lastPage - 1) {
    pages.push("...");
  }

  pages.push(lastPage);
  return pages;
}

export default function Pagination({
  currentPage = 1,
  lastPage = 1,
  onPageChange,
  disabled = false,
  className = "",
}) {
  if (lastPage <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, lastPage);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= lastPage;

  const handlePageClick = (page) => {
    if (disabled || page === currentPage || page < 1 || page > lastPage) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="التنقل بين الصفحات"
      className={`flex items-center justify-center gap-1.5 sm:gap-2 select-none py-6 ${className}`}
      dir="rtl"
    >
      {/* Previous Page (السابق) */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={disabled || isFirstPage}
        aria-label="الصفحة السابقة"
        className="flex items-center gap-1 px-3 sm:px-4 h-10 rounded-xl font-bold text-sm bg-white border border-gray-200 text-[#123340] hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all cursor-pointer shadow-xs"
      >
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">السابق</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 sm:w-10 h-10 flex items-center justify-center text-gray-400 font-bold text-sm tracking-wider"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => handlePageClick(page)}
              disabled={disabled}
              aria-current={isActive ? "page" : undefined}
              aria-label={`الصفحة ${page}`}
              className={`w-9 sm:w-10 h-10 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isActive
                  ? "bg-[#123340] text-white shadow-sm ring-2 ring-[#123340]/20"
                  : "bg-white border border-gray-200 text-[#123340] hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Page (التالي) */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={disabled || isLastPage}
        aria-label="الصفحة التالية"
        className="flex items-center gap-1 px-3 sm:px-4 h-10 rounded-xl font-bold text-sm bg-white border border-gray-200 text-[#123340] hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all cursor-pointer shadow-xs"
      >
        <span className="hidden sm:inline">التالي</span>
        <ChevronLeft className="w-4 h-4 shrink-0" />
      </button>
    </nav>
  );
}

