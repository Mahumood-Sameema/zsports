// CustomerLoginPage Component
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import TabGroup from '../../../components/common/TabGroup';
import { Trophy } from 'lucide-react';

// Zod schemas
const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters long'),
  rememberMe: zod.boolean().optional(),
});

const registerSchema = zod.object({
  displayName: zod.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: zod.string().email('Please enter a valid email address'),
  phone: zod.string().refine(val => !val || /^\d{10}$/.test(val), 'Phone number must be exactly 10 digits').optional(),
  password: zod.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: zod.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const CustomerLoginPage = () => {
  const { login, register, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const from = location.state?.from || '/dashboard/customer';
  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [errorMsg, setErrorMsg] = useState('');

  // Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
    reset: resetLoginForm
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors, isSubmitting: regSubmitting },
    reset: resetRegForm
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', phone: '', password: '', confirmPassword: '' }
  });

  useEffect(() => {
    // If logged in as customer, auto redirect to intended destination or dashboard
    if (currentUser && currentUser.role === 'customer') {
      navigate(from);
    }
  }, [currentUser, navigate, from]);

  const onLogin = async (data) => {
    setErrorMsg('');
    try {
      const user = await login(data.email, data.password);
      if (user.role !== 'customer') {
        throw new Error('Please use the Admin Portal to log in.');
      }
      navigate(from);
    } catch (err) {
      setErrorMsg('invalid email or password.');
    }
  };

  const onRegister = async (data) => {
    setErrorMsg('');
    try {
      await register(data.email, data.password, data.displayName, data.phone);
      navigate(from);
    } catch (err) {
      setErrorMsg('invalid email or password.');
    }
  };

  const onGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const user = await loginWithGoogle();
      if (user.role !== 'customer') {
        throw new Error('Please use the Admin Portal to log in.');
      }
      navigate(from);
    } catch (err) {
      setErrorMsg(err.message || 'Google Authentication failed.');
    }
  };

  const handleTabChange = (tabId) => {
    setErrorMsg('');
    resetLoginForm();
    resetRegForm();
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex flex-col items-center justify-center text-center">
        <Trophy size={36} className="text-primary mb-2 fill-primary/10" />
        <h2 className="text-xl font-extrabold text-neutral-900">
          {activeTab === 'login' ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">
          {activeTab === 'login' 
            ? 'Sign in to book courts, manage reservations, and track reviews.'
            : 'Join ZSports to discover local turf courts and book slots online.'}
        </p>
      </div>

      <TabGroup
        tabs={[
          { id: 'login', label: 'Sign In' },
          { id: 'register', label: 'Register' }
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
        className="w-full justify-center"
      />

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-accent-red rounded text-center">
          {errorMsg}
        </div>
      )}

      {/* Tab 1: Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            error={loginErrors.email}
            {...loginRegister('email')}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={loginErrors.password}
            {...loginRegister('password')}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 font-semibold text-neutral-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4" 
                {...loginRegister('rememberMe')} 
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline font-semibold">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loginSubmitting}>
            Sign In
          </Button>
        </form>
      )}

      {/* Tab 2: Register Form */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegSubmit(onRegister)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={regErrors.displayName}
            {...regRegister('displayName')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            error={regErrors.email}
            {...regRegister('email')}
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="9876543210"
            error={regErrors.phone}
            {...regRegister('phone')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={regErrors.password}
            helperText="Minimum 8 characters, at least 1 uppercase and 1 number"
            {...regRegister('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={regErrors.confirmPassword}
            {...regRegister('confirmPassword')}
          />

          <Button type="submit" variant="primary" fullWidth loading={regSubmitting}>
            Create Account
          </Button>
        </form>
      )}

      {/* Social login option */}
      <div className="relative my-2 select-none">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-neutral-400">Or continue with</span></div>
      </div>

      <Button variant="outline" fullWidth onClick={onGoogleLogin}>
        {/* Simple Google SVG Icon */}
        <svg className="inline h-4 w-4 mr-2" style={{ display: 'inline' }} viewBox="0 0 24 24" width="24" height="24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Sign in with Google
      </Button>

      {/* portal navigators */}
      <div className="flex flex-col items-center gap-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500">
        <Link to="/" className="text-primary hover:underline">
          &larr; Back to Website
        </Link>
        <Link to="/admin/login" className="text-neutral-500 hover:text-neutral-800 underline">
          Staff / Admin? Portal
        </Link>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
