'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES, UNIVERSES, COMPANY_TYPES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminSelectButtons, AdminFormSection, AdminSubmitButtons } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.companies

export default function AddCompany() {
  const router = useRouter()
  const supabase = createClientComponentClient()
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
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
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
      const { error } = await supabase.from('companies').insert([{
        code: formData.code.trim().toUpperCase(),
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        universe: formData.universe || null,
        company_type: formData.company_type || null,
        description: formData.description?.trim() || null,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminFormHeader title={`새 ${PAGE_CONFIG.titleSingle} 추가`} icon={PAGE_CONFIG.icon} backHref={PAGE_CONFIG.basePath} />

      <main className={ADMIN_STYLES.formContainer}>
        <form onSubmit={handleSubmit} className={ADMIN_STYLES.formCard}>
          
          <AdminFormSection title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTextField label="이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required placeholder="아나하임 일렉트로닉스" />
              <AdminTextField label="이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} placeholder="Anaheim Electronics" />
              <AdminTextField label="이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} placeholder="アナハイム・エレクトロニクス" />
              <div>
                <label className={ADMIN_STYLES.label}>코드 <span className="text-red-500">*</span></label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="AE" className={`${ADMIN_STYLES.input} font-mono uppercase`} required />
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

          <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
        </form>
      </main>
    </div>
  )
}
