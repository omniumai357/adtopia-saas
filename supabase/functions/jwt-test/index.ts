import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    // Test 1: Check if secrets are present
    const secretsPresent = {
      SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
      SUPABASE_ANON_KEY: !!supabaseAnonKey,
    }

    // Test 2: Try to create Supabase client
    let clientTest = { status: 'not_tested', error: null }
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        clientTest = { status: 'success', error: null }
      } catch (error) {
        clientTest = { status: 'error', error: error.message }
      }
    }

    // Test 3: Try to validate JWT token if provided
    let jwtTest = { status: 'not_tested', error: null, user: null }
    const authHeader = req.headers.get('Authorization')
    if (authHeader && supabaseUrl && supabaseServiceKey) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error) {
          jwtTest = { status: 'error', error: error.message, user: null }
        } else if (user) {
          jwtTest = { status: 'success', error: null, user: { id: user.id, email: user.email } }
        } else {
          jwtTest = { status: 'no_user', error: 'No user found', user: null }
        }
      } catch (error) {
        jwtTest = { status: 'error', error: error.message, user: null }
      }
    }

    const testReport = {
      timestamp: new Date().toISOString(),
      secrets_present: secretsPresent,
      client_test: clientTest,
      jwt_test: jwtTest,
      status: clientTest.status === 'success' ? 'operational' : 'error'
    }

    return new Response(
      JSON.stringify(testReport, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: clientTest.status === 'success' ? 200 : 500,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'JWT test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
