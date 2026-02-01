// src/app/api/stats/route.ts
// 통계 API - 메인 페이지용

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 건담 킷 수
    const { count: kitsCount, error: kitsError } = await supabase
      .from('gundam_kits')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null)

    if (kitsError) throw kitsError

    // 등급 수
    const { count: gradesCount, error: gradesError } = await supabase
      .from('grades')
      .select('*', { count: 'exact', head: true })

    if (gradesError) throw gradesError

    // 브랜드 수
    const { count: brandsCount, error: brandsError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })

    if (brandsError) throw brandsError

    // 시리즈 수
    const { count: seriesCount, error: seriesError } = await supabase
      .from('series')
      .select('*', { count: 'exact', head: true })

    if (seriesError) throw seriesError

    return NextResponse.json({
      data: {
        kits: kitsCount || 0,
        grades: gradesCount || 0,
        brands: brandsCount || 0,
        series: seriesCount || 0,
        gradesBrands: (gradesCount || 0) + (brandsCount || 0)
      }
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
