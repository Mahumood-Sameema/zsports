// CustomerLookupPage Component
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { dbMock } from '../../../repositories/mock/dbMock';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import SearchInput from '../../../components/common/SearchInput';
import StatusBadge from '../../../components/common/StatusBadge';
import { Search, User, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerLookupPage = () => {
  const [queryText, setQueryText] = useState('');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!queryText) return;
    setSearched(true);

    const users = dbMock.getTable('users');
    const bookingsTable = dbMock.getTable('bookings');

    // 1. Search for customer by email, phone, or name
    const q = queryText.toLowerCase().trim();
    const matched = users.find(
      u => u.email.toLowerCase() === q || u.phone === q || u.displayName.toLowerCase().includes(q)
    );

    if (matched) {
      setProfile(matched);
      // 2. Fetch customer bookings
      const list = bookingsTable.filter(b => b.customerId === matched.uid);
      setBookings(list.sort((a, b) => b.date.localeCompare(a.date)));
    } else {
      setProfile(null);
      setBookings([]);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Lookup Console</h2>
        <p className="text-xs text-slate-600 mt-1">Search guest profiles by email, phone, or names to pull booking records.</p>
      </div>

      {/* Toolbar Search */}
      <div className="flex gap-2 max-w-lg bg-slate-50/20 p-4 border border-slate-200 rounded-xl">
        <SearchInput
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onClear={() => setQueryText('')}
          placeholder="Enter email, phone, or customer name..."
          className="bg-white border-slate-200 focus:border-primary text-slate-900"
        />
        <Button onClick={handleSearch} variant="primary">
          Search
        </Button>
      </div>

      {/* Search results */}
      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          {profile ? (
            <>
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 h-fit">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-lg border border-slate-200 shadow">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{profile.displayName}</h3>
                    <span className="text-[10px] bg-primary text-white border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-1.5 inline-block select-none">
                      {profile.role}
                    </span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100" />

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} />
                    <span>{profile.phone || 'No phone number'}</span>
                  </div>
                </div>
              </div>

              {/* Bookings history */}
              <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={16} className="text-primary" />
                  Booking History ({bookings.length} reservations)
                </h3>

                {bookings.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-550 py-4">No bookings on file for this user.</p>
                ) : (
                  <div className="space-y-3.5 divide-y divide-slate-200">
                    {bookings.map((b) => (
                      <div key={b.id} className="flex justify-between items-center pt-3.5 first:pt-0 gap-4 text-xs font-semibold select-none">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{b.date} &bull; {b.startTime}-{b.endTime}</span>
                          <h4 className="text-slate-900 font-bold">{b.courtName}</h4>
                          <span className="text-[9px] text-slate-600 border border-slate-200 bg-slate-50/20 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
                            REF: {b.bookingRef}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <StatusBadge status={b.status} />
                          <Link to={`/dashboard/customer/bookings/${b.id}`}>
                            <Button variant="ghost" size="sm" className="!p-1 text-slate-500 hover:text-slate-900" aria-label="Details">
                              <ArrowRight size={14} />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="lg:col-span-3 p-8 bg-slate-50/10 border border-dashed border-slate-200 text-slate-500 font-medium text-center rounded-xl">
              <User size={36} className="text-slate-650 mx-auto mb-3" />
              <p className="text-sm">No customer profile matching search parameters found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerLookupPage;
