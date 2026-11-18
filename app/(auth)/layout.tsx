'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Sparkles, BookOpen, Users } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0B0D12] flex">
      {/* Left decorative panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0D12] via-[#151923] to-[#0B0D12]" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse at 60% 70%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 30%, rgba(139,92,246,0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Decorative orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.8, 0.5, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold font-heading gradient-text">EduFlow</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold font-heading text-[#E6E9F0] mb-4 leading-tight"
          >
            Elevate your{' '}
            <span className="gradient-text">learning</span>{' '}
            journey
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9AA3B5] text-lg mb-12"
          >
            A powerful platform for modern education, connecting students and instructors seamlessly.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {[
              { icon: BookOpen, label: 'Interactive Courses', desc: 'Rich content with videos & quizzes' },
              { icon: Users, label: 'Collaborative Projects', desc: 'Work together, learn together' },
              { icon: Sparkles, label: 'Smart Analytics', desc: 'Track your progress in real-time' },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-4 glass rounded-xl p-4 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#6366F1]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#E6E9F0]">{label}</div>
                  <div className="text-xs text-[#9AA3B5]">{desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0D12] to-[#151923]" />
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)',
            }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
