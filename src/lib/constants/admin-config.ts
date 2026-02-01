// src/lib/constants/admin-config.ts
// Admin 페이지 통합 설정

// ============================================
// 아이콘 경로
// ============================================
export const ADMIN_ICONS = {
  kits: '/icons/admin/box.svg',
  series: '/icons/admin/tv.svg',
  mobileSuits: '/icons/admin/robot.svg',
  pilots: '/icons/admin/user.svg',
  factions: '/icons/admin/flag.svg',
  companies: '/icons/admin/factory.svg',
} as const

// ============================================
// 공통 스타일 정의
// ============================================
export const ADMIN_STYLES = {
  // 입력 필드 스타일
  input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0 text-gray-900 bg-white',
  // 라벨 스타일
  label: 'block text-sm font-medium text-gray-700 mb-2',
  // 필수 표시
  required: 'text-red-500 ml-1',
  // 섹션 타이틀
  sectionTitle: 'text-xl font-semibold text-gray-900 mb-4',
  // 폼 카드
  formCard: 'bg-white rounded-xl shadow p-8',
  // 필터 카드
  filterCard: 'bg-white rounded-xl shadow p-6 mb-6',
  // 테이블 카드
  tableCard: 'bg-white rounded-xl shadow overflow-hidden',
  // 테이블 헤더 셀
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  // 테이블 바디 셀
  tableCell: 'px-6 py-4 whitespace-nowrap',
  // 코드 뱃지
  codeBadge: 'font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded',
  // 메인 컨테이너
  mainContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  // 폼 컨테이너
  formContainer: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
} as const

// ============================================
// 색상 설정
// ============================================
export const ADMIN_COLORS = {
  kits: {
    primary: 'blue',
    text: 'text-blue-600',
    textHover: 'hover:text-blue-800',
    bg: 'bg-blue-100',
    bgSolid: 'bg-blue-600',
    bgSolidHover: 'hover:bg-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-600',
    spinner: 'border-blue-600',
  },
  series: {
    primary: 'purple',
    text: 'text-purple-600',
    textHover: 'hover:text-purple-800',
    bg: 'bg-purple-100',
    bgSolid: 'bg-purple-600',
    bgSolidHover: 'hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    border: 'border-purple-600',
    spinner: 'border-purple-600',
  },
  mobileSuits: {
    primary: 'orange',
    text: 'text-orange-600',
    textHover: 'hover:text-orange-800',
    bg: 'bg-orange-100',
    bgSolid: 'bg-orange-600',
    bgSolidHover: 'hover:bg-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    border: 'border-orange-600',
    spinner: 'border-orange-600',
  },
  pilots: {
    primary: 'green',
    text: 'text-green-600',
    textHover: 'hover:text-green-800',
    bg: 'bg-green-100',
    bgSolid: 'bg-green-600',
    bgSolidHover: 'hover:bg-green-700',
    badge: 'bg-green-100 text-green-800',
    border: 'border-green-600',
    spinner: 'border-green-600',
  },
  factions: {
    primary: 'red',
    text: 'text-red-600',
    textHover: 'hover:text-red-800',
    bg: 'bg-red-100',
    bgSolid: 'bg-red-600',
    bgSolidHover: 'hover:bg-red-700',
    badge: 'bg-red-100 text-red-800',
    border: 'border-red-600',
    spinner: 'border-red-600',
  },
  companies: {
    primary: 'indigo',
    text: 'text-indigo-600',
    textHover: 'hover:text-indigo-800',
    bg: 'bg-indigo-100',
    bgSolid: 'bg-indigo-600',
    bgSolidHover: 'hover:bg-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800',
    border: 'border-indigo-600',
    spinner: 'border-indigo-600',
  },
} as const

