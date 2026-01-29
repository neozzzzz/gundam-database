'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function EditFaction() {
  const router = useRouter()
  const params = useParams()
  const factionId = params?.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [factions, setFactions] = useState<any[]>([])
  
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
    loadFaction()
  }, [factionId])

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

  const loadFaction = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('factions')
        .select('*')
        .eq('id', factionId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          code: data.code || '',
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          parent_id: data.parent_id || '',
          universe: data.universe || 'UC',
          color: data.color || '#0066CC',
          description: data.description || '',
          sort_order: data.sort_order || 0,
        })
      }
    } catch (error: any) {
      console.error('진영 로딩 오류:', error)
      alert(`로딩 실패: ${error.message}`)
      router.push('/admin/factions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code || !formData.name_ko) {
      alert('코드와 이름(한글)은 필수입니다!')
      return
    }

    try {
      setSaving(true)

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
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('factions')
        .update(factionData)
        .eq('id', factionId)

      if (error) throw error

      alert('✅ 진영이 수정되었습니다!')
      router.push('/admin/factions')
    } catch (error: any) {
      console.error('진영 수정 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">진영 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">진영 수정</h1>
              <p className="text-sm text-gray-600 mt-1">{formData.name_ko}</p>
            </div>
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
                  />
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
                  />
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
                    />
                  </div>
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
                    {factions.filter(f => f.id !== factionId).map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name_ko} ({f.code})
                      </option>
                    ))}
                  </select>
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
                <div className="font-semibold text-gray-900">{formData.name_ko}</div>
                <div className="text-sm text-gray-600">{formData.code} · {formData.universe}</div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '저장 중...' : '✅ 수정 완료'}
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
