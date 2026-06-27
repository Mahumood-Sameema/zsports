// CustomerDetailPage Component
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository, notificationRepository } from '../../../repositories';
import { useBookings } from '../../bookings/hooks/useBookings';
import { 
  User, Mail, Phone, Calendar, ArrowLeft, Send, 
  CheckCircle2, AlertTriangle, Clock, MapPin, BadgePercent 
} from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import StatusBadge from '../../../components/common/StatusBadge';
import { format, parseISO } from 'date-fns';

export const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sending, setSending] = useState(false);

  // 1. Fetch customer profile
  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['admin-customer-profile', customerId],
    queryFn: () => authRepository.getUserById(customerId),
    enabled: !!customerId
  });

  // 2. Fetch customer bookings
  const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useBookings(
    customerId, 
    'customer'
  );

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setSending(true);
    try {
      await notificationRepository.sendNotification(customerId, {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: 'admin_alert'
      });
      setNotifOpen(false);
      setNotifTitle('');
      setNotifMessage('');
      alert('Alert dispatch confirmation: Notification sent successfully.');
    } catch (err) {
      alert(err.message || 'Failed to dispatch notification.');
    } finally {
      setSending(false);
    }
  };

  if (profileLoading || bookingsLoading) return <LoadingCard message="Loading profile analytics..." />;
  if (profileError || bookingsError || !profile) {
    return (
      <div className="space-y-4">
        <Link to="/admin/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft size={14} /> Back to Database
        </Link>
        <ErrorState message="Could not find this customer's profile history." />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Back link */}
      <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider">
        <ArrowLeft size={14} /> Back to Database
      </Link>

      {/* Main Grid: Profile and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        
        {/* Profile details Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-5 h-fit shadow-xs">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-primary text-2xl font-black shadow-sm">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900 leading-tight">{profile.displayName}</h3>
            <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-primary text-white border border-primary/20 uppercase tracking-wide">
              {profile.role}
            </span>
          </div>

          <div className="h-[1px] bg-slate-100" />

          <div className="space-y-4 text-xs font-medium">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail size={14} className="text-slate-500" />
              <span className="truncate">{profile.email}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone size={14} className="text-slate-500" />
              <span>{profile.phone || 'No phone listed'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar size={14} className="text-slate-500" />
              <span>Joined: {profile.createdAt ? format(parseISO(profile.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          <Button
            variant="primary"
            fullWidth
            onClick={() => setNotifOpen(true)}
            leftIcon={<Send size={13} />}
          >
            Send Notification
          </Button>
        </div>

        {/* Bookings Ledger */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl space-y-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
            Reservation Ledger ({bookings.length} items)
          </h3>

          {bookings.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500 py-8 text-center">No transactions or bookings found for this customer.</p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-200">
              {bookings.map((b, idx) => (
                <div key={b.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs pt-4 first:pt-0`}>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{b.date} &bull; {b.startTime} - {b.endTime}</span>
                    <h4 className="text-slate-900 font-bold">{b.courtName}</h4>
                    <p className="text-2xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-slate-550 shrink-0" /> {b.venueName}
                    </p>
                    <span className="text-[9px] text-primary border border-slate-200 bg-slate-50/20 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                      REF ID: {b.bookingRef}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-200/40 pt-2 sm:pt-0">
                    <span className="font-extrabold text-slate-900 sm:text-right">₹{b.totalAmount}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      {b.checkedIn && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Checked-In
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Dispatch Modal */}
      <Modal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        title={`Notify ${profile.displayName}`}
      >
        <form onSubmit={handleSendNotification} className="space-y-4 text-neutral-600">
          <Input
            label="Notification Title"
            placeholder="e.g. Schedule Update: Slot adjustments"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            required
          />

          <div className="w-full">
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Notification Message
            </label>
            <textarea
              rows={4}
              placeholder="Type your message description here. This will show up in their alerts pane instantly..."
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              className="block w-full rounded border border-neutral-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setNotifOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={sending}>
              Send Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetailPage;
