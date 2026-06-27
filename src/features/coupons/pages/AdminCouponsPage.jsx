// AdminCouponsPage Component
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { couponRepository } from '../../../repositories';
import { Plus, Edit3, Trash2, Power, PowerOff, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import { format, parseISO } from 'date-fns';

export const AdminCouponsPage = () => {
  const navigate = useNavigate();

  // Fetch all coupons
  const { data: coupons = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-all-coupons'],
    queryFn: () => couponRepository.getAllCoupons()
  });

  const handleToggleActive = async (couponId, currentStatus) => {
    try {
      await couponRepository.toggleCoupon(couponId, !currentStatus);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Coupons</h2>
          <p className="text-xs text-slate-600 mt-1">Configure campaign discounts, validation dates, and customer usage limits.</p>
        </div>
        
        <Link to="/dashboard/admin/coupons/new">
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Coupons Table */}
      {isLoading ? (
        <LoadingCard message="Loading coupons ledger..." />
      ) : isError ? (
        <ErrorState message="Failed to load campaign coupons." />
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 border border-dashed border-slate-200 rounded-xl text-slate-500 font-medium">
          <Tag size={36} className="text-slate-650 mb-3" />
          <p className="text-sm">No campaign coupons listed.</p>
          <p className="text-xs text-slate-500 mt-0.5">Click "Create Coupon" to begin campaign discounts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/20">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
            <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left">Coupon Code</th>
                <th className="px-6 py-3.5 text-left">Type & Value</th>
                <th className="px-6 py-3.5 text-left">Validity Range</th>
                <th className="px-6 py-3.5 text-left">Redemptions</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/35 font-medium">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">{c.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">
                      {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Min spend: ₹{c.minimumBookingAmount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{format(parseISO(c.validFrom), 'yyyy-MM-dd')}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">to {format(parseISO(c.validTo), 'yyyy-MM-dd')}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.currentUsageCount || 0} / {c.totalUsageLimit} usages
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.isActive ? 'available' : 'blocked'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/dashboard/admin/coupons/edit/${c.id}`}>
                        <Button variant="ghost" size="sm" className="!p-1.5 text-slate-600 hover:text-slate-900" aria-label="Edit Coupon">
                          <Edit3 size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(c.id, c.isActive)}
                        className={`!p-1.5 ${c.isActive ? 'text-accent-green hover:text-green-400' : 'text-slate-500 hover:text-slate-350'}`}
                        aria-label={c.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {c.isActive ? <Power size={14} /> : <PowerOff size={14} />}
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

export default AdminCouponsPage;
