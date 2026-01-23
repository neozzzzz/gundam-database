// src/app/api/kits/[id]/route.ts
// 건담 킷 상세 조회 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { KitWithDetails, ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // 킷 상세 정보 조회
    const { data: kit, error: kitError } = await supabase
      .from('gundam_kits')
      .select(`
        *,
        grade:grades(*),
        brand:brands(*),
        series:series(*),
        mobile_suit:mobile_suits(*),
        kit_images!kit_images_kit_id_fkey(*),
        purchase_links:purchase_links(
          *,
          store:stores(*)
        )
      `)
      .eq('id', id)
      .single()

    if (kitError) {
      if (kitError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Kit not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', kitError)
      return NextResponse.json(
        { error: 'Failed to fetch kit details' },
        { status: 500 }
      )
    }

    // 조회수 증가 (비동기로 실행, 응답에 영향 없음)
    supabase
      .from('gundam_kits')
      .update({ view_count: (kit.view_count || 0) + 1 })
      .eq('id', id)
      .then()

    const response: ApiResponse<KitWithDetails> = {
      data: kit as KitWithDetails,
      error: null,
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

// 관리자 전용: 킷 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // 사용자 인증 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 사용자 권한 확인
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 업데이트할 데이터
    const body = await request.json()

    // 킷 업데이트
    const { data, error } = await supabase
      .from('gundam_kits')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update kit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 관리자 전용: 킷 삭제 (상태 변경)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // 사용자 인증 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 사용자 권한 확인
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 킷 상태를 'discontinued'로 변경 (소프트 삭제)
    const { data, error } = await supabase
      .from('gundam_kits')
      .update({ status: 'discontinued' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete kit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
