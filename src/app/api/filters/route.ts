// src/app/api/filters/route.ts
// 필터 옵션 조회 API (등급, 브랜드, 시리즈, 한정판 유형 등)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 모든 필터 옵션 병렬 조회
    const [
      { data: timelines },
      { data: grades },
      { data: brands },
      { data: series },
      { data: limitedTypes },
    ] = await Promise.all([
      supabase.from('timelines').select('*').order('code'),
      supabase.from('grades').select('*').order('sort_order'),
      supabase.from('brands').select('*, grade:grades(code, name)').order('sort_order'),
      supabase.from('series').select('*, timeline:timelines(code, name_ko)').order('name_ko'),
      supabase.from('limited_types').select('*').order('sort_order'),
    ])

    return NextResponse.json({
      data: {
        timelines: timelines || [],
        grades: grades || [],
        brands: brands || [],
        series: series || [],
        limitedTypes: limitedTypes || [],
      },
      error: null,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
