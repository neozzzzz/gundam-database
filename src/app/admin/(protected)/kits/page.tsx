'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function KitsAdmin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [kits, setKits] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [grades, setGrades] = useState<any[]>([])
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
    loadGrades()
  }, [])

  useEffect(() => {
    loadKits()
  }, [currentPage, searchTerm, selectedGrades, grades])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .order('sort_order')
    
    setGrades(data || [])
  }

  const loadKits = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('gundam_kits')
        .select(`
          *,
          grade:grades(code, name),
          series:series(name_ko)
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })

      // 검색 필터
      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`)
      }

      // 등급 필터
      if (selectedGrades.length > 0 && grades.length > 0) {
        const gradeIds = grades
          .filter(g => selectedGrades.includes(g.code))
          .map(g => g.id)
        
        if (gradeIds.length > 0) {
          query = query.in('grade_id', gradeIds)
        }
      }

      const { data: allData, error, count } = await query

      if (error) throw error
      
      // 클라이언트 사이드 정렬: 수정된 킷만 위로
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
      
      // 페이지네이션 적용
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage
      const paginatedData = sortedData.slice(from, to)
      
      setKits(paginatedData)
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error('킷 로딩 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 킷을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('gundam_kits')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('삭제되었습니다!')
      loadKits()
    } catch (error: any) {
      console.error('삭제 오류:', error)
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const toggleGrade = (gradeCode: string) => {
    setSelectedGrades(prev => {
      if (prev.includes(gradeCode)) {
        return prev.filter(g => g !== gradeCode)
      } else {
        return [...prev, gradeCode]
      }
    })
    setCurrentPage(1)
  }

  const clearAllGrades = () => {
    setSelectedGrades([])
    setCurrentPage(1)
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

  if (loading && kits.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">킷 목록을 불러오는 중...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">📦 킷 관리</h1>
                <p className="text-sm text-gray-600 mt-1">총 {totalCount}개</p>
              </div>
            </div>
            <Link
              href="/admin/kits/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 킷 추가
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
                placeholder="킷 이름 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
              />
            </div>

            {/* 등급 필터 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">등급 필터</label>
                {selectedGrades.length > 0 && (
                  <button
                    onClick={clearAllGrades}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    전체 해제
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {grades.map((grade) => {
                  const isSelected = selectedGrades.includes(grade.code)
                  return (
                    <button
                      key={grade.id}
                      onClick={() => toggleGrade(grade.code)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {grade.code}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 킷 테이블 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    킷 이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등급
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시리즈
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedGrades.length > 0 ? '검색 결과가 없습니다.' : '등록된 킷이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  kits.map((kit) => (
                    <tr key={kit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{kit.name_ko}</div>
                        {kit.name_en && (
                          <div className="text-sm text-gray-500">{kit.name_en}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {kit.grade?.code || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {kit.series?.name_ko || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kit.price_krw ? `₩${kit.price_krw.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/kits/${kit.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(kit.id, kit.name_ko)}
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
                          ? 'bg-blue-600 text-white'
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
