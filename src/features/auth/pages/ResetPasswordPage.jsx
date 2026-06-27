// ResetPasswordPage Component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const schema = zod.object({
  password: zod.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: zod.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const ResetPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      // Simulate reset confirmation
      await new Promise(r => setTimeout(r, 600));
      setSuccess(true);
    } catch (err) {
      setErrorMsg('Failed to update password. Link may have expired.');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-neutral-900">
          Create New Password
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Set a secure, brand-new password for your ZSports profile below.
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-medium text-center">
            Your password has been updated successfully!
          </div>
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-accent-red rounded text-center">
              {errorMsg}
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            helperText="Minimum 8 characters, 1 uppercase, 1 number"
            {...register('password')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
