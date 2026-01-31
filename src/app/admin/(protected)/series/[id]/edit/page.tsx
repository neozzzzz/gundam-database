'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SeriesData {
  name_ko: string
  name_en: string
  name_ja: string
  description: string
}

export default function EditSeriesPage() {
  const router = useRouter()
  const params = useParams()
  const seriesId = params.id as string
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<SeriesData>({
    name_ko: '',
    name_en: '',
    name_ja: '',
    description: ''
  })

  // 인증 확인 및 시리즈 데이터 로딩
  useEffect(() => {
    const checkAuthAndLoadSeries = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/admin/login')
        return
      }

      if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        alert('접근 권한이 없습니다.')
        await supabase.auth.signOut()
        router.push('/admin/login')
        return
      }

      // 시리즈 데이터 로딩
      await loadSeries()
    }

    checkAuthAndLoadSeries()
  }, [seriesId])

  const loadSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('id', seriesId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          description: data.description || ''
        })
      }
    } catch (error) {
      console.error('시리즈 로딩 오류:', error)
      alert('시리즈를 찾을 수 없습니다.')
      router.push('/admin')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('series')
        .update({
          name_ko: formData.name_ko,
          name_en: formData.name_en || null,
          name_ja: formData.name_ja || null,
          description: formData.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', seriesId)

      if (error) throw error

      alert('시리즈가 수정되었습니다!')
      router.push('/admin')
    } catch (error: any) {
      console.error('시리즈 수정 오류:', error)
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">시리즈 정보를 불러오는 중...</p>
        </div>
      </div>
    )
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
              시리즈 수정
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8">
          <div className="space-y-6">
            {/* 한글 이름 */}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
                placeholder="예: 기동전사 건담 GQuuuuuuX"
              />
            </div>

            {/* 영문 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시리즈 이름 (영문)
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
                placeholder="예: Mobile Suit Gundam GQuuuuuuX"
              />
            </div>

            {/* 일본어 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시리즈 이름 (일본어)
              </label>
              <input
                type="text"
                name="name_ja"
                value={formData.name_ja}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
                placeholder="예: 機動戦士ガンダム GQuuuuuuX"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
                placeholder="시리즈에 대한 설명을 입력하세요..."
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '수정 중...' : '시리즈 수정'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
