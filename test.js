// test-supabase-node.js - CREATE THIS FILE
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Configuration (Node.js)...\n');

// Get environment variables
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Clean values (remove quotes)
const cleanValue = (value) => {
  if (!value) return '';
  return value.replace(/^["']|["']$/g, '').trim();
};

supabaseUrl = cleanValue(supabaseUrl);
supabaseKey = cleanValue(supabaseKey);

console.log('1. Environment Variables:');
console.log('   URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ MISSING');
console.log('   Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Missing Supabase credentials!');
  console.error('\nCheck your .env.local file:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://pkzsthlhoqwelzbxjyum.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

// Create client
console.log('\n2. Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
  try {
    console.log('\n3. Testing Supabase connection...');
    
    // Test 1: List buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Bucket list failed:', bucketError.message);
      return false;
    }
    
    console.log('✅ Connected to Supabase!');
    console.log('   Available buckets:', buckets.map(b => b.name));
    
    const targetBucket = 'Katwanyaa High';
    const hasBucket = buckets.some(b => b.name === targetBucket);
    
    console.log(`   Has "${targetBucket}" bucket:`, hasBucket ? '✅ Yes' : '❌ No');
    
    // Test 2: Try to upload a test file
    console.log('\n4. Testing file upload...');
    const testBuffer = Buffer.from('Test file content from Node.js');
    const testFileName = `test-uploads/node-test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(testFileName, testBuffer, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      
      // Check if it's an RLS error
      if (uploadError.message.includes('row-level security')) {
        console.log('\n💡 RLS Policy Issue Detected!');
        console.log('Run this SQL in Supabase SQL Editor:');
        console.log(`
          CREATE POLICY "Allow public uploads" 
          ON storage.objects 
          FOR INSERT 
          TO public 
          WITH CHECK (bucket_id = 'Katwanyaa High');
        `);
      }
      
      return false;
    }
    
    console.log('✅ Upload successful!');
    console.log('   File path:', uploadData.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(testFileName);
    
    console.log('   Public URL:', publicUrl);
    
    // Test 3: List files in bucket
    console.log('\n5. Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from(targetBucket)
      .list('test-uploads');
    
    if (listError) {
      console.log('❌ File list failed:', listError.message);
    } else {
      console.log('✅ Files in test-uploads/:', files?.length || 0);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Stack:', error.stack);
    return false;
  }
}

// Run tests
testConnection().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 SUCCESS: Supabase is configured correctly!');
    console.log('Your file uploads should work now.');
  } else {
    console.log('❌ FAILURE: Supabase configuration has issues.');
    console.log('Check:');
    console.log('1. Environment variables in .env.local');
    console.log('2. RLS policies in Supabase dashboard');
    console.log('3. Bucket name matches exactly: Katwanyaa High');
  }
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
});