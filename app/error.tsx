'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0D12' }}>
      <div className="text-center space-y-6 px-4 max-w-lg mx-auto">
        {/* Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: '1.75rem',
          }}
        >
          ⚠
        </div>

        <div className="space-y-2">
          <h2
            className="text-2xl font-bold"
            style={{ color: '#E6E9F0', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Something went wrong
          </h2>
          <p className="text-sm" style={{ color: '#9AA3B5' }}>
            An unexpected error occurred. The team has been notified.
          </p>
          {error.message && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                textAlign: 'left',
                wordBreak: 'break-word',
              }}
            >
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
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
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            ↺ Try Again
          </button>
          <a
            href="/dashboard"
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
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
