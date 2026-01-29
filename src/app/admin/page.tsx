'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalKits: 0,
    realKits: 0,
    sampleKits: 0,
    totalSeries: 0,
  })
  const [kits, setKits] = useState<any[]>([])
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [grades, setGrades] = useState<any[]>([])
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState<'kits' | 'series'>('kits')
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalFilteredCount, setTotalFilteredCount] = useState(0)

  useEffect(() => {
    checkUser()
    loadStats()
    loadGrades()
    
    // URL 파라미터에서 refresh 확인
    const refresh = searchParams.get('refresh')
    if (refresh === 'true') {
      setCurrentPage(1)
      setActiveTab('kits')
      // URL에서 파라미터 제거
      router.replace('/admin')
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'kits') {
      loadKits()
    } else {
      loadSeries()
    }
  }, [currentPage, searchTerm, selectedGrades, activeTab])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/admin/login')
        return
      }

      if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        alert('접근 권한이 없습니다.')
        await supabase.auth.signOut()
        router.push('/admin/login')
        return
      }

      setUser(session.user)
    } catch (error) {
      console.error('사용자 확인 오류:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { count: total } = await supabase
        .from('gundam_kits')
        .select('*', { count: 'exact', head: true })

      const { count: real } = await supabase
        .from('gundam_kits')
        .select('*', { count: 'exact', head: true })
        .not('name_ko', 'like', '%[sample]%')

      const { count: sample } = await supabase
        .from('gundam_kits')
        .select('*', { count: 'exact', head: true })
        .like('name_ko', '%[sample]%')

      const { count: series } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalKits: total || 0,
        realKits: real || 0,
        sampleKits: sample || 0,
        totalSeries: series || 0,
      })
    } catch (error) {
      console.error('통계 로딩 오류:', error)
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
      let query = supabase
        .from('gundam_kits')
        .select(`
          *,
          grade:grades(code, name),
          series:series(name_ko),
          brand:brands(code)
        `, { count: 'exact' })
        // DB에서는 created_at으로만 정렬 (등록순)
        .order('created_at', { ascending: false })

      // 검색 필터 적용
      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`)
      }

      // 등급 필터 적용 (복수 선택)
      if (selectedGrades.length > 0) {
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
        
        // 수정 여부 판단 (1초 이상 차이나면 수정됨)
        const aModified = Math.abs(aUpdated - aCreated) > 1000
        const bModified = Math.abs(bUpdated - bCreated) > 1000
        
        // a만 수정됨 → a가 위로
        if (aModified && !bModified) return -1
        // b만 수정됨 → b가 위로
        if (!aModified && bModified) return 1
        
        // 둘 다 수정됨 → 최신 수정이 위로
        if (aModified && bModified) {
          return bUpdated - aUpdated
        }
        
        // 둘 다 수정 안 됨 → 최신 등록이 위로 (이미 DB에서 정렬됨)
        return bCreated - aCreated
      })
      
      // 페이지네이션 적용
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage
      const paginatedData = sortedData.slice(from, to)
      
      setKits(paginatedData)
      setTotalFilteredCount(count || 0)
    } catch (error) {
      console.error('킷 로딩 오류:', error)
    }
  }

  const loadSeries = async () => {
    try {
      let query = supabase
        .from('series')
        .select(`
          *,
          kits:gundam_kits(count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // 검색 필터 적용
      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,name_ja.ilike.%${searchTerm}%`)
      }

      // 페이지네이션 적용
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      
      setSeriesList(data || [])
      setTotalFilteredCount(count || 0)
    } catch (error) {
      console.error('시리즈 로딩 오류:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const handleDeleteKit = async (id: string, name: string) => {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('gundam_kits')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('삭제되었습니다.')
      loadKits()
      loadStats()
    } catch (error: any) {
      console.error('삭제 오류:', error)
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const handleDeleteSeries = async (id: string, name: string) => {
    if (!confirm(`시리즈 "${name}"을(를) 삭제하시겠습니까?\n\n⚠️ 이 시리즈에 속한 킷들은 시리즈 정보가 제거됩니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('시리즈가 삭제되었습니다.')
      loadSeries()
      loadStats()
    } catch (error: any) {
      console.error('시리즈 삭제 오류:', error)
      alert(`삭제 실패: ${error.message}`)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
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

  const handleTabChange = (tab: 'kits' | 'series') => {
    setActiveTab(tab)
    setSearchTerm('')
    setSelectedGrades([])
    setCurrentPage(1)
  }

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage)

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 킷</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalKits}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">실제 제품</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.realKits}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">샘플 데이터</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.sampleKits}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">시리즈</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.totalSeries}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/kits/new"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">킷 추가</h3>
                <p className="text-sm text-gray-600">새로운 건담 킷 등록</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/series/new"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">시리즈 추가</h3>
                <p className="text-sm text-gray-600">새로운 시리즈 등록</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/mobile-suits"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">모빌슈트 관리</h3>
                <p className="text-sm text-gray-600">기체 정보 등록</p>
              </div>
            </div>
          </Link>

          <Link
            href="/kits"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">킷 목록 보기</h3>
                <p className="text-sm text-gray-600">사용자 화면에서 확인</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 킷/시리즈 목록 */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200">
            {/* 탭 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => handleTabChange('kits')}
                  className={`text-lg font-bold pb-2 border-b-2 transition-colors ${
                    activeTab === 'kits'
                      ? 'text-gray-900 border-blue-600'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  킷 목록
                </button>
                <button
                  onClick={() => handleTabChange('series')}
                  className={`text-lg font-bold pb-2 border-b-2 transition-colors ${
                    activeTab === 'series'
                      ? 'text-gray-900 border-purple-600'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  시리즈 목록
                </button>
              </div>
              <button
                onClick={() => activeTab === 'kits' ? loadKits() : loadSeries()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                새로고침
              </button>
            </div>

            {/* 검색 */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={activeTab === 'kits' ? '킷 이름 검색...' : '시리즈 이름 검색...'}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 등급 필터 (킷 목록일 때만) */}
            {activeTab === 'kits' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    등급 필터 {selectedGrades.length > 0 && `(${selectedGrades.length}개 선택)`}
                  </label>
                  {selectedGrades.length > 0 && (
                    <button
                      onClick={clearAllGrades}
                      className="text-xs text-gray-500 hover:text-gray-700"
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
            )}
          </div>

          {/* 킷 목록 테이블 */}
          {activeTab === 'kits' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
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
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kits.map((kit) => (
                    <tr key={kit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {kit.name_ko}
                        </div>
                        {kit.name_en && (
                          <div className="text-sm text-gray-500">
                            {kit.name_en}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {kit.grade?.code || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {kit.series?.name_ko || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kit.price_krw ? `₩${kit.price_krw.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/kits/${kit.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDeleteKit(kit.id, kit.name_ko)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {kits.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">킷이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* 시리즈 목록 테이블 */}
          {activeTab === 'series' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시리즈 이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      영문/일본어
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      킷 개수
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {seriesList.map((series) => (
                    <tr key={series.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {series.name_ko}
                        </div>
                        {series.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {series.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {series.name_en && (
                          <div className="text-sm text-gray-600">
                            {series.name_en}
                          </div>
                        )}
                        {series.name_ja && (
                          <div className="text-sm text-gray-500">
                            {series.name_ja}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {series.kits?.[0]?.count || 0}개
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteSeries(series.id, series.name_ko)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {seriesList.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">시리즈가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{totalFilteredCount}</span>개 중{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalFilteredCount)}
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
