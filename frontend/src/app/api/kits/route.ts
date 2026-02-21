// src/app/api/kits/route.ts
// 건담 킷 목록 조회 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { KitFilters, PaginatedResponse, KitListItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // 필터 파라미터 추출
    const filters: KitFilters = {
      grade: searchParams.get('grade')?.split(','),
      scale: searchParams.get('scale')?.split(','),
      brand: searchParams.get('brand')?.split(','),
      series: searchParams.get('series')?.split(','),
      timeline: searchParams.get('timeline')?.split(','),
      limitedTypes: searchParams.get('limitedTypes')?.split(','),
      priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
      isPbandai: searchParams.get('isPbandai') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'release_date',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    }

    // 쿼리 빌드
    let query = supabase
      .from('gundam_kits')
      .select(`
        *,
        grade:grades(*),
        series:series(*),
        limited_type:limited_types(*),
        kit_images!kit_images_kit_id_fkey(image_url, is_primary)
      `, { count: 'exact' })
      .eq('status', 'active')
      .is('deleted_at', null)  // Soft Delete 필터

    // 필터 적용
    if (filters.grade && filters.grade.length > 0) {
      // grade_id로 필터링하기 위해 먼저 grade code에 해당하는 ID 조회
      const { data: gradesData } = await supabase
        .from('grades')
        .select('id')
        .in('code', filters.grade)
      
      if (gradesData && gradesData.length > 0) {
        const gradeIds = gradesData.map(g => g.id)
        query = query.in('grade_id', gradeIds)
      }
    }

    // scale 필터 - grade 테이블의 scale 컬럼으로 필터링
    if (filters.scale && filters.scale.length > 0) {
      const { data: scaleGrades } = await supabase
        .from('grades')
        .select('id')
        .in('scale', filters.scale)
      
      if (scaleGrades && scaleGrades.length > 0) {
        const scaleGradeIds = scaleGrades.map(g => g.id)
        query = query.in('grade_id', scaleGradeIds)
      }
    }

    // brand 필터 제거됨 (brands 테이블 비활성화)

    if (filters.series && filters.series.length > 0) {
      query = query.in('series_id', filters.series)
    }

    // 한정판 유형 필터 (새로운 방식)
    if (filters.limitedTypes && filters.limitedTypes.length > 0) {
      query = query.in('limited_type_id', filters.limitedTypes)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price_krw', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price_krw', filters.priceMax)
    }

    // 기존 isPbandai 필터 (하위 호환성)
    if (filters.isPbandai !== undefined) {
      query = query.eq('is_pbandai', filters.isPbandai)
    }

    if (filters.search) {
      query = query.or(`name_ko.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%`)
    }

    // 정렬
    query = query.order(filters.sortBy!, { ascending: filters.sortOrder === 'asc' })

    // 페이지네이션
    const page = filters.page || 1
    const limit = filters.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    // 실행
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch kits' },
        { status: 500 }
      )
    }

    // 응답
    const response: PaginatedResponse<KitListItem> = {
      data: data as KitListItem[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
