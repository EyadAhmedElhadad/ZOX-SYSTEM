'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

interface SignUpFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch('password');

  const onSubmit = async (_data: SignUpFormData) => {
    setIsLoading(true);
    // Backend integration point: POST /api/auth/register with customer profile data
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    onSwitchToLogin();
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Join Zoox as a customer to book sessions and track loyalty
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
          <input
            type="text"
            className={`input-field ${errors.name ? 'border-danger' : ''}`}
            placeholder="Ahmed Mohamed"
            {...register('name', { required: 'Full name is required' })}
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Email address
          </label>
          <input
            type="email"
            className={`input-field ${errors.email ? 'border-danger' : ''}`}
            placeholder="you@gmail.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Egyptian mobile number — used for reservations and notifications
          </p>
          <input
            type="tel"
            className={`input-field ${errors.phone ? 'border-danger' : ''}`}
            placeholder="01xxxxxxxxx"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: { value: /^01[0-9]{9}$/, message: 'Enter a valid Egyptian mobile number' },
            })}
          />
          {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.password ? 'border-danger' : ''}`}
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
            <input
              type={showConfirm ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.confirmPassword ? 'border-danger' : ''}`}
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
              className="w-4 h-4 mt-0.5 rounded border-border bg-input accent-primary flex-shrink-0"
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
          className="btn-primary w-full h-11 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
