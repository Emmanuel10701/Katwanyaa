// lib/supabase.js - FIXED VERSION
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✅ Add validation and logging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ Supabase client initializing...');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
console.log('✅ Supabase client created successfully');

export { supabase }