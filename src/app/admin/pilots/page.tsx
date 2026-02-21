// src/app/admin/pilots/page.tsx
// 파일럿 관리 페이지
// V2.1: 탑승기체 뱃지 클릭 시 기체 목록 팝업 모달 추가

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_PAGES, ADMIN_STYLES, PILOT_ROLES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter, AdminBadgeFilter } from '@/components/admin'
import { useAdminList } from '@/lib/admin'

const PAGE_CONFIG = ADMIN_PAGES.pilots

// 탑승 기체 정보 타입
interface MsInfo {
  ms_id: string
  name_ko: string
  name_en: string | null
  model_number: string | null
  is_primary: boolean
}

export default function PilotsAdmin() {
  const supabase = createClient()
  
  // 진영 목록 (필터용)
  const [factions, setFactions] = useState<any[]>([])
  const [factionsMap, setFactionsMap] = useState<Record<string, any>>({})
  const [selectedFaction, setSelectedFaction] = useState('')
  
  // MS 데이터 (카운트 + 상세 정보)
  const [msCounts, setMsCounts] = useState<Record<string, number>>({})
  const [msDetails, setMsDetails] = useState<Record<string, MsInfo[]>>({})
  
  // 팝업 모달 상태
  const [modalPilot, setModalPilot] = useState<{ id: string; name: string } | null>(null)

  // useAdminList hook 사용
  const {
    items: pilots,
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
    tableName: 'pilots',
    searchColumns: ['name_ko', 'name_en', 'id'],
    defaultOrderBy: 'updated_at',
    defaultOrderAsc: false,
    pageSize: 40,
    selectQuery: '*',
  })

  // 진영 목록 로드
  useEffect(() => {
    loadFactions()
  }, [])

  // 진영 필터 변경 시 적용
  useEffect(() => {
    if (selectedFaction) {
      setFilter('affiliation_default_id', selectedFaction)
    } else {
      setFilter('affiliation_default_id', undefined)
    }
  }, [selectedFaction, setFilter])

  // 파일럿 목록 로드 후 MS 데이터 조회
  useEffect(() => {
    if (pilots.length > 0) {
      loadMsData()
    }
  }, [pilots])

  const loadFactions = async () => {
    const { data } = await supabase.from('factions').select('*').order('sort_order')
    const factionsList = data || []
    setFactions(factionsList)
    const map: Record<string, any> = {}
    factionsList.forEach(f => { map[f.id] = f })
    setFactionsMap(map)
  }

  // MS 카운트 + 상세 정보를 한 번에 로드
  const loadMsData = async () => {
    const pilotIds = pilots.map((p: any) => p.id)
    const { data: mspData } = await supabase
      .from('mobile_suit_pilots')
      .select('pilot_id, ms_id, is_primary, mobile_suits(id, name_ko, name_en, model_number)')
      .in('pilot_id', pilotIds)
    
    const counts: Record<string, number> = {}
    const details: Record<string, MsInfo[]> = {}
    
    mspData?.forEach((msp: any) => {
      if (!msp.pilot_id) return
      // 카운트
      counts[msp.pilot_id] = (counts[msp.pilot_id] || 0) + 1
      // 상세 정보
      if (!details[msp.pilot_id]) details[msp.pilot_id] = []
      const ms = msp.mobile_suits
      if (ms) {
        details[msp.pilot_id].push({
          ms_id: ms.id,
          name_ko: ms.name_ko,
          name_en: ms.name_en,
          model_number: ms.model_number,
          is_primary: msp.is_primary ?? false,
        })
      }
    })
    
    setMsCounts(counts)
    setMsDetails(details)
  }

  // 삭제 핸들러
  const handleDelete = (id: string, name: string) => {
    deleteItem(id, `${name} ${PAGE_CONFIG.titleSingle}`)
  }

  // 헬퍼 함수
  const getFaction = (affiliationId: string) => factionsMap[affiliationId] || null
  const getRoleLabel = (role: string) => PILOT_ROLES.find(r => r.code === role)?.name || role || '-'

  // 로딩 상태
  if (isLoading && pilots.length === 0) {
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
              label="진영 필터" 
              options={factions.map(f => ({ code: f.id, name: f.name_ko, color: f.color }))} 
              selected={selectedFaction} 
              onSelect={(c) => setSelectedFaction(selectedFaction === c ? '' : c)} 
              onClear={() => setSelectedFaction('')} 
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
                  <th className={ADMIN_STYLES.tableHeader}>소속 진영</th>
                  <th className={ADMIN_STYLES.tableHeader}>역할</th>
                  <th className={ADMIN_STYLES.tableHeader}>탑승 기체</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pilots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedFaction 
                        ? '검색 결과가 없습니다.' 
                        : `등록된 ${PAGE_CONFIG.titleSingle}이(가) 없습니다.`}
                    </td>
                  </tr>
                ) : (
                  pilots.map((pilot: any) => {
                    const faction = getFaction(pilot.affiliation_default_id)
                    const msCount = msCounts[pilot.id] || 0
                    return (
                      <tr key={pilot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{pilot.name_ko}</div>
                          {pilot.name_en && <div className="text-sm text-gray-500">{pilot.name_en}</div>}
                        </td>
                        <td className={ADMIN_STYLES.tableCell}>
                          <span className={ADMIN_STYLES.codeBadge}>{pilot.id}</span>
                        </td>
                        <td className={ADMIN_STYLES.tableCell}>
                          {faction ? (
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium text-white" 
                              style={{ backgroundColor: faction.color || '#6B7280' }}
                            >
                              {faction.name_ko}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-700`}>
                          {getRoleLabel(pilot.role)}
                        </td>
                        {/* 탑승 기체 - 클릭 시 팝업 */}
                        <td className={ADMIN_STYLES.tableCell}>
                          {msCount > 0 ? (
                            <button
                              onClick={() => setModalPilot({ id: pilot.id, name: pilot.name_ko })}
                              className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                              title="클릭하여 기체 목록 보기"
                            >
                              {msCount}기
                            </button>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-400">
                              0기
                            </span>
                          )}
                        </td>
                        <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`${PAGE_CONFIG.basePath}/${pilot.id}/edit`} 
                              className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                            >
                              수정
                            </Link>
                            <button 
                              onClick={() => handleDelete(pilot.id, pilot.name_ko)} 
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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

      {/* 탑승 기체 팝업 모달 */}
      {modalPilot && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setModalPilot(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalPilot.name}
                </h3>
                <p className="text-sm text-gray-500">탑승 기체 목록</p>
              </div>
              <button 
                onClick={() => setModalPilot(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 모달 본문 - 기체 목록 */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {(msDetails[modalPilot.id] && msDetails[modalPilot.id].length > 0) ? (
                <div className="space-y-3">
                  {msDetails[modalPilot.id].map((ms, idx) => (
                    <div 
                      key={`${ms.ms_id}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* 형식번호 */}
                        {ms.model_number && (
                          <span className="px-2 py-1 bg-gray-100 text-black rounded text-xs font-mono font-semibold">
                            {ms.model_number}
                          </span>
                        )}
                        {/* 기체명 */}
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{ms.name_ko}</div>
                          {ms.name_en && (
                            <div className="text-xs text-gray-500">{ms.name_en}</div>
                          )}
                        </div>
                      </div>
                      {/* 주 탑승기 표시 + MS 수정 링크 */}
                      <div className="flex items-center gap-2">
                        {ms.is_primary && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            주 탑승기
                          </span>
                        )}
                        <Link
                          href={`/admin/mobile-suits/${ms.ms_id}/edit`}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                          onClick={() => setModalPilot(null)}
                        >
                          이동 →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">기체 정보를 불러오는 중...</p>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right">
              <button
                onClick={() => setModalPilot(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
