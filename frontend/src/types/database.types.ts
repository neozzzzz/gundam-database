// types/database.types.ts
// Supabase 데이터베이스 타입 정의 (V1.9)
// V1.9: ms_organizations, org_faction_memberships 관계 테이블 추가

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// V1.9 ENUM 타입
// ============================================

// 조직 유형
export type OrgType = 
  | 'MILITARY'      // 군사 조직
  | 'PARAMILITARY'  // 준군사 조직
  | 'CORPORATE'     // 기업
  | 'CIVIL'         // 민간 조직
  | 'OTHER'         // 기타

// MS-조직 관계 유형
export type MsRelationshipType =
  | 'operated_by'     // 운용
  | 'developed_by'    // 개발
  | 'manufactured_by' // 제조
  | 'supplied_by'     // 공급
  | 'captured_by'     // 노획
  | 'modified_by'     // 개수

// 킷 관계 유형
export type RelationType =
  | 'variant'
  | 'recolor'
  | 'upgrade'
  | 'remake'
  | 'related'
  | 'same_mobile_suit'
  | 'recommended'
  | 'same_series'

// ============================================
// V1.9 테이블 인터페이스
// ============================================

// 타임라인 (UC, CE, AD 등)
export interface Timeline {
  id: string
  code: string
  name_ko: string
  name_en: string | null
  name_ja: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 진영 (정치적 편)
export interface Faction {
  id: string
  code: string
  name_ko: string
  name_en: string | null
  name_ja: string | null
  universe: string | null
  color: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 조직 (실행 주체)
export interface Organization {
  id: string
  code: string
  name_ko: string
  name_en: string | null
  name_ja: string | null
  org_type: OrgType
  universe: string | null
  parent_id: string | null
  color: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 조직-진영 소속 관계
export interface OrgFactionMembership {
  id: string
  organization_id: string
  faction_id: string
  timeline_id: string | null
  year_start: number | null
  year_end: number | null
  is_primary: boolean
  notes: string | null
  created_at: string
}

// MS-조직 관계
export interface MsOrganization {
  id: string
  mobile_suit_id: string
  organization_id: string
  relationship_type: MsRelationshipType
  timeline_id: string | null
  year_start: number | null
  year_end: number | null
  is_primary: boolean
  notes: string | null
  sort_order: number
  created_at: string
}

// 파일럿
export interface Pilot {
  id: string
  code: string | null
  name_ko: string
  name_en: string | null
  name_ja: string | null
  role: 'protagonist' | 'antagonist' | 'supporting' | 'other' | null
  rank: string | null
  nationality: string | null
  birth_date: string | null
  death_date: string | null
  blood_type: string | null
  height: number | null
  weight: number | null
  image_url: string | null
  bio: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// MS-파일럿 관계
export interface MobileSuitPilot {
  id: string
  ms_id: string
  pilot_id: string
  is_primary: boolean
  notes: string | null
  created_at: string
}

// 모빌슈트
export interface MobileSuit {
  id: string
  code: string | null
  name_ko: string
  name_en: string | null
  name_ja: string | null
  model_number: string | null
  series_id: string | null
  height: string | null
  weight: string | null
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// 시리즈
export interface Series {
  id: string
  code: string | null
  name_ko: string
  name_en: string | null
  name_ja: string | null
  timeline_id: string | null
  year_start: number | null
  year_end: number | null
  media_type: string | null
  description: string | null
  additional_info: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// 등급
export interface Grade {
  id: string
  code: string
  name_ko: string | null
  name_en: string | null
  scale: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 브랜드
export interface Brand {
  id: string
  code: string
  name_ko: string
  name_en: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// 한정 유형
export interface LimitedType {
  id: string
  code: string
  name_ko: string
  name_en: string | null
  badge_color: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 건담 킷
export interface GundamKit {
  id: string
  name_ko: string
  name_en: string | null
  name_ja: string | null
  grade_id: string | null
  series_id: string | null
  brand_id: string | null
  mobile_suit_id: string | null
  limited_type_id: string | null
  scale: string | null
  jan_code: string | null
  bandai_product_code: string | null
  release_date: string | null
  msrp_price: number | null
  price_krw: number | null
  box_art_url: string | null
  description: string | null
  is_pbandai: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// 킷 이미지
export interface KitImage {
  id: string
  kit_id: string
  image_url: string
  image_type: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

// 킷 관계
export interface KitRelation {
  id: string
  kit_id: string
  related_kit_id: string
  relation_type: RelationType
  created_at: string
}

// ============================================
// V1.9 조인된 타입 (킷 상세용)
// ============================================

// 조직 + 진영 정보
export interface OrganizationWithFaction extends Organization {
  faction?: Faction | null
}

// MS-조직 관계 + 조직/진영 정보
export interface MsOrganizationWithDetails extends MsOrganization {
  organization: OrganizationWithFaction
}

// 모빌슈트 + 모든 관계 정보 (V1.9)
export interface MobileSuitWithRelations extends MobileSuit {
  // V1.9: ms_organizations를 통한 조직 관계들
  ms_organizations?: MsOrganizationWithDetails[]
  // 파일럿 정보
  pilot?: Pilot | null
  // 레거시 호환
  factions?: Faction | null
  company?: Organization | null
  manufacturer?: Organization | null
  operator?: Organization | null
}

// 킷 상세 정보 (전체 JOIN)
export interface KitWithDetails extends GundamKit {
  grades: Grade | null
  series: (Series & { timeline?: Timeline | null }) | null
  brand: Brand | null
  limited_type: LimitedType | null
  mobile_suits: MobileSuitWithRelations | null
  kit_images: KitImage[]
  related_kits: (GundamKit & {
    grade?: Grade | null
    series?: Series | null
    relation_type?: RelationType
  })[]
}

// ============================================
// 헬퍼 상수
// ============================================

// 관계 유형 한글명
export const RELATIONSHIP_TYPE_NAMES: Record<MsRelationshipType, string> = {
  operated_by: '운용',
  developed_by: '개발',
  manufactured_by: '제조',
  supplied_by: '공급',
  captured_by: '노획',
  modified_by: '개수'
}

// 관계 유형 아이콘
export const RELATIONSHIP_TYPE_ICONS: Record<MsRelationshipType, string> = {
  operated_by: '📍',
  developed_by: '🔬',
  manufactured_by: '🏭',
  supplied_by: '📦',
  captured_by: '⚔️',
  modified_by: '🔧'
}

// 조직 유형 한글명
export const ORG_TYPE_NAMES: Record<OrgType, string> = {
  MILITARY: '군사 조직',
  PARAMILITARY: '준군사 조직',
  CORPORATE: '기업',
  CIVIL: '민간 조직',
  OTHER: '기타'
}
