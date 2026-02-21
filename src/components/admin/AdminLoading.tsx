// src/components/admin/AdminLoading.tsx
// Admin 페이지 공통 로딩 화면

'use client'

interface AdminLoadingProps {
  message?: string
  spinnerColor?: string // 예: 'blue', 'green', 'orange' 등
}

export function AdminLoading({
  message = '데이터를 불러오는 중...',
  spinnerColor = 'blue',
}: AdminLoadingProps) {
  const getSpinnerClass = () => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-600',
      purple: 'border-purple-600',
      orange: 'border-orange-600',
      green: 'border-green-600',
      red: 'border-red-600',
      indigo: 'border-indigo-600',
    }
    return colorMap[spinnerColor] || colorMap.blue
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getSpinnerClass()} mx-auto mb-4`}></div>
        <p className="text-gray-900 font-medium">{message}</p>
      </div>
    </div>
  )
}
