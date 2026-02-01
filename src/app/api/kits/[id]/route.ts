// src/app/api/kits/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Step 1: 먼저 킷만 가져오기 (JOIN 없이)
    const { data: kitOnly, error: kitError } = await supabase
      .from('gundam_kits')
      .select('*')
      .eq('id', id)
      .single()

    if (kitError) {
      console.error('Kit fetch error:', kitError)
      return NextResponse.json(
        { error: 'Kit not found', details: kitError },
        { status: 404 }
      )
    }

    if (!kitOnly) {
      return NextResponse.json(
        { error: 'Kit not found' },
        { status: 404 }
      )
    }

    // Step 2: grade 정보 가져오기
    let gradeData = null
    if (kitOnly.grade_id) {
      const { data: grade } = await supabase
        .from('grades')
        .select('*')
        .eq('id', kitOnly.grade_id)
        .single()
      gradeData = grade
    }

    // Step 3: series 정보 가져오기
    let seriesData = null
    if (kitOnly.series_id) {
      const { data: series } = await supabase
        .from('series')
        .select('*')
        .eq('id', kitOnly.series_id)
        .single()
      seriesData = series
    }

    // Step 4: brand 정보 가져오기
    let brandData = null
    if (kitOnly.brand_id) {
      const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('id', kitOnly.brand_id)
        .single()
      brandData = brand
    }

    // Step 5: mobile_suit 정보 가져오기
    let mobileSuitData = null
    if (kitOnly.mobile_suit_id) {
      const { data: mobileSuit } = await supabase
        .from('mobile_suits')
        .select('*')
        .eq('id', kitOnly.mobile_suit_id)
        .single()
      
      if (mobileSuit) {
        // Step 6: faction 정보 가져오기
        let factionData = null
        if (mobileSuit.faction_id) {
          const { data: faction } = await supabase
            .from('factions')
            .select('*')
            .eq('id', mobileSuit.faction_id)
            .single()
          factionData = faction
        }

        // Step 6-1: company 정보 가져오기
        let companyData = null
        if (mobileSuit.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', mobileSuit.company_id)
            .single()
          companyData = company
        }

        // Step 6-2: pilot 정보 가져오기
        let pilotData = null
        if (mobileSuit.pilot_id) {
          const { data: pilot } = await supabase
            .from('pilots')
            .select('*')
            .eq('id', mobileSuit.pilot_id)
            .single()
          pilotData = pilot
        }
        
        mobileSuitData = {
          ...mobileSuit,
          factions: factionData,
          company: companyData,
          pilot: pilotData
        }
      }
    }

    // Step 6.5: limited_type 정보 가져오기
    let limitedTypeData = null
    if (kitOnly.limited_type_id) {
      const { data: limitedType } = await supabase
        .from('limited_types')
        .select('*')
        .eq('id', kitOnly.limited_type_id)
        .single()
      limitedTypeData = limitedType
    }

    // Step 7: kit_images 가져오기
    let imagesData: any[] = []
    const { data: images } = await supabase
      .from('kit_images')
      .select('*')
      .eq('kit_id', id)
      .order('is_primary', { ascending: false })
    
    if (images) {
      imagesData = images
    }

    // Step 8: 관련 킷 가져오기
    let relatedKitsData: any[] = []
    const { data: relations } = await supabase
      .from('kit_relations')
      .select('related_kit_id, relation_type')
      .eq('kit_id', id)
    
    if (relations && relations.length > 0) {
      const relatedKitIds = relations.map(r => r.related_kit_id)
      const { data: relatedKits } = await supabase
        .from('gundam_kits')
        .select(`
          id, name_ko, name_en, box_art_url, price_krw,
          grade:grades(code, scale),
          series:series(name_ko)
        `)
        .in('id', relatedKitIds)
        .is('deleted_at', null)
      
      if (relatedKits) {
        // relation_type 정보 매핑
        relatedKitsData = relatedKits.map(kit => {
          const relation = relations.find(r => r.related_kit_id === kit.id)
          return {
            ...kit,
            relation_type: relation?.relation_type
          }
        })
      }
    }

    // 최종 결과 조합
    const result = {
      ...kitOnly,
      grades: gradeData,
      series: seriesData,
      brand: brandData,
      mobile_suits: mobileSuitData,
      limited_type: limitedTypeData,
      kit_images: imagesData,
      related_kits: relatedKitsData
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Kit detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
