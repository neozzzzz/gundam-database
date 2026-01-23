// src/app/api/suggestions/[id]/review/route.ts
// 제안 승인/거부 API (관리자 전용)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

    // 사용자 권한 확인 (관리자 또는 모더레이터)
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 요청 본문
    const body = await request.json()
    const { status, review_comment } = body // 'approved' 또는 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // 제안 정보 조회
    const { data: suggestion, error: suggestionError } = await supabase
      .from('suggestions')
      .select('*')
      .eq('id', id)
      .single()

    if (suggestionError || !suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    // 제안 상태 업데이트
    const { error: updateError } = await supabase
      .from('suggestions')
      .update({
        status,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
        review_comment,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update suggestion' },
        { status: 500 }
      )
    }

    // 승인된 경우, 실제 데이터 업데이트
    if (status === 'approved') {
      if (suggestion.suggestion_type === 'edit' && suggestion.kit_id) {
        // 킷 정보 수정
        await supabase
          .from('gundam_kits')
          .update(suggestion.suggested_data as any)
          .eq('id', suggestion.kit_id)
      } else if (suggestion.suggestion_type === 'new') {
        // 새 킷 추가
        await supabase
          .from('gundam_kits')
          .insert(suggestion.suggested_data as any)
      } else if (suggestion.suggestion_type === 'delete' && suggestion.kit_id) {
        // 킷 삭제 (상태 변경)
        await supabase
          .from('gundam_kits')
          .update({ status: 'discontinued' })
          .eq('id', suggestion.kit_id)
      }
    }

    return NextResponse.json({
      data: { status: 'success' },
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
