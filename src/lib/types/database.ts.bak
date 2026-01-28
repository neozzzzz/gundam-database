// src/lib/types/database.ts
// Supabase 데이터베이스 타입 정의

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
          code: string
          name: string
          scale: string | null
          difficulty: number | null
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['grades']['Insert']>
      }
      brands: {
        Row: {
          id: string
          grade_id: string | null
          code: string
          name: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
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
          grade_id: string
          brand_id: string
          series_id: string | null
          mobile_suit_id: string | null
          product_code: string | null
          lineup_number: string | null
          name_ko: string
          name_en: string | null
          name_ja: string | null
          price_jpy: number | null
          price_krw: number | null
          release_date: string | null
          release_type: string
          is_pbandai: boolean
          scale: string | null
          height_mm: number | null
          runner_count: number | null
          parts_count: number | null
          description: string | null
          features: string[] | null
          accessories: string[] | null
          status: string
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['gundam_kits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gundam_kits']['Insert']>
      }
      kit_images: {
        Row: {
          id: string
          kit_id: string
          image_url: string
          image_type: string
          sort_order: number
          is_primary: boolean
          created_at: string
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
          is_available: boolean
          last_checked: string
          created_at: string
          updated_at: string
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
          is_active: boolean
          created_at: string
          updated_at: string
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
