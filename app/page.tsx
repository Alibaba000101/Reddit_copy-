import Header from '@/components/Header'
import PostsSection from '@/components/PostsSection'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/browser-client'

export default async function Home() {
  const supabase = createClient()
  const { data, error} = await supabase.from('posts').select('*')
  console.log("data:" + data, "error:" + error)

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto mt-5 px-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Posts from Supabase</h2>
              <div className="space-y-4">
                {data && data.map(item => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 space-x-4">
                      <span>By: {item.user_id}</span>
                      {item.created_at && <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>}
                    </div>
                    {item.content && (
                      <p className="text-gray-300 mt-3 text-sm leading-relaxed">{item.content}</p>
                    )}
                  </div>
                ))}
                {(!data || data.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    No posts found
                  </div>
                )}
              </div>
            </div>
            <PostsSection />
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
    </>
  )
}