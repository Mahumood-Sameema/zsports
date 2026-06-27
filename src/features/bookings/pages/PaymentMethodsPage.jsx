// PaymentMethodsPage Component
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { bookingRepository } from '../../../repositories';
import { CreditCard, Download, Receipt, ExternalLink, Calendar, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import Modal from '../../../components/common/Modal';
import { format, parseISO } from 'date-fns';

export const PaymentMethodsPage = () => {
  const { currentUser } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Query past bookings to construct transactions ledger
  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ['customer-transactions', currentUser?.uid],
    queryFn: () => bookingRepository.getBookingsByCustomer(currentUser.uid),
    enabled: !!currentUser?.uid
  });

  const handleDownloadInvoice = async (booking) => {
    setDownloadingId(booking.id);
    // Simulate generation delay
    await new Promise(r => setTimeout(r, 1200));
    setDownloadingId(null);

    // Dynamic fake CSV file generation and trigger download
    const headers = 'Transaction ID,Booking Ref,Venue,Court,Sport,Date,Amount,Status,Method\n';
    const row = `"${booking.paymentId || 'N/A'}","${booking.bookingRef}","${booking.venueName}","${booking.courtName}","${booking.sport}","${booking.date}","INR ${booking.totalAmount}","${booking.paymentStatus || 'paid'}","${booking.paymentMethod || 'Razorpay'}"\n`;
    
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ZSports_Invoice_${booking.bookingRef}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('printable-receipt-area');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, uniqueName, 'left=50,top=50,width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>ZSports Invoice Receipt - ${selectedReceipt?.bookingRef}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .receipt-header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .details-table th, .details-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
            .details-table th { background: #f8fafc; color: #475569; }
            .totals-section { text-align: right; font-size: 16px; font-weight: bold; margin-top: 20px; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <span class="logo">🏆 ZSports Booking Platform</span>
            <h2 style="margin-top: 10px;">Official Invoice Receipt</h2>
            <p style="font-size: 13px; color: #666;">Date: ${format(new Date(), 'dd MMMM yyyy')}</p>
          </div>
          <div>
            <p><strong>Customer Name:</strong> ${selectedReceipt?.customerName}</p>
            <p><strong>Registered Email:</strong> ${selectedReceipt?.customerEmail}</p>
            <p><strong>Transaction Ref:</strong> ${selectedReceipt?.paymentId || 'pay-' + selectedReceipt?.bookingRef}</p>
            <p><strong>Booking Ref:</strong> ${selectedReceipt?.bookingRef}</p>
          </div>
          <table class="details-table">
            <thead>
              <tr>
                <th>Sports Venue / Center</th>
                <th>Court details</th>
                <th>Date scheduled</th>
                <th>Time slot timings</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${selectedReceipt?.venueName}</td>
                <td>${selectedReceipt?.courtName} (${selectedReceipt?.sport})</td>
                <td>${selectedReceipt?.date}</td>
                <td>${selectedReceipt?.startTime} - ${selectedReceipt?.endTime}</td>
                <td>INR ${selectedReceipt?.totalAmount}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals-section">
            <p>Subtotal: INR ${selectedReceipt?.subtotal}</p>
            <p>Discount Applied: -INR ${selectedReceipt?.discountAmount || 0}</p>
            <p style="font-size: 18px; color: #2563eb;">Total Paid: INR ${selectedReceipt?.totalAmount}</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ZSports. Play active, live healthy!</p>
            <p>This is a computer generated invoice and requires no signature.</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) return <LoadingCard message="Loading transactional history..." />;
  if (isError) return <ErrorState message="Could not load your payment records ledger." />;

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto text-neutral-600 font-normal pb-12">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <CreditCard className="text-primary h-6 w-6 shrink-0" />
          <span>Payment History</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Review past payments statements, check processing status, and download receipts invoices.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-450 font-medium">
          <Receipt size={36} className="text-neutral-350 mx-auto mb-3" />
          <p className="text-sm">No transaction history detected.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-xs font-semibold text-neutral-600">
            <thead className="bg-slate-50 text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Invoice ID</th>
                <th className="px-6 py-3.5 text-left">Venue</th>
                <th className="px-6 py-3.5 text-left">Date</th>
                <th className="px-6 py-3.5 text-left">Price</th>
                <th className="px-6 py-3.5 text-left">Method</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Receipts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {bookings.map((b) => {
                const isRefunded = b.status === 'cancelled' && b.refundStatus === 'paid';
                return (
                  <tr key={b.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-neutral-850 block font-bold">
                        {b.paymentId || `pay-${b.bookingRef}`}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Booking Ref: {b.bookingRef}</span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[150px] font-bold text-neutral-850">{b.venueName}</td>
                    <td className="px-6 py-4 text-neutral-400">{format(parseISO(b.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 font-extrabold text-neutral-900">₹{b.totalAmount}</td>
                    <td className="px-6 py-4 text-neutral-500 uppercase">{b.paymentMethod || 'Razorpay'}</td>
                    <td className="px-6 py-4">
                      {isRefunded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-250 px-2 py-0.5 rounded uppercase font-bold">
                          <RefreshCw size={10} className="animate-spin" /> Refunded
                        </span>
                      ) : b.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-red-50 text-accent-red border border-red-200 px-2 py-0.5 rounded uppercase font-bold">
                          <XCircle size={10} /> Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-250 px-2 py-0.5 rounded uppercase font-bold">
                          <CheckCircle2 size={10} /> Completed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceipt(b)}
                          className="!p-1.5 text-neutral-400 hover:text-primary"
                          aria-label="View Receipt"
                        >
                          <Receipt size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={downloadingId === b.id}
                          onClick={() => handleDownloadInvoice(b)}
                          className="!p-1.5 text-neutral-400 hover:text-primary"
                          aria-label="Download CSV"
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Transaction Invoice Details"
        size="md"
      >
        {selectedReceipt && (
          <div className="space-y-6 text-neutral-600 select-none" id="printable-receipt-area">
            {/* Header info */}
            <div className="flex justify-between items-start gap-4 border-b border-neutral-100 pb-4">
              <div>
                <span className="text-[10px] bg-primary-light text-primary px-2 py-0.5 font-bold uppercase rounded border border-primary/20">
                  {selectedReceipt.paymentMethod || 'Razorpay'} Statement
                </span>
                <h3 className="text-sm font-bold text-neutral-900 mt-2">
                  ID: {selectedReceipt.paymentId || `pay-${selectedReceipt.bookingRef}`}
                </h3>
                <p className="text-3xs text-neutral-450 mt-1 uppercase">
                  Processed on {format(parseISO(selectedReceipt.createdAt), 'MMMM dd, yyyy • hh:mm a')}
                </p>
              </div>

              <div className="text-right">
                <span className="block text-3xs font-semibold text-neutral-400 uppercase tracking-wider">Transaction Amount</span>
                <span className="text-lg font-black text-primary">₹{selectedReceipt.totalAmount}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="block font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Customer Details</span>
                <span className="block font-bold text-neutral-850">{selectedReceipt.customerName}</span>
                <span className="block text-neutral-550 text-2xs">{selectedReceipt.customerEmail}</span>
              </div>
              
              <div className="space-y-0.5">
                <span className="block font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Booking Reference</span>
                <span className="block font-mono font-black text-neutral-800">{selectedReceipt.bookingRef}</span>
              </div>
            </div>

            {/* Venue Box card */}
            <div className="p-4 bg-slate-50 border border-neutral-200 rounded-lg text-xs space-y-2">
              <div>
                <span className="block font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Sports Venue & Time</span>
                <h4 className="font-bold text-neutral-850 mt-0.5">{selectedReceipt.venueName}</h4>
                <p className="text-neutral-500 text-2xs mt-0.5">{selectedReceipt.courtName} ({selectedReceipt.sport})</p>
              </div>

              <div className="flex justify-between items-center text-2xs font-semibold text-neutral-600 pt-1 border-t border-neutral-200">
                <span>Date scheduled: {selectedReceipt.date}</span>
                <span>Hours: {selectedReceipt.startTime} - {selectedReceipt.endTime}</span>
              </div>
            </div>

            {/* Price Calculations breakdown */}
            <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500">
              <div className="flex justify-between">
                <span>Subtotal (Slots price)</span>
                <span className="text-neutral-850">₹{selectedReceipt.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Discounts applied</span>
                <span className="text-accent-red">-₹{selectedReceipt.discountAmount || 0}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-neutral-100 pt-2 text-neutral-900">
                <span>Total amount charged</span>
                <span className="text-primary">₹{selectedReceipt.totalAmount}</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
              <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={handlePrintReceipt}
                leftIcon={<ExternalLink size={14} />}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentMethodsPage;
