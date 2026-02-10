// src/app/admin/kits/page.tsx
// 킷 관리 페이지
// V1.11: checkAuth 제거 (layout에서 처리) + useAdminList hook 적용

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { 
  AdminPageHeader, 
  AdminPagination, 
  AdminLoading,
  AdminSearchFilter,
  AdminBadgeFilter 
} from '@/components/admin'
import { useAdminList } from '@/lib/admin'

const PAGE_CONFIG = ADMIN_PAGES.kits

export default function KitsAdmin() {
  const supabase = createClient()
  
  // 등급 목록 (필터용)
  const [grades, setGrades] = useState<any[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])

  // useAdminList hook 사용
  const {
    items: kits,
    totalCount,
    totalPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    deleteItem,
    setFilter,
    reload,
  } = useAdminList({
    tableName: 'gundam_kits',
    searchColumns: ['name_ko', 'name_en'],
    defaultOrderBy: 'updated_at',
    defaultOrderAsc: false,
    pageSize: 40,
    selectQuery: '*, grade:grades(id, name_ko), series:series(name_ko)',
  })

  // 등급 목록 로드
  useEffect(() => {
    loadGrades()
  }, [])

  // 등급 필터 변경 시 적용
  useEffect(() => {
    if (selectedGrades.length > 0) {
      setFilter('grade_id', selectedGrades)
    } else {
      setFilter('grade_id', undefined)
    }
  }, [selectedGrades, setFilter])

  const loadGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select('id, name_ko')
      .order('sort_order')
    setGrades(data || [])
  }

  // 삭제 핸들러
  const handleDelete = (id: string, name: string) => {
    deleteItem(id, `${name} ${PAGE_CONFIG.titleSingle}`)
  }

  // 등급 토글
  const toggleGrade = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(g => g !== gradeId) 
        : [...prev, gradeId]
    )
  }

  // 로딩 상태
  if (isLoading && kits.length === 0) {
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
        {/* 필터 영역 */}
        <div className={ADMIN_STYLES.filterCard}>
          <div className="space-y-4">
            <AdminSearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder={PAGE_CONFIG.searchPlaceholder}
            />
            <AdminBadgeFilter
              label="등급 필터"
              options={grades.map(g => ({ code: g.id, name: g.id }))}
              selected={selectedGrades}
              onSelect={toggleGrade}
              onClear={() => setSelectedGrades([])}
              multiple={true}
              accentColor={PAGE_CONFIG.color.primary}
            />
          </div>
        </div>

        {/* 테이블 */}
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
                      {searchTerm || selectedGrades.length > 0 
                        ? '검색 결과가 없습니다.' 
                        : `등록된 ${PAGE_CONFIG.titleSingle}이(가) 없습니다.`}
                    </td>
                  </tr>
                ) : (
                  kits.map((kit: any) => (
                    <tr key={kit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{kit.name_ko}</div>
                        {kit.name_en && <div className="text-sm text-gray-500">{kit.name_en}</div>}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${PAGE_CONFIG.color.badge}`}>
                          {kit.grade?.id || '-'}
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
                          <Link 
                            href={`${PAGE_CONFIG.basePath}/${kit.id}/edit`} 
                            className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                          >
                            수정
                          </Link>
                          <button 
                            onClick={() => handleDelete(kit.id, kit.name_ko)} 
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
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
          
          <AdminPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalCount={totalCount} 
            itemsPerPage={pageSize} 
            onPageChange={setCurrentPage} 
            accentColor={PAGE_CONFIG.color.primary} 
          />
        </div>
      </main>
    </div>
  )
}
