// src/components/pagination.tsx
// 페이지네이션 컴포넌트

'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // 최대 표시할 페이지 번호 개수

    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 많으면 현재 페이지 기준으로 표시
      if (currentPage <= 4) {
        // 시작 부분
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // 끝 부분
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        // 중간 부분
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) {
    return null // 페이지가 1개면 페이지네이션 안보임
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* 현재 표시 범위 */}
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            <span className="font-medium text-foreground">{startItem}</span>
            {' - '}
            <span className="font-medium text-foreground">{endItem}</span>
            {' / '}
            <span>{totalItems}개</span>
          </>
        ) : (
          '결과 없음'
        )}
      </div>

      {/* 페이지 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 이전 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
            currentPage === 1
              ? 'bg-secondary text-muted-foreground cursor-not-allowed'
              : 'bg-secondary text-foreground hover:bg-accent'
          }`}
        >
          ← 이전
        </button>

        {/* 페이지 번호들 */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[40px] h-[40px] rounded-lg font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary text-black'
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* 모바일: 현재 페이지만 표시 */}
        <div className="sm:hidden px-4 py-2 bg-secondary rounded-lg text-sm">
          <span className="font-medium">{currentPage}</span>
          <span className="text-muted-foreground"> / {totalPages}</span>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-secondary text-muted-foreground cursor-not-allowed'
              : 'bg-secondary text-foreground hover:bg-accent'
          }`}
        >
          다음 →
        </button>
      </div>

      {/* 페이지 점프 (선택사항) */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">페이지 이동:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value)
            if (page >= 1 && page <= totalPages) {
              onPageChange(page)
            }
          }}
          className="w-16 px-2 py-1 bg-secondary border border-border rounded text-center"
        />
        <span className="text-muted-foreground">/ {totalPages}</span>
      </div>
    </div>
  )
}
