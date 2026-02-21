// src/components/admin/AdminSearchFilter.tsx
// Admin 페이지 공통 검색 필터
// V1.11.4: 자체 디바운스 + IME 지원 + 포커스 유지

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface AdminSearchFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function AdminSearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = '검색...',
  debounceMs = 300,
}: AdminSearchFilterProps) {
  // 로컬 입력값 (컴포넌트 내부에서만 관리)
  const [localValue, setLocalValue] = useState(searchTerm)
  
  // IME 조합 중 여부
  const isComposingRef = useRef(false)
  
  // 디바운스 타이머
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 내부에서 변경 중인지 여부 (외부 동기화 방지)
  const isInternalChangeRef = useRef(false)

  // 외부 searchTerm이 변경되면 로컬값도 동기화
  // (단, 내부 변경 중이 아닐 때만 - 사용자 입력 중 덮어쓰기 방지)
  useEffect(() => {
    if (!isInternalChangeRef.current && !isComposingRef.current) {
      setLocalValue(searchTerm)
    }
  }, [searchTerm])

  // 디바운스된 검색어 전달
  const debouncedSearch = useCallback((value: string) => {
    // 기존 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    isInternalChangeRef.current = true
    
    // 새 타이머 설정
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value)
      // 약간의 딜레이 후 플래그 해제 (리렌더링 완료 대기)
      setTimeout(() => {
        isInternalChangeRef.current = false
      }, 50)
    }, debounceMs)
  }, [onSearchChange, debounceMs])

  // 입력 변경 핸들러
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    
    // IME 조합 중이 아닐 때만 디바운스 검색 시작
    if (!isComposingRef.current) {
      debouncedSearch(value)
    }
  }, [debouncedSearch])

  // IME 조합 시작
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  // IME 조합 완료
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    // 조합 완료 후 디바운스 검색 시작
    debouncedSearch(e.currentTarget.value)
  }, [debouncedSearch])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
      />
    </div>
  )
}
