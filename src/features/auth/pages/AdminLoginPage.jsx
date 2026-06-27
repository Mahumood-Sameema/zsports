// AdminLoginPage Component
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { ShieldCheck } from 'lucide-react';

const adminLoginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters long'),
});

export const AdminLoginPage = () => {
  const { login, currentUser, role } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (currentUser) {
      const activeRole = role?.toLowerCase();
      if (activeRole === 'admin') {
        navigate('/dashboard/admin');
      } else if (activeRole === 'staff') {
        navigate('/dashboard/staff');
      }
    }
  }, [currentUser, role, navigate]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const user = await login(data.email, data.password);
      const activeRole = user.role?.toLowerCase();

      if (activeRole === 'admin') {
        navigate('/dashboard/admin');
      } else if (activeRole === 'staff') {
        navigate('/dashboard/staff');
      } else {
        throw new Error('Access denied. This portal is for authorized personnel only.');
      }
    } catch (err) {
      setErrorMsg('invalid email or password.');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex flex-col items-center justify-center text-center">
        <ShieldCheck size={36} className="text-primary mb-2 fill-primary/10" />
        <h2 className="text-xl font-extrabold text-neutral-900">
          ZSports Console Login
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">
          Authorized personnel portal. Authenticate to manage venues, bookings, schedules, and operations.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-accent-red rounded text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Console Email Address"
          type="email"
          placeholder="admin@zsports.com"
          error={errors.email}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password}
          {...register('password')}
        />

        <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
          Log In to Console
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500">
        <Link to="/" className="text-primary hover:underline">
          &larr; Back to Website
        </Link>
        <Link to="/login" className="text-neutral-500 hover:text-neutral-800 underline">
          Customer Portal
        </Link>
      </div>
    </div>
  );
};

export default AdminLoginPage;
