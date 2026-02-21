// src/components/filter-panel.tsx
// 필터 패널 컴포넌트
// V1.9.3: 등급/스케일 분리, 년도 표기 삭제, 커스텀 스크롤바 적용

'use client'

import { useEffect, useState, useRef } from 'react'
import { CustomScrollbar } from './custom-scrollbar'

// 실제 DB 스키마에 맞는 타입 정의
interface Timeline {
  id: string
  name_ko: string
  name_en: string | null
  sort_order: number | null
  is_active: boolean
}

interface Grade {
  id: string
  code: string  // API에서 id를 code로 매핑
  name_ko: string | null
  name_en: string | null
  scale: string | null
  sort_order: number | null
  is_active: boolean
}

interface Series {
  id: string
  name_ko: string
  name_en: string | null
  year_start: number | null
  year_end: number | null
  media_type: string | null
  timeline_id: string | null
  timeline: { id: string; name_ko: string } | null
}

interface LimitedType {
  id: string
  name_ko: string
  name_en: string | null
  description: string | null
  badge_color: string | null
  sort_order: number | null
  is_active: boolean
}

interface FilterOptions {
  timelines: Timeline[]
  grades: Grade[]
  series: Series[]
  limitedTypes: LimitedType[]
}

interface FilterPanelProps {
  onFilterChange: (filters: any) => void
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [options, setOptions] = useState<FilterOptions>({
    timelines: [],
    grades: [],
    series: [],
    limitedTypes: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  
  // 선택된 필터
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedScales, setSelectedScales] = useState<string[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [selectedLimitedTypes, setSelectedLimitedTypes] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('release_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 정렬 옵션
  const sortOptions = [
    { value: 'release_date', label: '출시일' },
    { value: 'name_ko', label: '이름' },
    { value: 'price_krw', label: '가격' },
    { value: 'view_count', label: '조회수' },
  ]

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 필터 옵션 로드
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    const filters = {
      grade: selectedGrades,
      scale: selectedScales,
      series: selectedSeries,
      limitedTypes: selectedLimitedTypes,
      priceMin: priceMin ? parseInt(priceMin) : undefined,
      priceMax: priceMax ? parseInt(priceMax) : undefined,
      sortBy,
      sortOrder,
    }
    onFilterChange(filters)
  }, [selectedGrades, selectedScales, selectedSeries, selectedLimitedTypes, priceMin, priceMax, sortBy, sortOrder])

  async function fetchFilterOptions() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/filters')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error && !result.data) {
        throw new Error(result.error)
      }
      
