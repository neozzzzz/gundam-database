// src/components/admin/AdminPagination.tsx
// Admin 페이지 공통 페이지네이션

'use client'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  accentColor?: string // Hex 코드 (예: '#3B82F6') 또는 이름 ('blue')
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
  accentColor = 'blue',
}: AdminPaginationProps) {
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
      for (let i = start; i <= end; i++) pages.push(i)
    }
    return pages
  }

  const getActiveButtonClass = () => {
    // Hex 코드인지 확인 (#으로 시작)
    if (accentColor.startsWith('#')) {
      return '' // 인라인 스타일 사용
    }
    
    // Tailwind 이름 매핑
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600 text-white',
      purple: 'bg-purple-600 text-white',
      orange: 'bg-orange-600 text-white',
      green: 'bg-green-600 text-white',
      red: 'bg-red-600 text-white',
      indigo: 'bg-indigo-600 text-white',
    }
    return colorMap[accentColor] || colorMap.blue
  }
  
  const getActiveButtonStyle = () => {
    // Hex 코드인 경우 인라인 스타일 반환
    if (accentColor.startsWith('#')) {
      return {
        backgroundColor: accentColor,
        color: '#FFFFFF',
      }
    }
    return {}
  }

  if (totalPages <= 1) return null

  return (
    <nav className="px-6 py-4 border-t border-gray-200" aria-label="페이지네이션">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700" role="status" aria-live="polite">
          <span className="font-medium">{totalCount}</span>개 중{' '}
          <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
          {' '}-{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalCount)}
          </span>
          개 표시
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="이전 페이지"
          >
            이전
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                currentPage === page
                  ? getActiveButtonClass() || 'text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={currentPage === page ? getActiveButtonStyle() : {}}
              aria-label={`페이지 ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="다음 페이지"
          >
            다음
          </button>
        </div>
      </div>
    </nav>
  )
}
