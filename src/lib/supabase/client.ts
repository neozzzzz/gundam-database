// src/lib/supabase/client.ts
// 브라우저(클라이언트)에서 사용하는 Supabase 클라이언트

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/types/database'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

// 편의를 위한 싱글톤 인스턴스
export const supabase = createClient()