      if (result.data) {
        setOptions({
          timelines: result.data.timelines || [],
          grades: result.data.grades || [],
          series: result.data.series || [],
          limitedTypes: result.data.limitedTypes || [],
        })
      } else {
        setOptions({
          timelines: result.timelines || [],
          grades: result.grades || [],
          series: result.series || [],
          limitedTypes: result.limitedTypes || [],
        })
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err)
      setError(err instanceof Error ? err.message : '필터 옵션을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 등급에서 고유 스케일 목록 추출
  const uniqueScales = [...new Set(
    options.grades
      .map(g => g.scale)
      .filter((scale): scale is string => scale !== null && scale !== '')
  )].sort((a, b) => {
    // 스케일 정렬: 1/144 -> 1/100 -> 1/60 순서
    const getScaleValue = (s: string) => {
      const match = s.match(/1\/(\d+)/)
      return match ? parseInt(match[1]) : 9999
    }
    return getScaleValue(b) - getScaleValue(a)  // 숫자가 큰 것(작은 스케일)이 먼저
  })

  const handleGradeToggle = (code: string) => {
    setSelectedGrades(prev =>
      prev.includes(code) ? prev.filter(g => g !== code) : [...prev, code]
    )
  }

  const handleScaleToggle = (scale: string) => {
    setSelectedScales(prev =>
      prev.includes(scale) ? prev.filter(s => s !== scale) : [...prev, scale]
    )
  }

  const handleSeriesToggle = (id: string) => {
    setSelectedSeries(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleLimitedTypeToggle = (id: string) => {
    setSelectedLimitedTypes(prev =>
      prev.includes(id) ? prev.filter(lt => lt !== id) : [...prev, id]
    )
  }

  const handleReset = () => {
    setSelectedGrades([])
    setSelectedScales([])
    setSelectedSeries([])
    setSelectedLimitedTypes([])
    setPriceMin('')
    setPriceMax('')
    setSortBy('release_date')
    setSortOrder('desc')
  }

  const activeFilterCount = 
    selectedGrades.length + 
    selectedScales.length +
    selectedSeries.length + 
    selectedLimitedTypes.length +
    (priceMin ? 1 : 0) + 
    (priceMax ? 1 : 0)

  return (
    <div>
      {/* 필터 버튼 (모바일) */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary w-full flex items-center justify-between"
        >
          <span>필터 {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* 필터 패널 */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* 로딩 상태 */}
        {loading && (
          <div className="card-threads text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-2"></div>
            <p className="text-sm text-muted-foreground">필터 로딩 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="card-threads bg-red-900/20 border-red-900">
            <p className="text-sm text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchFilterOptions}
              className="text-xs text-primary hover:underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 정렬 */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">정렬</h3>
          <div className="space-y-2">
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-xl text-foreground hover:bg-accent transition-colors"
              >
                <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isSortDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 py-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value)
                        setIsSortDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-colors ${
                        sortBy === option.value
                          ? 'bg-primary text-black font-medium'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('desc')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  sortOrder === 'desc'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                내림차순
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  sortOrder === 'asc'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                오름차순
              </button>
            </div>
          </div>
        </div>

        {/* 등급 (스케일 제외) */}
        {!loading && (
          <div className="card-threads">
            <h3 className="font-bold mb-3">
              등급
              {options.grades.length === 0 && (
                <span className="text-xs text-muted-foreground ml-2">(데이터 없음)</span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {options.grades.length === 0 ? (
                <p className="text-sm text-muted-foreground">등급 데이터를 불러올 수 없습니다</p>
              ) : (
                options.grades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => handleGradeToggle(grade.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedGrades.includes(grade.code)
                        ? 'bg-primary text-black'
                        : 'bg-secondary text-foreground hover:bg-accent'
                    }`}
                    title={grade.name_ko || grade.id}
                  >
                    {grade.id}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 스케일 (등급에서 분리) */}
        {!loading && uniqueScales.length > 0 && (
          <div className="card-threads">
            <h3 className="font-bold mb-3">스케일</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueScales.map((scale) => (
                <button
                  key={scale}
                  onClick={() => handleScaleToggle(scale)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedScales.includes(scale)
                      ? 'bg-primary text-black'
                      : 'bg-secondary text-foreground hover:bg-accent'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 시리즈 - 커스텀 스크롤바 적용, 년도 표기 삭제 */}
        {!loading && (
          <div className="card-threads">
            <h3 className="font-bold mb-3">
              시리즈
              {options.series.length === 0 && (
                <span className="text-xs text-muted-foreground ml-2">(데이터 없음)</span>
              )}
            </h3>
            {options.series.length === 0 ? (
              <p className="text-sm text-muted-foreground">시리즈 데이터를 불러올 수 없습니다</p>
            ) : (
              <CustomScrollbar maxHeight="280px">
                <div className="flex flex-col gap-1.5 pr-1">
                  {[...options.series]
                    .sort((a, b) => (a.year_start || 9999) - (b.year_start || 9999))
                    .map((series) => (
                    <button
                      key={series.id}
                      onClick={() => handleSeriesToggle(series.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                        selectedSeries.includes(series.id)
                          ? 'bg-primary text-black'
                          : 'bg-secondary text-foreground hover:bg-accent'
                      }`}
                    >
                      {series.name_ko}
                    </button>
                  ))}
                </div>
              </CustomScrollbar>
            )}
          </div>
        )}

        {/* 가격 범위 */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">가격 범위</h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="최소 가격"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="input-threads w-full"
            />
            <input
              type="number"
              placeholder="최대 가격"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="input-threads w-full"
            />
          </div>
        </div>

        {/* 한정판 */}
        {!loading && options.limitedTypes.length > 0 && (
          <div className="card-threads">
            <h3 className="font-bold mb-3">한정판</h3>
            <div className="flex flex-col gap-1.5">
              {options.limitedTypes.map((limitedType) => (
                <button
                  key={limitedType.id}
                  onClick={() => handleLimitedTypeToggle(limitedType.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-left flex items-center gap-2 ${
                    selectedLimitedTypes.includes(limitedType.id)
                      ? 'text-white'
                      : 'bg-secondary text-foreground hover:bg-accent'
                  }`}
                  style={selectedLimitedTypes.includes(limitedType.id) 
                    ? { backgroundColor: limitedType.badge_color || '#DC2626' } 
                    : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: limitedType.badge_color || '#DC2626' }}
                  />
                  {limitedType.name_ko}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 초기화 버튼 */}
        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="btn-secondary w-full"
          >
            필터 초기화 ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )
}
