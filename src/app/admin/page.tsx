'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminAuthGuard } from '@/components/admin-auth-guard'
import { ADMIN_COLORS } from '@/lib/constants/admin-colors'

function AdminDashboardContent() {
  const supabase = createClient()
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
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.log('Logout error:', error)
    }
    
    // 브라우저 스토리지 강제 삭제
    if (typeof window !== 'undefined') {
      const localKeys = Object.keys(localStorage)
      localKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
        }
      })
      
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
    { 
      title: '전체 킷', 
      count: stats.totalKits, 
      icon: '/icons/admin/box.svg',
      colorClass: ADMIN_COLORS.kits.stat,
      subText: `실제: ${stats.realKits} / 샘플: ${stats.sampleKits}`
    },
    { 
      title: '시리즈', 
      count: stats.totalSeries, 
      icon: '/icons/admin/tv.svg',
      colorClass: ADMIN_COLORS.series.stat 
    },
    { 
      title: '모빌슈트', 
      count: stats.totalMobileSuits, 
      icon: '/icons/admin/robot.svg',
      colorClass: ADMIN_COLORS.mobileSuits.stat 
    },
    { 
      title: '파일럿', 
      count: stats.totalPilots, 
      icon: '/icons/admin/user.svg',
      colorClass: ADMIN_COLORS.pilots.stat 
    },
    { 
      title: '진영', 
      count: stats.totalFactions, 
      icon: '/icons/admin/flag.svg',
      colorClass: ADMIN_COLORS.factions.stat 
    },
    { 
      title: '제조사', 
      count: stats.totalCompanies, 
      icon: '/icons/admin/factory.svg',
      colorClass: ADMIN_COLORS.companies.stat 
    },
  ]

  // 메뉴 아이템 설정
  const menuItems = [
    { 
      title: '킷 관리', 
      href: '/admin/kits', 
      count: stats.totalKits, 
      icon: '/icons/admin/box.svg',
    },
    { 
      title: '시리즈 관리', 
      href: '/admin/series', 
      count: stats.totalSeries, 
      icon: '/icons/admin/tv.svg',
    },
    { 
      title: '모빌슈트 관리', 
      href: '/admin/mobile-suits', 
      count: stats.totalMobileSuits, 
      icon: '/icons/admin/robot.svg',
    },
    { 
      title: '파일럿 관리', 
      href: '/admin/pilots', 
      count: stats.totalPilots, 
      icon: '/icons/admin/user.svg',
    },
    { 
      title: '진영 관리', 
      href: '/admin/factions', 
      count: stats.totalFactions, 
      icon: '/icons/admin/flag.svg',
    },
    { 
      title: '제조사 관리', 
      href: '/admin/companies', 
      count: stats.totalCompanies, 
      icon: '/icons/admin/factory.svg',
    },
  ]

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
                {card.count}
              </div>
              {card.subText && (
                <div className="mt-1 text-xs text-gray-500">
                  {card.subText}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <p className="text-sm text-gray-500"><span className="font-bold">{item.count}</span>개 등록됨</p>
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

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <AdminDashboardContent />
    </AdminAuthGuard>
  )
}
