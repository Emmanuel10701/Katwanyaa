// utils/supabaseStorage.js
export function getSupabasePublicUrl(bucketName, filePath) {
  // Properly encode all parts of the URL
  const encodedBucketName = encodeURIComponent(bucketName);
  const encodedFilePath = encodeURIComponent(filePath);
  
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${encodedBucketName}/${encodedFilePath}`;
}

// Use it in your FileManager:
const publicUrl = getSupabasePublicUrl(this.bucketName, data.path);