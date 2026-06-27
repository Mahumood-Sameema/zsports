// CouponFormPage Component
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { couponRepository } from '../../../repositories';
import { useAuth } from '../../auth/hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import BackButton from '../../../components/common/BackButton';
import { Save } from 'lucide-react';
import { format } from 'date-fns';

const couponFormSchema = zod.object({
  code: zod.string()
    .min(4, 'Code must be at least 4 characters')
    .max(12, 'Code must be under 12 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
  description: zod.string().min(5, 'Description must be at least 5 characters'),
  discountType: zod.enum(['percentage', 'fixed']),
  discountValue: zod.coerce.number().positive('Discount value must be greater than zero'),
  minimumBookingAmount: zod.coerce.number().min(0, 'Minimum booking amount cannot be negative'),
  maximumDiscountAmount: zod.coerce.number().optional(),
  validFrom: zod.string().min(1, 'Valid from date is required'),
  validTo: zod.string().min(1, 'Valid to date is required'),
  totalUsageLimit: zod.coerce.number().min(1, 'Limit must be at least 1 usage'),
  perCustomerLimit: zod.coerce.number().min(1, 'Per customer limit must be at least 1')
}).refine((data) => {
  return new Date(data.validTo) >= new Date(data.validFrom);
}, {
  message: "Expiry date must be on or after start date",
  path: ["validTo"]
});

export const CouponFormPage = () => {
  const { couponId } = useParams();
  const isEdit = !!couponId;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minimumBookingAmount: 500,
      maximumDiscountAmount: 200,
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      validTo: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      totalUsageLimit: 100,
      perCustomerLimit: 1
    }
  });

  // Helper helper
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Load coupon for edit
  useEffect(() => {
    const loadCoupon = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const c = await couponRepository.getAllCoupons();
        const matched = c.find(x => x.id === couponId);
        if (matched) {
          // Format ISO strings to YYYY-MM-DD for date fields
          const formatted = {
            ...matched,
            validFrom: format(new Date(matched.validFrom), 'yyyy-MM-dd'),
            validTo: format(new Date(matched.validTo), 'yyyy-MM-dd')
          };
          reset(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCoupon();
  }, [couponId, isEdit, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        validFrom: new Date(data.validFrom).toISOString(),
        validTo: new Date(data.validTo).toISOString(),
        venueId: currentUser?.uid || 'user-admin'
      };

      if (isEdit) {
        await couponRepository.updateCoupon(couponId, payload);
      } else {
        await couponRepository.createCoupon(payload);
      }

      navigate('/dashboard/admin/coupons');
    } catch (err) {
      alert(err.message || 'Failed to submit coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? 'Configure Coupon' : 'Create Promo Coupon'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">Configure discount values, validation dates, and customer limits.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        
        {/* Core settings */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            1. Coupon Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Promo Code"
              type="text"
              placeholder="e.g. ZSPORTS50"
              error={errors.code}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('code')}
            />
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
                Discount Type
              </label>
              <select
                {...register('discountType')}
                className="block w-full text-xs font-bold rounded border border-slate-200 bg-white py-2.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
              >
                <option value="percentage">Percentage (e.g. 20% Off)</option>
                <option value="fixed">Fixed Flat Discount (e.g. ₹100 Off)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Discount Value"
              type="number"
              error={errors.discountValue}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('discountValue')}
            />
            <Input
              label="Min Spend Required (₹)"
              type="number"
              error={errors.minimumBookingAmount}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('minimumBookingAmount')}
            />
            <Input
              label="Max Discount Cap (₹) - Percentage Type Only"
              type="number"
              error={errors.maximumDiscountAmount}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('maximumDiscountAmount')}
            />
          </div>

          <Input
            label="Campaign Description"
            type="text"
            placeholder="e.g. Get 20% discount on all badminton bookings!"
            error={errors.description}
            className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
            {...register('description')}
          />
        </section>

        {/* Validity bounds */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            2. Campaign Bounds & Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              error={errors.validFrom}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('validFrom')}
            />
            <Input
              label="Valid To (Expiry)"
              type="date"
              error={errors.validTo}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('validTo')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Total Redemptions Limit (All customers)"
              type="number"
              error={errors.totalUsageLimit}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('totalUsageLimit')}
            />
            <Input
              label="Per Customer Usage Limit"
              type="number"
              error={errors.perCustomerLimit}
              className="bg-slate-50/20 border-slate-200 focus:border-primary text-slate-900"
              {...register('perCustomerLimit')}
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/admin/coupons')}
            className="border-slate-200 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            loading={loading}
          >
            {isEdit ? 'Save Changes' : 'Publish Coupon'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponFormPage;
