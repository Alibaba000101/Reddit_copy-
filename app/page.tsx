// ============================================
// IMPORTANT: "use client" makes this a Client Component
// This is required because we use React hooks (useState, useEffect)
// Server Components can't use hooks or browser APIs
// ============================================
'use client'

// ============================================
// IMPORTS
// ============================================

// React hooks for state management and side effects
import { useState, useEffect } from 'react'

// Our Supabase client to connect to the database
import { createClient } from '@/utils/supabase/browser-client'

// UI Components
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import PostCard from '@/components/PostCard'
import type { Post } from '@/components/PostCard'

// ============================================
// TYPE DEFINITIONS
// ============================================

// This matches your Supabase "posts" table structure
// We use this to get TypeScript autocomplete when working with database data
interface DatabasePost {
  id: string
  created_at: string
  title: string
  content: string | null  // Can be null in database
  slug: string
  author_id: string
  image_url: string | null  // Can be null in database
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converts a database timestamp to a human-readable "time ago" format
 * Example: "2024-01-15T10:30:00" -> "2 hours ago"
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  // Find the appropriate time unit
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'Just now'
}

/**
 * Transforms a database post into the format our PostCard component expects
 * This maps database field names to UI field names
 */
function transformDatabasePost(dbPost: DatabasePost, username: string): Post {
  return {
    // Direct mappings from database
    id: dbPost.id,
    title: dbPost.title,
    content: dbPost.content || undefined,  // Convert null to undefined
    image_url: dbPost.image_url || undefined,  // Convert null to undefined

    // Use the fetched username
    author: username,

    // Convert the ISO timestamp to "X hours ago" format
    timestamp: formatTimeAgo(dbPost.created_at),

    // Placeholder values for features not yet implemented
    // These will be replaced when you add subreddits and voting
    subreddit: 'general',  // Default community for all posts
    voteCount: 0,          // Will be calculated from votes table later
    commentCount: 0,       // Will be calculated from comments table later
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Home() {
  // ----------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------

  // posts: Array of posts to display (empty initially)
  const [posts, setPosts] = useState<Post[]>([])

  // loading: Shows loading spinner while fetching data
  const [loading, setLoading] = useState(true)

  // error: Stores error message if something goes wrong
  const [error, setError] = useState<string | null>(null)

  // searchQuery: Current search term (empty means show all posts)
  const [searchQuery, setSearchQuery] = useState('')

  // ----------------------------------------
  // DATA FETCHING
  // ----------------------------------------

  // Fetch posts from database, optionally filtered by search query
  async function fetchPosts(query: string = '') {
    try {
      setLoading(true)
      setError(null)

      // Create a Supabase client instance
      const supabase = createClient()

      // Build the query - simple fetch without joins for now
      let supabaseQuery = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      // If search query provided, filter by title (case-insensitive)
      if (query.trim()) {
        supabaseQuery = supabaseQuery.ilike('title', `%${query.trim()}%`)
      }

      const { data, error: fetchError } = await supabaseQuery

      // If Supabase returned an error, throw it to be caught below
      if (fetchError) {
        throw fetchError
      }

      // Get posts array (could be null, so default to empty)
      const postsData = data || []

      // Fetch username for each post separately
      const transformedPosts: Post[] = []
      for (const post of postsData) {
        // Query the profiles table for this post's author
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', post.author_id)
          .single()

        // Use username if found, otherwise 'deleted'
        const username = profile?.username || 'deleted'

        // Transform and add to array
        transformedPosts.push(transformDatabasePost(post, username))
      }

      // Update state with the fetched posts
      setPosts(transformedPosts)

    } catch (err) {
      // Log the full error for debugging (check browser console)
      console.error('Error fetching posts:', err)

      // Set a user-friendly error message
      setError('Failed to load posts. Please try again later.')

    } finally {
      // This runs whether fetch succeeded or failed
      // Stop showing the loading spinner
      setLoading(false)
    }
  }

  // useEffect runs when the component first loads (mounts)
  // The empty array [] means it only runs once, not on every re-render
  useEffect(() => {
    fetchPosts()
  }, []) // Empty dependency array = run once on mount

  // Handle search from Header component
  function handleSearch(query: string) {
    setSearchQuery(query)
    fetchPosts(query)
  }

  // ----------------------------------------
  // RENDER HELPERS
  // ----------------------------------------

  // Function to render the appropriate content based on state
  function renderPosts() {
    // STATE 1: Still loading - show loading message
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      )
    }

    // STATE 2: Error occurred - show error message
    if (error) {
      return (
        <div className="error-state">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
          <button
            className="btn-secondary mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )
    }

    // STATE 3: No posts exist - show empty message
    if (posts.length === 0) {
      // Different message for search vs no posts
      if (searchQuery.trim()) {
        return (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No results found</p>
            <p className="text-gray-400 mt-2">Try a different search term</p>
          </div>
        )
      }
      return (
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p>No posts yet</p>
          <p className="text-gray-400 mt-2">Be the first to create a post!</p>
        </div>
      )
    }

    // STATE 4: Posts exist - render them
    return (
      <div className="posts-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  }

  // ----------------------------------------
  // MAIN RENDER
  // ----------------------------------------

  return (
    <div className="min-h-screen">
      <Header onSearch={handleSearch} />

      <main className="main-container">
        <div className="content-layout">
          {/* Posts column */}
          <div className="posts-column">
            {/* Sort bar */}
            <div className="sort-bar">
              <button className="sort-btn active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                Hot
              </button>
              <button className="sort-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                New
              </button>
              <button className="sort-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Top
              </button>
            </div>

            {/* Posts list - uses renderPosts() to handle all states */}
            {renderPosts()}

            {/* Load more button - only show if we have posts */}
            {posts.length > 0 && (
              <div className="mt-8 text-center">
                <button className="btn-secondary px-8">
                  Load More Posts
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar-column hidden lg:block">
            <Sidebar />
          </aside>
        </div>
      </main>
    </div>
  )
}
