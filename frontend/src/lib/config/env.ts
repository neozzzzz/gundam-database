// src/lib/config/env.ts
// 환경 변수 검증 및 타입 안전성

/**
 * 필수 환경 변수 검증
 * 빌드 타임에 누락된 환경 변수가 있으면 즉시 실패
 */
function getEnvVar(key: string, required = true): string {
  const value = process.env[key]
  
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value || ''
}

/**
 * 타입 안전한 환경 변수 객체
 */
export const env = {
  // Supabase
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  
  // Google OAuth (선택적)
  google: {
    clientId: getEnvVar('GOOGLE_CLIENT_ID', false),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', false),
  },
  
  // App 설정
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL'),
  },
  
  // Admin 설정
  admin: {
    email: getEnvVar('NEXT_PUBLIC_ADMIN_EMAIL'),
  },
  
  // 환경
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

/**
 * 초기화 시 환경 변수 검증
 * 서버/클라이언트 모두에서 실행
 */
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_ADMIN_EMAIL',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env.local file.'
    )
  }
}

// 개발 환경에서 즉시 검증
if (process.env.NODE_ENV === 'development') {
  validateEnv()
}
