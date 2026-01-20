// lib/supabase.js - FINAL WORKING VERSION
import { createClient } from '@supabase/supabase-js'

// Clean environment variables (remove quotes)
const cleanEnv = (value) => {
  if (!value) return ''
  return value.toString().replace(/^["']|["']$/g, '').trim()
}

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Create client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

export { supabase }