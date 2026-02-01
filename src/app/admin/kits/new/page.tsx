'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ImageUpload from '@/components/image-upload'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { 
  AdminFormHeader, 
  AdminTextField, 
  AdminTextarea, 
  AdminSelectButtons, 
  AdminFormSection, 
  AdminSubmitButtons,
  AdminLoading 
} from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.kits

const STATUS_OPTIONS = [
  { value: 'active', label: '판매중', color: '#16A34A' },
  { value: 'discontinued', label: '단종', color: '#4B5563' },
  { value: 'upcoming', label: '출시예정', color: '#CA8A04' },
]

export default function AddKit() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
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
    try {
      setDataLoading(true)
      
      const [gradesRes, seriesRes, factionsRes, mobileSuitsRes] = await Promise.all([
        supabase.from('grades').select('*').order('sort_order'),
        supabase.from('series').select('*').order('name_ko'),
        supabase.from('factions').select('*').order('sort_order'),
        supabase.from('mobile_suits').select('id, name_ko, name_en, model_number, faction_id').order('name_ko'),
      ])

      setGrades(gradesRes.data || [])
      setSeries(seriesRes.data || [])
      setFactions(factionsRes.data || [])
      setMobileSuits(mobileSuitsRes.data || [])
      
      const fMap: Record<string, any> = {}
      factionsRes.data?.forEach(f => { fMap[f.id] = f })
      setFactionsMap(fMap)
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name_ko.trim()) {
      alert(`${PAGE_CONFIG.titleSingle} 이름(한글)은 필수입니다.`)
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('gundam_kits').insert([kitData]).select()
      if (error) throw error

      alert(`${PAGE_CONFIG.titleSingle}이(가) 성공적으로 추가되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const filteredMobileSuits = mobileSuits.filter(ms => {
    const search = searchTerm.toLowerCase()
    return ms.name_ko?.toLowerCase().includes(search) || ms.name_en?.toLowerCase().includes(search) || ms.model_number?.toLowerCase().includes(search)
  })

  const selectedMobileSuit = mobileSuits.find(ms => ms.id === formData.mobile_suit_id)
  const getFaction = (factionId: string) => factionsMap[factionId] || null

  if (dataLoading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`새 ${PAGE_CONFIG.titleSingle} 추가`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="박스아트">
            <div className="max-w-xs">
              <ImageUpload value={formData.box_art_url} onChange={(url) => setFormData({ ...formData, box_art_url: url })} bucket="images" folder="kits" aspectRatio="aspect-[4/3]" placeholder="박스아트 이미지" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="킷 이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="킷 이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
            </div>

            <div className="mt-6">
              <AdminSelectButtons
                label="등급"
                options={grades.map(g => ({ value: g.id, label: g.code }))}
                value={formData.grade_id}
                onChange={(v) => setFormData({ ...formData, grade_id: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
              />
            </div>

            <div className="mt-6">
              <AdminSelectButtons
                label="스케일"
                options={scaleOptions.map(s => ({ value: s, label: s }))}
                value={formData.scale}
                onChange={(v) => setFormData({ ...formData, scale: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
                allowEmpty={false}
              />
            </div>

            <div className="mt-6">
              <AdminSelectButtons
                label="시리즈"
                options={series.map(s => ({ value: s.id, label: s.name_ko }))}
                value={formData.series_id}
                onChange={(v) => setFormData({ ...formData, series_id: v })}
                accentColor={PAGE_CONFIG.color.bgSolid}
                scrollable
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="모빌슈트 연결">
            {selectedMobileSuit && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{selectedMobileSuit.name_ko}</div>
                    {selectedMobileSuit.model_number && <div className="text-sm text-gray-600 font-mono">{selectedMobileSuit.model_number}</div>}
                    {getFaction(selectedMobileSuit.faction_id) && (
                      <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: getFaction(selectedMobileSuit.faction_id)?.color || '#6B7280' }}>
                        {getFaction(selectedMobileSuit.faction_id)?.name_ko}
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={() => setFormData({ ...formData, mobile_suit_id: '' })} className="text-red-500 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className={ADMIN_STYLES.label}>모빌슈트 검색</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="이름, 모델 넘버로 검색..." className={ADMIN_STYLES.input} />
            </div>

            <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg">
              {filteredMobileSuits.length === 0 ? (
                <div className="p-4 text-center text-gray-500">{searchTerm ? '검색 결과가 없습니다' : '등록된 모빌슈트가 없습니다'}</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  <button type="button" onClick={() => setFormData({ ...formData, mobile_suit_id: '' })} className={`w-full p-3 text-left hover:bg-gray-50 ${formData.mobile_suit_id === '' ? 'bg-gray-100' : ''}`}>
                    <div className="text-gray-500 text-sm">선택 안 함</div>
                  </button>
                  {filteredMobileSuits.map((ms) => {
                    const faction = getFaction(ms.faction_id)
                    return (
                      <button key={ms.id} type="button" onClick={() => { setFormData({ ...formData, mobile_suit_id: ms.id }); setSearchTerm('') }}
                        className={`w-full p-3 text-left hover:bg-blue-50 ${formData.mobile_suit_id === ms.id ? 'bg-blue-100' : ''}`}>
                        <div className="font-medium text-gray-900">{ms.name_ko}</div>
                        {ms.model_number && <div className="text-sm text-gray-600 font-mono">{ms.model_number}</div>}
                        {faction && <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: faction.color || '#6B7280' }}>{faction.name_ko}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </AdminFormSection>

          <AdminFormSection title="가격 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="가격 (원)" name="price_krw" value={formData.price_krw} onChange={handleChange} type="number" placeholder="25000" />
              <AdminTextField label="가격 (엔)" name="price_jpy" value={formData.price_jpy} onChange={handleChange} type="number" placeholder="2500" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>제품 코드</label>
                <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} placeholder="BAN123456" className={`${ADMIN_STYLES.input} font-mono`} />
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>발매일</label>
                <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} className={ADMIN_STYLES.input} />
              </div>
            </div>
            <div className="mt-6">
              <AdminTextarea label="설명" name="description" value={formData.description} onChange={handleChange} placeholder="킷에 대한 설명..." />
            </div>
          </AdminFormSection>

          <AdminFormSection title="상태">
            <AdminSelectButtons
              label=""
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
              allowEmpty={false}
            />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
