'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function EditKit() {
  const router = useRouter()
  const params = useParams()
  const kitId = params?.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grades, setGrades] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [mobileSuits, setMobileSuits] = useState<any[]>([]) // ⭐
  const [searchTerm, setSearchTerm] = useState('') // ⭐
  
  const scaleOptions = ['1/144', '1/100', '1/60', 'Non-scale']
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    grade_id: '',
    series_id: '',
    brand_id: '',
    mobile_suit_id: '', // ⭐
    scale: '1/144',
    price_krw: '',
    price_jpy: '',
    product_code: '',
    release_date: '',
    description: '',
    status: 'active',
  })

  useEffect(() => {
    const init = async () => {
      await checkAuth()
      await loadData()
      if (kitId) {
        await loadKit()
      }
    }
    init()
  }, [kitId])

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
      const { data: gradesData } = await supabase
        .from('grades')
        .select('*')
        .order('sort_order')
      
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .order('name_ko')
      
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order')

      // ⭐ 모빌슈트 로드
      const { data: mobileSuitsData } = await supabase
        .from('mobile_suits')
        .select(`
          id,
          name_ko,
          name_en,
          model_number,
          faction,
          pilot,
          organization:organizations(
            name_ko,
            faction
          )
        `)
        .order('name_ko')

      setGrades(gradesData || [])
      setSeries(seriesData || [])
      setBrands(brandsData || [])
      setMobileSuits(mobileSuitsData || []) // ⭐
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    }
  }

  const loadKit = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('gundam_kits')
        .select('*')
        .eq('id', kitId)
        .single()

      if (error) throw error

      if (data) {
        let formattedDate = ''
        if (data.release_date) {
          const date = new Date(data.release_date)
          formattedDate = date.toISOString().split('T')[0]
        }

        setFormData({
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          grade_id: data.grade_id || '',
          series_id: data.series_id || '',
          brand_id: data.brand_id || '',
          mobile_suit_id: data.mobile_suit_id || '', // ⭐
          scale: data.scale || '1/144',
          price_krw: data.price_krw?.toString() || '',
          price_jpy: data.price_jpy?.toString() || '',
          product_code: data.product_code || '',
          release_date: formattedDate,
          description: data.description || '',
          status: data.status || 'active',
        })
      }
    } catch (error: any) {
      console.error('킷 로딩 오류:', error)
      alert(`킷 로딩 실패: ${error.message}`)
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      const kitData: any = {
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        grade_id: formData.grade_id || null,
        series_id: formData.series_id || null,
        brand_id: formData.brand_id || null,
        mobile_suit_id: formData.mobile_suit_id || null, // ⭐
        scale: formData.scale || null,
        price_krw: formData.price_krw ? parseInt(formData.price_krw) : null,
        price_jpy: formData.price_jpy ? parseInt(formData.price_jpy) : null,
        product_code: formData.product_code?.trim() || null,
        release_date: formData.release_date || null,
        description: formData.description?.trim() || null,
        status: formData.status,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedData, error } = await supabase
        .from('gundam_kits')
        .update(kitData)
        .eq('id', kitId)
        .select()

      if (error) throw error

      if (!updatedData || updatedData.length === 0) {
        throw new Error('데이터가 수정되지 않았습니다.')
      }

      alert('✅ 킷이 성공적으로 수정되었습니다!')
      router.push('/admin?refresh=true')
      
    } catch (error: any) {
      console.error('킷 수정 실패:', error)
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

  // ⭐ 모빌슈트 필터링
  const filteredMobileSuits = mobileSuits.filter(ms => {
    const search = searchTerm.toLowerCase()
    return (
      ms.name_ko?.toLowerCase().includes(search) ||
      ms.name_en?.toLowerCase().includes(search) ||
      ms.model_number?.toLowerCase().includes(search)
    )
  })

  // ⭐ 선택된 모빌슈트
  const selectedMobileSuit = mobileSuits.find(ms => ms.id === formData.mobile_suit_id)

  // ⭐ 진영 색상
  const FACTION_COLORS: Record<string, string> = {
    'EF': 'bg-blue-500/20 text-blue-600 border-blue-300',
    'ZEON': 'bg-red-500/20 text-red-600 border-red-300',
    'PLANT': 'bg-green-500/20 text-green-600 border-green-300',
    'CB': 'bg-purple-500/20 text-purple-600 border-purple-300',
    'OTHER': 'bg-gray-500/20 text-gray-600 border-gray-300',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">킷 정보를 불러오는 중...</p>
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
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">킷 수정</h1>
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
                    킷 이름 (한글) <span className="text-red-500">*</span>
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
                    킷 이름 (영문)
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* 등급 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  등급 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {grades.map((grade) => {
                    const isSelected = formData.grade_id === grade.id
                    return (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={() => handleToggle('grade_id', grade.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {grade.code}
                      </button>
                    )
                  })}
                </div>
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
                            ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {s.name_ko}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 브랜드 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드 (선택사항)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, brand_id: '' })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.brand_id === ''
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    선택 안 함
                  </button>
                  {brands.map((brand) => {
                    const isSelected = formData.brand_id === brand.id
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleToggle('brand_id', brand.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {brand.code}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 스케일 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  스케일
                </label>
                <div className="flex flex-wrap gap-2">
                  {scaleOptions.map((scale) => {
                    const isSelected = formData.scale === scale
                    return (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => handleToggle('scale', scale)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-600 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {scale}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ⭐ 모빌슈트 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span>
              <span>모빌슈트</span>
            </h2>

            {/* 선택된 모빌슈트 표시 */}
            {selectedMobileSuit && (
              <div className={`mb-4 p-4 rounded-lg border-2 ${FACTION_COLORS[selectedMobileSuit.faction || 'OTHER']}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{selectedMobileSuit.name_ko}</div>
                    {selectedMobileSuit.model_number && (
                      <div className="text-sm text-gray-600 font-mono mt-1">
                        {selectedMobileSuit.model_number}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {selectedMobileSuit.faction && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${FACTION_COLORS[selectedMobileSuit.faction]}`}>
                          {selectedMobileSuit.faction}
                        </span>
                      )}
                      {selectedMobileSuit.pilot && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          파일럿: {selectedMobileSuit.pilot}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mobile_suit_id: '' })}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* 검색 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모빌슈트 검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름, 모델 넘버로 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 모빌슈트 목록 */}
            <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg">
              {filteredMobileSuits.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다' : '모빌슈트를 불러오는 중...'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mobile_suit_id: '' })}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                      formData.mobile_suit_id === '' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="text-gray-500 text-sm">선택 안 함</div>
                  </button>
                  {filteredMobileSuits.map((ms) => (
                    <button
                      key={ms.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, mobile_suit_id: ms.id })
                        setSearchTerm('')
                      }}
                      className={`w-full p-3 text-left hover:bg-blue-50 transition-colors ${
                        formData.mobile_suit_id === ms.id ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{ms.name_ko}</div>
                      {ms.model_number && (
                        <div className="text-sm text-gray-600 font-mono">{ms.model_number}</div>
                      )}
                      <div className="flex gap-2 mt-1">
                        {ms.faction && (
                          <span className={`px-2 py-0.5 rounded text-xs ${FACTION_COLORS[ms.faction]}`}>
                            {ms.faction}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">가격 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (원)
                </label>
                <input
                  type="number"
                  name="price_krw"
                  value={formData.price_krw}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (엔)
                </label>
                <input
                  type="number"
                  name="price_jpy"
                  value={formData.price_jpy}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">추가 정보</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제품 코드
                  </label>
                  <input
                    type="text"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출시일
                  </label>
                  <input
                    type="date"
                    name="release_date"
                    value={formData.release_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* 상태 (토글) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'active', label: '활성' },
                    { value: 'discontinued', label: '단종' },
                    { value: 'upcoming', label: '출시 예정' }
                  ].map(({ value, label }) => {
                    const isSelected = formData.status === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: value })}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
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
              href="/admin"
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
