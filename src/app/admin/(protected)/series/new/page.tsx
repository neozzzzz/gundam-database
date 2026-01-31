'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AddSeries() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    description: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      const seriesData = {
        name_ko: formData.name_ko,
        name_en: formData.name_en || null,
        name_ja: formData.name_ja || null,
        description: formData.description || null,
      }

      const { data, error } = await supabase
        .from('series')
        .insert([seriesData])
        .select()

      if (error) throw error

      alert('시리즈가 성공적으로 추가되었습니다!')
      router.push('/admin')
    } catch (error: any) {
      console.error('시리즈 추가 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              새 시리즈 추가
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시리즈 이름 (한글) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name_ko"
                value={formData.name_ko}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900"
                placeholder="예: 기동전사 건담 GQuuuuuuX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시리즈 이름 (영문)
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900"
                placeholder="예: Mobile Suit Gundam GQuuuuuuX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시리즈 이름 (일본어)
              </label>
              <input
                type="text"
                name="name_ja"
                value={formData.name_ja}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900"
                placeholder="예: 機動戦士ガンダム GQuuuuuuX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900"
                placeholder="시리즈에 대한 설명을 입력하세요..."
              />
            </div>
          </div>

          {/* 예시 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>예시:</strong><br />
              한글: 기동전사 건담 SEED FREEDOM<br />
              영문: Mobile Suit Gundam SEED FREEDOM<br />
              일본어: 機動戦士ガンダムSEED FREEDOM<br />
              설명: 기동전사 건담 SEED 극장판. 2024년 개봉.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '추가 중...' : '시리즈 추가'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
