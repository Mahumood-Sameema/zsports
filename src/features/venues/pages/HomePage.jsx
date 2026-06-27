// HomePage Component
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useVenues from '../hooks/useVenues';
import VenueCard from '../components/VenueCard';
import Button from '../../../components/common/Button';
import { Search, Trophy, CheckCircle2, ChevronRight, MessageSquare, Dribbble, Target, Award, Activity } from 'lucide-react';

const SPORTS = [
  { name: 'Football Turf', icon: Dribbble },
  { name: 'Cricket Nets', icon: Target },
  { name: 'Badminton', icon: Trophy },
  { name: 'Tennis', icon: Award },
  { name: 'Basketball', icon: Dribbble },
  { name: 'Volleyball', icon: Dribbble },
  { name: 'Squash', icon: Activity },
  { name: 'Swimming', icon: Activity }
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load featured and trending venues
  const { data: featured = [], isLoading: featuredLoading } = useVenues({ isFeatured: true });
  const { data: allVenues = [] } = useVenues({});

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSport) params.set('sport', selectedSport);
    if (searchQuery) params.set('search', searchQuery);
    navigate(`/venues?${params.toString()}`);
  };

  const trending = [...allVenues]
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-16 select-none bg-slate-50">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 py-20 px-4 md:px-8 text-center text-white flex flex-col items-center justify-center min-h-[500px]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/15">
            <Trophy size={14} className="text-amber-400" />
            <span>Discover & Book Premium Sports Courts</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight md:leading-none">
            Find Your Perfect Court. <br className="hidden sm:inline" /> Play Anytime, Anywhere.
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Real-time slots availability, direct online checkouts, and premium turf courts in Mumbai. Skip the phone calls, book instantly.
          </p>
        </div>

        {/* Hero Search Box */}
        <form onSubmit={handleSearch} className="mt-8 bg-white p-3 rounded-xl shadow-xl border border-neutral-100 flex flex-col md:flex-row items-center gap-3 w-full max-w-3xl">
          {/* Sport select */}
          <div className="w-full md:w-1/3">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full border-0 focus:ring-0 text-xs font-bold text-slate-900 bg-white"
              style={{ color: '#0f172a' }}
            >
              <option value="" className="text-neutral-900 bg-white">-- All Sports --</option>
              {SPORTS.map(s => (
                <option key={s.name} value={s.name} className="text-neutral-900 bg-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-neutral-200" />

          {/* Search text */}
          <div className="flex items-center gap-2 flex-grow w-full">
            <Search className="text-neutral-400 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search by venue name or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 focus:ring-0 text-xs font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full md:w-auto">
            Search Available
          </Button>
        </form>
      </section>

      {/* 2. Sport Categories Scrollable Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-neutral-900 uppercase tracking-wider">Explore by Sport</h2>
          <Link to="/venues" className="text-xs font-bold text-primary flex items-center hover:underline uppercase">
            Browse All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SPORTS.map((sp) => {
            const Icon = sp.icon;
            return (
              <Link 
                key={sp.name} 
                to={`/venues?sport=${sp.name}`}
                className="bg-white p-5 border border-neutral-200 rounded-xl shadow-xs hover:shadow hover:scale-105 transition-all text-center flex flex-col items-center justify-center text-primary hover:text-primary-dark"
              >
                <Icon size={28} className="mb-2.5" />
                <span className="text-xs font-bold text-neutral-700">{sp.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Venues */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-lg font-extrabold text-neutral-900 uppercase tracking-wider">Featured Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.slice(0, 3).map(venue => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>
      )}

      {/* 4. How It Works */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center">
            <h2 className="text-lg font-extrabold text-neutral-900 uppercase tracking-wider">How It Works</h2>
            <p className="text-xs text-neutral-500 mt-2">Book and play in 3 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
              <div className="h-12 w-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-sm font-bold text-neutral-850">Discover Facilities</h3>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">Search courts by sport, price range, city locations, and rating profiles.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
              <div className="h-12 w-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-sm font-bold text-neutral-850">Check & Hold Slots</h3>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">Select active slots, apply promo coupons, and complete checkout payments safely.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
              <div className="h-12 w-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-sm font-bold text-neutral-850">Play and Check-In</h3>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">Present your ticket QR check-in code at the reception desk and play!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending Section */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-lg font-extrabold text-neutral-900 uppercase tracking-wider">Trending Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trending.map(venue => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-lg font-extrabold text-neutral-900 uppercase tracking-wider text-center mb-4">What Our Players Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">"Booking turfs used to require calling 5 places. Now I just checkout slots in 3 clicks. The checkin QR code is super convenient!"</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">A</div>
              <div>
                <p className="text-xs font-bold text-neutral-800">Amit Verma</p>
                <p className="text-[10px] text-neutral-400">Football Enthusiast</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">"Clean badminton courts, accurate availability mapping, and very supportive staff check-in validations. Will recommend ZSports."</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">P</div>
              <div>
                <p className="text-xs font-bold text-neutral-800">Pooja Shah</p>
                <p className="text-[10px] text-neutral-400">Badminton Player</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">★★★★★</div>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">"Simulated credit card checkout order processed instantly. Great experience playing under floodlights. Highly recommended turf."</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">K</div>
              <div>
                <p className="text-xs font-bold text-neutral-800">Karan Malhotra</p>
                <p className="text-[10px] text-neutral-400">Cricket Captain</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
