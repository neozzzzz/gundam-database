// src/components/search-bar.tsx
// 검색 바 컴포넌트

'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = '킷 이름 검색...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input-threads w-full pl-12 pr-12"
      />
      
      {/* 검색 아이콘 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        🔍
      </div>

      {/* 지우기 버튼 */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      )}
    </form>
  )
}
