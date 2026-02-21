import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// .env.local 파일 읽기
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

async function fixTimestamps() {
  console.log('NULL 타임스탬프 확인 중...\n')
  
  // NULL 타임스탬프를 가진 킷 확인
  const { data: nullKits, error: checkError } = await supabase
    .from('gundam_kits')
    .select('id, name_ko, created_at, updated_at')
    .or('created_at.is.null,updated_at.is.null')
  
  if (checkError) {
    console.error('확인 실패:', checkError)
    return
  }
  
  console.log(`NULL 타임스탬프를 가진 킷: ${nullKits.length}개\n`)
  
  if (nullKits.length === 0) {
    console.log('모든 킷에 타임스탬프가 설정되어 있습니다!')
    return
  }
  
  // 일괄 업데이트
  const now = new Date().toISOString()
  
  for (const kit of nullKits) {
    const updates = {}
    if (!kit.created_at) updates.created_at = now
    if (!kit.updated_at) updates.updated_at = now
    
    const { error: updateError } = await supabase
      .from('gundam_kits')
      .update(updates)
      .eq('id', kit.id)
    
    if (updateError) {
      console.error(`❌ ${kit.name_ko} 업데이트 실패:`, updateError)
    } else {
      const fields = Object.keys(updates).join(', ')
      console.log(`✅ ${kit.name_ko} - ${fields} 설정됨`)
    }
  }
  
  console.log('\n완료!')
}

fixTimestamps()
