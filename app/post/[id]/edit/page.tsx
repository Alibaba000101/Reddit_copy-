'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/browser-client'
import Header from '@/components/Header'

export default function EditPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user, loading: authLoading } = useAuth()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setRemoveExistingImage(true)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    setRemoveExistingImage(true)
  }

  // Fetch existing post data
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
          throw fetchError
        }

        // Check if user is the author
        if (user && data.author_id !== user.id) {
          router.push('/')
          return
        }

        setTitle(data.title)
        setContent(data.content || '')
        setExistingImageUrl(data.image_url || null)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
      } finally {
        setFetching(false)
      }
    }

    if (!authLoading && user && id) {
      fetchPost()
    } else if (!authLoading && !user) {
      router.push('/login')
    }
  }, [id, user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!user) {
      setError('You must be logged in to edit a post')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      let imageUrl: string | null = existingImageUrl

      // Handle image changes
      if (imageFile) {
        setUploading(true)
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
        setUploading(false)
      } else if (removeExistingImage) {
        imageUrl = null
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          content: content.trim() || null,
          image_url: imageUrl,
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      router.push(`/posts/${id}`)
    } catch (err) {
      console.error('Error updating post:', err)
      setError(err instanceof Error ? err.message : 'Failed to update post. Please try again.')
      setLoading(false)
      setUploading(false)
    }
  }

  // Show loading while checking auth or fetching post
  if (authLoading || fetching) {
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
              Edit Post
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

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Image (optional)
                  </label>
                  {imagePreview || (existingImageUrl && !removeExistingImage) ? (
                    <div className="relative">
                      <img
                        src={imagePreview || existingImageUrl || ''}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded border-2 border-[var(--border-color)] bg-[var(--bg-input)]"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-[#1a1a1b] rounded-full hover:bg-[#272729]"
                      >
                        <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-color)] rounded cursor-pointer hover:border-[var(--brand-primary)] bg-[var(--bg-input)]">
                      <svg className="w-8 h-8 text-[var(--text-secondary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-[var(--text-secondary)]">Click to upload an image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
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
                    disabled={loading || uploading}
                    className="btn-primary flex-1"
                  >
                    {uploading ? 'Uploading image...' : loading ? 'Saving...' : 'Save Changes'}
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
