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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          subject_id: string
          user_id: string
          exam_name: string
          exam_date: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          user_id: string
          exam_name: string
          exam_date: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          user_id?: string
          exam_name?: string
          exam_date?: string
          description?: string | null
          created_at?: string
        }
      }
      study_materials: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          file_name: string
          file_path: string
          file_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          uploaded_at?: string
        }
      }
      generated_content: {
        Row: {
          id: string
          user_id: string
          material_id: string
          content_type: 'summary' | 'flashcard' | 'quiz'
          content: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          material_id: string
          content_type: 'summary' | 'flashcard' | 'quiz'
          content: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          material_id?: string
          content_type?: 'summary' | 'flashcard' | 'quiz'
          content?: Json
          created_at?: string
        }
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          start_date: string
          end_date: string
          plan_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          start_date: string
          end_date: string
          plan_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          start_date?: string
          end_date?: string
          plan_data?: Json
          created_at?: string
        }
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
