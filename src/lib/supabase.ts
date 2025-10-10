// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ CLIENT-SIDE: Use anon key with user sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth-token'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
})

// ✅ SERVER-SIDE: Use service role key (NEVER expose to client)
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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

// Typed Supabase client (client-side only)
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth-token'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
})
