'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ImageUpload from '@/components/image-upload'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.mobileSuits

export default function AddMobileSuit() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [series, setSeries] = useState<any[]>([])
  const [factions, setFactions] = useState<any[]>([])
  const [pilots, setPilots] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
    model_number: '',
    series_id: '',
    faction_id: '',
    pilot_id: '',
    description: '',
    image_url: '',
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
      const [seriesRes, factionsRes, pilotsRes] = await Promise.all([
        supabase.from('series').select('*').order('name_ko'),
        supabase.from('factions').select('*').order('sort_order'),
        supabase.from('pilots').select('id, name_ko, name_en').order('name_ko'),
      ])
      setSeries(seriesRes.data || [])
      setFactions(factionsRes.data || [])
      setPilots(pilotsRes.data || [])
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
      const { error } = await supabase.from('mobile_suits').insert([{
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        model_number: formData.model_number?.trim().toUpperCase() || null,
        series_id: formData.series_id || null,
        faction_id: formData.faction_id || null,
        pilot_id: formData.pilot_id || null,
        description: formData.description?.trim() || null,
        image_url: formData.image_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]).select()

      if (error) throw error
      alert(`${PAGE_CONFIG.titleSingle}가 성공적으로 추가되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (dataLoading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`새 ${PAGE_CONFIG.titleSingle} 추가`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="이미지">
            <div className="max-w-xs">
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} bucket="images" folder="mobile-suits" aspectRatio="aspect-square" placeholder="모빌슈트 이미지" />
            </div>
          </AdminFormSection>

          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
              <AdminTextField label="이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} />
              <div>
                <label className={ADMIN_STYLES.label}>모델 번호</label>
                <input type="text" name="model_number" value={formData.model_number} onChange={handleChange} placeholder="RX-78-2" className={`${ADMIN_STYLES.input} font-mono uppercase`} />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="소속 정보">
            <div className="space-y-6">
              <AdminSelectButtons label="진영" options={factions.map(f => ({ value: f.id, label: f.name_ko, color: f.color }))} value={formData.faction_id} onChange={(v) => setFormData({ ...formData, faction_id: v })} scrollable />
              <AdminSelectButtons label="시리즈" options={series.map(s => ({ value: s.id, label: s.name_ko }))} value={formData.series_id} onChange={(v) => setFormData({ ...formData, series_id: v })} accentColor={PAGE_CONFIG.color.bgSolid} scrollable />
              <AdminSelectButtons label="파일럿" options={pilots.map(p => ({ value: p.id, label: p.name_ko }))} value={formData.pilot_id} onChange={(v) => setFormData({ ...formData, pilot_id: v })} accentColor={PAGE_CONFIG.color.bgSolid} scrollable />
            </div>
          </AdminFormSection>

          <AdminFormSection title="설명">
            <AdminTextarea label="" name="description" value={formData.description} onChange={handleChange} rows={4} />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
