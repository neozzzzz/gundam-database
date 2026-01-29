// types/database.types.ts
// Supabase 데이터베이스 타입 정의 (V1.4)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FactionType = 
  | 'EF'           // 지구연방
  | 'ZEON'         // 지온
  | 'PLANT'        // 플랜트
  | 'CB'           // 솔레스탈 비잉
  | 'OZ'           // OZ
  | 'GJALLARHORN'  // 기갈라혼
  | 'TEKKADAN'     // 철화단
  | 'UNION'        // 유니온
  | 'AEU'          // AEU
  | 'HRL'          // 인혁련
  | 'OTHER'        // 기타

export type RelationType =
  | 'variant'
  | 'recolor'
  | 'upgrade'
  | 'remake'
  | 'related'
  | 'same_mobile_suit'
  | 'recommended'
  | 'same_series'

export interface Database {
  public: {
    Tables: {
      // 조직 (진영 + 조직 통합)
      organizations: {
        Row: {
          id: string
          code: string
          faction: FactionType
          name_ko: string
          name_en: string | null
          name_jp: string | null
          aliases: Json | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      
      // 등급 (HG, MG, RG, PG, SD 등)
      grades: {
        Row: {
          id: string
          name: string
          full_name: string | null
          scale: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['grades']['Insert']>
      }
      
      // 모빌슈트 (기체)
      mobile_suits: {
        Row: {
          id: string
          name: string
          series_id: string | null
          model_number: string | null
          pilot: string | null
          faction: FactionType | null
          organization_id: string | null
          description: string | null
          height: string | null
          weight: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mobile_suits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mobile_suits']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'mobile_suits_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      
      // 건담 킷
      gundam_kits: {
        Row: {
          id: string
          name: string
          grade_id: string | null
          mobile_suit_id: string | null
          jan_code: string | null
          bandai_product_code: string | null
          release_type: string | null
          release_date: string | null
          msrp_price: number | null
          price_krw: number | null
          description: string | null
          box_art_url: string | null
          dalong_url: string | null
          name_norm: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['gundam_kits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gundam_kits']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'gundam_kits_grade_id_fkey'
            columns: ['grade_id']
            referencedRelation: 'grades'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gundam_kits_mobile_suit_id_fkey'
            columns: ['mobile_suit_id']
            referencedRelation: 'mobile_suits'
            referencedColumns: ['id']
          }
        ]
      }
      
      // 킷 관계
      kit_relations: {
        Row: {
          id: string
          kit_id: string
          related_kit_id: string
          relation_type: RelationType
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kit_relations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kit_relations']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'kit_relations_kit_id_fkey'
            columns: ['kit_id']
            referencedRelation: 'gundam_kits'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kit_relations_related_kit_id_fkey'
            columns: ['related_kit_id']
            referencedRelation: 'gundam_kits'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      faction_type: FactionType
      relation_type: RelationType
    }
  }
}

// 헬퍼 타입들
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// 킷 상세 정보 (JOIN된 데이터)
export interface KitWithDetails extends Tables<'gundam_kits'> {
  grades: Tables<'grades'> | null
  mobile_suits: (Tables<'mobile_suits'> & {
    organizations: Tables<'organizations'> | null
  }) | null
}

// 진영 색상 매핑
export const FACTION_COLORS: Record<FactionType, string> = {
  EF: '#3b82f6',           // 파란색 - 지구연방
  ZEON: '#ef4444',         // 빨간색 - 지온
  PLANT: '#10b981',        // 초록색 - 플랜트
  CB: '#8b5cf6',           // 보라색 - 솔레스탈 비잉
  OZ: '#f59e0b',           // 주황색 - OZ
  GJALLARHORN: '#06b6d4',  // 청록색 - 기갈라혼
  TEKKADAN: '#ec4899',     // 핑크색 - 철화단
  UNION: '#3b82f6',        // 파란색 - 유니온
  AEU: '#6366f1',          // 인디고 - AEU
  HRL: '#ef4444',          // 빨간색 - 인혁련
  OTHER: '#64748b'         // 회색 - 기타
}

// 진영 한글명
export const FACTION_NAMES: Record<FactionType, string> = {
  EF: '지구연방',
  ZEON: '지온',
  PLANT: '플랜트',
  CB: '솔레스탈 비잉',
  OZ: 'OZ',
  GJALLARHORN: '기갈라혼',
  TEKKADAN: '철화단',
  UNION: '유니온',
  AEU: 'AEU',
  HRL: '인혁련',
  OTHER: '기타'
}
