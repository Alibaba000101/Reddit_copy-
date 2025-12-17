'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/browser-client'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Profile type for joined data
interface Profile {
  username: string
}

// Database post type
interface DatabasePost {
  id: string
  created_at: string
  title: string
  content: string | null
  slug: string
  author_id: string
  image_url: string | null
  profiles: Profile | null
}

// Comment type
interface Comment {
  id: string
  created_at: string
  content: string
  author_id: string
  post_id: string
  parent_id: string | null
  profiles: Profile | null
}

// Comment with children for tree structure
interface CommentWithChildren extends Comment {
  children: CommentWithChildren[]
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

// Build comment tree from flat array
function buildCommentTree(comments: Comment[]): CommentWithChildren[] {
  const commentMap = new Map<string, CommentWithChildren>()
  const roots: CommentWithChildren[] = []

  // First pass: create all nodes with empty children arrays
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] })
  })

  // Second pass: build the tree
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!
    if (comment.parent_id === null) {
      roots.push(node)
    } else {
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.children.push(node)
      } else {
        // Parent not found, treat as root
        roots.push(node)
      }
    }
  })

  return roots
}

// Maximum nesting depth
const MAX_DEPTH = 5

// Count all children recursively
function countAllChildren(comment: CommentWithChildren): number {
  return comment.children.reduce((acc, child) => acc + 1 + countAllChildren(child), 0)
}

// Recursive Comment Component
function CommentItem({
  comment,
  depth,
  user,
  postId,
  onReplySubmit,
  onDelete,
}: {
  comment: CommentWithChildren
  depth: number
  user: { id: string } | null
  postId: string
  onReplySubmit: (content: string, parentId: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isAuthor = user && user.id === comment.author_id
  const canReply = user && depth < MAX_DEPTH

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      await onReplySubmit(replyContent.trim(), comment.id)
      setReplyContent('')
      setShowReplyForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setDeleting(true)
    try {
      await onDelete(comment.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ marginLeft: depth > 0 ? '40px' : '0' }}>
      <div className="py-3 border-l-2 border-[#343536] pl-4">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs text-[#818384] mb-2">
          <span className="font-medium text-[#d7dadc]">u/{comment.profiles?.username || comment.author_id.slice(0, 8)}</span>
          <span>•</span>
          <span>{formatTimeAgo(comment.created_at)}</span>
        </div>

        {/* Comment content */}
        <p className="text-[#d7dadc] text-sm mb-2 whitespace-pre-line">
          {comment.content}
        </p>

        {/* Comment actions */}
        <div className="flex items-center gap-4 text-xs">
          {canReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-[#818384] hover:text-[#d7dadc] font-medium"
            >
              Reply
            </button>
          )}
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[#818384] hover:text-[#ff4500] font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 bg-[#1a1a1b] border border-[#343536] rounded text-[#d7dadc] text-sm resize-none focus:outline-none focus:border-[#d7dadc]"
              rows={3}
              disabled={submitting}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="px-3 py-1 text-xs bg-[#ff4500] hover:bg-[#ff5722] text-white rounded font-medium disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false)
                  setReplyContent('')
                }}
                className="px-3 py-1 text-xs bg-[#272729] hover:bg-[#343536] text-[#d7dadc] rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Render children recursively */}
      {comment.children.length > 0 && (
        <div>
          {comment.children.map(child => (
            <CommentItem
              key={child.id}
              comment={child}
              depth={depth + 1}
              user={user}
              postId={postId}
              onReplySubmit={onReplySubmit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useAuth()

  const [post, setPost] = useState<DatabasePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Comment state
  const [comments, setComments] = useState<CommentWithChildren[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const isAuthor = user && post && user.id === post.author_id

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*, profiles(username)')
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      const tree = buildCommentTree(data || [])
      setComments(tree)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  // Submit a new comment or reply
  const handleCommentSubmit = async (content: string, parentId: string | null = null) => {
    if (!user) return

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        content,
        post_id: id,
        author_id: user.id,
        parent_id: parentId,
      })

    if (insertError) {
      console.error('Full error:', insertError)
      alert(`Failed to post comment: ${insertError.message}`)
      throw insertError
    }

    // Refresh comments
    await fetchComments()
  }

  // Submit top-level comment
  const handleTopLevelCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      await handleCommentSubmit(newComment.trim(), null)
      setNewComment('')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Delete a comment
  const handleCommentDelete = async (commentId: string) => {
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      alert('Failed to delete comment. Please try again.')
      throw deleteError
    }

    // Refresh comments
    await fetchComments()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      router.push('/')
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post. Please try again.')
      setDeleting(false)
    }
  }

  useEffect(() => {
    async function fetchPost() {
      try {
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*, profiles(username)')
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

  // Fetch comments when post loads
  useEffect(() => {
    if (id) {
      fetchComments()
    }
  }, [id, fetchComments])

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
            <span>Posted by u/{post.profiles?.username || post.author_id.slice(0, 8)}</span>
            <span>•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>

          {/* Post title */}
          <h1 className="text-xl font-semibold text-[#d7dadc] mb-4">
            {post.title}
          </h1>

          {/* Post image */}
          {post.image_url && (
            <div className="mb-4" style={{ maxWidth: '200px', maxHeight: '150px', overflow: 'hidden' }}>
              <img
                src={post.image_url}
                alt={post.title}
                className="rounded border border-[#343536]"
                style={{ width: '100%', height: '100%', maxHeight: '150px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Post content */}
          {post.content && (
            <div className="text-[#d7dadc] whitespace-pre-line leading-relaxed">
              {post.content}
            </div>
          )}

          {/* Edit/Delete buttons - only for author */}
          {isAuthor && (
            <div className="flex gap-3 mt-6 pt-4 border-t border-[#343536]">
              <Link
                href={`/post/${post.id}/edit`}
                className="px-4 py-2 text-sm bg-[#272729] hover:bg-[#343536] text-[#d7dadc] rounded font-medium border border-[#343536]"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-[#ff4500] hover:bg-[#ff5722] text-white rounded font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </article>

        {/* Comments section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[#d7dadc] mb-4">
            Comments {!commentsLoading && `(${comments.reduce((acc, c) => acc + 1 + countAllChildren(c), 0)})`}
          </h2>

          {/* Top-level comment form - only show if logged in */}
          {user ? (
            <form onSubmit={handleTopLevelCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full px-3 py-2 bg-[#1a1a1b] border border-[#343536] rounded text-[#d7dadc] text-sm resize-none focus:outline-none focus:border-[#d7dadc]"
                rows={4}
                disabled={submittingComment}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 text-sm bg-[#ff4500] hover:bg-[#ff5722] text-white rounded font-medium disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[#818384] text-sm mb-6 p-3 bg-[#1a1a1b] rounded border border-[#343536]">
              <Link href="/login" className="text-[#ff4500] hover:underline">Log in</Link> to leave a comment
            </p>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-[#818384]">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[#818384] text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-2">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  user={user}
                  postId={id}
                  onReplySubmit={handleCommentSubmit}
                  onDelete={handleCommentDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
