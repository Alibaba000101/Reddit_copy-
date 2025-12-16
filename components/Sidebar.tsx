'use client'

import Link from 'next/link'

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* About WorldPost */}
      <div className="sidebar-card">
        <div className="sidebar-header">
          About WorldPost
        </div>
        <div className="sidebar-content">
          <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
            Welcome to WorldPost. A raw, rugged space for real discussion. No polish, just community.
          </p>
          <Link href="/post/create">
            <button className="btn-primary w-full">
              Create Post
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-[var(--text-muted)] px-2 py-4">
        <p className="mb-1">Built with Next.js & Tailwind CSS</p>
        <p>WorldPost 2025</p>
      </div>
    </div>
  )
}
