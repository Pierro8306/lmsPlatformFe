'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || 'demo_token';

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
  });

  const currentPassword = watch('password', '');

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(currentPassword);

  const strengthLabel =
    strength === 0
      ? 'Empty'
      : strength === 1
      ? 'Weak'
      : strength === 2
      ? 'Fair'
      : strength === 3
      ? 'Good'
      : 'Strong';

  const strengthColor =
    strength === 0
      ? 'bg-border-DEFAULT'
      : strength === 1
      ? 'bg-status-danger'
      : strength === 2
      ? 'bg-status-warning'
      : strength === 3
      ? 'bg-accent-indigo'
      : 'bg-status-success';

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await authService.resetPassword({
        token,
        newPassword: data.password,
      });
      setIsSuccess(true);
      toast.success('Your password has been successfully updated!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError('root', { message });
      toast.error(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-3xl border border-border-DEFAULT bg-[#151923]/90 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/30 items-center justify-center mb-3 text-accent-indigo shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
            Create New Password
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ensure your account is protected with a strong, unique password
          </p>
          {token && (
            <div className="mt-2 text-[11px] font-mono text-accent-cyan bg-accent-cyan/10 px-2.5 py-0.5 rounded-full inline-block truncate max-w-xs border border-accent-cyan/20">
              Token: {token.slice(0, 18)}...
            </div>
          )}
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-center justify-center mx-auto text-status-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Password Changed</h3>
            <p className="text-xs text-text-secondary">
              Redirecting you to the sign in page in a moment...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="p-3 rounded-xl border border-status-danger/40 bg-status-danger/10 text-status-danger text-xs">
                {errors.root.message}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                  error={errors.password?.message}
                  className="bg-background-elevated/80 border-border-subtle focus:border-accent-indigo h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {currentPassword.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Strength:</span>
                    <span className="font-medium text-text-primary">{strengthLabel}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          strength >= step ? strengthColor : 'bg-background-elevated'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="passwordConfirm">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('passwordConfirm')}
                  error={errors.passwordConfirm?.message}
                  className="bg-background-elevated/80 border-border-subtle focus:border-accent-indigo h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating password...
                </>
              ) : (
                'Save & Sign In'
              )}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            Remembered your password? Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[#151923] border border-border-DEFAULT flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent-indigo" />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </React.Suspense>
  );
}
