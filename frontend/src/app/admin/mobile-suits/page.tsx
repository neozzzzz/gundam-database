'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter, AdminModal } from '@/components/admin'
import { useAdminList } from '@/lib/admin'

const PAGE_CONFIG = ADMIN_PAGES.mobileSuits

// 킷 정보 타입
interface KitInfo {
  id: string
  name_ko: string
  name_en?: string
}

// 조직 정보 타입
interface OrganizationInfo {
  name: string
  type: string
  is_primary: boolean
}

// 모빌슈트 타입
interface MobileSuit {
  id: string
  name_ko: string
  name_en?: string
  model_number?: string
  series_id?: string
  manufacturers?: OrganizationInfo[]
  operators?: OrganizationInfo[]
  [key: string]: any
}

export default function MobileSuitsAdmin() {
  
  // useAdminList hook 사용 - 기본 CRUD 로직 통합
  const {
    items: rawMobileSuits,
    totalCount,
    totalPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    deleteItem,
    reload,
  } = useAdminList<MobileSuit>({
    tableName: 'mobile_suits',
    searchColumns: ['name_ko', 'name_en', 'model_number'],
    defaultOrderBy: 'updated_at',
    defaultOrderAsc: false,
    pageSize: 40,
  })

  // 추가 데이터 (useAdminList가 커버하지 않는 영역)
  const [mobileSuits, setMobileSuits] = useState<MobileSuit[]>([])
  const [seriesMap, setSeriesMap] = useState<Record<string, any>>({})
  const [kitCountMap, setKitCountMap] = useState<Record<string, number>>({})
  
  // 킷 목록 모달 상태
  const [showKitModal, setShowKitModal] = useState(false)
  const [selectedMsName, setSelectedMsName] = useState('')
  const [selectedMsKits, setSelectedMsKits] = useState<KitInfo[]>([])
  const [loadingKits, setLoadingKits] = useState(false)

  // 초기 데이터 로드
  useEffect(() => {
    loadSeries()
    loadKitCounts()
  }, [])

  const loadSeries = async () => {
    const { data } = await supabase.from('series').select('id, name_ko')
    const map: Record<string, any> = {}
    data?.forEach(s => { map[s.id] = s })
    setSeriesMap(map)
  }

  // 모빌슈트별 킷 카운트 로드
  const loadKitCounts = async () => {
    const { data } = await supabase
      .from('gundam_kits')
      .select('mobile_suit_id')
      .not('mobile_suit_id', 'is', null)
    
    const countMap: Record<string, number> = {}
    data?.forEach(kit => {
      if (kit.mobile_suit_id) {
        countMap[kit.mobile_suit_id] = (countMap[kit.mobile_suit_id] || 0) + 1
      }
    })
    setKitCountMap(countMap)
  }

  // 특정 모빌슈트의 킷 목록 로드
  const loadKitsForMs = async (msId: string, msName: string) => {
    setSelectedMsName(msName)
    setShowKitModal(true)
    setLoadingKits(true)
    
    try {
      const { data } = await supabase
        .from('gundam_kits')
        .select('id, name_ko, name_en')
        .eq('mobile_suit_id', msId)
        .order('name_ko')
      
      setSelectedMsKits(data || [])
    } catch (error) {
      console.error('킷 목록 로드 실패:', error)
      setSelectedMsKits([])
    } finally {
      setLoadingKits(false)
    }
  }

  // 조직 정보 enrichment (rawMobileSuits 변경 시 실행)
  useEffect(() => {
    if (rawMobileSuits.length === 0) {
      setMobileSuits([])
      return
    }

    const enrichData = async () => {
      try {
        const msIds = rawMobileSuits.map(ms => ms.id)
        
        const { data: orgRelations } = await supabase
          .from('ms_organizations')
          .select(`
            mobile_suit_id,
            relationship_type,
            is_primary,
            organizations (
              id,
              name_ko,
              org_type
            )
          `)
          .in('mobile_suit_id', msIds)

        // 각 모빌슈트에 조직 정보 추가
        const enrichedData = rawMobileSuits.map(ms => {
          const relations = orgRelations?.filter(r => r.mobile_suit_id === ms.id) || []
          
          return {
            ...ms,
            manufacturers: relations
              .filter(r => r.relationship_type === 'manufactured_by')
              .map(r => ({
                name: (r.organizations as any)?.name_ko || '',
                type: (r.organizations as any)?.org_type || '',
                is_primary: r.is_primary
              }))
              .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)),
            operators: relations
              .filter(r => r.relationship_type === 'operated_by')
              .map(r => ({
                name: (r.organizations as any)?.name_ko || '',
                type: (r.organizations as any)?.org_type || '',
                is_primary: r.is_primary
              }))
              .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
          }
        })

        setMobileSuits(enrichedData)
      } catch (error) {
        console.error('조직 정보 로드 실패:', error)
        setMobileSuits(rawMobileSuits) // 실패 시 원본 데이터 사용
      }
    }

    enrichData()
  }, [rawMobileSuits, supabase])

  const handleDelete = async (id: string, name: string) => {
    const msg = `"${name}" 모빌슈트를 삭제하시겠습니까?\n\n⚠️ 이 모빌슈트를 사용하는 킷들은 연결이 해제됩니다.`
    if (!confirm(msg)) return
    
    const success = await deleteItem(id, name)
    if (success) {
      // kitCount도 갱신
      loadKitCounts()
    }
  }

  const getSeries = (seriesId?: string) => {
    if (!seriesId) return null
    return seriesMap[seriesId] || null
  }

  if (isLoading && mobileSuits.length === 0) {
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
                  <th className={ADMIN_STYLES.tableHeader}>이름</th>
                  <th className={ADMIN_STYLES.tableHeader}>모델 번호</th>
                  <th className={ADMIN_STYLES.tableHeader}>제조사</th>
                  <th className={ADMIN_STYLES.tableHeader}>운용조직</th>
                  <th className={ADMIN_STYLES.tableHeader}>시리즈</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-center`}>킷 수</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mobileSuits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : `등록된 ${PAGE_CONFIG.titleSingle}가 없습니다.`}
                    </td>
                  </tr>
                ) : (
                  mobileSuits.map((ms) => {
                    const series = getSeries(ms.series_id)
                    const kitCount = kitCountMap[ms.id] || 0
                    return (
                      <tr key={ms.id} className="hover:bg-gray-50">
                        {/* 이름 */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{ms.name_ko}</div>
                          {ms.name_en && <div className="text-sm text-gray-500">{ms.name_en}</div>}
                        </td>

                        {/* 모델 번호 */}
                        <td className={ADMIN_STYLES.tableCell}>
                          <span className={ADMIN_STYLES.codeBadge}>{ms.model_number || '-'}</span>
                        </td>

                        {/* 제조사 */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {ms.manufacturers && ms.manufacturers.length > 0 ? (
                              ms.manufacturers.map((mfg, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700"
                                  title={mfg.is_primary ? '주 제조사' : '제조사'}
                                >
                                  {mfg.name}
                                  {mfg.is_primary && (
                                    <span className="ml-1 text-gray-500">●</span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* 운용조직 */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {ms.operators && ms.operators.length > 0 ? (
                              ms.operators.map((op, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700"
                                  title={op.is_primary ? '주 운용조직' : '운용조직'}
                                >
                                  {op.name}
                                  {op.is_primary && (
                                    <span className="ml-1 text-blue-500">●</span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* 시리즈 */}
                        <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-600`}>
                          {series?.name_ko || '-'}
                        </td>

                        {/* 킷 수 */}
                        <td className={`${ADMIN_STYLES.tableCell} text-center`}>
                          {kitCount > 0 ? (
                            <button
                              onClick={() => loadKitsForMs(ms.id, ms.name_ko)}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                            >
                              {kitCount}
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* 작업 */}
                        <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`${PAGE_CONFIG.basePath}/${ms.id}/edit`} 
                              className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}
                            >
                              수정
                            </Link>
                            <button 
                              onClick={() => handleDelete(ms.id, ms.name_ko)} 
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

      {/* 킷 목록 모달 */}
      <AdminModal
        isOpen={showKitModal}
        onClose={() => setShowKitModal(false)}
        title={`${selectedMsName} - 연결된 킷 목록`}
        size="md"
      >
        {loadingKits ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mb-2"></div>
            <p>로딩 중...</p>
          </div>
        ) : selectedMsKits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            연결된 킷이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {selectedMsKits.map((kit) => (
              <li key={kit.id} className="py-3">
                <Link
                  href={`/kits/${kit.id}`}
                  target="_blank"
                  className="block hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                >
                  <div className="font-medium text-gray-900">{kit.name_ko}</div>
                  {kit.name_en && <div className="text-sm text-gray-500">{kit.name_en}</div>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminModal>
    </div>
  )
}
