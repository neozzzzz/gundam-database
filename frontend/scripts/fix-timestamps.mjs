#!/usr/bin/env node
/**
 * gundam_kits 테이블의 NULL 타임스탬프를 수정하는 스크립트
 * 
 * 실행: node scripts/fix-timestamps.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fubmzvpbxitzrwqmoynl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Ym16dnBieGl0enJ3cW1veW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTE2MTEsImV4cCI6MjA4NDcyNzYxMX0.EfOqTx1qhfsyPEJrKtQFZQGje3l19200p85REJCRjYs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  console.log('🔍 gundam_kits 타임스탬프 상태 확인...\n')

  // 현재 상태 확인
  const { data: kits, error } = await supabase
    .from('gundam_kits')
    .select('id, name_en, created_at, updated_at')
    .order('id')

  if (error) {
    console.error('❌ 조회 실패:', error.message)
    process.exit(1)
  }

  const nullCreated = kits.filter(k => !k.created_at)
  const nullUpdated = kits.filter(k => !k.updated_at)

  console.log(`총 ${kits.length}개 킷`)
  console.log(`  created_at NULL: ${nullCreated.length}개`)
  console.log(`  updated_at NULL: ${nullUpdated.length}개\n`)

  if (nullCreated.length === 0 && nullUpdated.length === 0) {
    console.log('✅ 모든 타임스탬프가 이미 설정되어 있습니다.')
    return
  }

  // NULL 타임스탬프 수정
  const now = new Date().toISOString()
  let fixedCount = 0

  for (const kit of kits) {
    const updates = {}
    if (!kit.created_at) updates.created_at = now
    if (!kit.updated_at) updates.updated_at = now

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('gundam_kits')
        .update(updates)
        .eq('id', kit.id)

      if (updateError) {
        console.error(`❌ ${kit.name_en}: ${updateError.message}`)
      } else {
        fixedCount++
        console.log(`✅ ${kit.name_en}: ${Object.keys(updates).join(', ')} 설정`)
      }
    }
  }

  console.log(`\n🎉 완료! ${fixedCount}개 킷 수정됨`)
}

main().catch(console.error)
