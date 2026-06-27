// ForgotPasswordPage Component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const schema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Failed to send recovery email.'
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-neutral-900">
          Reset Password
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Enter your registered email address below, and we will send you instructions to reset your password.
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-medium leading-relaxed text-center">
            Password reset link has been sent to your email. Please check your inbox (and spam folder).
          </div>
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Back to Sign In
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
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            error={errors.email}
            {...register('email')}
          />

          <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
            Send Reset Instructions
          </Button>

          <div className="text-center text-xs font-semibold">
            <Link to="/login" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
