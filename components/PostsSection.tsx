export default function PostsSection() {
  return (
    <div className="posts-section">
      <div className="sort-bar">
        <button className="sort-btn active">Hot</button>
        <button className="sort-btn">New</button>
        <button className="sort-btn">Rising</button>
        <button className="sort-btn">Top</button>
      </div>

      <div id="posts-container">
        {/* Posts will be loaded from Supabase */}
      </div>
    </div>
  )
}