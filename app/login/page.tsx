'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Success - redirect to home
    router.push('/')
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="main-container">
        <div className="max-w-md mx-auto mt-8">
          <div className="sidebar-card" style={{ transform: 'none' }}>
            <div className="sidebar-header">
              Welcome Back
            </div>
            <div className="sidebar-content">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm bg-[var(--downvote-bg)] border border-[var(--downvote)] rounded text-[var(--text-primary)]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="Your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>

                <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-[var(--brand-primary)] hover:underline font-semibold">
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
