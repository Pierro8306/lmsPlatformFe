'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, CheckCircle2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError('root', { message });
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
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 text-center">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/30 items-center justify-center mb-3 text-accent-indigo">
                  <Mail className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
                  Reset Password
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Enter your email address and we will send you a link to reset your credentials.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root && (
                  <div className="p-3 rounded-xl border border-status-danger/40 bg-status-danger/10 text-status-danger text-xs">
                    {errors.root.message}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary" htmlFor="email">
                    Account Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@eduflow.dev"
                    {...register('email')}
                    error={errors.email?.message}
                    className="bg-background-elevated/80 border-border-subtle focus:border-accent-indigo h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending instructions...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-center justify-center mx-auto text-status-success shadow-lg shadow-status-success/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold font-heading text-text-primary">
                Check Your Inbox
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                We sent a password reset link to{' '}
                <span className="font-semibold text-text-primary">{submittedEmail}</span>.
              </p>

              <div className="p-4 rounded-2xl border border-accent-indigo/30 bg-accent-indigo/10 text-xs text-text-secondary space-y-2">
                <p className="font-medium text-accent-indigo">Demo Preview Token</p>
                <p>Click below to open the reset password screen directly with a sample token:</p>
                <Link
                  href={`/reset-password?token=mock_sample_recovery_token_${Date.now()}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-accent-indigo px-3 py-1.5 rounded-xl hover:bg-accent-violet transition-colors mt-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Open Reset Page With Token
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
