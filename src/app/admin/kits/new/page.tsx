'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AddKit() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [grades, setGrades] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [mobileSuits, setMobileSuits] = useState<any[]>([]) // ⭐ 모빌슈트 목록
  const [searchTerm, setSearchTerm] = useState('') // ⭐ 검색어
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    grade_id: '',
    series_id: '',
    brand_id: '',
    mobile_suit_id: '', // ⭐ 모빌슈트 ID
    scale: '1/144',
    price_krw: '',
    price_jpy: '',
    product_code: '',
    release_date: '',
    description: '',
    status: 'active',
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
    
    // 브랜드 로드
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // 데이터 정리
      const kitData = {
        name_ko: formData.name_ko,
        name_en: formData.name_en || null,
        grade_id: formData.grade_id || null,
        series_id: formData.series_id || null,
        brand_id: formData.brand_id || null,
        mobile_suit_id: formData.mobile_suit_id || null, // ⭐
        scale: formData.scale || null,
        price_krw: formData.price_krw ? parseInt(formData.price_krw) : null,
        price_jpy: formData.price_jpy ? parseInt(formData.price_jpy) : null,
        product_code: formData.product_code || null,
        release_date: formData.release_date || null,
        description: formData.description || null,
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('gundam_kits')
        .insert([kitData])
        .select()

      if (error) throw error

      alert('킷이 성공적으로 추가되었습니다!')
      router.push('/admin?refresh=true')
    } catch (error: any) {
      console.error('킷 추가 오류:', error)
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
              새 킷 추가
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
                  킷 이름 (한글) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_ko"
                  value={formData.name_ko}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="예: HGUC 사자비"
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
                  placeholder="예: HGUC Sazabi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  등급 <span className="text-red-500">*</span>
                </label>
                <select
                  name="grade_id"
                  value={formData.grade_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">등급 선택</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.code} - {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시리즈
                </label>
                <select
                  name="series_id"
                  value={formData.series_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">시리즈 선택 (선택사항)</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_ko}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">브랜드 선택 (선택사항)</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.code} - {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  스케일
                </label>
                <select
                  name="scale"
                  value={formData.scale}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="1/144">1/144</option>
                  <option value="1/100">1/100</option>
                  <option value="1/60">1/60</option>
                  <option value="Non-scale">Non-scale</option>
                </select>
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
                  placeholder="예: 38000"
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
                  placeholder="예: 3520"
                />
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">추가 정보</h2>
            
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
                  placeholder="예: 5057492"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="active">활성</option>
                  <option value="discontinued">단종</option>
                  <option value="upcoming">출시 예정</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="킷에 대한 설명을 입력하세요..."
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '추가 중...' : '킷 추가'}
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
