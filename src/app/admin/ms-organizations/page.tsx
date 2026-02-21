// src/app/admin/ms-organizations/page.tsx
// MS-조직 관계 관리 페이지
// V1.11: checkAuth 제거 (layout에서 처리) + DB 레벨 페이지네이션 적용

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ADMIN_STYLES, MS_RELATIONSHIP_TYPES, getRelationshipTypeName } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminLoading, AdminSearchFilter, AdminPagination } from '@/components/admin'
import type { MsRelationshipType } from '@/lib/types/database'

// 페이지 설정
const PAGE_CONFIG = {
  title: 'MS-조직 관계',
  titleSingle: '관계',
  basePath: '/admin/ms-organizations',
  icon: '/icons/admin/robot.svg',
  itemUnit: '관계',
  searchPlaceholder: 'MS명, 형식번호, 조직명 검색...',
  color: {
    primary: '#8B5CF6',
    text: 'text-purple-600',
    textHover: 'hover:text-purple-800',
    bgSolid: '#8B5CF6',
    badge: 'bg-purple-100 text-purple-800',
  }
}

interface MsOrganization {
  id: string
  mobile_suit_id: string
  organization_id: string
  relationship_type: MsRelationshipType
  timeline_id: string | null
  year_start: number | null
  year_end: number | null
  is_primary: boolean | null
  notes: string | null
  sort_order: number | null
  created_at: string
  mobile_suit?: { id: string; name_ko: string; model_number: string | null }
  organization?: { id: string; name_ko: string }
}

export default function MsOrganizationsPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [relations, setRelations] = useState<MsOrganization[]>([])
  const [organizations, setOrganizations] = useState<{ id: string; name_ko: string }[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOrg, setFilterOrg] = useState('')
  const [filterType, setFilterType] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 40

  // 초기 로드
  useEffect(() => {
    loadOrganizations()
  }, [])

  // 데이터 로드
  useEffect(() => {
    fetchRelations()
  }, [filterOrg, filterType, currentPage])

  const loadOrganizations = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('id, name_ko')
      .order('name_ko')
    setOrganizations(data || [])
  }

  const fetchRelations = useCallback(async () => {
    setLoading(true)
    
    // DB 레벨 페이지네이션
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase
      .from('ms_organizations')
      .select(`
        *, 
        mobile_suit:mobile_suits(id, name_ko, model_number), 
        organization:organizations(id, name_ko)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (filterOrg) query = query.eq('organization_id', filterOrg)
    if (filterType) query = query.eq('relationship_type', filterType)
    
    const { data, count } = await query
    setRelations(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [currentPage, filterOrg, filterType, pageSize])

  const handleDelete = async (id: string) => {
    if (!confirm('이 관계를 삭제하시겠습니까?')) return
    
    const { error } = await supabase.from('ms_organizations').delete().eq('id', id)
    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      fetchRelations()
    }
  }

  const handleClearFilters = () => {
    setFilterOrg('')
    setFilterType('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const getRelationBadgeColor = (type: MsRelationshipType) => {
    const colors: Record<MsRelationshipType, string> = {
      'operated_by': 'bg-blue-100 text-blue-800',
      'developed_by': 'bg-purple-100 text-purple-800',
      'manufactured_by': 'bg-green-100 text-green-800',
      'supplied_by': 'bg-yellow-100 text-yellow-800',
      'captured_by': 'bg-red-100 text-red-800',
      'owned_by': 'bg-gray-100 text-gray-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  // 클라이언트 검색 (이미 로드된 데이터에서)
  const filteredRelations = relations.filter(r => {
    if (!searchTerm) return true
    const query = searchTerm.toLowerCase()
    return (
      r.mobile_suit?.name_ko?.toLowerCase().includes(query) ||
      r.mobile_suit?.model_number?.toLowerCase().includes(query) ||
      r.organization?.name_ko?.toLowerCase().includes(query) ||
      r.organization_id?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && relations.length === 0) {
    return <AdminLoading message="관계 목록을 불러오는 중..." spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPageHeader
        title={PAGE_CONFIG.title}
        icon={PAGE_CONFIG.icon}
        totalCount={totalCount}
        itemUnit={PAGE_CONFIG.itemUnit}
        addButtonLabel="관계 추가"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                value={filterOrg} 
                onChange={(e) => { setFilterOrg(e.target.value); setCurrentPage(1) }} 
                className={ADMIN_STYLES.input}
              >
                <option value="">모든 조직</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name_ko} ({org.id})</option>
                ))}
              </select>
              <select 
                value={filterType} 
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }} 
                className={ADMIN_STYLES.input}
              >
                <option value="">모든 관계 유형</option>
                {MS_RELATIONSHIP_TYPES.map(t => (
                  <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                ))}
              </select>
              <button 
                onClick={handleClearFilters} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>모빌슈트</th>
                  <th className={ADMIN_STYLES.tableHeader}>관계</th>
                  <th className={ADMIN_STYLES.tableHeader}>조직</th>
                  <th className={ADMIN_STYLES.tableHeader}>기간</th>
                  <th className={ADMIN_STYLES.tableHeader}>주요</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRelations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterOrg || filterType 
                        ? '검색 결과가 없습니다.' 
                        : '등록된 관계가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredRelations.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{r.mobile_suit?.name_ko || '-'}</div>
                        {r.mobile_suit?.model_number && (
                          <div className="text-xs text-gray-500 font-mono">{r.mobile_suit.model_number}</div>
                        )}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRelationBadgeColor(r.relationship_type)}`}>
                          {getRelationshipTypeName(r.relationship_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{r.organization?.name_ko || '-'}</div>
                        <div className="text-xs text-gray-500 font-mono">{r.organization_id}</div>
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {r.year_start || r.year_end ? (
                          <span className="text-xs">{r.year_start || '?'} ~ {r.year_end || '현재'}</span>
                        ) : '-'}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {r.is_primary 
                          ? <span className="text-green-600 font-medium">●</span> 
                          : <span className="text-gray-400">○</span>
                        }
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`${PAGE_CONFIG.basePath}/${r.id}/edit`} 
                            className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                          >
                            수정
                          </Link>
                          <button 
                            onClick={() => handleDelete(r.id)} 
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
