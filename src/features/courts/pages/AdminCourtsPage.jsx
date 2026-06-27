// AdminCourtsPage Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { courtRepository, venueRepository } from '../../../repositories';
import CourtCard from '../components/CourtCard';
import { Plus, Building, Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';

export const AdminCourtsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Load admin venues
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['admin-venues-for-courts', currentUser?.uid],
    queryFn: () => venueRepository.getAllVenues(),
    enabled: !!currentUser?.uid
  });

  const [selectedVenueId, setSelectedVenueId] = useState('');

  useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  // Load courts
  const { data: courts = [], isLoading: courtsLoading, isError, refetch } = useQuery({
    queryKey: ['admin-courts', selectedVenueId],
    queryFn: () => courtRepository.getCourtsByVenue(selectedVenueId),
    enabled: !!selectedVenueId
  });

  const handleToggleMaintenance = async (courtId, currentStatus) => {
    try {
      await courtRepository.toggleMaintenance(courtId, currentStatus);
      refetch();
    } catch (err) {
      console.error('Failed to change maintenance status:', err);
    }
  };

  const handleDelete = async (courtId) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        await courtRepository.deleteCourt(courtId);
        refetch();
      } catch (err) {
        console.error('Failed to delete court:', err);
      }
    }
  };

  const handleEdit = (courtId) => {
    navigate(`/dashboard/admin/courts/form/${courtId}`);
  };

  if (venuesLoading) return <LoadingCard message="Loading venues config..." />;

  return (
    <div className="space-y-6 text-slate-350 select-none">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Courts Console</h2>
          <p className="text-xs text-slate-600 mt-1">Configure surfaces, dimensions, capacities, and slot pricing rules.</p>
        </div>

        {selectedVenueId && (
          <Link to={`/dashboard/admin/courts/form?venueId=${selectedVenueId}`}>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
              Add New Court
            </Button>
          </Link>
        )}
      </div>

      {/* Selector row */}
      {venues.length > 1 && (
        <div className="flex items-center gap-3 bg-slate-50/20 p-4 border border-slate-200 rounded-xl max-w-md">
          <Building size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Select Venue:</span>
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Courts display grid */}
      {!selectedVenueId ? (
        <p className="text-xs font-semibold text-slate-500 text-center py-8">Create a venue first to start listing courts.</p>
      ) : courtsLoading ? (
        <LoadingCard message="Loading courts list..." />
      ) : isError ? (
        <ErrorState message="Failed to load courts details." />
      ) : courts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 border border-dashed border-slate-200 rounded-xl text-slate-500 font-medium max-w-md mx-auto">
          <Landmark size={36} className="text-slate-600 mb-3" />
          <p className="text-sm">No courts listed for this venue.</p>
          <p className="text-xs text-slate-500 mt-0.5">Click "Add New Court" to begin slot allocations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              isAdmin={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleMaintenance={handleToggleMaintenance}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourtsPage;
