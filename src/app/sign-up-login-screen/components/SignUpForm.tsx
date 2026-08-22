'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, User, Mail, Phone, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SignUpFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerAccount } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    const created = registerAccount({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password,
    });
    setIsLoading(false);
    if (created) {
      toast.success(`Welcome, ${created.name}! Your account is ready.`);
    } else {
      toast.error('An account with this email already exists. Please log in.');
    }
  };

  const inputBase =
    'w-full bg-[#051424] border border-[#273647] rounded-lg py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150';

  const field = (error?: string) =>
    error ? 'border-danger focus:border-danger focus:ring-danger/50' : '';

  return (
    <div className="fade-in space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              className={`${inputBase} pl-10 ${field(errors.name?.message)}`}
              placeholder="Ahmed Mohamed"
              {...register('name', { required: 'Full name is required' })}
            />
          </div>
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="email"
              className={`${inputBase} pl-10 ${field(errors.email?.message)}`}
              placeholder="you@gmail.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
            />
          </div>
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Egyptian mobile number — used for reservations and notifications
          </p>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="tel"
              className={`${inputBase} pl-10 ${field(errors.phone?.message)}`}
              placeholder="01xxxxxxxxx"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^01[0-9]{9}$/,
                  message: 'Enter a valid Egyptian mobile number',
                },
              })}
            />
          </div>
          {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${inputBase} pl-10 pr-10 ${field(errors.password?.message)}`}
              placeholder="Min. 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <KeyRound
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type={showConfirm ? 'text' : 'password'}
              className={`${inputBase} pl-10 pr-10 ${field(errors.confirmPassword?.message)}`}
              placeholder="Re-enter password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-[#273647] bg-input accent-primary flex-shrink-0"
              {...register('terms', { required: 'You must accept the terms to continue' })}
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{' '}
              <span className="text-primary font-semibold hover:underline cursor-pointer">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-primary font-semibold hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-danger mt-1">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{' '}
        <span className="text-primary font-semibold cursor-pointer">Terms</span> and{' '}
        <span className="text-primary font-semibold cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );
}
