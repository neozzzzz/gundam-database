'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AddMobileSuit() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [factions, setFactions] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    model_number: '',
    pilot: '',
    faction_default_id: '',
    series_id: '',
    description: '',
    base_model: '',
  })

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadData = async () => {
    // 진영 로드
    const { data: factionsData } = await supabase
      .from('factions')
      .select('*')
      .order('sort_order')
    
    // 시리즈 로드
    const { data: seriesData } = await supabase
      .from('series')
      .select('*')
      .order('name_ko')

    setFactions(factionsData || [])
    setSeries(seriesData || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      const mobileSuitData = {
        name_ko: formData.name_ko,
        name_en: formData.name_en || null,
        name_ja: formData.name_ja || null,
        model_number: formData.model_number || null,
        pilot: formData.pilot || null,
        faction_default_id: formData.faction_default_id || null,
        series_id: formData.series_id || null,
        description: formData.description || null,
        base_model: formData.base_model || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('mobile_suits')
        .insert([mobileSuitData])
        .select()

      if (error) throw error

      alert('모빌슈트가 성공적으로 추가되었습니다!')
      router.push('/admin/mobile-suits')
    } catch (error: any) {
      console.error('모빌슈트 추가 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
              href="/admin/mobile-suits"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              새 모빌슈트 추가
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8">
          {/* 기본 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 (한글) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_ko"
                    value={formData.name_ko}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="예: 사자비"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 (영문)
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="예: Sazabi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 (일본어)
                  </label>
                  <input
                    type="text"
                    name="name_ja"
                    value={formData.name_ja}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="例: サザビー"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    모델 넘버
                  </label>
                  <input
                    type="text"
                    name="model_number"
                    value={formData.model_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono"
                    placeholder="예: MSN-04"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    파일럿
                  </label>
                  <input
                    type="text"
                    name="pilot"
                    value={formData.pilot}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="예: 샤아 아즈나블"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    베이스 모델
                  </label>
                  <input
                    type="text"
                    name="base_model"
                    value={formData.base_model}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="예: 자쿠 II"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 진영 & 시리즈 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">진영 & 시리즈</h2>
            
            <div className="space-y-6">
              {/* 진영 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진영 (선택사항)
                </label>
                <select
                  name="faction_default_id"
                  value={formData.faction_default_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">선택 안 함</option>
                  {factions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name_ko} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 시리즈 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시리즈 (선택사항)
                </label>
                <select
                  name="series_id"
                  value={formData.series_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">선택 안 함</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_ko}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">설명</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="모빌슈트에 대한 설명을 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '추가 중...' : '모빌슈트 추가'}
            </button>
            <Link
              href="/admin/mobile-suits"
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
