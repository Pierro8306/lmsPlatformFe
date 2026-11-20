'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, User, Mail, Shield, Users, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
})

type ProfileFormData = z.infer<typeof profileSchema>

function getInitials(name: string): string {
  return name
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const updated = await authService.updateProfile({
        username: data.username,
        email: data.email,
      })
      updateUser({ username: updated.username, email: updated.email })
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  const roleBadgeColor =
    user.role === 'admin'
      ? 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20'
      : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-[#E6E9F0]">Profile</h1>
        <p className="text-[#9AA3B5] text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar + info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(user.username)}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1F2B] border border-[#2A3142] rounded-lg flex items-center justify-center text-[#9AA3B5] hover:text-[#E6E9F0] transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[#E6E9F0] truncate">{user.username}</h2>
            <p className="text-[#9AA3B5] text-sm truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${roleBadgeColor}`}
              >
                {user.role}
              </span>
              {user.group && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#1A1F2B] border border-[#2A3142] text-[#9AA3B5]">
                  {user.group}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="border-t border-[#2A3142]" />

      {/* Edit form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-base font-semibold text-[#E6E9F0] mb-5">Account Information</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#E6E9F0] flex items-center gap-2" htmlFor="username">
              <User className="w-4 h-4 text-[#9AA3B5]" />
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`w-full bg-[#1A1F2B] border ${
                errors.username ? 'border-red-500/50' : 'border-[#2A3142]'
              } rounded-xl px-4 py-3 text-[#E6E9F0] placeholder:text-[#6B7385] text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all`}
              {...register('username')}
            />
            {errors.username && (
              <p className="text-red-400 text-xs">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#E6E9F0] flex items-center gap-2" htmlFor="email">
              <Mail className="w-4 h-4 text-[#9AA3B5]" />
              Email address
            </label>
            <input
              id="email"
              type="email"
              className={`w-full bg-[#1A1F2B] border ${
                errors.email ? 'border-red-500/50' : 'border-[#2A3142]'
              } rounded-xl px-4 py-3 text-[#E6E9F0] placeholder:text-[#6B7385] text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#E6E9F0] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#9AA3B5]" />
                Role
              </label>
              <div className="bg-[#1A1F2B] border border-[#2A3142] rounded-xl px-4 py-3 text-[#9AA3B5] text-sm capitalize">
                {user.role}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#E6E9F0] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9AA3B5]" />
                Group
              </label>
              <div className="bg-[#1A1F2B] border border-[#2A3142] rounded-xl px-4 py-3 text-[#9AA3B5] text-sm">
                {user.group ?? '—'}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C4DEF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 px-6 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
