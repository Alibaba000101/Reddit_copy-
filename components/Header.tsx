'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <Link href="/" className="logo">
          <div className="logo-icon">
            <span>W</span>
          </div>
          <span className="logo-text">WorldPost</span>
        </Link>

        {/* Search bar */}
        <div className="search-bar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search WorldPost"
          />
        </div>

        {/* Auth buttons */}
        <div className="auth-buttons">
          {loading ? (
            <div className="text-[var(--text-muted)] text-sm">Loading...</div>
          ) : user ? (
            <>
              <span className="text-sm text-[var(--text-secondary)] hidden sm:block truncate max-w-[150px]">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="btn-secondary">
                  Log In
                </button>
              </Link>
              <Link href="/register">
                <button className="btn-primary">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
