// PaymentsPage Component
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingRepository } from '../../../repositories';
import { 
  CreditCard, DollarSign, RefreshCw, AlertTriangle, 
  Search, ArrowUpRight, CheckCircle2, XCircle, Ban 
} from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { format, parseISO } from 'date-fns';

export const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundTargetId, setRefundTargetId] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState('Pending Auto-Transfer');

  // Fetch all platform bookings / payments
  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ['admin-all-payments'],
    queryFn: () => bookingRepository.getAllBookings()
  });

  const handleInitiateRefund = async () => {
    if (!refundTargetId) return;
    try {
      await bookingRepository.cancelBooking(refundTargetId, 'Admin Refund Triggered');
      queryClient.invalidateQueries(['admin-all-payments']);
      setRefundTargetId(null);
      alert('Transaction Cancellation: Booking cancelled and refund processed.');
    } catch (err) {
      alert(err.message || 'Refund processing failed.');
    }
  };

  const handleInstantPayout = async () => {
    setPayoutLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setPayoutStatus('Disbursed via IMPSO');
    setPayoutLoading(false);
    alert('Bank Payout: instant payout successfully sent to venue node accounts.');
  };

  // Calculations
  const metrics = useMemo(() => {
    let gross = 0;
    let refunded = 0;
    let cancelledCount = 0;
    
    bookings.forEach(b => {
      if (b.status === 'confirmed' || b.paymentStatus === 'paid') {
        gross += b.totalAmount;
      }
      if (b.status === 'cancelled') {
        refunded += b.refundAmount || 0;
        cancelledCount++;
      }
    });

    const platformFees = Math.round(gross * 0.10); // 10% platform fee
    const netPayout = Math.max(0, gross - refunded - platformFees);

    return { gross, platformFees, refunded, netPayout, cancelledCount };
  }, [bookings]);

  // Filters
  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => {
        const matchesSearch = 
          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.venueName.toLowerCase().includes(searchQuery.toLowerCase());

        const isCancelled = b.status === 'cancelled';
        const isRefunded = isCancelled && b.refundStatus === 'paid';
        
        let matchesStatus = true;
        if (statusFilter === 'completed') {
          matchesStatus = b.status === 'confirmed' && b.paymentStatus === 'paid';
        } else if (statusFilter === 'refunded') {
          matchesStatus = isRefunded;
        } else if (statusFilter === 'cancelled') {
          matchesStatus = isCancelled && !isRefunded;
        }

        return matchesSearch && matchesStatus;
      });
  }, [bookings, searchQuery, statusFilter]);

  if (isLoading) return <LoadingCard message="Loading financial ledger..." />;
  if (isError) return <ErrorState message="Could not compile payments summaries." />;

  return (
    <div className="space-y-6 text-slate-700 select-none pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payments & Escrow Logs</h2>
        <p className="text-xs text-slate-600 mt-1">Review gross booking values, platform commissions (10%), refunds, and scheduled vendor payouts.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Gross Volume</span>
          <span className="block text-lg font-black text-slate-900">₹{metrics.gross}</span>
          <span className="block text-[9px] text-slate-500 font-semibold">Total processed payments</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">ZSports Fee (10%)</span>
          <span className="block text-lg font-black text-primary">₹{metrics.platformFees}</span>
          <span className="block text-[9px] text-slate-500 font-semibold">Platform usage commission</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Refunded Volume</span>
          <span className="block text-lg font-black text-accent-red">₹{metrics.refunded}</span>
          <span className="block text-[9px] text-slate-500 font-semibold">Returned to players</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Escrow Net Payouts</span>
          <span className="block text-lg font-black text-emerald-500">₹{metrics.netPayout}</span>
          <span className="block text-[9px] text-slate-500 font-semibold">Due to venue operators</span>
        </div>
      </div>

      {/* Payout & Payout Trigger block */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-w-5xl">
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Vendor Settlements Distribution</h3>
          <p className="text-2xs text-slate-600 leading-relaxed max-w-lg">
            Payout balance of <strong className="text-emerald-500">₹{metrics.netPayout}</strong> is queued. Standard payouts disburse every Sunday at midnight.
          </p>
          <div className="flex gap-4 text-3xs font-semibold text-slate-500 pt-1">
            <span>Destination: HDFC ESCROW A/C (...8892)</span>
            <span>Status: <span className="text-primary font-bold">{payoutStatus}</span></span>
          </div>
        </div>

        {payoutStatus.includes('Pending') && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleInstantPayout}
            loading={payoutLoading}
            leftIcon={<ArrowUpRight size={14} />}
          >
            Trigger Payout
          </Button>
        )}
      </div>

      {/* Transaction Records List */}
      <div className="space-y-4 max-w-5xl">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transaction Records</h3>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search ref, customer, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-2xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 self-start md:self-auto select-none">
            {['all', 'completed', 'refunded', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 border rounded text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
                  statusFilter === f
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table list */}
        {filteredBookings.length === 0 ? (
          <p className="text-xs font-semibold text-slate-500 py-8 text-center bg-slate-50/10 border border-slate-200 rounded-xl border-dashed">
            No transaction records found matching filters.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-350 font-medium">
              <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-6 py-3.5 text-left">Invoice Ref</th>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-left">Venue Center</th>
                  <th className="px-6 py-3.5 text-left">Gross Fee</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855 bg-white/35">
                {filteredBookings.map((b) => {
                  const isCancelled = b.status === 'cancelled';
                  const isRefunded = isCancelled && b.refundStatus === 'paid';
                  return (
                    <tr key={b.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-900 font-bold block">{b.paymentId || `pay-${b.bookingRef}`}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">REF: {b.bookingRef}</span>
                      </td>
                      <td className="px-6 py-4 truncate font-semibold text-slate-900 max-w-[130px]">{b.customerName}</td>
                      <td className="px-6 py-4 truncate text-slate-700 max-w-[150px]">{b.venueName}</td>
                      <td className="px-6 py-4 font-black text-slate-900">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        {isRefunded ? (
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            Refunded (₹{b.refundAmount})
                          </span>
                        ) : isCancelled ? (
                          <span className="text-[9px] bg-red-500/10 text-accent-red border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            Cancelled (No Refund)
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCancelled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRefundTargetId(b.id)}
                            className="text-accent-red hover:bg-red-950/20 !p-1.5 shrink-0"
                            aria-label="Cancel and Refund Transaction"
                          >
                            <Ban size={13} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!refundTargetId}
        onConfirm={handleInitiateRefund}
        onCancel={() => setRefundTargetId(null)}
        title="Trigger Escrow Refund"
        message="Are you sure you want to cancel this booking and trigger an escrow refund? This will return the eligible amount to the customer's credit card and set the booking slots back to available."
        confirmLabel="Initiate Refund"
        danger
      />
    </div>
  );
};

export default PaymentsPage;
