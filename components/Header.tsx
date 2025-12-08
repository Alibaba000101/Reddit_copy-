export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-5 h-12">
        <div className="logo">
          <h1 className="text-orange-500 text-xl font-bold">freddit</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1 border border-orange-600 rounded-xl bg-transparent text-orange-600 font-bold text-xs hover:bg-orange-600 hover:text-white transition-all">
            Log In
          </button>
          <button className="px-4 py-1 border border-orange-600 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-all">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  )
}