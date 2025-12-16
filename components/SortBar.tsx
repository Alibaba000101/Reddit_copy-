'use client'

import { useState } from 'react'

/*
 * SortBar Component
 * Allows users to sort posts by different criteria
 * - Hot: Popular posts
 * - New: Most recent
 * - Top: Highest voted
 * - Rising: Gaining momentum
 */

const sortOptions = [
  { id: 'hot', label: 'Hot', icon: '🔥' },
  { id: 'new', label: 'New', icon: '✨' },
  { id: 'top', label: 'Top', icon: '📈' },
  { id: 'rising', label: 'Rising', icon: '🚀' },
]

export default function SortBar() {
  const [activeSort, setActiveSort] = useState('hot')

  return (
    <div className="card p-2 flex items-center gap-2">
      {sortOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => setActiveSort(option.id)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${activeSort === option.id
              ? 'bg-[#ff4500] text-white'
              : 'text-[#818384] hover:bg-[#2d2d2f]'
            }
          `}
        >
          <span className="mr-1">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  )
}
