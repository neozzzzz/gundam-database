'use client'

import { useState, useRef, useEffect } from 'react'
import { ADMIN_STYLES } from '@/lib/constants/admin-config'

/**
 * AdminAutocomplete - 재사용 가능한 자동완성 컴포넌트
 * 
 * 사용법:
 * <AdminAutocomplete<Pilot>
 *   label="파일럿 선택"
 *   placeholder="파일럿 이름 검색..."
 *   value={selectedPilot}
 *   onChange={setSelectedPilot}
 *   onSearch={searchPilots}
 *   displayField="name_ko"
 *   renderItem={(item) => <div>{item.name_ko}</div>}
 * />
 */

interface AdminAutocompleteProps<T> {
  label?: string
  placeholder?: string
  value: T | null
  onChange: (value: T | null) => void
  onSearch: (query: string) => Promise<T[]>
  displayField: keyof T
  renderItem?: (item: T) => React.ReactNode
  debounceMs?: number
  minChars?: number
  disabled?: boolean
  selectedMessage?: (item: T) => string
}

export default function AdminAutocomplete<T extends { id: string }>({
  label,
  placeholder = '검색...',
  value,
  onChange,
  onSearch,
  displayField,
  renderItem,
  debounceMs = 200,
  minChars = 1,
  disabled = false,
  selectedMessage,
}: AdminAutocompleteProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 선택된 값이 있으면 입력창에 표시
  useEffect(() => {
    if (value) {
      setSearchQuery(String(value[displayField]))
    }
  }, [value, displayField])

  // 디바운스된 검색
  useEffect(() => {
    if (searchQuery.length < minChars) {
      setResults([])
      return
    }

    setIsLoading(true)
    const debounce = setTimeout(async () => {
      try {
        const data = await onSearch(searchQuery)
        setResults(data)
      } catch (error) {
        console.error('검색 오류:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(debounce)
  }, [searchQuery, onSearch, debounceMs, minChars])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: T) => {
    onChange(item)
    setSearchQuery(String(item[displayField]))
    setShowDropdown(false)
  }

  const handleClear = () => {
    onChange(null)
    setSearchQuery('')
    setResults([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    setShowDropdown(true)
    if (!newValue) {
      onChange(null)
    }
  }

  const defaultRenderItem = (item: T) => (
    <div className="font-medium text-gray-900">
      {String(item[displayField])}
    </div>
  )

  return (
    <div className="space-y-1">
      {label && <label className={ADMIN_STYLES.label}>{label}</label>}
      
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition-colors ${
              value ? 'border-green-500 bg-green-50' : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
          />
          
          {/* 로딩 스피너 또는 클리어 버튼 */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (value || searchQuery) && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
        
        {/* 드롭다운 */}
        {showDropdown && !disabled && results.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                {renderItem ? renderItem(item) : defaultRenderItem(item)}
                <span className="text-green-600 flex-shrink-0 ml-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 검색 결과 없음 */}
        {showDropdown && !disabled && searchQuery.length >= minChars && results.length === 0 && !isLoading && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </div>

      {/* 선택 완료 메시지 */}
      {value && (
        <div className="text-sm text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {selectedMessage ? selectedMessage(value) : `선택됨: ${String(value[displayField])}`}
        </div>
      )}
    </div>
  )
}
