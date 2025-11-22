import type { PaginationMeta } from "../../types/pagination";
import { AngleLeftIcon, AngleRightIcon } from "../../icons";
import Button from "../ui/button/Button";

interface PaginationProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  meta,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (!meta || meta.last_page <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= meta.last_page && page !== meta.current_page) {
      onPageChange(page);
    }
  };

  const getPageNumber = (url: string | null): number | null => {
    if (!url) return null;
    const match = url.match(/[?&]page=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-5 py-4 sm:flex-row">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total} results
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(meta.current_page - 1)}
          disabled={meta.current_page === 1 || isLoading}
          startIcon={<AngleLeftIcon className="w-4 h-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {meta.links.map((link, index) => {
            if (link.label.includes("Previous") || link.label.includes("Next")) {
              return null;
            }

            const pageNum = getPageNumber(link.url);
            if (!pageNum && link.label !== "1") {
              return (
                <span key={index} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const isCurrentPage = link.active;
            const displayLabel = pageNum || link.label;

            return (
              <button
                key={index}
                onClick={() => pageNum && handlePageClick(pageNum)}
                disabled={isCurrentPage || isLoading}
                className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCurrentPage
                    ? "bg-brand-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                } ${isCurrentPage || isLoading ? "cursor-default" : "cursor-pointer"}`}
                aria-label={`Go to page ${displayLabel}`}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(meta.current_page + 1)}
          disabled={meta.current_page === meta.last_page || isLoading}
          endIcon={<AngleRightIcon className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

