// test-cloudinary-config.js
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

console.log("=== Cloudinary Configuration Test ===\n");

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  console.log(`✅ Found .env.local at: ${envPath}`);
  config({ path: envPath });
} else {
  console.log(`⚠️  .env.local not found, checking .env`);
  const fallbackPath = resolve(process.cwd(), '.env');
  if (existsSync(fallbackPath)) {
    config({ path: fallbackPath });
    console.log(`✅ Loaded .env from: ${fallbackPath}`);
  } else {
    console.log(`❌ No environment file found at ${envPath} or ${fallbackPath}`);
  }
}

// Check environment variables
console.log("\n=== Environment Variables Check ===");
const hasCloudinaryUrl = !!process.env.CLOUDINARY_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

console.log(`CLOUDINARY_URL: ${hasCloudinaryUrl ? '✅ Set' : '❌ Not set'}`);
console.log(`CLOUDINARY_CLOUD_NAME: ${cloudName || '❌ Not set'}`);
console.log(`CLOUDINARY_API_KEY: ${apiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`CLOUDINARY_API_SECRET: ${hasApiSecret ? '✅ Set' : '❌ Not set'}`);

// Test Cloudinary configuration
console.log("\n=== Testing Cloudinary Setup ===");
try {
  const cloudinaryModule = await import('./libs/cloudinary.js');
  const cloudinary = cloudinaryModule.default;
  
  const cfg = cloudinary.config();
  
  console.log(`Cloud Name: ${cfg.cloud_name || '❌ undefined'}`);
  console.log(`API Key: ${cfg.api_key ? '✅ Set' : '❌ Not set'}`);
  console.log(`API Secret: ${cfg.api_secret ? '✅ Set' : '❌ Not set'}`);
  
  if (cfg.cloud_name && cfg.api_key && cfg.api_secret) {
    console.log("\n🎉 SUCCESS: Cloudinary is properly configured!");
    
    // Optional: Test upload capability
    console.log("\n=== Testing Upload Capability ===");
    try {
      const uploadTest = await cloudinary.uploader.upload(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiPk9LPC90ZXh0Pjwvc3ZnPg==',
        {
          folder: 'test_uploads',
          public_id: `test_${Date.now()}`,
          overwrite: true
        }
      );
      
      console.log(`✅ Upload successful!`);
      console.log(`   URL: ${uploadTest.secure_url}`);
      console.log(`   Public ID: ${uploadTest.public_id}`);
      
      // Clean up
      await cloudinary.uploader.destroy(uploadTest.public_id);
      console.log(`✅ Test file cleaned up`);
      
    } catch (uploadError) {
      console.log(`⚠️  Upload test failed (but config is OK): ${uploadError.message}`);
    }
  } else {
    console.log("\n❌ FAILURE: Cloudinary configuration incomplete");
  }
  
} catch (error) {
  console.log(`❌ ERROR loading Cloudinary: ${error.message}`);
}

console.log("\n=== Test Complete ===");