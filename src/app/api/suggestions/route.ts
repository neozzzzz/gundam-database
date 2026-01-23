// src/app/api/suggestions/route.ts
// 사용자 제안 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SuggestionCreate } from '@/lib/types'

// 제안 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams

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

    // 쿼리 빌드
    let query = supabase
      .from('suggestions')
      .select(`
        *,
        user:users!suggestions_user_id_fkey(display_name, email),
        kit:gundam_kits(name_ko)
      `)

    // 일반 사용자는 자신의 제안만 조회
    if (user?.role !== 'admin' && user?.role !== 'moderator') {
      query = query.eq('user_id', session.user.id)
    }

    // 상태 필터
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    // 정렬
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
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

// 새 제안 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 사용자 인증 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 요청 본문
    const body: SuggestionCreate = await request.json()

    // 제안 생성
    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        ...body,
        user_id: session.user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
