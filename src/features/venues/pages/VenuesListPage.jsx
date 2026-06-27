// VenuesListPage Component
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useVenues from '../hooks/useVenues';
import useDebounce from '../../../hooks/useDebounce';
import { useAuth } from '../../auth/hooks/useAuth';
import VenueCard from '../components/VenueCard';
import VenueMap from '../components/VenueMap';
import SearchInput from '../../../components/common/SearchInput';
import Button from '../../../components/common/Button';
import SkeletonCard from '../../../components/common/SkeletonCard';
import EmptyState from '../../../components/common/EmptyState';
import FilterChip from '../../../components/common/FilterChip';
import Pagination from '../../../components/common/Pagination';
import { SlidersHorizontal, Map, List, Search } from 'lucide-react';

const ALL_SPORTS = [
  'Football Turf', 'Cricket Turf', 'Cricket Nets', 'Badminton', 
  'Tennis', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash', 'Swimming'
];

const ALL_AMENITIES = ['Parking', 'Changing Rooms', 'Floodlights', 'Cafeteria', 'Restrooms', 'WiFi'];

export const VenuesListPage = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const favoriteIds = userProfile?.favoriteVenueIds || [];

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchText, 300);

  // States
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || '');
  const [priceMax, setPriceMax] = useState(parseInt(searchParams.get('priceMax')) || 2000);
  const [selectedAmenities, setSelectedAmenities] = useState(searchParams.getAll('amenities') || []);
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('rating')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const handleFavoriteToggle = async (venueId) => {
    if (!currentUser) {
      alert('Please log in to add venues to your favorites.');
      return;
    }
    try {
      const isAlreadyFav = favoriteIds.includes(venueId);
      const updatedFavorites = isAlreadyFav
        ? favoriteIds.filter(id => id !== venueId)
        : [...favoriteIds, venueId];
      await updateProfile({ favoriteVenueIds: updatedFavorites });
    } catch (err) {
      alert(err.message || 'Failed to update favorite.');
    }
  };

  // Sync state to URL params
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedSport) params.sport = selectedSport;
    if (priceMax < 2000) params.priceMax = priceMax.toString();
    if (minRating > 0) params.rating = minRating.toString();
    if (sortBy !== 'relevance') params.sortBy = sortBy;
    
    // Add amenities
    const updatedParams = new URLSearchParams(params);
    selectedAmenities.forEach(a => updatedParams.append('amenities', a));
    
    setSearchParams(updatedParams);
    setCurrentPage(1); // reset to page 1 on filter change
  }, [debouncedSearch, selectedSport, priceMax, selectedAmenities, minRating, sortBy, setSearchParams]);

  // Fetch data
  const { data: venues = [], isLoading } = useVenues({
    city: 'Mumbai', // default scoped city
    search: debouncedSearch,
    sport: selectedSport,
    priceMax: priceMax,
    rating: minRating,
    amenities: selectedAmenities
  });

  // Client sorting
  const sortedVenues = [...venues].sort((a, b) => {
    if (sortBy === 'price-low') {
      return 300 - 300; // Mock rate delta
    }
    if (sortBy === 'rating') {
      return (b.avgRating || 0) - (a.avgRating || 0);
    }
    return b.totalBookings - a.totalBookings; // relevance / bookings
  });

  // Client pagination
  const totalPages = Math.ceil(sortedVenues.length / pageSize);
  const paginatedVenues = sortedVenues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedSport('');
    setPriceMax(2000);
    setSelectedAmenities([]);
    setMinRating(0);
    setSortBy('relevance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      <div className="flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">Discover Venues</h2>
            <p className="text-xs text-neutral-500 mt-1">Book premium sports courts and turfs in Mumbai.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<List size={14} />}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Map size={14} />}
              onClick={() => setViewMode('map')}
            >
              Map
            </Button>
          </div>
        </div>

        {/* Filter and Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panel */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-6 h-fit">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-widest">
                <SlidersHorizontal size={14} />
                Filters
              </span>
              <button 
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-primary hover:underline uppercase"
              >
                Clear All
              </button>
            </div>

            {/* Sport Pills */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sport Category</span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SPORTS.map((sport) => (
                  <FilterChip
                    key={sport}
                    label={sport}
                    selected={selectedSport === sport}
                    onClick={() => setSelectedSport(selectedSport === sport ? '' : sport)}
                  />
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Max Hourly Rate (₹{priceMax})
              </span>
              <input
                type="range"
                min="300"
                max="2000"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                <span>₹300</span>
                <span>₹2000+</span>
              </div>
            </div>

            {/* Amenities Checkbox */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Amenities</span>
              <div className="space-y-2">
                {ALL_AMENITIES.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-xs font-semibold text-neutral-650 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Select */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Min Rating</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full text-xs font-semibold rounded border border-neutral-200 py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white text-neutral-700"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Sort row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm justify-between">
              <SearchInput
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onClear={() => setSearchText('')}
                placeholder="Search by venue name or address..."
                className="max-w-md"
              />

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold rounded border border-neutral-200 py-1.5 px-3 focus:outline-none focus:ring-primary bg-white text-neutral-700"
                >
                  <option value="relevance">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>

            {/* Loader / Results display */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : venues.length === 0 ? (
              <EmptyState 
                icon={Search} 
                title="No venues found" 
                message="Try adjusting your filter parameters or search terms to find match slots." 
                action={{ label: 'Clear Filters', onClick: handleClearFilters }}
              />
            ) : viewMode === 'list' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedVenues.map((venue) => (
                    <VenueCard 
                      key={venue.id} 
                      venue={venue} 
                      isFavorited={favoriteIds.includes(venue.id)}
                      onFavorite={handleFavoriteToggle}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </>
            ) : (
              /* Map View */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {venues.map((venue) => (
                    <VenueMap 
                      key={venue.id} 
                      location={venue.location} 
                      address={venue.address} 
                      name={venue.name} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuesListPage;
