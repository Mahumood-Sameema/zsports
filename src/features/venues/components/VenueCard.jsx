// VenueCard Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin } from 'lucide-react';
import SportBadge from './SportBadge';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/hooks/useAuth';

export const VenueCard = ({
  venue,
  showDistance = false,
  onFavorite = null,
  isFavorited = false,
}) => {
  const { currentUser } = useAuth();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(venue.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md flex flex-col h-full group"
    >
      <Link to={`/venues/${venue.id}`} className="flex flex-col h-full">
        {/* Cover Image aspect 16:9 */}
        <div className="relative w-full aspect-video overflow-hidden bg-neutral-100 shrink-0">
          <img
            src={venue.coverImageUrl}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Favorite button overlay */}
          {currentUser && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-neutral-500 hover:text-accent-red transition-colors shadow-sm focus:outline-none z-10"
              aria-label="Add to favorites"
            >
              <Heart
                size={16}
                className={isFavorited ? 'fill-accent-red text-accent-red' : 'text-neutral-500'}
              />
            </button>
          )}

          {/* Featured tag */}
          {venue.isFeatured && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white uppercase tracking-wider shadow">
              Featured
            </span>
          )}
        </div>

        {/* Details area */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-neutral-800 line-clamp-1 group-hover:text-primary transition-colors">
                {venue.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-0.5 shrink-0 text-amber-500 font-bold text-xs">
                <Star size={13} className="fill-current" />
                <span>{venue.avgRating || 'New'}</span>
              </div>
            </div>

            {/* Address / Location details */}
            <p className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{venue.city}</span>
              {showDistance && venue.distance && (
                <span className="text-[10px] text-primary bg-primary-light px-1 rounded ml-1">
                  {venue.distance.toFixed(1)} km
                </span>
              )}
            </p>

            <div className="text-[11px] font-semibold text-neutral-550 mb-3 flex flex-col gap-0.5 leading-none select-none">
              <div>
                Total Courts: <span className="font-bold text-neutral-850">{venue.courtCount ?? 0}</span>
              </div>
              <div className="flex gap-2 text-[10px] mt-0.5 font-bold">
                <span className="text-emerald-600">{venue.activeCourtCount ?? 0} Active</span>
                <span className="text-amber-600">{venue.maintenanceCourtCount ?? 0} Maint.</span>
              </div>
            </div>

            {/* Sports badge line */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {venue.sports?.slice(0, 3).map((sport, idx) => (
                <SportBadge key={idx} sport={sport} />
              ))}
              {venue.sports?.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-500">
                  +{venue.sports.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Footer Pricing */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[10px] text-neutral-400 block font-semibold uppercase tracking-wider">Starting at</span>
              <span className="text-sm font-bold text-neutral-850">₹300<span className="text-[10px] font-normal text-neutral-500">/hr</span></span>
            </div>
            <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200">
              Book Now &rarr;
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VenueCard;
