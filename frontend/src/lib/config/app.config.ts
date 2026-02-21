// src/lib/config/app.config.ts
// 애플리케이션 전역 설정

import { env } from './env'

/**
 * 애플리케이션 설정
 * 하드코딩된 값들을 중앙 관리
 */
export const appConfig = {
  // 앱 메타데이터
  name: 'Gundam Database',
  description: '건프라 킷 데이터베이스',
  version: '1.0.0',
  
  // URL
  url: env.app.url,
  
  // Admin
  admin: {
    emails: [env.admin.email], // 배열로 관리하여 다중 관리자 지원 가능
    basePath: '/admin',
    itemsPerPage: 40,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    adminPageSize: 40,
    maxPageSize: 100,
  },
  
  // API
  api: {
    timeout: 10000, // 10초
    retryAttempts: 3,
  },
  
  // Features
  features: {
    enableAnalytics: env.isProduction,
    enableErrorTracking: env.isProduction,
    enableDebugMode: env.isDevelopment,
  },
} as const

/**
 * Admin 권한 체크 헬퍼
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return appConfig.admin.emails.includes(email)
}
