'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  value: string                          // 현재 이미지 URL
  onChange: (url: string) => void        // URL 변경 핸들러
  bucket?: string                        // Supabase Storage 버킷명
  folder?: string                        // 저장 폴더 경로
  maxSizeMB?: number                     // 최대 파일 크기 (MB)
  acceptTypes?: string[]                 // 허용 이미지 타입
  aspectRatio?: string                   // 미리보기 비율 (예: 'aspect-square')
  placeholder?: string                   // 플레이스홀더 텍스트
  className?: string                     // 추가 클래스
}

// 업로드 정책 기본값
const DEFAULT_MAX_SIZE_MB = 5
const DEFAULT_ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DEFAULT_BUCKET = 'images'

export default function ImageUpload({
  value,
  onChange,
  bucket = DEFAULT_BUCKET,
  folder = 'uploads',
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptTypes = DEFAULT_ACCEPT_TYPES,
  aspectRatio = 'aspect-square',
  placeholder = '이미지를 드래그하거나 클릭하세요',
  className = '',
}: ImageUploadProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    // 타입 검사
    if (!acceptTypes.includes(file.type)) {
      return `지원하지 않는 형식입니다. (${acceptTypes.map(t => t.split('/')[1]).join(', ')}만 가능)`
    }
    
    // 크기 검사
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`
    }
    
    return null
  }

  // 파일 업로드 처리
  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // 고유 파일명 생성
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

      // Supabase Storage에 업로드
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(urlData.publicUrl)
    } catch (err: any) {
      console.error('업로드 오류:', err)
      setError(err.message || '업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  // 드래그 이벤트 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }, [])

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  // 클릭 핸들러 - URL 입력 모드 또는 파일 선택
  const handleClick = () => {
    if (!isDragging) {
      setShowUrlInput(true)
    }
  }

  // URL 입력 확인
  const handleUrlSubmit = () => {
    if (urlInputValue.trim()) {
      // 간단한 URL 검증
      if (urlInputValue.startsWith('http://') || urlInputValue.startsWith('https://')) {
        onChange(urlInputValue.trim())
        setError(null)
      } else {
        setError('올바른 URL 형식이 아닙니다. (http:// 또는 https://로 시작)')
        return
      }
    }
    setShowUrlInput(false)
    setUrlInputValue('')
  }

  // 이미지 삭제
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setError(null)
  }

  // 파일 선택 버튼
  const handleSelectFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  return (
    <div className={`relative ${className}`}>
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL 입력 모달 */}
      {showUrlInput && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowUrlInput(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">이미지 추가</h3>
            
            {/* URL 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL 입력
              </label>
              <input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUrlSubmit()
                  if (e.key === 'Escape') setShowUrlInput(false)
                }}
              />
            </div>

            {/* 구분선 */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 파일 선택 버튼 */}
            <button
              type="button"
              onClick={handleSelectFile}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              컴퓨터에서 파일 선택
            </button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              {acceptTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} / 최대 {maxSizeMB}MB
            </p>

            {/* 버튼 */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInputValue.trim()}
                className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 업로드 영역 */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative ${aspectRatio} border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200 overflow-hidden
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : value 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        {/* 이미지 미리보기 */}
        {value && !isUploading && (
          <>
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
            >
              ×
            </button>
            {/* 변경 오버레이 */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white font-medium">클릭하여 변경</span>
            </div>
          </>
        )}

        {/* 업로드 중 */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-3"></div>
            <p className="text-gray-600 text-sm">업로드 중...</p>
          </div>
        )}

        {/* 드래그 오버레이 */}
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 z-10">
            <svg className="w-10 h-10 mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            <p className="text-blue-600 font-medium">이미지를 여기에 놓으세요</p>
          </div>
        )}

        {/* 기본 상태 */}
        {!value && !isUploading && !isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15l-5-5L5 21"/>
            </svg>
            <p className="text-sm font-medium">{placeholder}</p>
            <p className="text-xs mt-1 text-gray-400">
              드래그 & 드롭 또는 클릭
            </p>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* 현재 URL 표시 (디버깅/확인용) */}
      {value && (
        <p className="mt-2 text-xs text-gray-500 truncate" title={value}>
          {value}
        </p>
      )}
    </div>
  )
}
