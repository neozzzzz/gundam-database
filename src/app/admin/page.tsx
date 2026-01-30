'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalKits: 0,
    realKits: 0,
    sampleKits: 0,
    totalSeries: 0,
    totalMobileSuits: 0,
    totalPilots: 0,
    totalFactions: 0,
    totalCompanies: 0,
  })

  useEffect(() => {
    // layout.tsx에서 이미 인증 체크 완료됨, 여기서는 user 정보만 가져옴
    getUser()
    loadStats()
  }, [])

  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUser(session.user)
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

      const { count: mobileSuits } = await supabase
        .from('mobile_suits')
        .select('*', { count: 'exact', head: true })

      const { count: pilots } = await supabase
        .from('pilots')
        .select('*', { count: 'exact', head: true })

      const { count: factions } = await supabase
        .from('factions')
        .select('*', { count: 'exact', head: true })

      const { count: companies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalKits: total || 0,
        realKits: real || 0,
        sampleKits: sample || 0,
        totalSeries: series || 0,
        totalMobileSuits: mobileSuits || 0,
        totalPilots: pilots || 0,
        totalFactions: factions || 0,
        totalCompanies: companies || 0,
      })
    } catch (error) {
      console.error('통계 로딩 오류:', error)
    }
  }

  const handleLogout = async () => {
    // 먼저 상태 초기화
    setUser(null)
    
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.log('Logout API error (ignored):', error)
    }
    
    // 브라우저 스토리지 강제 삭제
    if (typeof window !== 'undefined') {
      // 로컬 스토리지
      const localKeys = Object.keys(localStorage)
      localKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      // 세션 스토리지
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
        }
      })
      
      // 쿠키 삭제 (supabase 관련)
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      // 하드 리다이렉트로 완전히 초기화
      window.location.href = '/admin/login'
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
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

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">모빌슈트</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.totalMobileSuits}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">파일럿</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.totalPilots}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">진영</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.totalFactions}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚔️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">제조사</p>
                <p className="text-3xl font-bold text-teal-600 mt-2">
                  {stats.totalCompanies}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏭</span>
              </div>
            </div>
          </div>
        </div>

        {/* 관리 메뉴 */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">데이터 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/kits"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">📦 킷 관리</h3>
                <p className="text-sm text-gray-600">{stats.totalKits}개 등록됨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/series"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">🎬 시리즈 관리</h3>
                <p className="text-sm text-gray-600">{stats.totalSeries}개 등록됨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/mobile-suits"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">🤖 모빌슈트 관리</h3>
                <p className="text-sm text-gray-600">{stats.totalMobileSuits}개 등록됨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/pilots"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">👤 파일럿 관리</h3>
                <p className="text-sm text-gray-600">{stats.totalPilots}개 등록됨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/factions"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚔️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">⚔️ 진영 관리</h3>
                <p className="text-sm text-gray-600">{stats.totalFactions}개 등록됨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/companies"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-teal-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏭</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">🏭 제조사 관리</h3>
                <p className="text-sm text-gray-600">{stats.totalCompanies}개 등록됨</p>
              </div>
            </div>
          </Link>

          <Link
            href="/kits"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-gray-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">👁️ 사용자 화면</h3>
                <p className="text-sm text-gray-600">프론트엔드 확인</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
