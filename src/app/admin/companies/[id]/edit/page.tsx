'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES, UNIVERSES, COMPANY_TYPES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons, AdminLoading } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.companies

export default function EditCompany() {
  const router = useRouter()
  const params = useParams()
  const companyId = params?.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    universe: '',
    company_type: '',
    description: '',
  })

  useEffect(() => {
    const init = async () => {
      await checkAuth()
      if (companyId) await loadCompany()
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
      const { data, error } = await supabase.from('companies').select('*').eq('id', companyId).single()
      if (error) throw error

      if (data) {
        setFormData({
          code: data.code || '',
          name_ko: data.name_ko || '',
          name_en: data.name_en || '',
          name_ja: data.name_ja || '',
          universe: data.universe || '',
          company_type: data.company_type || '',
          description: data.description || '',
        })
      }
    } catch (error: any) {
      alert(`로딩 실패: ${error.message}`)
      router.push(PAGE_CONFIG.basePath)
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
      const { error } = await supabase.from('companies').update({
        code: formData.code.trim().toUpperCase(),
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        universe: formData.universe || null,
        company_type: formData.company_type || null,
        description: formData.description?.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', companyId).select()

      if (error) throw error
      alert(`${PAGE_CONFIG.titleSingle}가 성공적으로 수정되었습니다!`)
      router.push(PAGE_CONFIG.basePath)
    } catch (error: any) {
      alert(`수정 실패: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (loading) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 정보를 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`${PAGE_CONFIG.titleSingle} 수정`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} />
              <AdminTextField label="이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} />
              <div>
                <label className={ADMIN_STYLES.label}>코드 <span className="text-red-500">*</span></label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} className={`${ADMIN_STYLES.input} font-mono uppercase`} required />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="분류">
            <div className="space-y-6">
              <AdminSelectButtons label="세계관" options={UNIVERSES.map(u => ({ value: u.code, label: u.name }))} value={formData.universe} onChange={(v) => setFormData({ ...formData, universe: v })} accentColor={PAGE_CONFIG.color.bgSolid} />
              <AdminSelectButtons label="유형" options={COMPANY_TYPES.map(t => ({ value: t.code, label: t.name }))} value={formData.company_type} onChange={(v) => setFormData({ ...formData, company_type: v })} accentColor={PAGE_CONFIG.color.bgSolid} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="추가 정보">
            <AdminTextarea label="설명" name="description" value={formData.description} onChange={handleChange} rows={4} />
          </AdminFormSection>

          <AdminSubmitButtons saving={saving} submitText="수정 완료" cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
