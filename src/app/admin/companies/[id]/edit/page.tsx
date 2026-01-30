'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const UNIVERSES = [
  { code: 'UC', name: 'UC (Universal Century)' },
  { code: 'CE', name: 'CE (Cosmic Era)' },
  { code: 'AD', name: 'AD (Anno Domini)' },
  { code: 'AC', name: 'AC (After Colony)' },
  { code: 'FC', name: 'FC (Future Century)' },
  { code: 'PD', name: 'PD (Post Disaster)' },
  { code: 'AS', name: 'AS (Ad Stella)' },
  { code: 'BD', name: 'BD (Build)' },
]

const COMPANY_TYPES = [
  { code: 'manufacturer', name: '제조사', desc: 'MS 제조 기업' },
  { code: 'research', name: '연구기관', desc: '기술 연구소' },
  { code: 'conglomerate', name: '복합기업', desc: '대기업/재벌' },
  { code: 'military_org', name: '군사조직', desc: '군 직영 공장' },
]

const ALIGNMENTS = [
  { code: 'federation', name: '연방 계열' },
  { code: 'zeon', name: '지온 계열' },
  { code: 'neutral', name: '중립' },
  { code: 'multi_side', name: '양측 공급' },
]

export default function EditCompanyPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params?.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    universe: '',
    company_type: '',
    alignment: '',
    color: '#14B8A6',
    description: '',
    sort_order: 0,
  })

  useEffect(() => {
    const init = async () => {
      await checkAuth()
      if (companyId) {
        await loadCompany()
      }
    }
    init()
  }, [companyId])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadCompany = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          code: data.code || '',
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          universe: data.universe || '',
          company_type: data.company_type || '',
          alignment: data.alignment || '',
          color: data.color || '#14B8A6',
          description: data.description || '',
          sort_order: data.sort_order || 0,
        })
      }
    } catch (error: any) {
      console.error('제조사 로딩 오류:', error)
      alert(`로딩 실패: ${error.message}`)
      router.push('/admin/companies')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name_ko.trim()) {
      alert('코드와 이름(한글)은 필수입니다.')
      return
    }

    try {
      setSaving(true)

      const companyData = {
        code: formData.code.toUpperCase(),
        name_ko: formData.name_ko,
        name_en: formData.name_en || null,
        name_ja: formData.name_ja || null,
        universe: formData.universe || null,
        company_type: formData.company_type || null,
        alignment: formData.alignment || null,
        color: formData.color || null,
        description: formData.description || null,
        sort_order: formData.sort_order || 0,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyId)

      if (error) throw error

      alert('제조사가 성공적으로 수정되었습니다!')
      router.push('/admin/companies')
    } catch (error: any) {
      console.error('제조사 수정 오류:', error)
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

  const handleToggle = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field as keyof typeof formData] === value ? '' : value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">제조사 정보를 불러오는 중...</p>
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
              href="/admin/companies"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              🏭 제조사 수정
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8">
          {/* 기본 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
            
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white font-mono uppercase"
                  placeholder="예: AE, ZEONIC"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white"
                  placeholder="예: 애너하임 일렉트로닉스"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white"
                  placeholder="예: Anaheim Electronics"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white"
                  placeholder="예: アナハイム・エレクトロニクス"
                />
              </div>
            </div>
          </div>

          {/* 분류 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">분류 정보</h2>
            
            <div className="space-y-6">
              {/* 세계관 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">세계관</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, universe: '' })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.universe === ''
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    선택 안 함
                  </button>
                  {UNIVERSES.map((universe) => {
                    const isSelected = formData.universe === universe.code
                    return (
                      <button
                        key={universe.code}
                        type="button"
                        onClick={() => handleToggle('universe', universe.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {universe.code}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 기업 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기업 유형</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, company_type: '' })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.company_type === ''
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    선택 안 함
                  </button>
                  {COMPANY_TYPES.map((type) => {
                    const isSelected = formData.company_type === type.code
                    return (
                      <button
                        key={type.code}
                        type="button"
                        onClick={() => handleToggle('company_type', type.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={type.desc}
                      >
                        {type.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 진영 성향 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">진영 성향</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, alignment: '' })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.alignment === ''
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    선택 안 함
                  </button>
                  {ALIGNMENTS.map((alignment) => {
                    const isSelected = formData.alignment === alignment.code
                    return (
                      <button
                        key={alignment.code}
                        type="button"
                        onClick={() => handleToggle('alignment', alignment.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {alignment.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 표시 설정 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">표시 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">배지 색상</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white font-mono"
                    placeholder="#14B8A6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white"
                  placeholder="0"
                />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white"
              placeholder="제조사/기업에 대한 설명을 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '저장 중...' : '수정 완료'}
            </button>
            <Link
              href="/admin/companies"
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
