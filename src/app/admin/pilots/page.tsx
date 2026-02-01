'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADMIN_PAGES, ADMIN_STYLES, PILOT_ROLES } from '@/lib/constants/admin-config'
import { AdminPageHeader, AdminPagination, AdminLoading, AdminSearchFilter, AdminBadgeFilter } from '@/components/admin'

const PAGE_CONFIG = ADMIN_PAGES.pilots

export default function PilotsAdmin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [pilots, setPilots] = useState<any[]>([])
  const [factions, setFactions] = useState<any[]>([])
  const [factionsMap, setFactionsMap] = useState<Record<string, any>>({})
  const [msCounts, setMsCounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaction, setSelectedFaction] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(40)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
    loadFactions()
  }, [])

  useEffect(() => {
    if (Object.keys(factionsMap).length > 0 || factions.length === 0) {
      loadPilots()
    }
  }, [currentPage, searchTerm, selectedFaction, factionsMap])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadFactions = async () => {
    const { data } = await supabase.from('factions').select('*').order('sort_order')
    const factionsList = data || []
    setFactions(factionsList)
    const map: Record<string, any> = {}
    factionsList.forEach(f => { map[f.id] = f })
    setFactionsMap(map)
  }

  const loadPilots = async () => {
    try {
      setLoading(true)
      let query = supabase.from('pilots').select('*', { count: 'exact' }).order('updated_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`)
      }

      if (selectedFaction) {
        const faction = factions.find(f => f.code === selectedFaction)
        if (faction) query = query.eq('affiliation_default_id', faction.id)
      }

      const { data: allData, error, count } = await query
      if (error) throw error

      // 클라이언트 사이드 정렬: 수정된 항목 위로
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
      setPilots(sortedData.slice(from, to))
      setTotalCount(count || 0)

      const pilotsPage = sortedData.slice(from, to)
      if (pilotsPage.length > 0) {
        const pilotIds = pilotsPage.map((p: any) => p.id)
        const { data: msData } = await supabase.from('mobile_suits').select('pilot_id').in('pilot_id', pilotIds)
        const counts: Record<string, number> = {}
        msData?.forEach((ms: any) => { if (ms.pilot_id) counts[ms.pilot_id] = (counts[ms.pilot_id] || 0) + 1 })
        setMsCounts(counts)
      }
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ${PAGE_CONFIG.titleSingle}을(를) 삭제하시겠습니까?`)) return
    try {
      const { error } = await supabase.from('pilots').delete().eq('id', id)
      if (error) throw error
      alert('삭제되었습니다!')
      loadPilots()
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const getFaction = (affiliationId: string) => factionsMap[affiliationId] || null
  const getRoleLabel = (role: string) => PILOT_ROLES.find(r => r.code === role)?.name || role || '-'

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading && pilots.length === 0) {
    return <AdminLoading message={`${PAGE_CONFIG.titleSingle} 목록을 불러오는 중...`} spinnerColor={PAGE_CONFIG.color.primary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPageHeader title={PAGE_CONFIG.title} icon={PAGE_CONFIG.icon} totalCount={totalCount} itemUnit={PAGE_CONFIG.itemUnit} addButtonLabel={`${PAGE_CONFIG.titleSingle} 추가`} addButtonHref={`${PAGE_CONFIG.basePath}/new`} color={PAGE_CONFIG.color} />

      <main className={ADMIN_STYLES.mainContainer}>
        <div className={ADMIN_STYLES.filterCard}>
          <div className="space-y-4">
            <AdminSearchFilter searchTerm={searchTerm} onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(1) }} placeholder={PAGE_CONFIG.searchPlaceholder} />
            <AdminBadgeFilter label="진영 필터" options={factions.map(f => ({ code: f.code, name: f.name_ko, color: f.color }))} selected={selectedFaction} onSelect={(c) => { setSelectedFaction(selectedFaction === c ? '' : c); setCurrentPage(1) }} onClear={() => { setSelectedFaction(''); setCurrentPage(1) }} accentColor={PAGE_CONFIG.color.primary} />
          </div>
        </div>

        <div className={ADMIN_STYLES.tableCard}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={ADMIN_STYLES.tableHeader}>이름</th>
                  <th className={ADMIN_STYLES.tableHeader}>코드</th>
                  <th className={ADMIN_STYLES.tableHeader}>소속 진영</th>
                  <th className={ADMIN_STYLES.tableHeader}>역할</th>
                  <th className={ADMIN_STYLES.tableHeader}>탑승 기체</th>
                  <th className={`${ADMIN_STYLES.tableHeader} text-right`}>작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pilots.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">{searchTerm || selectedFaction ? '검색 결과가 없습니다.' : `등록된 ${PAGE_CONFIG.titleSingle}이(가) 없습니다.`}</td></tr>
                ) : (
                  pilots.map((pilot) => {
                    const faction = getFaction(pilot.affiliation_default_id)
                    return (
                      <tr key={pilot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{pilot.name_ko}</div>
                          {pilot.name_en && <div className="text-sm text-gray-500">{pilot.name_en}</div>}
                        </td>
                        <td className={ADMIN_STYLES.tableCell}>
                          {pilot.code ? <span className={ADMIN_STYLES.codeBadge}>{pilot.code}</span> : <span className="text-gray-400">-</span>}
                        </td>
                        <td className={ADMIN_STYLES.tableCell}>
                          {faction ? <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: faction.color || '#6B7280' }}>{faction.name_ko}</span> : <span className="text-gray-400">-</span>}
                        </td>
                        <td className={`${ADMIN_STYLES.tableCell} text-sm text-gray-700`}>{getRoleLabel(pilot.role)}</td>
                        <td className={ADMIN_STYLES.tableCell}>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${PAGE_CONFIG.color.badge}`}>{msCounts[pilot.id] || 0}기</span>
                        </td>
                        <td className={`${ADMIN_STYLES.tableCell} text-right text-sm`}>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`${PAGE_CONFIG.basePath}/${pilot.id}/edit`} className={`${PAGE_CONFIG.color.text} ${PAGE_CONFIG.color.textHover} font-medium`}>수정</Link>
                            <button onClick={() => handleDelete(pilot.id, pilot.name_ko)} className="text-red-600 hover:text-red-800 font-medium">삭제</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
