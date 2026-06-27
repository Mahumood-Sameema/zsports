// AdminVenuesPage Component
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { venueRepository, courtRepository, slotRepository, bookingRepository } from '../../../repositories';
import { Plus, Edit3, Eye, Trash2, Power, PowerOff, Building2, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import SearchInput from '../../../components/common/SearchInput';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

export const AdminVenuesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  // Load venues managed by this admin
  const { data: venues = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-venues', currentUser?.uid],
    queryFn: () => venueRepository.getAllVenues(),
    enabled: !!currentUser?.uid
  });

  const handleDeactivate = async (venueId, currentStatus) => {
    try {
      await venueRepository.updateVenue(venueId, { isActive: !currentStatus });
      refetch();
    } catch (err) {
      console.error('Failed to change venue state:', err);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    try {
      const courtsList = await courtRepository.getCourtsByVenue(venueId);
      const futureSlotsCount = await slotRepository.getFutureSlotsCount(venueId);
      const activeBookingsCount = await bookingRepository.getActiveBookingsCount(venueId);

      if (courtsList.length > 0 || futureSlotsCount > 0 || activeBookingsCount > 0) {
        alert(
          `This venue cannot be deleted because it contains:\n` +
          `• ${courtsList.length} Associated Court(s)\n` +
          `• ${futureSlotsCount} Future Slot(s)\n` +
          `• ${activeBookingsCount} Active Booking(s)\n\n` +
          `Please remove, transfer, or archive these records before deleting the venue.`
        );
        return;
      }

      const confirmDelete = window.confirm('Are you sure you want to delete this venue?');
      if (!confirmDelete) return;

      await venueRepository.deleteVenue(venueId);
      refetch();
    } catch (err) {
      console.error('Failed to delete venue:', err);
      alert('Failed to delete venue.');
    }
  };

  const filteredVenues = venues.filter(v => {
    const q = search.toLowerCase();
    const nameMatch = v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q);
    const cityMatch = cityFilter === 'all' || v.city.toLowerCase() === cityFilter.toLowerCase();
    return nameMatch && cityMatch;
  });

  if (isLoading) return <LoadingCard message="Loading venues..." />;
  if (isError) return <ErrorState message="Failed to load admin venues." />;

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Venue Console</h2>
          <p className="text-xs text-slate-600 mt-1">Manage, edit, and configure your listed sports facilities.</p>
        </div>
        
        <Link to="/dashboard/admin/venues/new">
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            Add New Venue
          </Button>
        </Link>
      </div>

      {/* Search and filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/20 p-4 border border-slate-200 rounded-xl">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search venues by name..."
          className="max-w-md bg-white border-slate-200 focus:border-primary text-slate-900"
        />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-600 font-medium">City:</span>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
          >
            <option value="all">All Cities</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
          </select>
        </div>
      </div>

      {/* Venues Table */}
      {venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-600">
          <Building2 size={48} className="text-primary mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No venues found.</h3>
          <p className="text-xs text-slate-500 mb-6">Create your first venue to configure courts and slots.</p>
          <Link to="/dashboard/admin/venues/form">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Create Venue
            </Button>
          </Link>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 border border-dashed border-slate-200 rounded-xl text-slate-500">
          <Building2 size={36} className="text-slate-600 mb-3" />
          <p className="text-sm font-semibold">No matching venues found.</p>
          <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600 select-none">
              <tr>
                <th className="px-6 py-3.5 text-left">Venue Name</th>
                <th className="px-6 py-3.5 text-left">Location</th>
                <th className="px-6 py-3.5 text-left">Sports Offered</th>
                <th className="px-6 py-3.5 text-left">Total Bookings</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/35 font-medium">
              {filteredVenues.map((v) => (
                <tr key={v.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 truncate max-w-[200px] font-bold text-slate-900">
                    <Link to={`/dashboard/admin/venues/${v.id}`} className="hover:underline hover:text-primary transition-all">
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[120px]">
                    {v.city}, {v.state}
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {v.sports?.slice(0, 3).map((sp, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                          {sp}
                        </span>
                      ))}
                      {v.sports?.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{v.sports.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {v.totalBookings || 0} bookings
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={v.isActive ? 'available' : 'blocked'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/venues/${v.id}`}>
                        <Button variant="ghost" size="sm" className="!p-1.5 text-slate-600 hover:text-slate-900" aria-label="View Public Page">
                          <Eye size={14} />
                        </Button>
                      </Link>
                      <Link to={`/dashboard/admin/venues/${v.id}`}>
                        <Button variant="ghost" size="sm" className="!p-1.5 text-slate-600 hover:text-slate-900" aria-label="Manage Venue">
                          <Sliders size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(v.id, v.isActive)}
                        className={`!p-1.5 ${v.isActive ? 'text-accent-green hover:text-green-400' : 'text-slate-500 hover:text-slate-700'}`}
                        aria-label={v.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {v.isActive ? <Power size={14} /> : <PowerOff size={14} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVenue(v.id)}
                        className="!p-1.5 text-accent-red hover:text-red-650"
                        aria-label="Delete Venue"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVenuesPage;
