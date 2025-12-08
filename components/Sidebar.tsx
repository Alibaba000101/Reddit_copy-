export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="trending-communities">
        <h3>Trending Communities</h3>
        <div id="trending-container">
          {/* Trending communities will be loaded from Supabase */}
        </div>
      </div>

      <div className="popular-posts">
        <h3>Popular Right Now</h3>
        <div id="popular-container">
          {/* Popular posts will be loaded from Supabase */}
        </div>
      </div>
    </aside>
  )
}