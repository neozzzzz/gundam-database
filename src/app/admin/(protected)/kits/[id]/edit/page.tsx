'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/image-upload'

export default function EditKit() {
  const router = useRouter()
  const params = useParams()
  const kitId = params?.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grades, setGrades] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [mobileSuits, setMobileSuits] = useState<any[]>([])
  const [factions, setFactions] = useState<any[]>([])
  const [factionsMap, setFactionsMap] = useState<Record<string, any>>({})
  const [searchTerm, setSearchTerm] = useState('')
  
  const scaleOptions = ['1/144', '1/100', '1/60', 'Non-scale']
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    grade_id: '',
    series_id: '',
    mobile_suit_id: '',
    scale: '1/144',
    price_krw: '',
    price_jpy: '',
    product_code: '',
    release_date: '',
    description: '',
    status: 'active',
    box_art_url: '',
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
    }
  }

  const loadData = async () => {
    try {
      // 등급 로드
      const { data: gradesData } = await supabase
        .from('grades')
        .select('*')
        .order('sort_order')
      
      // 시리즈 로드
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .order('name_ko')

      // 진영 로드
      const { data: factionsData } = await supabase
        .from('factions')
        .select('*')
        .order('sort_order')

      // 모빌슈트 로드 (간소화된 쿼리)
      const { data: mobileSuitsData } = await supabase
        .from('mobile_suits')
        .select('id, name_ko, name_en, model_number, faction_id')
        .order('name_ko')

      setGrades(gradesData || [])
      setSeries(seriesData || [])
      setFactions(factionsData || [])
      setMobileSuits(mobileSuitsData || [])
      
      // 진영 맵 생성
      const fMap: Record<string, any> = {}
      factionsData?.forEach(f => { fMap[f.id] = f })
      setFactionsMap(fMap)
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
          mobile_suit_id: data.mobile_suit_id || '',
          scale: data.scale || '1/144',
          price_krw: data.price_krw?.toString() || '',
          price_jpy: data.price_jpy?.toString() || '',
          product_code: data.product_code || '',
          release_date: formattedDate,
          description: data.description || '',
          status: data.status || 'active',
          box_art_url: data.box_art_url || '',
        })
      }
    } catch (error: any) {
      console.error('킷 로딩 오류:', error)
      alert(`킷 로딩 실패: ${error.message}`)
      router.push('/admin/kits')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name_ko.trim()) {
      alert('킷 이름(한글)은 필수입니다.')
      return
    }

    try {
      setSaving(true)

      const kitData = {
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        grade_id: formData.grade_id || null,
        series_id: formData.series_id || null,
        mobile_suit_id: formData.mobile_suit_id || null,
        scale: formData.scale || null,
        price_krw: formData.price_krw ? parseInt(formData.price_krw) : null,
        price_jpy: formData.price_jpy ? parseInt(formData.price_jpy) : null,
        product_code: formData.product_code?.trim() || null,
        release_date: formData.release_date || null,
        description: formData.description?.trim() || null,
        status: formData.status,
        box_art_url: formData.box_art_url || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('gundam_kits')
        .update(kitData)
        .eq('id', kitId)

      if (error) throw error

      alert('킷이 성공적으로 수정되었습니다!')
      router.push('/admin/kits')
    } catch (error: any) {
      console.error('킷 수정 오류:', error)
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

  // 모빌슈트 필터링
  const filteredMobileSuits = mobileSuits.filter(ms => {
    const search = searchTerm.toLowerCase()
    return (
      ms.name_ko?.toLowerCase().includes(search) ||
      ms.name_en?.toLowerCase().includes(search) ||
      ms.model_number?.toLowerCase().includes(search)
    )
  })

  // 선택된 모빌슈트
  const selectedMobileSuit = mobileSuits.find(ms => ms.id === formData.mobile_suit_id)

  // 진영 정보 가져오기
  const getFaction = (factionId: string) => {
    if (!factionId) return null
    return factionsMap[factionId] || null
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
              href="/admin/kits"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📦 킷 수정</h1>
              <p className="text-sm text-gray-600 mt-1">{formData.name_ko}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8">
          {/* 박스아트 이미지 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">박스아트</h2>
            <div className="max-w-xs">
              <ImageUpload
                value={formData.box_art_url}
                onChange={(url) => setFormData({ ...formData, box_art_url: url })}
                bucket="images"
                folder="kits"
                aspectRatio="aspect-[4/3]"
                placeholder="박스아트 이미지"
              />
            </div>
          </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
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
                            ? 'bg-blue-600 text-white shadow-md'
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
                  시리즈
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
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
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {s.name_ko}
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
                            ? 'bg-orange-600 text-white shadow-md'
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

          {/* 모빌슈트 연결 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              모빌슈트 연결 (선택사항)
            </h2>

            {/* 선택된 모빌슈트 표시 */}
            {selectedMobileSuit && (
              <div className="mb-4 p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{selectedMobileSuit.name_ko}</div>
                    {selectedMobileSuit.model_number && (
                      <div className="text-sm text-gray-600 font-mono mt-1">
                        {selectedMobileSuit.model_number}
                      </div>
                    )}
                    {selectedMobileSuit.faction_id && getFaction(selectedMobileSuit.faction_id) && (
                      <div className="mt-2">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getFaction(selectedMobileSuit.faction_id)?.color || '#6B7280' }}
                        >
                          {getFaction(selectedMobileSuit.faction_id)?.name_ko}
                        </span>
                      </div>
                    )}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
              />
            </div>

            {/* 모빌슈트 목록 */}
            <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg">
              {filteredMobileSuits.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다' : '등록된 모빌슈트가 없습니다'}
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
                  {filteredMobileSuits.map((ms) => {
                    const faction = getFaction(ms.faction_id)
                    return (
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
                        {faction && (
                          <div className="mt-1">
                            <span 
                              className="px-2 py-0.5 rounded text-xs text-white"
                              style={{ backgroundColor: faction.color || '#6B7280' }}
                            >
                              {faction.name_ko}
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
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
                  placeholder="25000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
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
                  placeholder="2500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">추가 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품 코드
                </label>
                <input
                  type="text"
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleChange}
                  placeholder="BAN123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  발매일
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
                />
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
                placeholder="킷에 대한 설명..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* 상태 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">상태</h2>
            <div className="flex gap-4">
              {['active', 'discontinued', 'upcoming'].map((status) => {
                const isSelected = formData.status === status
                const labels: Record<string, string> = {
                  'active': '판매중',
                  'discontinued': '단종',
                  'upcoming': '출시예정',
                }
                const colors: Record<string, string> = {
                  'active': 'bg-green-600',
                  'discontinued': 'bg-gray-600',
                  'upcoming': 'bg-yellow-600',
                }
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? `${colors[status]} text-white shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {labels[status]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '저장 중...' : '수정 완료'}
            </button>
            <Link
              href="/admin/kits"
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
