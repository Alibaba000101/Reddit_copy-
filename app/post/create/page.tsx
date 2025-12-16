'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/browser-client'
import Header from '@/components/Header'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Generate a URL-friendly slug from the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100) + '-' + Date.now()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: content.trim() || null,
          slug: generateSlug(title),
          author_id: user.id,
        })

      if (insertError) {
        throw insertError
      }

      // Success - redirect to home
      router.push('/')
    } catch (err) {
      console.error('Error creating post:', err)
      setError('Failed to create post. Please try again.')
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="main-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  // Don't render form if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="main-container">
        <div className="max-w-2xl mx-auto">
          <div className="sidebar-card" style={{ transform: 'none' }}>
            <div className="sidebar-header">
              Create a Post
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="Give your post a title"
                    maxLength={300}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Content (optional)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] resize-y"
                    placeholder="Write your thoughts..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
