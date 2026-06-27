// StarRating Component
import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  max = 5,
  interactive = false,
  onChange = null,
  size = 'md',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const handleClick = (val) => {
    if (interactive && onChange) {
      onChange(val);
    }
  };

  const handleMouseEnter = (val) => {
    if (interactive) {
      setHoverRating(val);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const stars = [];
  const activeRating = hoverRating || rating;

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= activeRating;
    const isHalf = !interactive && !isFilled && (i - 0.5) <= rating;

    stars.push(
      <span
        key={i}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        className={`${interactive ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''}`}
      >
        <Star
          size={sizes[size]}
          className={`transition-colors duration-100 ${
            isFilled 
              ? 'fill-amber-400 text-amber-400' 
              : isHalf 
                ? 'fill-amber-400/50 text-amber-400' 
                : 'fill-transparent text-neutral-300'
          }`}
        />
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {stars}
    </div>
  );
};

export default StarRating;
