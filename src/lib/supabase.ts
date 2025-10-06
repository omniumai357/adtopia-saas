// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      purchases: {
        Row: {
          id: string
          email: string
          product: string
          price: number
          stripe_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          product: string
          price: number
          stripe_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          product?: string
          price?: number
          stripe_session_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Typed Supabase client
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey)
