'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.series

export default function SeriesAdmin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(40)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    loadSeries()
  }, [currentPage, searchTerm])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadSeries = async () => {
    try {
      setLoading(true)
      let query = supabase.from('series').select('*', { count: 'exact' }).order('updated_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,name_ja.ilike.%${searchTerm}%`)
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
      setSeriesList(sortedData.slice(from, to))
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
      const { error } = await supabase.from('series').delete().eq('id', id)
      if (error) throw error
      alert('삭제되었습니다!')
      loadSeries()
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading && seriesList.length === 0) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 목록을 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPageHeader title={PAGE_CONFIG.title} icon={PAGE_CONFIG.icon} totalCount={totalCount} itemUnit={PAGE_CONFIG.itemUnit} addButtonLabel={`${PAGE_CONFIG.titleSingle} 추가`} addButtonHref={`${PAGE_CONFIG.basePath}/new`} color={PAGE_CONFIG.color} />

      <main className={ADMIN_STYLES.mainContainer}>
        <div className={ADMIN_STYLES.filterCard}>
          <AdminSearchFilter searchTerm={searchTerm} onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(1) }} placeholder={PAGE_CONFIG.searchPlaceholder} />
        </div>

        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>시리즈명</th>
                  <th className={ADMIN_STYLES.tableHeader}>설명</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seriesList.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">{searchTerm ? '검색 결과가 없습니다.' : `등록된 ${PAGE_CONFIG.titleSingle}가 없습니다.`}</td></tr>
                ) : (
                  seriesList.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{s.name_ko}</div>
                        {s.name_en && <div className="text-sm text-gray-500">{s.name_en}</div>}
                        {s.name_ja && <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{s.name_ja}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{s.description || '-'}</td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`${PAGE_CONFIG.basePath}/${s.id}/edit`} className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}>수정</Link>
                          <button onClick={() => handleDelete(s.id, s.name_ko)} className="text-red-600 hover:text-red-800 font-medium">삭제</button>
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
