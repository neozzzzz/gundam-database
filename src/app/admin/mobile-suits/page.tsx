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
  const [searchTerm, setSearchTerm] = useState('')
  const [factionFilter, setFactionFilter] = useState('')

  useEffect(() => {
    checkAuth()
    loadMobileSuits()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadMobileSuits = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('mobile_suits')
        .select(`
          *,
          series:series(id, name_ko),
          faction:factions(id, name_ko, code, color)
        `)
        .order('name_ko')

      if (error) throw error
      setMobileSuits(data || [])
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

  const filteredMobileSuits = mobileSuits.filter(ms => {
    const search = searchTerm.toLowerCase()
    const matchSearch = !searchTerm || 
      ms.name_ko?.toLowerCase().includes(search) ||
      ms.name_en?.toLowerCase().includes(search) ||
      ms.model_number?.toLowerCase().includes(search) ||
      ms.pilot?.toLowerCase().includes(search)

    const matchFaction = !factionFilter || ms.faction?.code === factionFilter

    return matchSearch && matchFaction
  })

  const getFactionColor = (factionCode: string) => {
    const colors: any = {
      'EFSF': 'bg-blue-500/20 text-blue-800',
      'ZEON': 'bg-red-500/20 text-red-800',
      'PLANT': 'bg-green-500/20 text-green-800',
      'CB': 'bg-purple-500/20 text-purple-800',
    }
    return colors[factionCode] || 'bg-gray-500/20 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                <p className="text-sm text-gray-600 mt-1">총 {filteredMobileSuits.length}개</p>
              </div>
            </div>
            <Link
              href="/admin/mobile-suits/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 모빌슈트 추가
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름, 모델번호, 파일럿 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진영 필터
              </label>
              <select
                value={factionFilter}
                onChange={(e) => setFactionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">전체</option>
                <option value="EFSF">지구연방</option>
                <option value="ZEON">지온</option>
                <option value="PLANT">플랜트</option>
                <option value="CB">솔레스탈 비잉</option>
                <option value="OTHER">기타</option>
              </select>
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
                    파일럿
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
                {filteredMobileSuits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || factionFilter ? '검색 결과가 없습니다.' : '등록된 모빌슈트가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredMobileSuits.map((ms) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ms.pilot || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ms.series?.name_ko || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/mobile-suits/${ms.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
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
        </div>
      </main>
    </div>
  )
}
