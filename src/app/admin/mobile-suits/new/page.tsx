'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function AddMobileSuit() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [factions, setFactions] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  
  // 파일럿 자동완성
  const [pilotSearch, setPilotSearch] = useState('')
  const [pilotResults, setPilotResults] = useState<any[]>([])
  const [showPilotDropdown, setShowPilotDropdown] = useState(false)
  const [selectedPilot, setSelectedPilot] = useState<any>(null)
  const pilotInputRef = useRef<HTMLInputElement>(null)
  const pilotDropdownRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    model_number: '',
    pilot_id: '',
    faction_id: '',
    series_id: '',
    company_id: '',
    description: '',
    base_model: '',
  })

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  // 파일럿 검색
  useEffect(() => {
    const searchPilots = async () => {
      if (pilotSearch.length < 1) {
        setPilotResults([])
        return
      }

      const { data } = await supabase
        .from('pilots')
        .select('id, name_ko, name_en, code')
        .or(`name_ko.ilike.%${pilotSearch}%,name_en.ilike.%${pilotSearch}%,code.ilike.%${pilotSearch}%`)
        .limit(10)

      setPilotResults(data || [])
    }

    const debounce = setTimeout(searchPilots, 200)
    return () => clearTimeout(debounce)
  }, [pilotSearch])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pilotDropdownRef.current &&
        !pilotDropdownRef.current.contains(event.target as Node) &&
        pilotInputRef.current &&
        !pilotInputRef.current.contains(event.target as Node)
      ) {
        setShowPilotDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadData = async () => {
    const { data: factionsData } = await supabase
      .from('factions')
      .select('*')
      .order('sort_order')
    
    const { data: seriesData } = await supabase
      .from('series')
      .select('*')
      .order('name_ko')

    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    setFactions(factionsData || [])
    setSeries(seriesData || [])
    setCompanies(companiesData || [])
  }

  const handlePilotSelect = (pilot: any) => {
    setSelectedPilot(pilot)
    setPilotSearch(pilot.name_ko)
    setFormData({
      ...formData,
      pilot_id: pilot.id,
    })
    setShowPilotDropdown(false)
  }

  const handlePilotClear = () => {
    setSelectedPilot(null)
    setPilotSearch('')
    setFormData({
      ...formData,
      pilot_id: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name_ko.trim()) {
      alert('이름(한글)은 필수입니다.')
      return
    }

    try {
      setLoading(true)

      const mobileSuitData = {
        name_ko: formData.name_ko,
        name_en: formData.name_en || null,
        name_ja: formData.name_ja || null,
        model_number: formData.model_number || null,
        pilot_id: formData.pilot_id || null,
        faction_id: formData.faction_id || null,
        series_id: formData.series_id || null,
        company_id: formData.company_id || null,
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

  const handleToggle = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field as keyof typeof formData] === value ? '' : value
    })
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
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 새 모빌슈트 추가
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
                  이름 (한글) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_ko"
                  value={formData.name_ko}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white font-mono"
                  placeholder="예: MSN-04"
                />
              </div>

              {/* 파일럿 자동완성 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  파일럿
                </label>
                <div className="relative">
                  <input
                    ref={pilotInputRef}
                    type="text"
                    value={pilotSearch}
                    onChange={(e) => {
                      setPilotSearch(e.target.value)
                      setShowPilotDropdown(true)
                      if (!e.target.value) {
                        setSelectedPilot(null)
                        setFormData({ ...formData, pilot: '', pilot_id: '' })
                      }
                    }}
                    onFocus={() => setShowPilotDropdown(true)}
                    className={`w-full px-4 py-2 border rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white ${
                      selectedPilot ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="파일럿 이름 검색..."
                  />
                  {selectedPilot && (
                    <button
                      type="button"
                      onClick={handlePilotClear}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* 드롭다운 */}
                {showPilotDropdown && pilotResults.length > 0 && (
                  <div 
                    ref={pilotDropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {pilotResults.map((pilot) => (
                      <button
                        key={pilot.id}
                        type="button"
                        onClick={() => handlePilotSelect(pilot)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{pilot.name_ko}</div>
                          <div className="text-sm text-gray-500">
                            {pilot.name_en && <span>{pilot.name_en}</span>}
                            {pilot.code && <span className="ml-2 font-mono text-xs bg-gray-100 px-1 rounded">{pilot.code}</span>}
                          </div>
                        </div>
                        <span className="text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {showPilotDropdown && pilotSearch.length > 0 && pilotResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}

                {selectedPilot && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    파일럿 선택됨: {selectedPilot.name_ko}
                  </div>
                )}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                  placeholder="예: 자쿠 II"
                />
              </div>
            </div>
          </div>

          {/* 진영 & 시리즈 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">진영 & 시리즈 & 제조사</h2>
            
            <div className="space-y-6">
              {/* 진영 뱃지 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진영
                </label>
                {factions.length === 0 ? (
                  <p className="text-sm text-gray-500">등록된 진영이 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, faction_id: '' })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.faction_id === ''
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      선택 안 함
                    </button>
                    {factions.map((faction) => {
                      const isSelected = formData.faction_id === faction.id
                      return (
                        <button
                          key={faction.id}
                          type="button"
                          onClick={() => handleToggle('faction_id', faction.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'text-white shadow-md ring-2 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={isSelected ? { backgroundColor: faction.color || '#F97316', ringColor: faction.color || '#F97316' } : {}}
                        >
                          {faction.name_ko}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 제조사 뱃지 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제조사
                </label>
                {companies.length === 0 ? (
                  <p className="text-sm text-gray-500">등록된 제조사가 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, company_id: '' })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.company_id === ''
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      선택 안 함
                    </button>
                    {companies.map((company) => {
                      const isSelected = formData.company_id === company.id
                      return (
                        <button
                          key={company.id}
                          type="button"
                          onClick={() => handleToggle('company_id', company.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'text-white shadow-md ring-2 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={isSelected ? { backgroundColor: company.color || '#14B8A6', ringColor: company.color || '#14B8A6' } : {}}
                        >
                          {company.name_ko}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 시리즈 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시리즈
                </label>
                {series.length === 0 ? (
                  <p className="text-sm text-gray-500">등록된 시리즈가 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
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
                )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
              placeholder="모빌슈트에 대한 설명을 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '추가 중...' : '모빌슈트 추가'}
            </button>
            <Link
              href="/admin/mobile-suits"
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
