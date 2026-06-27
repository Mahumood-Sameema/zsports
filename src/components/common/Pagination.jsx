// Pagination Component
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 my-6 ${className}`}>
      {/* Prev */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="!p-1.5"
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Page Numbers */}
      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <Button
            key={p}
            variant={isCurrent ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
            className="w-8 h-8 !p-0 font-semibold"
          >
            {p}
          </Button>
        );
      })}

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="!p-1.5"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
