'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0D12' }}>
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1
            className="text-8xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #22D3EE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            404
          </h1>
          <h2
            className="text-2xl font-semibold"
            style={{ color: '#E6E9F0', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Page Not Found
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: '#9AA3B5' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#ffffff',
              fontWeight: 500,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #2A3142',
              color: '#9AA3B5',
              fontWeight: 500,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Go Home
          </Link>
        </div>

        {/* Decorative orb */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </div>
    </div>
  )
}
