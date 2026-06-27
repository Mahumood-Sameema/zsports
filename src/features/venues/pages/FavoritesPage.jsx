// FavoritesPage Component
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { venueRepository } from '../../../repositories';
import { Heart, Search, MapPin, Star, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import StarRating from '../../../components/common/StarRating';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

export const FavoritesPage = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();

  // Fetch all active venues
  const { data: venues = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['all-venues'],
    queryFn: () => venueRepository.getVenues()
  });

  const favoriteIds = userProfile?.favoriteVenueIds || [];

  // Filter venues matching favorite ids
  const favoriteVenues = venues.filter(v => favoriteIds.includes(v.id));

  const handleRemoveFavorite = async (venueId) => {
    try {
      const updatedFavorites = favoriteIds.filter(id => id !== venueId);
      await updateProfile({ favoriteVenueIds: updatedFavorites });
    } catch (err) {
      alert(err.message || 'Failed to remove favorite.');
    }
  };

  if (isLoading) return <LoadingCard message="Loading your favorited venues..." />;
  if (isError) return <ErrorState message="Could not load venues list." />;

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto text-neutral-600 font-normal pb-12">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <Heart className="text-accent-red fill-accent-red h-6 w-6 shrink-0" />
          <span>Favorites</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Keep track of your favorite turf arenas and match grounds. Quick book slots directly.
        </p>
      </div>

      {favoriteVenues.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="h-12 w-12 bg-rose-50 text-accent-red rounded-full flex items-center justify-center border border-rose-100">
            <Heart size={22} className="fill-accent-red/20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-800">No favorite venues saved</h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Tap the heart icon when browsing venues to add them to your bookmarks list.
            </p>
          </div>
          <Link to="/venues">
            <Button variant="primary" size="sm" leftIcon={<Search size={14} />}>
              Browse Venues
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoriteVenues.map((venue) => (
            <div 
              key={venue.id} 
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Image & rating badge */}
                <div className="relative h-44 w-full bg-slate-100">
                  <img 
                    src={venue.coverImageUrl} 
                    alt={venue.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md border border-neutral-100 flex items-center gap-1 shadow-xs">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-2xs font-extrabold text-neutral-850">{venue.avgRating || 'New'}</span>
                    <span className="text-3xs text-neutral-400 font-semibold">({venue.reviewCount || 0})</span>
                  </div>
                </div>

                {/* Info details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 hover:text-primary transition-colors">
                      <Link to={`/venues/${venue.id}`}>{venue.name}</Link>
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin size={13} className="text-neutral-400 shrink-0" />
                      {venue.address}, {venue.city}
                    </p>
                  </div>

                  {/* Sports tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {venue.sports.map((sport) => (
                      <span 
                        key={sport} 
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-slate-100 border border-slate-200 text-neutral-600 uppercase tracking-wide"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-neutral-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFavorite(venue.id)}
                  leftIcon={<Trash2 size={13} />}
                  className="text-neutral-500 border-neutral-250 hover:bg-red-50 hover:text-accent-red hover:border-red-200"
                >
                  Remove
                </Button>

                <Link to={`/venues/${venue.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight size={13} />}
                  >
                    Book Venue
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
