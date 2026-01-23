// src/components/filter-panel.tsx
// 필터 패널 컴포넌트

'use client'

import { useEffect, useState } from 'react'
import type { Grade, Brand, Series, Timeline } from '@/lib/types'

interface FilterOptions {
  timelines: Timeline[]
  grades: Grade[]
  brands: Brand[]
  series: Series[]
}

interface FilterPanelProps {
  onFilterChange: (filters: any) => void
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [options, setOptions] = useState<FilterOptions>({
    timelines: [],
    grades: [],
    brands: [],
    series: [],
  })
  const [isOpen, setIsOpen] = useState(false)
  
  // 선택된 필터
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')
  const [isPbandai, setIsPbandai] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>('release_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 필터 옵션 로드
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    const filters = {
      grade: selectedGrades,
      brand: selectedBrands,
      series: selectedSeries,
      priceMin: priceMin ? parseInt(priceMin) : undefined,
      priceMax: priceMax ? parseInt(priceMax) : undefined,
      isPbandai,
      sortBy,
      sortOrder,
    }
    onFilterChange(filters)
  }, [selectedGrades, selectedBrands, selectedSeries, priceMin, priceMax, isPbandai, sortBy, sortOrder])

  async function fetchFilterOptions() {
    try {
      const response = await fetch('/api/filters')
      const result = await response.json()
      setOptions(result.data)
    } catch (error) {
      console.error('Failed to fetch filter options:', error)
    }
  }

  const handleGradeToggle = (code: string) => {
    setSelectedGrades(prev =>
      prev.includes(code) ? prev.filter(g => g !== code) : [...prev, code]
    )
  }

  const handleBrandToggle = (code: string) => {
    setSelectedBrands(prev =>
      prev.includes(code) ? prev.filter(b => b !== code) : [...prev, code]
    )
  }

  const handleSeriesToggle = (id: string) => {
    setSelectedSeries(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleReset = () => {
    setSelectedGrades([])
    setSelectedBrands([])
    setSelectedSeries([])
    setPriceMin('')
    setPriceMax('')
    setIsPbandai(undefined)
    setSortBy('release_date')
    setSortOrder('desc')
  }

  const activeFilterCount = 
    selectedGrades.length + 
    selectedBrands.length + 
    selectedSeries.length + 
    (priceMin ? 1 : 0) + 
    (priceMax ? 1 : 0) + 
    (isPbandai !== undefined ? 1 : 0)

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
        {/* 정렬 */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">정렬</h3>
          <div className="space-y-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-threads w-full"
            >
              <option value="release_date">출시일</option>
              <option value="name_ko">이름</option>
              <option value="price_krw">가격</option>
              <option value="view_count">조회수</option>
            </select>
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

        {/* 등급 */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">등급</h3>
          <div className="flex flex-wrap gap-2">
            {options.grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => handleGradeToggle(grade.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedGrades.includes(grade.code)
                    ? 'bg-primary text-black'
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                {grade.code}
              </button>
            ))}
          </div>
        </div>

        {/* 브랜드 */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">브랜드</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
            {options.brands.slice(0, 20).map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.code)}
                  onChange={() => handleBrandToggle(brand.code)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 시리즈 */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">시리즈</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
            {options.series.slice(0, 20).map((series) => (
              <label
                key={series.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSeries.includes(series.id)}
                  onChange={() => handleSeriesToggle(series.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{series.name_ko}</span>
              </label>
            ))}
          </div>
        </div>

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

        {/* P-BANDAI */}
        <div className="card-threads">
          <h3 className="font-bold mb-3">P-BANDAI</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPbandai === true}
                onChange={(e) => setIsPbandai(e.target.checked ? true : undefined)}
                className="w-4 h-4"
              />
              <span className="text-sm">P-BANDAI만 보기</span>
            </label>
          </div>
        </div>

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
