// StaffSlotOverridePage Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { venueRepository, courtRepository, slotRepository } from '../../../repositories';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import Modal from '../../../components/common/Modal';
import Tooltip from '../../../components/common/Tooltip';
import { Settings2, Clock, Hammer, AlertOctagon } from 'lucide-react';
import { format } from 'date-fns';

export const StaffSlotOverridePage = () => {
  const { currentUser } = useAuth();
  const userVenueId = currentUser?.venueId;

  // State
  const [selectedVenueId, setSelectedVenueId] = useState(userVenueId || 'venue-1');
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Block Modal states
  const [blockOpen, setBlockOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load venues (only if user does not have a fixed venueId)
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const list = await venueRepository.getVenues();
        setVenues(list);
        if (!userVenueId && list.length > 0) {
          setSelectedVenueId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadVenues();
  }, [userVenueId]);

  // Load venue courts
  useEffect(() => {
    if (!selectedVenueId) return;
    const loadCourts = async () => {
      try {
        const list = await courtRepository.getCourtsByVenue(selectedVenueId);
        const activeCourts = list.filter(c => c.isActive);
        setCourts(activeCourts);
        if (activeCourts.length > 0) {
          setSelectedCourtId(activeCourts[0].id);
        } else {
          setSelectedCourtId('');
          setSlots([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCourts();
  }, [selectedVenueId]);

  // Load slots
  const reloadSlots = async () => {
    if (!selectedCourtId || !targetDate) return;
    setSlotsLoading(true);
    try {
      const list = await slotRepository.getAvailableSlots(selectedCourtId, targetDate);
      setSlots(list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    reloadSlots();
  }, [selectedCourtId, targetDate]);

  const handleSlotClick = (slot) => {
    if (slot.status === 'booked') {
      alert('This slot is already booked by a customer. Cannot override.');
      return;
    }

    if (slot.status === 'blocked') {
      // Unblock slot
      if (window.confirm('Do you want to unblock this slot and make it available?')) {
        setSubmitting(true);
        slotRepository.unblockSlot(slot.id)
          .then(() => { reloadSlots(); alert('Slot unblocked successfully.'); })
          .catch(err => alert(err.message))
          .finally(() => setSubmitting(false));
      }
    } else {
      // Block slot
      setTargetSlot(slot);
      setBlockReason('Maintenance');
      setBlockOpen(true);
    }
  };

  const handleConfirmBlock = async () => {
    if (!targetSlot || !blockReason) return;
    setSubmitting(true);
    try {
      await slotRepository.blockSlot(targetSlot.id, blockReason);
      setBlockOpen(false);
      reloadSlots();
      alert('Slot blocked successfully.');
    } catch (err) {
      alert(err.message || 'Block failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Slot Overrides Console</h2>
        <p className="text-xs text-slate-600 mt-1">Block specific court times for maintenance, reservations, or blackouts.</p>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-50/20 p-4 border border-slate-200 rounded-xl">
        {!userVenueId && venues.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-450">Venue:</span>
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

        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-450">Court:</span>
          <select
            value={selectedCourtId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
            className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
          >
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.sport})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-450">Date:</span>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
          />
        </div>
      </div>

      {/* Override Grid */}
      {slotsLoading ? (
        <LoadingCard message="Loading slots grid..." />
      ) : slots.length === 0 ? (
        <p className="text-xs font-semibold text-slate-500 text-center py-6">No slots generated for this court date.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Configure Slots States</h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Click slot to toggle block/unblock state</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {slots.map(s => {
              const isBlocked = s.status === 'blocked';
              const isBooked = s.status === 'booked';
              const isHold = s.status === 'on_hold';

              let style = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-primary';
              if (isBooked) style = 'bg-slate-50 text-slate-650 border-slate-200 cursor-not-allowed opacity-50';
              if (isHold) style = 'bg-amber-950/20 text-amber-500 border-amber-900/50 cursor-not-allowed';
              if (isBlocked) style = 'bg-rose-950/30 text-rose-400 border-rose-900 ring-1 ring-rose-900 hover:bg-rose-950/40';

              const content = (
                <button
                  key={s.id}
                  disabled={isBooked || isHold || submitting}
                  onClick={() => handleSlotClick(s)}
                  className={`flex flex-col items-center justify-center p-3 rounded border text-xs font-bold transition-all shadow-xs h-16 w-full ${style}`}
                >
                  <span>{s.startTime}</span>
                  <span className="text-[9px] font-semibold mt-1">
                    {isBooked ? 'Booked' : isBlocked ? 'Blocked' : 'Available'}
                  </span>
                </button>
              );

              if (isBlocked && s.notes) {
                return (
                  <Tooltip key={s.id} content={`Reason: ${s.notes}`} position="top">
                    {content}
                  </Tooltip>
                );
              }

              return content;
            })}
          </div>
        </div>
      )}

      {/* Block reason Dialog modal */}
      <Modal isOpen={blockOpen} onClose={() => setBlockOpen(false)} title="Block Slot">
        <div className="space-y-4 text-neutral-600 select-none">
          <p className="text-xs text-neutral-500 leading-relaxed font-normal">
            Enter a reason for blocking this slot. Blocked slots will appear as unavailable for player bookings.
          </p>

          <Input
            label="Block Reason"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="e.g. Maintenance, Corporate Reservation, Holiday Closure"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmBlock} loading={submitting}>
              Block Slot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffSlotOverridePage;
