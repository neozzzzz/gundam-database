'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { 
  AdminPageHeader, 
  AdminPagination, 
  AdminLoading,
  AdminSearchFilter,
  AdminBadgeFilter 
} from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.kits

export default function KitsAdmin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [kits, setKits] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [grades, setGrades] = useState<any[]>([])
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(40)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
    loadGrades()
  }, [])

  useEffect(() => {
    loadKits()
  }, [currentPage, searchTerm, selectedGrades, grades])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .order('sort_order')
    setGrades(data || [])
  }

  const loadKits = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('gundam_kits')
        .select(`*, grade:grades(code, name), series:series(name_ko)`, { count: 'exact' })
        .order('updated_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`)
      }

      if (selectedGrades.length > 0 && grades.length > 0) {
        const gradeIds = grades.filter(g => selectedGrades.includes(g.code)).map(g => g.id)
        if (gradeIds.length > 0) {
          query = query.in('grade_id', gradeIds)
        }
      }

      const { data: allData, error, count } = await query

      if (error) throw error
      
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
      setKits(sortedData.slice(from, to))
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error('킷 로딩 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ${PAGE_CONFIG.titleSingle}을(를) 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase.from('gundam_kits').delete().eq('id', id)
      if (error) throw error
      alert('삭제되었습니다!')
      loadKits()
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const toggleGrade = (gradeCode: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeCode) ? prev.filter(g => g !== gradeCode) : [...prev, gradeCode]
    )
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading && kits.length === 0) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 목록을 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPageHeader
        title={PAGE_CONFIG.title}
        icon={PAGE_CONFIG.icon}
        totalCount={totalCount}
        itemUnit={PAGE_CONFIG.itemUnit}
        addButtonLabel={`${PAGE_CONFIG.titleSingle} 추가`}
        addButtonHref={`${PAGE_CONFIG.basePath}/new`}
        color={PAGE_CONFIG.color}
      />

      <main className={ADMIN_STYLES.mainContainer}>
        <div className={ADMIN_STYLES.filterCard}>
          <div className="space-y-4">
            <AdminSearchFilter
              searchTerm={searchTerm}
              onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1) }}
              placeholder={PAGE_CONFIG.searchPlaceholder}
            />
            <AdminBadgeFilter
              label="등급 필터"
              options={grades.map(g => ({ code: g.code, name: g.code }))}
              selected={selectedGrades}
              onSelect={toggleGrade}
              onClear={() => { setSelectedGrades([]); setCurrentPage(1) }}
              multiple={true}
              accentColor={PAGE_CONFIG.color.primary}
            />
          </div>
        </div>

        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>킷 이름</th>
                  <th className={ADMIN_STYLES.tableHeader}>등급</th>
                  <th className={ADMIN_STYLES.tableHeader}>시리즈</th>
                  <th className={ADMIN_STYLES.tableHeader}>가격</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedGrades.length > 0 ? '검색 결과가 없습니다.' : `등록된 ${PAGE_CONFIG.titleSingle}이(가) 없습니다.`}
                    </td>
                  </tr>
                ) : (
                  kits.map((kit) => (
                    <tr key={kit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{kit.name_ko}</div>
                        {kit.name_en && <div className="text-sm text-gray-500">{kit.name_en}</div>}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${PAGE_CONFIG.color.badge}`}>
                          {kit.grade?.code || '-'}
                        </span>
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-600`}>
                        {kit.series?.name_ko || '-'}
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-900`}>
                        {kit.price_krw ? `₩${kit.price_krw.toLocaleString()}` : '-'}
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`${PAGE_CONFIG.basePath}/${kit.id}/edit`} className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}>
                            수정
                          </Link>
                          <button onClick={() => handleDelete(kit.id, kit.name_ko)} className="text-red-600 hover:text-red-800 font-medium">
                            삭제
                          </button>
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
