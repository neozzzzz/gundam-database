// src/app/admin/mobile-suit-pilots/page.tsx
// MS-파일럿 관계 관리 페이지
// V1.11: checkAuth 제거 (layout에서 처리) + 커스텀 로딩 로직 유지

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminLoading, AdminSearchFilter, AdminPagination } from '@/components/admin'

// 페이지 설정
const PAGE_CONFIG = {
  title: 'MS-파일럿 관계',
  titleSingle: '관계',
  basePath: '/admin/mobile-suit-pilots',
  icon: '/icons/admin/user.svg',
  itemUnit: '관계',
  searchPlaceholder: 'MS명, 파일럿명으로 검색...',
  color: {
    primary: '#F59E0B',
    text: 'text-amber-600',
    textHover: 'hover:text-amber-800',
    bgSolid: '#F59E0B',
    badge: 'bg-amber-100 text-amber-800',
  }
}

interface MobileSuitPilot {
  id: string
  ms_id: string
  pilot_id: string
  faction_at_time_id: string | null
  is_primary: boolean | null
  notes: string | null
  created_at: string
  mobile_suit?: { id: string; name_ko: string; model_number: string | null }
  pilot?: { id: string; name_ko: string; name_en: string | null }
  faction?: { id: string; name_ko: string; color: string | null }
}

export default function MobileSuitPilotsPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [relations, setRelations] = useState<MobileSuitPilot[]>([])
  const [pilots, setPilots] = useState<{ id: string; name_ko: string }[]>([])
  const [factions, setFactions] = useState<{ id: string; name_ko: string; color: string | null }[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPilot, setFilterPilot] = useState('')
  const [filterFaction, setFilterFaction] = useState('')
  
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
    fetchRelations()
  }, [filterPilot, filterFaction, currentPage])

  const loadFilterOptions = async () => {
    // 파일럿 목록
    const { data: pilotsData } = await supabase
      .from('pilots')
      .select('id, name_ko, name_en')
      .order('name_ko')
    setPilots(pilotsData || [])
    
    // 진영 목록
    const { data: factionsData } = await supabase
      .from('factions')
      .select('id, name_ko, color')
      .order('name_ko')
    setFactions(factionsData || [])
  }

  const fetchRelations = useCallback(async () => {
    setLoading(true)
    
    // DB 레벨 페이지네이션
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1
    
    // 관계 목록 쿼리
    let query = supabase
      .from('mobile_suit_pilots')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (filterPilot) query = query.eq('pilot_id', filterPilot)
    if (filterFaction) query = query.eq('faction_at_time_id', filterFaction)
    
    const { data: relationsData, count } = await query
    setTotalCount(count || 0)
    
    if (relationsData && relationsData.length > 0) {
      // 관련 ID 추출
      const msIds = [...new Set(relationsData.map(r => r.ms_id).filter(Boolean))]
      const pilotIds = [...new Set(relationsData.map(r => r.pilot_id).filter(Boolean))]
      const factionIds = [...new Set(relationsData.map(r => r.faction_at_time_id).filter(Boolean))]
      
      // 관련 데이터 병렬 조회
      const [msResult, pilotResult, factionResult] = await Promise.all([
        msIds.length > 0 
          ? supabase.from('mobile_suits').select('id, name_ko, model_number').in('id', msIds) 
          : { data: [] },
        pilotIds.length > 0 
          ? supabase.from('pilots').select('id, name_ko, name_en').in('id', pilotIds) 
          : { data: [] },
        factionIds.length > 0 
          ? supabase.from('factions').select('id, name_ko, color').in('id', factionIds) 
          : { data: [] },
      ])
      
      // Map 생성
      const msMap = new Map((msResult.data || []).map(ms => [ms.id, ms]))
      const pilotMap = new Map((pilotResult.data || []).map(p => [p.id, p]))
      const factionMap = new Map((factionResult.data || []).map(f => [f.id, f]))
      
      // 관계 데이터에 조인
      const enrichedRelations = relationsData.map(r => ({
        ...r,
        mobile_suit: msMap.get(r.ms_id) || null,
        pilot: pilotMap.get(r.pilot_id) || null,
        faction: factionMap.get(r.faction_at_time_id) || null,
      }))
      
      setRelations(enrichedRelations)
    } else {
      setRelations([])
    }
    
    setLoading(false)
  }, [currentPage, filterPilot, filterFaction, pageSize])

  const handleDelete = async (id: string) => {
    if (!confirm('이 관계를 삭제하시겠습니까?')) return
    
    const { error } = await supabase.from('mobile_suit_pilots').delete().eq('id', id)
    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      fetchRelations()
    }
  }

  const handleClearFilters = () => {
    setFilterPilot('')
    setFilterFaction('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  // 클라이언트 검색 필터링 (이미 로드된 데이터에서)
  const filteredRelations = relations.filter(r => {
    if (!searchTerm) return true
    const query = searchTerm.toLowerCase()
    return (
      r.mobile_suit?.name_ko?.toLowerCase().includes(query) ||
      r.mobile_suit?.model_number?.toLowerCase().includes(query) ||
      r.pilot?.name_ko?.toLowerCase().includes(query) ||
      r.pilot?.name_en?.toLowerCase().includes(query) ||
      r.pilot_id?.toLowerCase().includes(query)
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
                value={filterPilot} 
                onChange={(e) => { setFilterPilot(e.target.value); setCurrentPage(1) }} 
                className={ADMIN_STYLES.input}
              >
                <option value="">모든 파일럿</option>
                {pilots.map(p => (
                  <option key={p.id} value={p.id}>{p.name_ko} ({p.id})</option>
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
                  <th className={ADMIN_STYLES.tableHeader}>파일럿</th>
                  <th className={ADMIN_STYLES.tableHeader}>당시 소속</th>
                  <th className={ADMIN_STYLES.tableHeader}>주요</th>
                  <th className={ADMIN_STYLES.tableHeader}>비고</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRelations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterPilot || filterFaction 
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
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{r.pilot?.name_ko || '-'}</div>
                        <div className="text-xs text-gray-500">
                          {r.pilot?.name_en && <span>{r.pilot.name_en} </span>}
                          <span className="font-mono">({r.pilot_id})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.faction ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: r.faction.color ? `${r.faction.color}20` : '#f3f4f6',
                              color: r.faction.color || '#374151'
                            }}
                          >
                            {r.faction.color && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.faction.color }} />
                            )}
                            {r.faction.name_ko}
                          </span>
                        ) : '-'}
                      </td>
                      <td className={ADMIN_STYLES.tableCell}>
                        {r.is_primary 
                          ? <span className="text-green-600 font-medium">●</span> 
                          : <span className="text-gray-400">○</span>
                        }
                      </td>
                      <td className={`${ADMIN_STYLES.tableCell} max-w-[200px] truncate`}>
                        {r.notes || '-'}
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
