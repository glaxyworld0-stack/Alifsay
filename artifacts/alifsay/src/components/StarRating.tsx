import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const iconClass = `${iconSizes[size]} text-secondary fill-secondary`;
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={iconClass} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className={iconClass} />);
      } else {
        stars.push(<Star key={i} className={`${iconSizes[size]} text-muted fill-muted`} />);
      }
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {renderStars()}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
