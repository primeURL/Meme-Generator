import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      meme_templates: {
        Row: {
          id: string
          name: string
          image_url: string
          description: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url: string
          description?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string
          description?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      generated_memes: {
        Row: {
          id: string
          prompt: string
          template_id: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt: string
          template_id: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt?: string
          template_id?: string
          image_url?: string
          created_at?: string
        }
      }
    }
  }
}