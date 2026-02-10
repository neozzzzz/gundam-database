// src/app/admin/page.tsx
// Admin 대시보드 페이지
// V1.11: AdminAuthGuard 제거 (layout에서 처리), 병렬 데이터 로드

'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADMIN_COLORS } from '@/lib/constants/admin-colors'

export default function AdminDashboard() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalKits: 0,
    realKits: 0,
    sampleKits: 0,
    totalSeries: 0,
    totalMobileSuits: 0,
    totalPilots: 0,
    totalFactions: 0,
    totalOrganizations: 0,
    totalOrgFactionMemberships: 0,
    totalMsOrganizations: 0,
    totalMsPilots: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    
    try {
      // 유저 정보와 통계를 병렬로 로드
      const [userResult, ...statsResults] = await Promise.all([
        supabase.auth.getUser(),
        // 모든 카운트 쿼리를 병렬 실행
        supabase.from('gundam_kits').select('*', { count: 'exact', head: true }),
        supabase.from('gundam_kits').select('*', { count: 'exact', head: true }).not('name_ko', 'like', '%[sample]%'),
        supabase.from('gundam_kits').select('*', { count: 'exact', head: true }).like('name_ko', '%[sample]%'),
        supabase.from('series').select('*', { count: 'exact', head: true }),
        supabase.from('mobile_suits').select('*', { count: 'exact', head: true }),
        supabase.from('pilots').select('*', { count: 'exact', head: true }),
        supabase.from('factions').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('org_faction_memberships').select('*', { count: 'exact', head: true }),
        supabase.from('ms_organizations').select('*', { count: 'exact', head: true }),
        supabase.from('mobile_suit_pilots').select('*', { count: 'exact', head: true }),
      ])

      if (userResult.data.user) {
        setUser(userResult.data.user)
      }

      setStats({
        totalKits: statsResults[0].count || 0,
        realKits: statsResults[1].count || 0,
        sampleKits: statsResults[2].count || 0,
        totalSeries: statsResults[3].count || 0,
        totalMobileSuits: statsResults[4].count || 0,
        totalPilots: statsResults[5].count || 0,
        totalFactions: statsResults[6].count || 0,
        totalOrganizations: statsResults[7].count || 0,
        totalOrgFactionMemberships: statsResults[8].count || 0,
        totalMsOrganizations: statsResults[9].count || 0,
        totalMsPilots: statsResults[10].count || 0,
      })
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.log('Logout error:', error)
    }
    
    // 스토리지 정리
    if (typeof window !== 'undefined') {
      ['localStorage', 'sessionStorage'].forEach(storage => {
        const store = window[storage as 'localStorage' | 'sessionStorage']
        Object.keys(store).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            store.removeItem(key)
          }
        })
      })
      
      // 쿠키 정리
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      window.location.href = '/admin/login'
    }
  }

  // 통계 카드 설정
  const statCards = [
    { title: '전체 킷', count: stats.totalKits, icon: '/icons/admin/box.svg', colorClass: ADMIN_COLORS.kits.stat, subText: `실제: ${stats.realKits} / 샘플: ${stats.sampleKits}` },
    { title: '시리즈', count: stats.totalSeries, icon: '/icons/admin/tv.svg', colorClass: ADMIN_COLORS.series.stat },
    { title: '모빌슈트', count: stats.totalMobileSuits, icon: '/icons/admin/robot.svg', colorClass: ADMIN_COLORS.mobileSuits.stat },
    { title: '파일럿', count: stats.totalPilots, icon: '/icons/admin/user.svg', colorClass: ADMIN_COLORS.pilots.stat },
    { title: '진영', count: stats.totalFactions, icon: '/icons/admin/flag.svg', colorClass: ADMIN_COLORS.factions.stat },
    { title: '조직', count: stats.totalOrganizations, icon: '/icons/admin/factory.svg', colorClass: ADMIN_COLORS.organizations?.stat || 'text-purple-600' },
  ]

  // 메인 메뉴 아이템
  const menuItems = [
    { title: '킷 관리', href: '/admin/kits', count: stats.totalKits, icon: '/icons/admin/box.svg', description: '건프라 킷 정보 관리' },
    { title: '시리즈 관리', href: '/admin/series', count: stats.totalSeries, icon: '/icons/admin/tv.svg', description: '건담 시리즈/작품 관리' },
    { title: '모빌슈트 관리', href: '/admin/mobile-suits', count: stats.totalMobileSuits, icon: '/icons/admin/robot.svg', description: '모빌슈트 정보 관리' },
    { title: '파일럿 관리', href: '/admin/pilots', count: stats.totalPilots, icon: '/icons/admin/user.svg', description: '파일럿 캐릭터 관리' },
    { title: '진영 관리', href: '/admin/factions', count: stats.totalFactions, icon: '/icons/admin/flag.svg', description: '정치적 세력/진영 관리' },
    { title: '조직 관리', href: '/admin/organizations', count: stats.totalOrganizations, icon: '/icons/admin/factory.svg', description: '기업/군사조직 관리' },
  ]

  // 관계 관리 메뉴
  const relationMenuItems = [
    { title: '조직-진영 관계', href: '/admin/org-faction-memberships', count: stats.totalOrgFactionMemberships, description: '조직이 속한 진영 관계 관리' },
    { title: 'MS-조직 관계', href: '/admin/ms-organizations', count: stats.totalMsOrganizations, description: '모빌슈트 제조/운용 조직 관계' },
    { title: 'MS-파일럿 관계', href: '/admin/mobile-suit-pilots', count: stats.totalMsPilots, description: '모빌슈트 탑승 파일럿 관계' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="mt-1 text-sm text-gray-600">{user?.email || '로딩 중...'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                사이트 보기
              </Link>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <img src={card.icon} alt={card.title} className="w-5 h-5" />
                <span>{card.title}</span>
              </div>
              <div className={`mt-2 text-2xl font-bold ${card.colorClass}`}>
                {isLoading ? (
                  <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded"></span>
                ) : (
                  card.count
                )}
              </div>
              {card.subText && (
                <div className="mt-1 text-xs text-gray-500">
                  {isLoading ? '...' : card.subText}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 메인 메뉴 그리드 */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.icon} alt={item.title} className="w-8 h-8" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-bold">
                        {isLoading ? '...' : item.count}
                      </span>
                      개 등록됨
                    </p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* 관계 관리 메뉴 */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">관계 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relationMenuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-xs text-indigo-600 mt-1">
                      <span className="font-bold">
                        {isLoading ? '...' : item.count}
                      </span>
                      개 관계
                    </p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
