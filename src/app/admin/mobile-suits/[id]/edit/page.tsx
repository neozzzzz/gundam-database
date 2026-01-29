'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function EditMobileSuit() {
  const router = useRouter()
  const params = useParams()
  const mobileSuitId = params?.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    model_number: '',
    pilot: '',
    faction: 'EF',
    organization_id: '',
    series_id: '',
    description: '',
    base_model: '',
  })

  useEffect(() => {
    const init = async () => {
      await checkAuth()
      await loadData()
      if (mobileSuitId) {
        await loadMobileSuit()
      }
    }
    init()
  }, [mobileSuitId])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('로그인이 필요합니다.')
      router.push('/admin/login')
      return
    }
    
    if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      alert('접근 권한이 없습니다.')
      await supabase.auth.signOut()
      router.push('/admin/login')
      return
    }
  }

  const loadData = async () => {
    try {
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*')
        .order('name_ko')
      
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .order('name_ko')

      setOrganizations(orgsData || [])
      setSeries(seriesData || [])
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    }
  }

  const loadMobileSuit = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('mobile_suits')
        .select('*')
        .eq('id', mobileSuitId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          model_number: data.model_number || '',
          pilot: data.pilot || '',
          faction: data.faction || 'EF',
          organization_id: data.organization_id || '',
          series_id: data.series_id || '',
          description: data.description || '',
          base_model: data.base_model || '',
        })
      }
    } catch (error: any) {
      console.error('모빌슈트 로딩 오류:', error)
      alert(`로딩 실패: ${error.message}`)
      router.push('/admin/mobile-suits')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      const mobileSuitData: any = {
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        model_number: formData.model_number?.trim() || null,
        pilot: formData.pilot?.trim() || null,
        faction: formData.faction || null,
        organization_id: formData.organization_id || null,
        series_id: formData.series_id || null,
        description: formData.description?.trim() || null,
        base_model: formData.base_model?.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedData, error } = await supabase
        .from('mobile_suits')
        .update(mobileSuitData)
        .eq('id', mobileSuitId)
        .select()

      if (error) throw error

      if (!updatedData || updatedData.length === 0) {
        throw new Error('데이터가 수정되지 않았습니다.')
      }

      alert('✅ 모빌슈트가 성공적으로 수정되었습니다!')
      router.push('/admin/mobile-suits')
      
    } catch (error: any) {
      console.error('모빌슈트 수정 실패:', error)
      alert(`수정 실패: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // 진영별로 조직 필터링
  const filteredOrganizations = organizations.filter(org => 
    !formData.faction || org.faction === formData.faction
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">모빌슈트 정보를 불러오는 중...</p>
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
              href="/admin/mobile-suits"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">모빌슈트 수정</h1>
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
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 진영 & 조직 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">진영 & 조직</h2>
            
            <div className="space-y-6">
              {/* 진영 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진영
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'EF', label: '지구연방', color: 'bg-blue-600' },
                    { value: 'ZEON', label: '지온', color: 'bg-red-600' },
                    { value: 'PLANT', label: '플랜트', color: 'bg-green-600' },
                    { value: 'CB', label: '솔레스탈 비잉', color: 'bg-purple-600' },
                    { value: 'OTHER', label: '기타', color: 'bg-gray-600' }
                  ].map(({ value, label, color }) => {
                    const isSelected = formData.faction === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, faction: value, organization_id: '' })
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? `${color} text-white shadow-md ring-2 ring-offset-2`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 조직 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  조직 (선택사항)
                </label>
                {filteredOrganizations.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {formData.faction ? '해당 진영의 조직이 없습니다' : '진영을 먼저 선택하세요'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, organization_id: '' })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.organization_id === ''
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      선택 안 함
                    </button>
                    {filteredOrganizations.map((org) => {
                      const isSelected = formData.organization_id === org.id
                      return (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => handleToggle('organization_id', org.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-600 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {org.name_ko}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 시리즈 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시리즈 (선택사항)
                </label>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, series_id: '' })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.series_id === ''
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    선택 안 함
                  </button>
                  {series.map((s) => {
                    const isSelected = formData.series_id === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggle('series_id', s.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {s.name_ko}
                      </button>
                    )
                  })}
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
              href="/admin/mobile-suits"
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
