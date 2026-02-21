'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/utils/logger'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Admin error', error, {
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h1>
        <p className="text-gray-600 mb-6">
          관리자 페이지에서 문제가 발생했습니다.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            관리자 홈으로
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer text-gray-700 text-sm mb-2">
              개발자 정보
            </summary>
            <pre className="text-xs text-red-600 overflow-auto max-h-64">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
