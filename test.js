import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load the file named .env
dotenv.config(); 

// Cleaning function to handle the quotes in your file
const clean = (val) => val ? val.replace(/^["']|["']$/g, '').trim() : '';

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

console.log("--- Connection Check ---");
console.log("Checking URL:", supabaseUrl || "NOT FOUND");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Variables not found in .env file.");
  console.log("Current Directory:", process.cwd());
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCheck() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    console.log("✅ SUCCESS: Connected to Supabase!");
    console.log("Buckets found:", data.map(b => b.name));
  } catch (err) {
    console.error("❌ CONNECTION FAILED:", err.message);
  }
}

runCheck();