// ============================================
// 페이지 설정
// ============================================
export const ADMIN_PAGES = {
  kits: {
    key: 'kits',
    title: '킷 관리',
    titleSingle: '킷',
    icon: ADMIN_ICONS.kits,
    color: ADMIN_COLORS.kits,
    basePath: '/admin/kits',
    tableName: 'gundam_kits',
    searchPlaceholder: '킷 이름 검색...',
    searchFields: ['name_ko', 'name_en'],
    itemUnit: '개',
  },
  series: {
    key: 'series',
    title: '시리즈 관리',
    titleSingle: '시리즈',
    icon: ADMIN_ICONS.series,
    color: ADMIN_COLORS.series,
    basePath: '/admin/series',
    tableName: 'series',
    searchPlaceholder: '시리즈 이름 검색...',
    searchFields: ['name_ko', 'name_en', 'name_ja'],
    itemUnit: '개',
  },
  mobileSuits: {
    key: 'mobileSuits',
    title: '모빌슈트 관리',
    titleSingle: '모빌슈트',
    icon: ADMIN_ICONS.mobileSuits,
    color: ADMIN_COLORS.mobileSuits,
    basePath: '/admin/mobile-suits',
    tableName: 'mobile_suits',
    searchPlaceholder: '모빌슈트 이름 또는 형식번호 검색...',
    searchFields: ['name_ko', 'name_en', 'model_number'],
    itemUnit: '기',
  },
  pilots: {
    key: 'pilots',
    title: '파일럿 관리',
    titleSingle: '파일럿',
    icon: ADMIN_ICONS.pilots,
    color: ADMIN_COLORS.pilots,
    basePath: '/admin/pilots',
    tableName: 'pilots',
    searchPlaceholder: '파일럿 이름 검색...',
    searchFields: ['name_ko', 'name_en'],
    itemUnit: '명',
  },
  factions: {
    key: 'factions',
    title: '진영 관리',
    titleSingle: '진영',
    icon: ADMIN_ICONS.factions,
    color: ADMIN_COLORS.factions,
    basePath: '/admin/factions',
    tableName: 'factions',
    searchPlaceholder: '진영 이름 검색...',
    searchFields: ['name_ko', 'name_en', 'code'],
    itemUnit: '개',
  },
  companies: {
    key: 'companies',
    title: '제조사 관리',
    titleSingle: '제조사',
    icon: ADMIN_ICONS.companies,
    color: ADMIN_COLORS.companies,
    basePath: '/admin/companies',
    tableName: 'companies',
    searchPlaceholder: '제조사 이름 검색...',
    searchFields: ['name_ko', 'name_en', 'code'],
    itemUnit: '개',
  },
} as const

// ============================================
// 공통 상수
// ============================================
export const UNIVERSES = [
  { code: 'UC', name: 'UC (Universal Century)' },
  { code: 'CE', name: 'CE (Cosmic Era)' },
  { code: 'AD', name: 'AD (Anno Domini)' },
  { code: 'AC', name: 'AC (After Colony)' },
  { code: 'FC', name: 'FC (Future Century)' },
  { code: 'AG', name: 'AG (Advanced Generation)' },
  { code: 'PD', name: 'PD (Post Disaster)' },
  { code: 'AS', name: 'AS (Ad Stella)' },
  { code: 'BD', name: 'BD (Build)' },
  { code: 'BUILD', name: 'BUILD' },
  { code: 'OTHER', name: '기타' },
] as const

export const COMPANY_TYPES = [
  { code: 'manufacturer', name: '제조사' },
  { code: 'research', name: '연구기관' },
  { code: 'conglomerate', name: '복합기업' },
  { code: 'military_org', name: '군사조직' },
] as const

export const PILOT_ROLES = [
  { code: 'protagonist', name: '주인공' },
  { code: 'antagonist', name: '적대자' },
  { code: 'supporting', name: '조연' },
  { code: 'other', name: '기타' },
] as const

// 진영별 색상 (모빌슈트/파일럿 뱃지용)
export const FACTION_BADGE_COLORS: Record<string, string> = {
  'EFSF': 'bg-blue-500/20 text-blue-800',
  'ZEON': 'bg-red-500/20 text-red-800',
  'TITANS': 'bg-indigo-500/20 text-indigo-800',
  'AEUG': 'bg-green-500/20 text-green-800',
  'NEO_ZEON': 'bg-orange-500/20 text-orange-800',
  'PLANT': 'bg-green-500/20 text-green-800',
  'CB': 'bg-purple-500/20 text-purple-800',
  'DEFAULT': 'bg-gray-500/20 text-gray-800',
}

// ============================================
// 타입 정의
// ============================================
export type AdminPageKey = keyof typeof ADMIN_PAGES
export type AdminColorKey = keyof typeof ADMIN_COLORS
