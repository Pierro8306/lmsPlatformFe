'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.access, response.refresh);
      toast.success(`Welcome back, ${response.user.firstName || response.user.username}!`);

      if (redirectPath) {
        router.push(redirectPath);
      } else if (response.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError('root', { message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setValue('username', 'admin');
      setValue('password', 'Admin@123');
    } else {
      setValue('username', 'student');
      setValue('password', 'Student@123');
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
        {/* Glow behind card */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-indigo/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-violet/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-indigo via-accent-violet to-accent-cyan p-0.5 shadow-lg shadow-accent-indigo/30 mb-3">
            <div className="w-full h-full bg-[#151923] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-indigo" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
            Sign In to <span className="gradient-text">EduFlow</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Access courses, interactive exams, and collaborative projects
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="mb-6 p-3 rounded-2xl border border-border-subtle bg-background-elevated/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-medium">Quick Demo Accounts:</span>
            <span className="text-[10px] text-accent-cyan">One-click auto-fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium bg-accent-indigo/10 text-accent-indigo hover:bg-accent-indigo/20 border border-accent-indigo/30 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/30 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Demo</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="p-3 rounded-xl border border-status-danger/40 bg-status-danger/10 text-status-danger text-xs">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary" htmlFor="username">
              Username or Email
            </label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. admin or student"
              autoComplete="username"
              {...register('username')}
              error={errors.username?.message}
              className="bg-background-elevated/80 border-border-subtle focus:border-accent-indigo h-11"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-secondary" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-accent-indigo hover:text-accent-violet transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                error={errors.password?.message}
                className="bg-background-elevated/80 border-border-subtle focus:border-accent-indigo h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In to Account'
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[#151923] border border-border-DEFAULT flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent-indigo" />
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
