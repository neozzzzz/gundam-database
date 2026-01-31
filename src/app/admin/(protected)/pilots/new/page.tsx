'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/image-upload'

export default function AddPilot() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [factions, setFactions] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    code: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    affiliation_default_id: '',
    rank: '',
    role: '',
    bio: '',
    birth_date: '',
    death_date: '',
    nationality: '',
    blood_type: '',
    height: '',
    weight: '',
    image_url: '',
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
    
    if (!formData.name_ko.trim()) {
      alert('이름(한글)은 필수입니다.')
      return
    }

    try {
      setLoading(true)

      const pilotData = {
        code: formData.code?.trim().toUpperCase() || null,
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        affiliation_default_id: formData.affiliation_default_id || null,
        rank: formData.rank?.trim() || null,
        role: formData.role || null,
        bio: formData.bio?.trim() || null,
        birth_date: formData.birth_date?.trim() || null,
        death_date: formData.death_date?.trim() || null,
        nationality: formData.nationality?.trim() || null,
        blood_type: formData.blood_type?.trim() || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        image_url: formData.image_url || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('pilots')
        .insert([pilotData])
        .select()

      if (error) throw error

      alert('파일럿이 성공적으로 추가되었습니다!')
      router.push('/admin/pilots')
    } catch (error: any) {
      console.error('파일럿 추가 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const ROLES = [
    { value: 'protagonist', label: '주인공' },
    { value: 'antagonist', label: '적대자' },
    { value: 'supporting', label: '조연' },
    { value: 'other', label: '기타' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/pilots"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👤 파일럿 추가</h1>
              <p className="text-sm text-gray-600 mt-1">새 파일럿 등록</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8">
          {/* 이미지 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">프로필 이미지</h2>
            <div className="max-w-xs">
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                bucket="images"
                folder="pilots"
                aspectRatio="aspect-[3/4]"
                placeholder="파일럿 이미지"
              />
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  코드
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="AMURO"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white font-mono uppercase"
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
                  placeholder="아무로 레이"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
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
                  placeholder="Amuro Ray"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
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
                  placeholder="アムロ・レイ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계급
                </label>
                <input
                  type="text"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  placeholder="대위"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  국적
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="사이드7"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 소속 & 역할 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">소속 & 역할</h2>
            
            <div className="space-y-6">
              {/* 진영 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소속 진영
                </label>
                {factions.length === 0 ? (
                  <p className="text-sm text-gray-500">등록된 진영이 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, affiliation_default_id: '' })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.affiliation_default_id === ''
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      선택 안 함
                    </button>
                    {factions.map((faction) => {
                      const isSelected = formData.affiliation_default_id === faction.id
                      return (
                        <button
                          key={faction.id}
                          type="button"
                          onClick={() => handleToggle('affiliation_default_id', faction.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'text-white shadow-md ring-2 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={isSelected ? { backgroundColor: faction.color || '#16A34A', ringColor: faction.color || '#16A34A' } : {}}
                        >
                          {faction.name_ko}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 역할 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => {
                    const isSelected = formData.role === role.value
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleToggle('role', role.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {role.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 신체 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">신체 정보</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <input
                  type="text"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  placeholder="U.C. 0063"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사망일
                </label>
                <input
                  type="text"
                  name="death_date"
                  value={formData.death_date}
                  onChange={handleChange}
                  placeholder="U.C. 0093"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  혈액형
                </label>
                <input
                  type="text"
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  placeholder="A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신장 (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="168"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  체중 (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="55"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 소개 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">소개</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="파일럿에 대한 소개..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900  focus:ring-0 text-gray-900 bg-white"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '저장 중...' : '파일럿 추가'}
            </button>
            <Link
              href="/admin/pilots"
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
