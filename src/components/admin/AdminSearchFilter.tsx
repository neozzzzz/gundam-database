// src/components/admin/AdminSearchFilter.tsx
// Admin 페이지 공통 검색 필터

'use client'

interface AdminSearchFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
}

export function AdminSearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = '검색...',
}: AdminSearchFilterProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
      />
    </div>
  )
}
