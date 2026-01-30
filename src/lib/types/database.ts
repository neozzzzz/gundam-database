// src/lib/types/database.ts
// Supabase 데이터베이스 타입 정의 (DB 구조와 정확히 일치하도록 수정됨)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      timelines: {
        Row: {
          id: string
          code: string
          name_ko: string
          name_en: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['timelines']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['timelines']['Insert']>
      }
      series: {
        Row: {
          id: string
          timeline_id: string | null
          name_ko: string
          name_en: string | null
          name_ja: string | null
          year_start: number | null
          year_end: number | null
          media_type: string | null  // ✅ V1.5: 형태 (TV, OVA, 극장판 등)
          additional_info: string | null  // ✅ V1.5: 추가 정보 및 특징
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['series']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['series']['Insert']>
      }
      grades: {
        Row: {
          id: string
          code: string | null
          name: string | null
          scale: string | null
          difficulty: number | null
          description: string | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['grades']['Insert']>
      }
      brands: {
        Row: {
          id: string
          grade_id: string  // NOT NULL
          timeline_id: string | null
          code: string  // NOT NULL
          name_ko: string  // NOT NULL
          name_en: string | null
          scale: string | null
          year_started: number | null
          box_color: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['brands']['Insert']>
      }
      mobile_suits: {
        Row: {
          id: string
          series_id: string | null
          model_number: string | null
          name_ko: string
          name_en: string | null
          name_ja: string | null
          pilot: string | null
          faction: string | null  // ✅ V1.2: 진영 (EF, ZEON, PLANT 등)
          organization: string | null  // ✅ V1.2: 조직 (EFSF, Neo Zeon 등)
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mobile_suits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mobile_suits']['Insert']>
      }
      gundam_kits: {
        Row: {
          id: string
          grade_id: string | null
          series_id: string | null
          mobile_suit_id: string | null
          brand_id: string | null
          product_code: string | null
          lineup_number: string | null
          name_ko: string | null
          name_en: string | null
          name_ja: string | null
          price_jpy: number | null
          price_krw: number | null
          release_date: string | null  // date type
          release_type: string | null
          is_pbandai: boolean | null
          scale: string | null
          height_mm: number | null
          runner_count: number | null
          parts_count: number | null
          description: string | null
          features: string[] | null  // ARRAY type
          accessories: string[] | null  // ARRAY type
          status: string | null
          view_count: number | null
          like_count: number | null
          created_at: string | null
          updated_at: string | null
          model_number: string | null  // ✅ 추가됨
          series: string | null  // ✅ 추가됨 (시리즈 텍스트)
          kit_code: string | null  // ✅ 추가됨
          deleted_at: string | null  // ✅ V1.3: Soft Delete
          jan_code: string | null  // ✅ V1.3: JAN 바코드
          box_art_url: string | null  // ✅ V1.3: 박스아트 URL
          specifications: Json | null  // ✅ V1.3: 상세 사양 (jsonb)
        }
        Insert: Omit<Database['public']['Tables']['gundam_kits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gundam_kits']['Insert']>
      }
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
      limited_types: {
        Row: {
          id: string
          code: string
          name_ko: string
          name_en: string | null
          description: string | null
          purchase_info: string | null
          badge_color: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['limited_types']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['limited_types']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
