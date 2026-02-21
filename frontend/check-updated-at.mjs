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

async function checkUpdatedAt() {
  const { data, error } = await supabase
    .from('gundam_kits')
    .select('id, name_ko, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('\n최근 수정된 킷 10개:\n')
  data.forEach((kit, i) => {
    const updatedDate = new Date(kit.updated_at)
    const createdDate = new Date(kit.created_at)
    const isNew = updatedDate.getTime() === createdDate.getTime()
    console.log(`${i+1}. ${kit.name_ko}`)
    console.log(`   Updated: ${updatedDate.toLocaleString('ko-KR')} ${isNew ? '(신규)' : '(수정됨)'}`)
    console.log(`   Created: ${createdDate.toLocaleString('ko-KR')}\n`)
  })
}

checkUpdatedAt()
