'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ADMIN_STYLES, MS_RELATIONSHIP_TYPES, UNIVERSE_CODES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'
import AdminAutocomplete from '@/components/admin/AdminAutocomplete'

const PAGE_CONFIG = {
  title: 'MS-조직 관계 추가',
  basePath: '/admin/ms-organizations',
  icon: '/icons/admin/robot.svg',
  color: { bgSolid: '#8B5CF6', bgSolidHover: '#7C3AED' }
}

interface MobileSuit {
  id: string
  name_ko: string
  name_en?: string
  model_number?: string
}

export default function NewMsOrganizationPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<{ id: string; name_ko: string }[]>([])
  const [selectedMs, setSelectedMs] = useState<MobileSuit | null>(null)
  
  const [formData, setFormData] = useState({
    organization_id: '',
    relationship_type: 'operated_by',
    timeline_id: '',
    year_start: '',
    year_end: '',
    is_primary: true,
    notes: '',
  })

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const fetchData = async () => {
    const { data: orgsData } = await supabase.from('organizations').select('id, name_ko').order('name_ko')
    setOrganizations(orgsData || [])
    setLoading(false)
  }

  const searchMobileSuits = useCallback(async (query: string): Promise<MobileSuit[]> => {
    const { data } = await supabase
      .from('mobile_suits')
      .select('id, name_ko, name_en, model_number')
      .or(`name_ko.ilike.%${query}%,name_en.ilike.%${query}%,model_number.ilike.%${query}%`)
      .limit(10)
    return data || []
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMs || !formData.organization_id) {
      alert('모빌슈트와 조직은 필수입니다.')
      return
    }
    
    setSaving(true)
    
    const { error } = await supabase.from('ms_organizations').insert({
      mobile_suit_id: selectedMs.id,
      organization_id: formData.organization_id,
      relationship_type: formData.relationship_type,
      timeline_id: formData.timeline_id || null,
      year_start: formData.year_start ? parseInt(formData.year_start) : null,
      year_end: formData.year_end ? parseInt(formData.year_end) : null,
      is_primary: formData.is_primary,
      notes: formData.notes || null,
    })
    
    if (error) {
      alert('저장 실패: ' + error.message)
      setSaving(false)
    } else {
      alert('관계가 추가되었습니다!')
      router.push(PAGE_CONFIG.basePath)
    }
  }

  if (loading) {
    return <AdminLoading message="데이터를 불러오는 중..." spinnerColor={PAGE_CONFIG.color.bgSolid} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={PAGE_CONFIG.title} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="모빌슈트 선택">
            <AdminAutocomplete<MobileSuit>
              label="모빌슈트 *"
              placeholder="모빌슈트 이름, 모델 번호로 검색..."
              value={selectedMs}
              onChange={setSelectedMs}
              onSearch={searchMobileSuits}
              displayField="name_ko"
              renderItem={(ms) => (
                <div>
                  <div className="font-medium text-gray-900">{ms.name_ko}</div>
                  <div className="text-sm text-gray-500">
                    {ms.name_en && <span>{ms.name_en}</span>}
                    {ms.model_number && <span className="ml-2 font-mono text-xs bg-gray-100 px-1 rounded">{ms.model_number}</span>}
                  </div>
                </div>
              )}
              selectedMessage={(ms) => `모빌슈트 선택됨: ${ms.name_ko}${ms.model_number ? ` (${ms.model_number})` : ''}`}
            />
          </AdminFormSection>

          <AdminFormSection title="관계 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>조직 <span className="text-red-500">*</span></label>
                <select value={formData.organization_id} onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })} className={ADMIN_STYLES.input} required>
                  <option value="">조직 선택...</option>
                  {organizations.map(org => (<option key={org.id} value={org.id}>{org.name_ko} ({org.id})</option>))}
                </select>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>관계 유형 <span className="text-red-500">*</span></label>
                <select value={formData.relationship_type} onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })} className={ADMIN_STYLES.input} required>
                  {MS_RELATIONSHIP_TYPES.map(t => (<option key={t.code} value={t.code}>{t.name} ({t.code})</option>))}
                </select>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={ADMIN_STYLES.label}>타임라인</label>
                <select value={formData.timeline_id} onChange={(e) => setFormData({ ...formData, timeline_id: e.target.value })} className={ADMIN_STYLES.input}>
                  <option value="">선택 안 함</option>
                  {UNIVERSE_CODES.map(u => (<option key={u.code} value={u.code}>{u.name} ({u.code})</option>))}
                </select>
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>시작 연도</label>
                <input type="number" value={formData.year_start} onChange={(e) => setFormData({ ...formData, year_start: e.target.value })} className={ADMIN_STYLES.input} placeholder="예: 0079" />
              </div>
              <div>
                <label className={ADMIN_STYLES.label}>종료 연도</label>
                <input type="number" value={formData.year_end} onChange={(e) => setFormData({ ...formData, year_end: e.target.value })} className={ADMIN_STYLES.input} placeholder="예: 0093" />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_primary} onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
                <span className="text-sm font-medium text-gray-700">주요 관계 (이 관계 유형의 대표)</span>
              </label>
            </div>
          </AdminFormSection>

          <AdminFormSection title="비고">
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={ADMIN_STYLES.input} rows={3} placeholder="관계에 대한 추가 설명..." />
          </AdminFormSection>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>💡 관계 유형 설명:</strong><br />
              • <strong>operated_by</strong>: 운용 조직 (실제 사용하는 군/세력)<br />
              • <strong>manufactured_by</strong>: 제조사 (생산한 기업)<br />
              • <strong>developed_by</strong>: 개발사 (설계/개발한 조직)<br />
              • <strong>captured_by</strong>: 노획 (전투 중 빼앗은 경우)
            </p>
          </div>

          <AdminSubmitButtons saving={saving} submitText="관계 추가" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
