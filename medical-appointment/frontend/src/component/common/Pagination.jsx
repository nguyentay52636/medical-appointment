import React from 'react';

/**
 * Reusable Pagination Component
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalItems - Total count of items
 * @param {number} pageSize - Number of items per page
 * @param {function} onPageChange - Callback when page changes (newPage) => void
 * @param {function} [onPageSizeChange] - Optional callback when page size changes (newSize) => void
 * @param {number[]} [pageSizeOptions] - List of available page size options
 * @param {string} [itemName] - Label of item (e.g. "bác sĩ", "lịch hẹn", "bệnh nhân")
 */
export default function Pagination({
    currentPage = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
    itemName = 'mục'
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    // Calculate display range
    const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

    // Generate page numbers with ellipses
    const getPageNumbers = () => {
        const pages = [];
        const maxVisibleButtons = 5;

        if (totalPages <= maxVisibleButtons) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            let start = Math.max(2, safeCurrentPage - 1);
            let end = Math.min(totalPages - 1, safeCurrentPage + 1);

            if (safeCurrentPage <= 3) {
                end = 4;
            } else if (safeCurrentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) {
                pages.push('ellipsis-start');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('ellipsis-end');
            }

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };

    if (totalItems <= 0) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none border-t border-slate-100 mt-2">
            {/* Left: Summary and Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                <span>
                    Hiển thị <strong className="font-bold text-slate-800">{startIndex}</strong> - <strong className="font-bold text-slate-800">{endIndex}</strong> trong tổng số <strong className="font-bold text-slate-800">{totalItems}</strong> {itemName}
                </span>

                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-slate-200">
                        <span className="text-slate-500 text-xs">Mỗi trang:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-400 transition"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size} / trang
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right: Pagination Controls */}
            <div className="flex items-center gap-1">
                {/* First Page Button */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={safeCurrentPage === 1}
                    title="Về trang đầu"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-xs border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                    <i className="fas fa-angle-double-left"></i>
                </button>

                {/* Previous Page Button */}
                <button
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    title="Trang trước"
                    className="px-2.5 h-8 flex items-center gap-1 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-xs font-semibold border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                    <i className="fas fa-chevron-left text-[10px]"></i>
                    <span className="hidden sm:inline">Trước</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1 mx-0.5">
                    {getPageNumbers().map((item, idx) => {
                        if (typeof item === 'string') {
                            return (
                                <span
                                    key={`${item}-${idx}`}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs"
                                >
                                    •••
                                </span>
                            );
                        }

                        const isActive = item === safeCurrentPage;
                        return (
                            <button
                                key={item}
                                onClick={() => onPageChange(item)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center shadow-sm ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {/* Next Page Button */}
                <button
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    title="Trang kế tiếp"
                    className="px-2.5 h-8 flex items-center gap-1 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-xs font-semibold border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                    <span className="hidden sm:inline">Sau</span>
                    <i className="fas fa-chevron-right text-[10px]"></i>
                </button>

                {/* Last Page Button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    title="Đến trang cuối"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-xs border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                    <i className="fas fa-angle-double-right"></i>
                </button>
            </div>
        </div>
    );
}
