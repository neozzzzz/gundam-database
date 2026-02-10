// src/app/admin/organizations/page.tsx
// 조직 관리 페이지
// V2.1: select → AdminBadgeFilter 뱃지 형태로 변경 (조직유형, 타임라인)

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ADMIN_STYLES, ADMIN_PAGES, ORG_TYPES, UNIVERSE_CODES, getOrgTypeBadge, getOrgTypeName, getUniverseName } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminLoading, AdminSearchFilter, AdminBadgeFilter, AdminPagination } from '@/components/admin'
import { useAdminList } from '@/lib/admin'

// 페이지 설정 - ADMIN_PAGES에서 가져오기
const PAGE_CONFIG = ADMIN_PAGES.organizations

export default function OrganizationsPage() {
  // 필터 상태
  const [filterOrgType, setFilterOrgType] = useState('')
  const [filterUniverse, setFilterUniverse] = useState('')

  // useAdminList hook 사용
  const {
    items: organizations,
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
    tableName: 'organizations',
    searchColumns: ['name_ko', 'name_en', 'id'],
    defaultOrderBy: 'updated_at',
    defaultOrderAsc: false,
    pageSize: 40,
    selectQuery: '*',
  })

  // 조직 유형 필터 변경 시 적용
  useEffect(() => {
    if (filterOrgType) {
      setFilter('org_type', filterOrgType)
    } else {
      setFilter('org_type', undefined)
    }
  }, [filterOrgType, setFilter])

  // 타임라인 필터 변경 시 적용
  useEffect(() => {
    if (filterUniverse) {
      setFilter('universe', filterUniverse)
    } else {
      setFilter('universe', undefined)
    }
  }, [filterUniverse, setFilter])

  // 삭제 핸들러
  const handleDelete = (id: string, name: string) => {
    deleteItem(id, `${name} 조직`)
  }

  // 로딩 상태
  if (isLoading && organizations.length === 0) {
    return <AdminLoading message="조직 목록을 불러오는 중..." spinnerColor={PAGE_CONFIG.color.primary} />
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
            {/* 검색 */}
            <AdminSearchFilter 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
              placeholder={PAGE_CONFIG.searchPlaceholder} 
            />
            {/* 조직 유형 필터 - 뱃지 형태 */}
            <AdminBadgeFilter
              label="조직 유형"
              options={ORG_TYPES.map(t => ({ code: t.code, name: t.name }))}
              selected={filterOrgType}
              onSelect={(c) => setFilterOrgType(filterOrgType === c ? '' : c)}
              onClear={() => setFilterOrgType('')}
              accentColor="purple"
            />
            {/* 타임라인 필터 - 뱃지 형태 */}
            <AdminBadgeFilter
              label="타임라인"
              options={UNIVERSE_CODES.map(u => ({ code: u.code, name: `${u.name}(${u.code})`, color: u.color }))}
              selected={filterUniverse}
              onSelect={(c) => setFilterUniverse(filterUniverse === c ? '' : c)}
              onClear={() => setFilterUniverse('')}
              accentColor="purple"
              useCustomColor={true}
            />
          </div>
        </div>

        {/* 테이블 */}
        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>ID</th>
                  <th className={ADMIN_STYLES.tableHeader}>조직명</th>
                  <th className={ADMIN_STYLES.tableHeader}>유형</th>
                  <th className={ADMIN_STYLES.tableHeader}>타임라인</th>
                  <th className={ADMIN_STYLES.tableHeader}>색상</th>
                  <th className={ADMIN_STYLES.tableHeader}>상태</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterOrgType || filterUniverse 
                        ? '검색 결과가 없습니다.' 
                        : '등록된 조직이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  organizations.map((org: any) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className={`${ADMIN_STYLES.tableCell} font-mono text-sm text-gray-500`}>
                        {org.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{org.name_ko}</div>
                        {org.name_en && <div className="text-sm text-gray-500">{org.name_en}</div>}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getOrgTypeBadge(org.org_type)}`}>
                          {getOrgTypeName(org.org_type)}
                        </span>
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {org.universe ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {getUniverseName(org.universe)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {org.color ? (
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full border border-gray-200" 
                              style={{ backgroundColor: org.color }} 
                            />
                            <span className="text-xs text-gray-500">{org.color}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {org.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`${PAGE_CONFIG.basePath}/${org.id}/edit`} 
                            className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                          >
                            수정
                          </Link>
                          <button 
                            onClick={() => handleDelete(org.id, org.name_ko)} 
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
