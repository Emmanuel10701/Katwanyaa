// libs/cloudinary.js - FIXED VERSION
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

console.log("=== Loading Environment Variables ===");

// Load from .env or .env.local
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  dotenv.config({ path: resolve(process.cwd(), '.env') });
} else {
  dotenv.config({ path: envPath });
}

console.log("\n=== Cloudinary Configuration ===");

// Parse CLOUDINARY_URL if present
if (process.env.CLOUDINARY_URL) {
  console.log("Found CLOUDINARY_URL");
  
  // Parse the URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const url = process.env.CLOUDINARY_URL;
  console.log("URL:", url);
  
  // Extract parts from the URL
  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@([^\/]+)/);
  
  if (match) {
    const [, apiKey, apiSecret, cloudName] = match;
    console.log("Parsed from URL:");
    console.log("  Cloud Name:", cloudName);
    console.log("  API Key:", apiKey ? "✓" : "✗");
    console.log("  API Secret:", apiSecret ? "✓" : "✗");
    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log("✅ Configured from parsed URL");
  } else {
    console.error("❌ Could not parse CLOUDINARY_URL");
    console.error("URL format should be: cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
  }
} else {
  // Fallback to individual variables
  console.log("Using individual environment variables");
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 
                   process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || 
                 process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("Cloud Name:", cloudName || "Not set");
  console.log("API Key:", apiKey ? "Set" : "Not set");
  console.log("API Secret:", apiSecret ? "Set" : "Not set");

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log("✅ Configured from individual variables");
  } else {
    console.error("❌ Missing Cloudinary configuration");
  }
}

// Verify configuration
const config = cloudinary.config();
console.log("\n=== Verification ===");
console.log("Cloud Name:", config.cloud_name || "undefined");
console.log("API Key:", config.api_key ? "✓ Set" : "✗ Not set");
console.log("API Secret:", config.api_secret ? "✓ Set" : "✗ Not set");

if (config.cloud_name && config.api_key) {
  console.log("\n✅ SUCCESS: Cloudinary is properly configured!");
} else {
  console.log("\n❌ FAILURE: Cloudinary configuration failed!");
}

export default cloudinary;