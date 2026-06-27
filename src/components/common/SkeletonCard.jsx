// SkeletonCard Component (Shimmer loading state)
import React from 'react';

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm flex flex-col ${className}`}>
      {/* 16:9 Image Aspect Ratio Area */}
      <div className="skeleton-shimmer w-full aspect-video" />
      
      {/* Detail Area */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Title */}
        <div className="skeleton-shimmer h-5 w-3/4 rounded" />
        
        {/* Subtitle / Location */}
        <div className="skeleton-shimmer h-4 w-1/2 rounded" />
        
        {/* Badges line */}
        <div className="flex gap-2 my-1">
          <div className="skeleton-shimmer h-4 w-16 rounded-full" />
          <div className="skeleton-shimmer h-4 w-16 rounded-full" />
          <div className="skeleton-shimmer h-4 w-16 rounded-full" />
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-neutral-100 my-1" />

        {/* Pricing / Booking Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="skeleton-shimmer h-5 w-20 rounded" />
          <div className="skeleton-shimmer h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
