import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
const envLines = envContent.split('\n')
const env = {}
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTableTimestamps(tableName) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('id, created_at, updated_at', { count: 'exact' })
    .limit(5)
  
  if (error) {
    console.log(`  ❌ 조회 실패: ${error.message}`)
    return
  }
  
  // NULL 개수 확인
  const { count: nullCount } = await supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true })
    .or('created_at.is.null,updated_at.is.null')
  
  const hasNulls = nullCount > 0
  const status = hasNulls ? '⚠️ ' : '✅'
  
  console.log(`  ${status} 전체: ${count}개, NULL: ${nullCount}개`)
  if (data.length > 0) {
    console.log(`  샘플: created=${data[0].created_at ? '있음' : 'NULL'}, updated=${data[0].updated_at ? '있음' : 'NULL'}`)
  }
}

async function checkAllTables() {
  console.log('\n=== 관리 페이지 테이블별 타임스탬프 상태 ===\n')
  
  const tables = [
    'gundam_kits',
    'series', 
    'factions',
    'pilots',
    'mobile_suits',
    'organizations',
    'ms_organizations',
    'org_faction_memberships',
    'mobile_suit_pilots',
  ]
  
  for (const table of tables) {
    console.log(`📋 ${table}:`)
    await checkTableTimestamps(table)
    console.log('')
  }
}

checkAllTables()
