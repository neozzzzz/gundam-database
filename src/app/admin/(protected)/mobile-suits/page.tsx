'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MobileSuitsAdmin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [mobileSuits, setMobileSuits] = useState<any[]>([])
  const [factions, setFactions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaction, setSelectedFaction] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
    loadFactions()
  }, [])

  useEffect(() => {
    loadMobileSuits()
  }, [currentPage, searchTerm, selectedFaction])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadFactions = async () => {
    const { data } = await supabase
      .from('factions')
      .select('*')
      .order('sort_order')
    
    setFactions(data || [])
  }

  const loadMobileSuits = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('mobile_suits')
        .select(`
          *,
          series:series(id, name_ko),
          faction:factions(id, name_ko, code, color)
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })

      // 검색 필터
      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,model_number.ilike.%${searchTerm}%`)
      }

      // 진영 필터
      if (selectedFaction) {
        const faction = factions.find(f => f.code === selectedFaction)
        if (faction) {
          query = query.eq('faction_id', faction.id)
        }
      }

      // 페이지네이션
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      setMobileSuits(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error('모빌슈트 로딩 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 모빌슈트를 삭제하시겠습니까?\n\n⚠️ 이 모빌슈트를 사용하는 킷들은 연결이 해제됩니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('mobile_suits')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('삭제되었습니다!')
      loadMobileSuits()
    } catch (error: any) {
      console.error('삭제 오류:', error)
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const getFactionColor = (factionCode: string) => {
    const colors: any = {
      'EFSF': 'bg-blue-500/20 text-blue-800',
      'ZEON': 'bg-red-500/20 text-red-800',
      'TITANS': 'bg-indigo-500/20 text-indigo-800',
      'AEUG': 'bg-green-500/20 text-green-800',
      'NEO_ZEON': 'bg-orange-500/20 text-orange-800',
      'PLANT': 'bg-green-500/20 text-green-800',
      'CB': 'bg-purple-500/20 text-purple-800',
    }
    return colors[factionCode] || 'bg-gray-500/20 text-gray-800'
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
      for (let i = start; i <= end; i++) pages.push(i)
    }
    return pages
  }

  if (loading && mobileSuits.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">모빌슈트 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🤖 모빌슈트 관리</h1>
                <p className="text-sm text-gray-600 mt-1">총 {totalCount}개</p>
              </div>
            </div>
            <Link
              href="/admin/mobile-suits/new"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              + 모빌슈트 추가
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="space-y-4">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="이름, 모델번호 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
              />
            </div>

            {/* 진영 필터 - 뱃지 형태 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">진영 필터</label>
                {selectedFaction && (
                  <button
                    onClick={() => {
                      setSelectedFaction('')
                      setCurrentPage(1)
                    }}
                    className="text-xs text-orange-600 hover:text-orange-800"
                  >
                    전체 해제
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {factions.map((faction) => {
                  const isSelected = selectedFaction === faction.code
                  return (
                    <button
                      key={faction.id}
                      onClick={() => {
                        setSelectedFaction(isSelected ? '' : faction.code)
                        setCurrentPage(1)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {faction.name_ko}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 모빌슈트 테이블 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    모델 번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    진영
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시리즈
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mobileSuits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedFaction ? '검색 결과가 없습니다.' : '등록된 모빌슈트가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  mobileSuits.map((ms) => (
                    <tr key={ms.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ms.name_ko}</div>
                        {ms.name_en && (
                          <div className="text-sm text-gray-500">{ms.name_en}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {ms.model_number || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ms.faction ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getFactionColor(ms.faction.code)}`}>
                            {ms.faction.name_ko}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ms.series?.name_ko || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/mobile-suits/${ms.id}/edit`}
                            className="text-orange-600 hover:text-orange-800 font-medium"
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{totalCount}</span>개 중{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalCount)}
                  </span>
                  개 표시
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
