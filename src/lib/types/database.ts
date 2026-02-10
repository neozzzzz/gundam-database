// src/lib/types/database.ts
// Supabase 데이터베이스 타입 정의 (V1.10 - ID 체계 변경: UUID → VARCHAR code)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// ENUM 타입 정의
// ============================================
export type OrgType = 'MILITARY' | 'PARAMILITARY' | 'CORPORATE' | 'CIVIL' | 'OTHER'
export type MsRelationshipType = 'operated_by' | 'developed_by' | 'manufactured_by' | 'supplied_by' | 'captured_by' | 'owned_by'

export interface Database {
  public: {
    Tables: {
      // ============================================
      // timelines (V1.10: id = code, VARCHAR)
      // ============================================
      timelines: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'UC', 'CE', 'AD')
          name_ko: string
          name_en: string | null
          name_ja: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['timelines']['Row'], 'created_at' | 'updated_at'> & { 
          id: string  // 필수 - 직접 입력
        }
        Update: Partial<Database['public']['Tables']['timelines']['Insert']>
      }
      // ============================================
      // series (V1.10: id = code, VARCHAR)
      // ============================================
      series: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'UC-0079', 'SEED')
          timeline_id: string | null  // timelines.id 참조
          name_ko: string
          name_en: string | null
          name_ja: string | null
          year_start: number | null
          year_end: number | null
          media_type: string | null
          additional_info: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['series']['Row'], 'created_at' | 'updated_at'> & {
          id: string  // 필수 - 직접 입력
        }
        Update: Partial<Database['public']['Tables']['series']['Insert']>
      }
      // ============================================
      // grades (V1.10: id = code, VARCHAR)
      // ============================================
      grades: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'HG', 'MG', 'PG')
          name_ko: string | null
          name_en: string | null
          name_ja: string | null
          scale: string | null
          difficulty: number | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'created_at' | 'updated_at'> & {
          id: string  // 필수 - 직접 입력
        }
        Update: Partial<Database['public']['Tables']['grades']['Insert']>
      }
      // ============================================
      // limited_types (V1.10: id = code, VARCHAR)
      // ============================================
      limited_types: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'PBANDAI', 'EVENT')
          name_ko: string
          name_en: string | null
          name_ja: string | null
          description: string | null
          purchase_info: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['limited_types']['Row'], 'created_at' | 'updated_at'> & {
          id: string  // 필수 - 직접 입력
        }
        Update: Partial<Database['public']['Tables']['limited_types']['Insert']>
      }
      // ============================================
      // factions (V1.10: id = code, VARCHAR)
      // ============================================
      factions: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'EFF', 'ZEON')
          name_ko: string
          name_en: string | null
          name_ja: string | null
          universe: string | null  // timelines.id 참조 가능
          color: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['factions']['Row'], 'created_at' | 'updated_at'> & {
          id: string  // 필수 - 직접 입력
        }
        Update: Partial<Database['public']['Tables']['factions']['Insert']>
      }
      // ============================================
      // organizations (V1.10: id = code, VARCHAR)
      // ============================================
      organizations: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'AE', 'SNRI')
          name_ko: string
          name_en: string | null
          name_ja: string | null
          org_type: OrgType
          universe: string | null  // timelines.id 참조 가능
          parent_id: string | null  // organizations.id 자기참조
          color: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'created_at' | 'updated_at'> & {
          id: string  // 필수 - 직접 입력
        }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      // ============================================
      // pilots (V1.10: id = code, VARCHAR)
      // ============================================
      pilots: {
        Row: {
          id: string              // VARCHAR(50) - code가 곧 id (예: 'AMURO-RAY', 'CHAR')
          name_ko: string
          name_en: string | null
          name_ja: string | null
          aliases: string | null
          series_first_id: string | null  // series.id 참조
          affiliation_default_id: string | null  // factions.id 참조
          faction_id: string | null  // factions.id 참조
          rank: string | null
          role: string | null
          tags: string | null
          bio: string | null
          birth_date: string | null
          death_date: string | null
          nationality: string | null
          blood_type: string | null
          height: number | null
          weight: number | null
          description: string | null
          universe: string | null
          image_url: string | null
          thumbnail_url: string | null
          source_ref: string | null
          is_active: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pilots']['Row'], 'created_at' | 'updated_at' | 'view_count'> & {
          id: string  // 필수 - 직접 입력
          view_count?: number
        }
        Update: Partial<Database['public']['Tables']['pilots']['Insert']>
      }
      // ============================================
      // org_faction_memberships (UUID 유지 - 관계 테이블)
      // ============================================
      org_faction_memberships: {
        Row: {
          id: string              // UUID - 자동 생성
          organization_id: string  // organizations.id 참조 (VARCHAR)
          faction_id: string       // factions.id 참조 (VARCHAR)
          timeline_id: string | null  // timelines.id 참조 (VARCHAR)
          year_start: number | null
          year_end: number | null
          is_primary: boolean | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['org_faction_memberships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['org_faction_memberships']['Insert']>
      }
      // ============================================
      // ms_organizations (UUID 유지 - 관계 테이블)
      // ============================================
      ms_organizations: {
        Row: {
          id: string              // UUID - 자동 생성
          mobile_suit_id: string   // mobile_suits.id 참조 (UUID)
          organization_id: string  // organizations.id 참조 (VARCHAR)
          relationship_type: MsRelationshipType
          timeline_id: string | null  // timelines.id 참조 (VARCHAR)
          year_start: number | null
          year_end: number | null
          is_primary: boolean | null
          notes: string | null
          sort_order: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ms_organizations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ms_organizations']['Insert']>
      }
      // ============================================
      // mobile_suit_pilots (UUID 유지 - 관계 테이블)
      // ============================================
      mobile_suit_pilots: {
        Row: {
          id: string              // UUID - 자동 생성
          ms_id: string           // mobile_suits.id 참조 (UUID)
          pilot_id: string        // pilots.id 참조 (VARCHAR)
          faction_at_time_id: string | null  // factions.id 참조 (VARCHAR)
          is_primary: boolean | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mobile_suit_pilots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mobile_suit_pilots']['Insert']>
      }
      // ============================================
      // mobile_suits (UUID 유지 - 대량 데이터)
      // ============================================
      mobile_suits: {
        Row: {
          id: string              // UUID - 자동 생성
          series_id: string | null  // series.id 참조 (VARCHAR)
          model_number: string | null
          name_ko: string
          name_en: string | null
          name_ja: string | null
          description: string | null
          created_at: string
          updated_at: string
          organization: string | null
          base_model: string | null
          code: string | null
          aliases: string[] | null
          type: string | null
          role: string | null
          generation: number | null
          era: string | null
          manufacturer: string | null
          operator: string | null
          height: number | null
          weight: number | null
          power_output: number | null
          thruster_total: number | null
          first_appearance: string | null
          universe: string | null
          image_url: string | null
          thumbnail_url: string | null
          source_ref: string | null
          is_active: boolean | null
          view_count: number | null
        }
        Insert: Omit<Database['public']['Tables']['mobile_suits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mobile_suits']['Insert']>
      }
      // ============================================
      // gundam_kits (UUID 유지 - 대량 데이터)
      // ============================================
      gundam_kits: {
        Row: {
          id: string              // UUID - 자동 생성
          grade_id: string | null   // grades.id 참조 (VARCHAR)
          series_id: string | null  // series.id 참조 (VARCHAR)
          mobile_suit_id: string | null  // mobile_suits.id 참조 (UUID)
          limited_type_id: string | null  // limited_types.id 참조 (VARCHAR)
          brand_id: string | null
          product_code: string | null
          lineup_number: string | null
          name_ko: string | null
          name_en: string | null
          name_ja: string | null
          price_jpy: number | null
          price_krw: number | null
          release_date: string | null
          release_type: string | null
          is_pbandai: boolean | null
          scale: string | null
          height_mm: number | null
          runner_count: number | null
          parts_count: number | null
          description: string | null
          features: string[] | null
          accessories: string[] | null
          status: string | null
          view_count: number | null
          like_count: number | null
          created_at: string | null
          updated_at: string | null
          model_number: string | null
          series: string | null
          kit_code: string | null
          deleted_at: string | null
          jan_code: string | null
          box_art_url: string | null
          specifications: Json | null
        }
        Insert: Omit<Database['public']['Tables']['gundam_kits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gundam_kits']['Insert']>
      }
      // ============================================
      // kit_images (UUID 유지)
      // ============================================
      kit_images: {
        Row: {
          id: string
          kit_id: string
          image_url: string
          image_type: string | null
          sort_order: number | null
          is_primary: boolean | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['kit_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kit_images']['Insert']>
      }
      // ============================================
      // kit_relations (UUID 유지)
      // ============================================
      kit_relations: {
        Row: {
          id: string
          kit_id: string
          related_kit_id: string
          relation_type: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kit_relations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kit_relations']['Insert']>
      }
      // ============================================
      // purchase_links (UUID 유지)
      // ============================================
      purchase_links: {
        Row: {
          id: string
          kit_id: string
          store_id: string
          url: string
          price: number | null
          currency: string | null
          is_available: boolean | null
          last_checked: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['purchase_links']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['purchase_links']['Insert']>
      }
      // ============================================
      // stores (UUID 유지)
      // ============================================
      stores: {
        Row: {
          id: string
          name: string
          url: string | null
          country: string | null
          logo_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['stores']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['stores']['Insert']>
      }
      // ============================================
      // users (UUID 유지)
      // ============================================
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      // ============================================
      // suggestions (UUID 유지)
      // ============================================
      suggestions: {
        Row: {
          id: string
          kit_id: string | null
          user_id: string
          suggestion_type: string
          current_data: Json | null
          suggested_data: Json
          reason: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['suggestions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['suggestions']['Insert']>
      }
      // ============================================
      // user_activities (UUID 유지)
      // ============================================
      user_activities: {
        Row: {
          id: string
          user_id: string | null
          kit_id: string | null
          activity_type: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_activities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_activities']['Insert']>
      }
    }
    Views: {
      v_kit_details: {
        Row: {
          id: string
          grade_name: string | null
          series_name: string | null
          timeline_id: string | null
          mobile_suit_name: string | null
          ms_model_number: string | null
          limited_type_name: string | null
        }
      }
      active_gundam_kits: {
        Row: {
          id: string
          grade_name: string | null
          series_name: string | null
          mobile_suit_name: string | null
          ms_model_number: string | null
        }
      }
      v_pilot_mobile_suits: {
        Row: {
          pilot_id: string
          pilot_name: string
          pilot_name_en: string | null
          affiliation_default_id: string | null
          faction_name: string | null
          faction_color: string | null
          mobile_suit_id: string | null
          mobile_suit_name: string | null
          model_number: string | null
          is_primary: boolean | null
        }
      }
      v_ms_with_organizations: {
        Row: {
          id: string
          name_ko: string
          name_en: string | null
          name_ja: string | null
          model_number: string | null
          series_id: string | null
          image_url: string | null
          description: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
          manufacturer_id: string | null
          manufacturer_name: string | null
          operator_id: string | null
          operator_name: string | null
          series_name: string | null
          timeline_id: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      org_type_enum: OrgType
      ms_relationship_type: MsRelationshipType
    }
  }
}
