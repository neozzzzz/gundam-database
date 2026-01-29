'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AddFaction() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [factions, setFactions] = useState<any[]>([]) // 상위 진영용
  
  const [formData, setFormData] = useState({
    code: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    parent_id: '',
    universe: 'UC',
    color: '#0066CC',
    description: '',
    sort_order: 0,
  })

  useEffect(() => {
    checkAuth()
    loadFactions()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadFactions = async () => {
    const { data } = await supabase
      .from('factions')
      .select('*')
      .order('sort_order')
    
    setFactions(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code || !formData.name_ko) {
      alert('코드와 이름(한글)은 필수입니다!')
      return
    }

    try {
      setLoading(true)

      const factionData = {
        code: formData.code.trim().toUpperCase(),
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        parent_id: formData.parent_id || null,
        universe: formData.universe || null,
        color: formData.color || null,
        description: formData.description?.trim() || null,
        sort_order: formData.sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('factions')
        .insert([factionData])

      if (error) throw error

      alert('✅ 진영이 추가되었습니다!')
      router.push('/admin/factions')
    } catch (error: any) {
      console.error('진영 추가 오류:', error)
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
              href="/admin/factions"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              새 진영 추가
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
                    코드 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono uppercase"
                    placeholder="EFSF"
                  />
                  <p className="text-xs text-gray-500 mt-1">영문 대문자, 최대 20자</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">작을수록 먼저 표시</p>
                </div>

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
                    placeholder="지구연방군"
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
                    placeholder="Earth Federation Space Force"
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
                    placeholder="地球連邦軍"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 분류 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">분류</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    세계관
                  </label>
                  <select
                    name="universe"
                    value={formData.universe}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="UC">UC (Universal Century)</option>
                    <option value="CE">CE (Cosmic Era)</option>
                    <option value="AD">AD (Anno Domini)</option>
                    <option value="AC">AC (After Colony)</option>
                    <option value="AG">AG (Advanced Generation)</option>
                    <option value="PD">PD (Post Disaster)</option>
                    <option value="RC">RC (Regild Century)</option>
                    <option value="BUILD">BUILD</option>
                    <option value="SD">SD</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    색상
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      maxLength={7}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono"
                      placeholder="#0066CC"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">진영 색상 (Hex 코드)</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상위 조직 (선택사항)
                  </label>
                  <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">없음</option>
                    {factions.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name_ko} ({f.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">예: 에우고 → 반 지온</p>
                </div>
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
              placeholder="진영에 대한 설명..."
            />
          </div>

          {/* 미리보기 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">미리보기</h3>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {formData.name_ko || '이름'}
                </div>
                <div className="text-sm text-gray-600">
                  {formData.code || 'CODE'} · {formData.universe}
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '추가 중...' : '✅ 진영 추가'}
            </button>
            <Link
              href="/admin/factions"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-center flex items-center justify-center"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
