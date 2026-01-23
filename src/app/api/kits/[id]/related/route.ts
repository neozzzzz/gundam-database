// src/app/api/kits/[id]/related/route.ts
// 관련 건담 킷 조회 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // 킷의 관계 정보 조회
    const { data: relations, error: relationsError } = await supabase
      .from('kit_relations')
      .select(`
        relation_type,
        related_kit:gundam_kits!kit_relations_related_kit_id_fkey(
          *,
          grade:grades(*),
          brand:brands(*),
          series:series(*),
          kit_images!kit_images_kit_id_fkey(image_url, is_primary)
        )
      `)
      .eq('kit_id', id)
      .eq('gundam_kits.status', 'active')

    if (relationsError) {
      console.error('Database error:', relationsError)
      return NextResponse.json(
        { error: 'Failed to fetch related kits' },
        { status: 500 }
      )
    }

    // 관계 타입별로 그룹화
    const grouped = {
      variant: [] as any[],
      series: [] as any[],
      similar: [] as any[],
    }

    // 타입 단언으로 타입 에러 해결
    const relationsData = (relations || []) as any[]
    relationsData.forEach((relation: any) => {
      const type = relation.relation_type as keyof typeof grouped
      if (grouped[type]) {
        grouped[type].push(relation.related_kit)
      }
    })

    return NextResponse.json({
      data: grouped,
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
