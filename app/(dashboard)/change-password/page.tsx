'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
} {
  if (!password) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' }
  if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' }
  if (score === 3) return { level: 3, label: 'Good', color: '#22C55E' }
  return { level: 4, label: 'Strong', color: '#6366F1' }
}

function PasswordField({
  id,
  label,
  placeholder,
  error,
  registration,
  onChange,
}: {
  id: string
  label: string
  placeholder: string
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any
  onChange?: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#E6E9F0] flex items-center gap-2" htmlFor={id}>
        <Lock className="w-4 h-4 text-[#9AA3B5]" />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholder}
          className={`w-full bg-[#1A1F2B] border ${
            error ? 'border-red-500/50' : 'border-[#2A3142]'
          } rounded-xl px-4 py-3 pr-12 text-[#E6E9F0] placeholder:text-[#6B7385] text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all`}
          {...registration}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            registration.onChange(e)
            onChange?.(e.target.value)
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7385] hover:text-[#9AA3B5] transition-colors p-1"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

export default function ChangePasswordPage() {
  const [newPasswordValue, setNewPasswordValue] = useState('')
  const strength = getPasswordStrength(newPasswordValue)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await authService.changePassword({
        old_password: data.oldPassword,
        new_password: data.newPassword,
        new_password_confirm: data.confirmPassword,
      })
      toast.success('Password changed successfully')
      reset()
      setNewPasswordValue('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password'
      setError('root', { message })
      toast.error(message)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-[#E6E9F0]">Change Password</h1>
        <p className="text-[#9AA3B5] text-sm mt-1">Keep your account secure with a strong password</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errors.root && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm"
            >
              {errors.root.message}
            </motion.div>
          )}

          <PasswordField
            id="oldPassword"
            label="Current password"
            placeholder="Enter your current password"
            error={errors.oldPassword?.message}
            registration={register('oldPassword')}
          />

          <div className="border-t border-[#2A3142] pt-5">
            <PasswordField
              id="newPassword"
              label="New password"
              placeholder="At least 8 characters"
              error={errors.newPassword?.message}
              registration={register('newPassword')}
              onChange={setNewPasswordValue}
            />

            {newPasswordValue && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 space-y-1.5"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i <= strength.level ? strength.color : '#2A3142',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color }}>
                  Password strength: {strength.label}
                </p>
              </motion.div>
            )}
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            placeholder="Repeat your new password"
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword')}
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C4DEF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 px-6 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
