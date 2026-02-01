'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES, UNIVERSES, COMPANY_TYPES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter, AdminBadgeFilter } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.companies

export default function CompaniesAdmin() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUniverse, setSelectedUniverse] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(40)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    loadCompanies()
  }, [currentPage, searchTerm, selectedUniverse])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadCompanies = async () => {
    try {
      setLoading(true)
      let query = supabase.from('companies').select('*', { count: 'exact' }).order('updated_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      }

      if (selectedUniverse) {
        query = query.eq('universe', selectedUniverse)
      }

      const { data: allData, error, count } = await query
      if (error) throw error

      // 클라이언트 사이드 정렬: 수정된 항목 위로
      const sortedData = (allData || []).sort((a, b) => {
        const aUpdated = new Date(a.updated_at).getTime()
        const aCreated = new Date(a.created_at).getTime()
        const bUpdated = new Date(b.updated_at).getTime()
        const bCreated = new Date(b.created_at).getTime()
        
        const aModified = Math.abs(aUpdated - aCreated) > 1000
        const bModified = Math.abs(bUpdated - bCreated) > 1000
        
        if (aModified && !bModified) return -1
        if (!aModified && bModified) return 1
        if (aModified && bModified) return bUpdated - aUpdated
        return bCreated - aCreated
      })

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage
      setCompanies(sortedData.slice(from, to))
      setTotalCount(count || 0)
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ${PAGE_CONFIG.titleSingle}를 삭제하시겠습니까?`)) return
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
      alert('삭제되었습니다!')
      loadCompanies()
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const getTypeLabel = (type: string) => COMPANY_TYPES.find(t => t.code === type)?.name || type || '-'

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading && companies.length === 0) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 목록을 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPageHeader title={PAGE_CONFIG.title} icon={PAGE_CONFIG.icon} totalCount={totalCount} itemUnit={PAGE_CONFIG.itemUnit} addButtonLabel={`${PAGE_CONFIG.titleSingle} 추가`} addButtonHref={`${PAGE_CONFIG.basePath}/new`} color={PAGE_CONFIG.color} />

      <main className={ADMIN_STYLES.mainContainer}>
        <div className={ADMIN_STYLES.filterCard}>
          <div className="space-y-4">
            <AdminSearchFilter searchTerm={searchTerm} onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(1) }} placeholder={PAGE_CONFIG.searchPlaceholder} />
            <AdminBadgeFilter label="세계관 필터" options={UNIVERSES.map(u => ({ code: u.code, name: u.code }))} selected={selectedUniverse} onSelect={(c) => { setSelectedUniverse(selectedUniverse === c ? '' : c); setCurrentPage(1) }} onClear={() => { setSelectedUniverse(''); setCurrentPage(1) }} accentColor={PAGE_CONFIG.color.primary} />
          </div>
        </div>

        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>이름</th>
                  <th className={ADMIN_STYLES.tableHeader}>코드</th>
                  <th className={ADMIN_STYLES.tableHeader}>세계관</th>
                  <th className={ADMIN_STYLES.tableHeader}>유형</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{searchTerm || selectedUniverse ? '검색 결과가 없습니다.' : `등록된 ${PAGE_CONFIG.titleSingle}가 없습니다.`}</td></tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{company.name_ko}</div>
                        {company.name_en && <div className="text-sm text-gray-500">{company.name_en}</div>}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}><span className={ADMIN_STYLES.codeBadge}>{company.code}</span></td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PAGE_CONFIG.color.badge}`}>{company.universe || '-'}</span>
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-700`}>{getTypeLabel(company.company_type)}</td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`${PAGE_CONFIG.basePath}/${company.id}/edit`} className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}>수정</Link>
                          <button onClick={() => handleDelete(company.id, company.name_ko)} className="text-red-600 hover:text-red-800 font-medium">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination currentPage={currentPage} totalPages={totalPages} totalCount={totalCount} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} accentColor={PAGE_CONFIG.color.primary} />
        </div>
      </main>
    </div>
  )
}
