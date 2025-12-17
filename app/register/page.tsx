'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/browser-client'
import Header from '@/components/Header'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      setError('Username must be 3-20 characters')
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, underscore, and hyphen')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { user, error: signUpError } = await signUp(email, password)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!user) {
      setError('Registration failed. Please try again.')
      setLoading(false)
      return
    }

    // Create user profile with user-chosen username
    const supabase = createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username,
      })

    if (profileError) {
      // Handle duplicate username error (code 23505 = unique violation)
      if (profileError.code === '23505') {
        setError('Username already taken')
        setLoading(false)
        return
      } else {
        setError('Failed to create profile: ' + profileError.message)
        setLoading(false)
        return
      }
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
              Create Account
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
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="3-20 characters (letters, numbers, _, -)"
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
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[var(--brand-primary)] hover:underline font-semibold">
                    Log In
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
