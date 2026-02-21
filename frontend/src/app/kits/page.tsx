// src/app/kits/page.tsx
// 건담 킷 목록 페이지 - 검색 & 필터 & 페이지네이션

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { KitCard } from '@/components/kit-card'
import { SearchBar } from '@/components/search-bar'
import { FilterPanel } from '@/components/filter-panel'
import { Pagination } from '@/components/pagination'
import { AuthButton } from '@/components/auth-button'
import type { KitListItem, PaginatedResponse } from '@/lib/types'

export default function KitsPage() {
  const [kits, setKits] = useState<KitListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  
  // Debounce 검색 & 가격 필터 (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedFilters = useDebounce(filters, 300)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  useEffect(() => {
    fetchKits()
  }, [debouncedSearch, debouncedFilters, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchKits = useCallback(async function fetchKits() {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setLoading(true)
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams()
      
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (debouncedFilters.grade?.length) params.append('grade', debouncedFilters.grade.join(','))
      if (debouncedFilters.scale?.length) params.append('scale', debouncedFilters.scale.join(','))
      if (debouncedFilters.brand?.length) params.append('brand', debouncedFilters.brand.join(','))
      if (debouncedFilters.series?.length) params.append('series', debouncedFilters.series.join(','))
      if (debouncedFilters.limitedTypes?.length) params.append('limitedTypes', debouncedFilters.limitedTypes.join(','))
      if (debouncedFilters.priceMin) params.append('priceMin', debouncedFilters.priceMin.toString())
      if (debouncedFilters.priceMax) params.append('priceMax', debouncedFilters.priceMax.toString())
      if (debouncedFilters.isPbandai !== undefined) params.append('isPbandai', debouncedFilters.isPbandai.toString())
      if (debouncedFilters.sortBy) params.append('sortBy', debouncedFilters.sortBy)
      if (debouncedFilters.sortOrder) params.append('sortOrder', debouncedFilters.sortOrder)
      
      // 페이지네이션 파라미터
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      
      const response = await fetch(`/api/kits?${params.toString()}`, {
        signal: controller.signal,
      })
      
      if (!response.ok) {
        throw new Error('킷 목록을 불러오는데 실패했습니다')
      }

      const data: PaginatedResponse<KitListItem> = await response.json()
      setError(null)
      setKits(data.data)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.total)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, debouncedFilters, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 페이지 변경 시 스크롤을 상단으로
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // 검색 시 첫 페이지로
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <a href="/" className="hover:text-primary transition-colors">
                GUNDAM ARCHIVE
              </a>
            </h1>
            <div className="flex items-center gap-4">
              <a href="/kits" className="text-primary">
                모델 목록
              </a>
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                홈
              </a>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 왼쪽: 필터 사이드바 */}
          <aside className="lg:col-span-1">
            <FilterPanel onFilterChange={handleFilterChange} />
          </aside>

          {/* 오른쪽: 메인 컨텐츠 */}
          <main className="lg:col-span-3">
            {/* 페이지 제목 & 검색 */}
            <div className="mb-6 space-y-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">건담 모델</h2>
                <p className="text-muted-foreground">
                  반다이 건담 프라모델 컬렉션
                </p>
              </div>
              
              <SearchBar 
                onSearch={handleSearch}
                placeholder="킷 이름 검색..."
              />
            </div>

            {/* 에러 상태 */}
            {error && (
              <div className="card-threads bg-red-900/20 border-red-900 text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* 킷 목록 */}
            {!error && (
              <div className="relative min-h-[400px]">
                {/* 로딩 오버레이 */}
                {loading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                      <p className="mt-4 text-white">로딩 중...</p>
                    </div>
                  </div>
                )}

                {/* 콘텐츠 */}
                <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      총 {totalItems}개의 모델
                    </span>
                    {searchQuery && (
                      <span className="text-primary">
                        "{searchQuery}" 검색 결과
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {kits.map((kit) => (
                      <KitCard key={kit.id} kit={kit} />
                    ))}
                  </div>

                  {/* 빈 상태 - 검색 결과 없음 */}
                  {kits.length === 0 && !loading && (
                    <div className="text-center py-20">
                      {/* 모노톤 돋보기 아이콘 */}
                      <div className="flex justify-center mb-6">
                        <svg 
                          className="w-24 h-24 text-muted-foreground opacity-40"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                          />
                        </svg>
                      </div>
                      <p className="text-xl font-bold mb-2 text-foreground">
                        검색 결과가 없습니다
                      </p>
                      <p className="text-muted-foreground">
                        다른 검색어나 필터를 시도해보세요
                      </p>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {kits.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
