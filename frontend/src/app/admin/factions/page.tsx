// src/app/admin/factions/page.tsx
// 진영 관리 페이지
// V1.11: checkAuth 제거 (layout에서 처리) + useAdminList hook 적용

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES, UNIVERSES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter, AdminBadgeFilter } from '@/components/admin'
import { useAdminList } from '@/lib/admin'

const PAGE_CONFIG = ADMIN_PAGES.factions

export default function FactionsAdmin() {
  // 세계관 필터
  const [selectedUniverse, setSelectedUniverse] = useState('')

  // useAdminList hook 사용
  const {
    items: factions,
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
  } = useAdminList({
    tableName: 'factions',
    searchColumns: ['name_ko', 'name_en', 'id'],
    defaultOrderBy: 'updated_at',
    defaultOrderAsc: false,
    pageSize: 40,
    selectQuery: '*',
  })

  // 세계관 필터 변경 시 적용
  useEffect(() => {
    if (selectedUniverse) {
      setFilter('universe', selectedUniverse)
    } else {
      setFilter('universe', undefined)
    }
  }, [selectedUniverse, setFilter])

  // 삭제 핸들러
  const handleDelete = (id: string, name: string) => {
    deleteItem(id, `${name} ${PAGE_CONFIG.titleSingle}`)
  }

  // 로딩 상태
  if (isLoading && factions.length === 0) {
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
              label="세계관 필터" 
              options={UNIVERSES.map(u => ({ code: u.code, name: `${u.name}(${u.code})` }))} 
              selected={selectedUniverse} 
              onSelect={(c) => setSelectedUniverse(selectedUniverse === c ? '' : c)} 
              onClear={() => setSelectedUniverse('')} 
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
                  <th className={ADMIN_STYLES.tableHeader}>이름</th>
                  <th className={ADMIN_STYLES.tableHeader}>ID</th>
                  <th className={ADMIN_STYLES.tableHeader}>세계관</th>
                  <th className={ADMIN_STYLES.tableHeader}>색상</th>
                  <th className={ADMIN_STYLES.tableHeader}>순서</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {factions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedUniverse 
                        ? '검색 결과가 없습니다.' 
                        : `등록된 ${PAGE_CONFIG.titleSingle}이(가) 없습니다.`}
                    </td>
                  </tr>
                ) : (
                  factions.map((faction: any) => (
                    <tr key={faction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{faction.name_ko}</div>
                        {faction.name_en && <div className="text-sm text-gray-500">{faction.name_en}</div>}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={ADMIN_STYLES.codeBadge}>{faction.id}</span>
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PAGE_CONFIG.color.badge}`}>
                          {faction.universe || '-'}
                        </span>
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {faction.color ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border border-gray-300" 
                              style={{ backgroundColor: faction.color }} 
                            />
                            <span className="text-sm text-gray-600">{faction.color}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-900`}>
                        {faction.sort_order || 0}
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`${PAGE_CONFIG.basePath}/${faction.id}/edit`} 
                            className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                          >
                            수정
                          </Link>
                          <button 
                            onClick={() => handleDelete(faction.id, faction.name_ko)} 
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
