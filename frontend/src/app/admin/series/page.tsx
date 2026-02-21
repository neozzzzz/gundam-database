// src/app/admin/series/page.tsx
// 시리즈 관리 페이지
// V1.11: checkAuth 제거 (layout에서 처리) + useAdminList hook 적용

'use client'

import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter } from '@/components/admin'
import { useAdminList } from '@/lib/admin'

const PAGE_CONFIG = ADMIN_PAGES.series

export default function SeriesAdmin() {
  // useAdminList hook 사용 - 모든 목록 로직 통합
  const {
    items: seriesList,
    totalCount,
    totalPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    deleteItem,
  } = useAdminList({
    tableName: 'series',
    searchColumns: ['name_ko', 'name_en', 'name_ja', 'id'],
    defaultOrderBy: 'updated_at',
    defaultOrderAsc: false,
    pageSize: 40,
    selectQuery: '*',
  })

  // 삭제 핸들러
  const handleDelete = (id: string, name: string) => {
    deleteItem(id, `${name} ${PAGE_CONFIG.titleSingle}`)
  }

  // 로딩 상태
  if (isLoading && seriesList.length === 0) {
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
        {/* 검색 필터 */}
        <div className={ADMIN_STYLES.filterCard}>
          <AdminSearchFilter 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            placeholder={PAGE_CONFIG.searchPlaceholder} 
          />
        </div>

        {/* 테이블 */}
        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>시리즈명</th>
                  <th className={ADMIN_STYLES.tableHeader}>ID</th>
                  <th className={ADMIN_STYLES.tableHeader}>설명</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seriesList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : `등록된 ${PAGE_CONFIG.titleSingle}가 없습니다.`}
                    </td>
                  </tr>
                ) : (
                  seriesList.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{s.name_ko}</div>
                        {s.name_en && <div className="text-sm text-gray-500">{s.name_en}</div>}
                        {s.name_ja && <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{s.name_ja}</div>}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={ADMIN_STYLES.codeBadge}>{s.id}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {s.description || '-'}
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`${PAGE_CONFIG.basePath}/${s.id}/edit`} 
                            className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                          >
                            수정
                          </Link>
                          <button 
                            onClick={() => handleDelete(s.id, s.name_ko)} 
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
          
          {/* 페이지네이션 */}
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
