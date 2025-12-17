import Link from 'next/link'

export interface Post {
  id: string
  title: string
  author: string
  subreddit: string
  timestamp: string
  voteCount: number
  commentCount: number
  content?: string
  image_url?: string
}

interface PostCardProps {
  post: Post
}

function VoteButton({ direction }: { direction: 'up' | 'down' }) {
  const isUp = direction === 'up'

  return (
    <button
      className={`vote-btn ${isUp ? 'upvote' : 'downvote'}`}
      aria-label={isUp ? 'Upvote' : 'Downvote'}
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d={isUp ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
        />
      </svg>
    </button>
  )
}

function formatVoteCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return count.toString()
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      {/* Vote section */}
      <div className="vote-section">
        <VoteButton direction="up" />
        <span className="vote-count">
          {formatVoteCount(post.voteCount)}
        </span>
        <VoteButton direction="down" />
      </div>

      {/* Post content */}
      <div className="post-content">
        {/* Meta info */}
        <div className="post-meta">
          <span className="subreddit">w/{post.subreddit}</span>
          <span>•</span>
          <span>Posted by u/{post.author}</span>
          <span>•</span>
          <span>{post.timestamp}</span>
        </div>

        {/* Title */}
        <Link href={`/posts/${post.id}`}>
          <h3 className="post-title">
            {post.title}
          </h3>
        </Link>

        {/* Post image */}
        {post.image_url && (
          <div className="post-image-container" style={{
            marginTop: '12px',
            marginBottom: '12px',
            maxWidth: '200px',
            maxHeight: '88px',
            overflow: 'hidden',
            borderRadius: '8px',
          }}>
            <img
              src={post.image_url}
              alt={post.title}
              className="post-image"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '88px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        )}

        {/* Content preview */}
        {post.content && (
          <p className="post-preview">
            {post.content}
          </p>
        )}

        {/* Actions */}
        <div className="post-actions">
          <Link href={`/posts/${post.id}`}>
            <button className="action-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.commentCount} Comments
            </button>
          </Link>

          <button className="action-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <button className="action-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </article>
  )
}
