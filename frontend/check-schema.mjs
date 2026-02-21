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

async function checkSchema() {
  // 샘플 데이터로 스키마 확인
  const { data, error } = await supabase
    .from('gundam_kits')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  if (data && data.length > 0) {
    console.log('\n테이블 필드 목록:')
    console.log(Object.keys(data[0]))
    console.log('\n샘플 데이터:')
    console.log(data[0])
  }
}

checkSchema()
