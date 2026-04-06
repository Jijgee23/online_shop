"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    siblingCount?: number; // How many pages to show beside the current page
}

export default function Pagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    siblingCount = 1,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize);

    // Don't render if there's only one page
    if (totalPages <= 1) return null;

    // Logic to generate page numbers with ellipses
    const range = (start: number, end: number) => {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const generatePages = () => {
        const totalPageNumbers = siblingCount + 5; // siblings + first + last + current + 2*dots

        if (totalPageNumbers >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 2;

        if (!showLeftDots && showRightDots) {
            const leftItemCount = 3 + 2 * siblingCount;
            return [...range(1, leftItemCount), "DOTS", totalPages];
        }

        if (showLeftDots && !showRightDots) {
            const rightItemCount = 3 + 2 * siblingCount;
            return [1, "DOTS", ...range(totalPages - rightItemCount + 1, totalPages)];
        }

        return [1, "DOTS", ...range(leftSiblingIndex, rightSiblingIndex), "DOTS", totalPages];
    };

    const pages = generatePages();

    return (
        <div className="flex flex-col items-center gap-4 mt-10">
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
                {/* Previous Button */}
                <PageBtn
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    icon={<ChevronLeft className="w-4 h-4" />}
                />

                {/* Page Numbers */}
                {pages.map((p, idx) =>
                    p === "DOTS" ? (
                        <div key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    ) : (
                        <PageBtn
                            key={p}
                            label={String(p)}
                            onClick={() => onPageChange(Number(p))}
                            active={currentPage === p}
                        />
                    )
                )}

                {/* Next Button */}
                <PageBtn
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    icon={<ChevronRight className="w-4 h-4" />}
                />
            </nav>

            {/* Info Text */}
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                Үр дүн: <span className="text-slate-900 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span>
                {" - "}
                <span className="text-slate-900 dark:text-slate-200">{Math.min(currentPage * pageSize, totalItems)}</span>
                {" / "}
                {totalItems}
            </p>
        </div>
    );
}

// Internal Button Component for cleaner JSX
function PageBtn({
    label,
    onClick,
    disabled,
    active,
    icon,
}: {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || active}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center
        ${active
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105"
                    : disabled
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-400 hover:text-teal-500 active:scale-95"
                }`}
        >
            {icon || label}
        </button>
    );
}