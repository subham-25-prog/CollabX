'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-strong p-8 rounded-3xl text-center shadow-2xl"
      >
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We encountered an unexpected glitch. Our team has been notified.
        </p>

        <div className="grid gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          
          <Link
            href="/feed"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 rounded-xl bg-destructive/5 text-left border border-destructive/10 overflow-auto max-h-40">
            <p className="text-xs font-mono text-destructive break-words">
              {error.message || 'No error message available'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
