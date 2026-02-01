'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminFormHeader, AdminTextField, AdminTextarea, AdminFormSection, AdminSubmitButtons } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.series

export default function AddSeries() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    name_ja: '',
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
    if (!formData.name_ko.trim()) {
      alert(`${PAGE_CONFIG.titleSingle} 이름(한글)은 필수입니다.`)
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('series').insert([{
        name_ko: formData.name_ko.trim(),
        name_en: formData.name_en?.trim() || null,
        name_ja: formData.name_ja?.trim() || null,
        description: formData.description?.trim() || null,
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
            <div className="space-y-6">
              <AdminTextField label="시리즈 이름 (한글)" name="name_ko" value={formData.name_ko} onChange={handleChange} required placeholder="예: 기동전사 건담 GQuuuuuuX" />
              <AdminTextField label="시리즈 이름 (영문)" name="name_en" value={formData.name_en} onChange={handleChange} placeholder="예: Mobile Suit Gundam GQuuuuuuX" />
              <AdminTextField label="시리즈 이름 (일본어)" name="name_ja" value={formData.name_ja} onChange={handleChange} placeholder="예: 機動戦士ガンダム GQuuuuuuX" />
              <AdminTextarea label="설명" name="description" value={formData.description} onChange={handleChange} placeholder="시리즈에 대한 설명을 입력하세요..." />
            </div>
          </AdminFormSection>

          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>예시:</strong><br />
              한글: 기동전사 건담 SEED FREEDOM<br />
              영문: Mobile Suit Gundam SEED FREEDOM<br />
              일본어: 機動戦士ガンダムSEED FREEDOM
            </p>
          </div>

          <div className="mt-8">
            <AdminSubmitButtons saving={saving} submitText={`${PAGE_CONFIG.titleSingle} 추가`} cancelHref={PAGE_CONFIG.basePath} accentColor={PAGE_CONFIG.color.bgSolid} accentHoverColor={PAGE_CONFIG.color.bgSolidHover} />
          </div>
        </form>
      </main>
    </div>
  )
}
