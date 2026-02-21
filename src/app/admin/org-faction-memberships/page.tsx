// src/app/admin/org-faction-memberships/page.tsx
// 조직-진영 관계 관리 페이지
// V1.11: checkAuth 제거 (layout에서 처리) + DB 레벨 페이지네이션 적용

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ADMIN_STYLES, UNIVERSE_CODES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminLoading, AdminSearchFilter, AdminPagination } from '@/components/admin'

// 페이지 설정
const PAGE_CONFIG = {
  title: '조직-진영 관계',
  titleSingle: '관계',
  basePath: '/admin/org-faction-memberships',
  icon: '/icons/admin/flag.svg',
  itemUnit: '관계',
  searchPlaceholder: '조직명, 진영명으로 검색...',
  color: {
    primary: '#6366F1',
    text: 'text-indigo-600',
    textHover: 'hover:text-indigo-800',
    bgSolid: '#6366F1',
    badge: 'bg-indigo-100 text-indigo-800',
  }
}

interface OrgFactionMembership {
  id: string
  organization_id: string
  faction_id: string
  timeline_id: string | null
  year_start: number | null
  year_end: number | null
  is_primary: boolean | null
  notes: string | null
  created_at: string
  organization?: { id: string; name_ko: string }
  faction?: { id: string; name_ko: string; color: string | null }
}

export default function OrgFactionMembershipsPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState<OrgFactionMembership[]>([])
  const [organizations, setOrganizations] = useState<{ id: string; name_ko: string }[]>([])
  const [factions, setFactions] = useState<{ id: string; name_ko: string }[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOrg, setFilterOrg] = useState('')
  const [filterFaction, setFilterFaction] = useState('')
  const [filterTimeline, setFilterTimeline] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 40

  // 초기 로드
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // 데이터 로드
  useEffect(() => {
    fetchMemberships()
  }, [filterOrg, filterFaction, filterTimeline, currentPage])

  const loadFilterOptions = async () => {
    const [orgsResult, factionsResult] = await Promise.all([
      supabase.from('organizations').select('id, name_ko').order('name_ko'),
      supabase.from('factions').select('id, name_ko').order('name_ko'),
    ])
    setOrganizations(orgsResult.data || [])
    setFactions(factionsResult.data || [])
  }

  const fetchMemberships = useCallback(async () => {
    setLoading(true)
    
    // DB 레벨 페이지네이션
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase
      .from('org_faction_memberships')
      .select(`
        *, 
        organization:organizations(id, name_ko), 
        faction:factions(id, name_ko, color)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (filterOrg) query = query.eq('organization_id', filterOrg)
    if (filterFaction) query = query.eq('faction_id', filterFaction)
    if (filterTimeline) query = query.eq('timeline_id', filterTimeline)
    
    const { data, count } = await query
    setMemberships(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [currentPage, filterOrg, filterFaction, filterTimeline, pageSize])

  const handleDelete = async (id: string) => {
    if (!confirm('이 관계를 삭제하시겠습니까?')) return
    
    const { error } = await supabase.from('org_faction_memberships').delete().eq('id', id)
    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      fetchMemberships()
    }
  }

  const handleClearFilters = () => {
    setFilterOrg('')
    setFilterFaction('')
    setFilterTimeline('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const getTimelineName = (code: string | null) => {
    if (!code) return '-'
    const timeline = UNIVERSE_CODES.find(u => u.code === code)
    return timeline?.name || code
  }

  // 클라이언트 검색 (이미 로드된 데이터에서)
  const filteredMemberships = memberships.filter(m => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      m.organization?.name_ko?.toLowerCase().includes(search) ||
      m.faction?.name_ko?.toLowerCase().includes(search) ||
      m.organization_id?.toLowerCase().includes(search) ||
      m.faction_id?.toLowerCase().includes(search)
    )
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && memberships.length === 0) {
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                value={filterFaction} 
                onChange={(e) => { setFilterFaction(e.target.value); setCurrentPage(1) }} 
                className={ADMIN_STYLES.input}
              >
                <option value="">모든 진영</option>
                {factions.map(f => (
                  <option key={f.id} value={f.id}>{f.name_ko} ({f.id})</option>
                ))}
              </select>
              <select 
                value={filterTimeline} 
                onChange={(e) => { setFilterTimeline(e.target.value); setCurrentPage(1) }} 
                className={ADMIN_STYLES.input}
              >
                <option value="">모든 타임라인</option>
                {UNIVERSE_CODES.map(u => (
                  <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
                ))}
              </select>
              <button 
                onClick={handleClearFilters} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                초기화
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
                  <th className={ADMIN_STYLES.tableHeader}>조직</th>
                  <th className={ADMIN_STYLES.tableHeader}>진영</th>
                  <th className={ADMIN_STYLES.tableHeader}>타임라인</th>
                  <th className={ADMIN_STYLES.tableHeader}>기간</th>
                  <th className={ADMIN_STYLES.tableHeader}>주요</th>
                  <th className={ADMIN_STYLES.tableHeader}>비고</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMemberships.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterOrg || filterFaction || filterTimeline 
                        ? '검색 결과가 없습니다.' 
                        : '등록된 관계가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredMemberships.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{m.organization?.name_ko || '-'}</div>
                        <div className="text-xs text-gray-500 font-mono">{m.organization_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" 
                          style={{ 
                            backgroundColor: m.faction?.color ? `${m.faction.color}20` : '#f3f4f6', 
                            color: m.faction?.color || '#374151' 
                          }}
                        >
                          {m.faction?.color && (
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.faction.color }} />
                          )}
                          {m.faction?.name_ko || '-'}
                        </span>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{m.faction_id}</div>
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {getTimelineName(m.timeline_id)}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {m.year_start || m.year_end ? (
                          <span className="text-xs">{m.year_start || '?'} ~ {m.year_end || '현재'}</span>
                        ) : '-'}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {m.is_primary 
                          ? <span className="text-green-600 font-medium">●</span> 
                          : <span className="text-gray-400">○</span>
                        }
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} max-w-[200px] truncate`}>
                        {m.notes || '-'}
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`${PAGE_CONFIG.basePath}/${m.id}/edit`} 
                            className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                          >
                            수정
                          </Link>
                          <button 
                            onClick={() => handleDelete(m.id)} 
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
