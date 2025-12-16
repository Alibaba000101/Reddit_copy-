'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/browser-client'
import Header from '@/components/Header'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Database post type
interface DatabasePost {
  id: string
  created_at: string
  title: string
  content: string | null
  slug: string
  author_id: string
}

// Format timestamp to "X hours ago" format
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'Just now'
}

export default function PostDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [post, setPost] = useState<DatabasePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Post not found')
          } else {
            throw fetchError
          }
          return
        }

        setPost(data)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id])

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-[800px] mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#818384] hover:text-[#d7dadc] mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Feed
          </Link>
          <div className="card p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-[#818384]">Loading post...</p>
          </div>
        </main>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <main className="max-w-[800px] mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#818384] hover:text-[#d7dadc] mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Feed
          </Link>
          <div className="card p-8 text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-[#ff4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[#d7dadc] mb-4">{error}</p>
            <Link href="/" className="btn-primary inline-block">
              Go Back Home
            </Link>
          </div>
        </main>
      </>
    )
  }

  // Post not found
  if (!post) {
    return (
      <>
        <Header />
        <main className="max-w-[800px] mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#818384] hover:text-[#d7dadc] mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Feed
          </Link>
          <div className="card p-8 text-center">
            <p className="text-[#d7dadc]">Post not found</p>
          </div>
        </main>
      </>
    )
  }

  // Success state - show the post
  return (
    <>
      <Header />

      <main className="max-w-[800px] mx-auto px-4 py-4">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#818384] hover:text-[#d7dadc] mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Feed
        </Link>

        {/* Post card */}
        <article className="card p-6 mb-4">
          {/* Post header */}
          <div className="flex items-center gap-2 text-xs text-[#818384] mb-3">
            <span>Posted by u/{post.author_id}</span>
            <span>•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>

          {/* Post title */}
          <h1 className="text-xl font-semibold text-[#d7dadc] mb-4">
            {post.title}
          </h1>

          {/* Post content */}
          {post.content && (
            <div className="text-[#d7dadc] whitespace-pre-line leading-relaxed">
              {post.content}
            </div>
          )}
        </article>

        {/* Comments placeholder */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[#d7dadc] mb-4">Comments</h2>
          <p className="text-[#818384] text-center py-8">
            Comments coming soon...
          </p>
        </div>
      </main>
    </>
  )
}
