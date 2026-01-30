'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const UNIVERSES = [
  { code: 'UC', name: 'UC (Universal Century)' },
  { code: 'CE', name: 'CE (Cosmic Era)' },
  { code: 'AD', name: 'AD (Anno Domini)' },
  { code: 'AC', name: 'AC (After Colony)' },
  { code: 'FC', name: 'FC (Future Century)' },
  { code: 'PD', name: 'PD (Post Disaster)' },
  { code: 'AS', name: 'AS (Ad Stella)' },
  { code: 'BD', name: 'BD (Build)' },
  { code: 'OTHER', name: '기타' },
]

const COMPANY_TYPES = [
  { code: 'manufacturer', name: '제조사' },
  { code: 'research', name: '연구기관' },
  { code: 'conglomerate', name: '복합기업' },
  { code: 'military_org', name: '군사조직' },
]

export default function CompaniesAdmin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [msCounts, setMsCounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUniverse, setSelectedUniverse] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    loadCompanies()
  }, [currentPage, searchTerm, selectedUniverse, selectedType])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/admin/login')
    }
  }

  const loadCompanies = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('sort_order')

      // 검색 필터
      if (searchTerm) {
        query = query.or(`name_ko.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      }

      // 세계관 필터
      if (selectedUniverse) {
        query = query.eq('universe', selectedUniverse)
      }

      // 타입 필터
      if (selectedType) {
        query = query.eq('company_type', selectedType)
      }

      // 페이지네이션
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      setCompanies(data || [])
      setTotalCount(count || 0)

      // 기체 수 조회
      if (data && data.length > 0) {
        const companyIds = data.map((c: any) => c.id)
        const { data: msData } = await supabase
          .from('mobile_suits')
          .select('company_id')
          .in('company_id', companyIds)

        // company_id별 count 계산
        const counts: Record<string, number> = {}
        if (msData) {
          msData.forEach((ms: any) => {
            if (ms.company_id) {
              counts[ms.company_id] = (counts[ms.company_id] || 0) + 1
            }
          })
        }
        setMsCounts(counts)
      }
    } catch (error: any) {
      console.error('Companies 로딩 오류:', error)
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 제조사를 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      alert('삭제되었습니다!')
      loadCompanies()
    } catch (error: any) {
      console.error('삭제 오류:', error)
      alert(`삭제 실패: ${error.message}`)
    }
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

  const getTypeName = (type: string) => {
    const found = COMPANY_TYPES.find(t => t.code === type)
    return found ? found.name : type
  }

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">제조사 목록을 불러오는 중...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">🏭 제조사/기업 관리</h1>
                <p className="text-sm text-gray-600 mt-1">총 {totalCount}개</p>
              </div>
            </div>
            <Link
              href="/admin/companies/new"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              + 제조사 추가
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
                placeholder="이름, 코드 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-900 text-gray-900 bg-white"
              />
            </div>

            {/* 세계관 필터 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">세계관 필터</label>
                {selectedUniverse && (
                  <button
                    onClick={() => {
                      setSelectedUniverse('')
                      setCurrentPage(1)
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800"
                  >
                    전체 해제
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {UNIVERSES.map((universe) => {
                  const isSelected = selectedUniverse === universe.code
                  return (
                    <button
                      key={universe.code}
                      onClick={() => {
                        setSelectedUniverse(isSelected ? '' : universe.code)
                        setCurrentPage(1)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {universe.code}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 타입 필터 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">유형 필터</label>
                {selectedType && (
                  <button
                    onClick={() => {
                      setSelectedType('')
                      setCurrentPage(1)
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800"
                  >
                    전체 해제
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {COMPANY_TYPES.map((type) => {
                  const isSelected = selectedType === type.code
                  return (
                    <button
                      key={type.code}
                      onClick={() => {
                        setSelectedType(isSelected ? '' : type.code)
                        setCurrentPage(1)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 제조사 테이블 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    세계관
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기체 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    색상
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || selectedUniverse || selectedType ? '검색 결과가 없습니다.' : '등록된 제조사가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {company.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{company.name_ko}</div>
                        {company.name_en && (
                          <div className="text-sm text-gray-500">{company.name_en}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800">
                          {company.universe || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {getTypeName(company.company_type) || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          {msCounts[company.id] || 0}기
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.color ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: company.color }}
                            />
                            <span className="text-sm text-gray-600">{company.color}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/companies/${company.id}/edit`}
                            className="text-teal-600 hover:text-teal-800 font-medium"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(company.id, company.name_ko)}
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
                          ? 'bg-teal-600 text-white'
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
