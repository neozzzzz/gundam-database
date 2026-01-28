// src/app/api/kits/route.ts
// 건담 킷 목록 조회 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { KitFilters, PaginatedResponse, KitListItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams

    // 필터 파라미터 추출
    const filters: KitFilters = {
      grade: searchParams.get('grade')?.split(','),
      brand: searchParams.get('brand')?.split(','),
      series: searchParams.get('series')?.split(','),
      timeline: searchParams.get('timeline')?.split(','),
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
        brand:brands(*),
        series:series(*),
        kit_images!kit_images_kit_id_fkey(image_url, is_primary)
      `, { count: 'exact' })
      .eq('status', 'active')
      .is('deleted_at', null)  // Soft Delete 필터

    // 필터 적용
    if (filters.grade && filters.grade.length > 0) {
      query = query.in('grade.code', filters.grade)
    }

    if (filters.brand && filters.brand.length > 0) {
      query = query.in('brand.code', filters.brand)
    }

    if (filters.series && filters.series.length > 0) {
      query = query.in('series_id', filters.series)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price_krw', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price_krw', filters.priceMax)
    }

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
