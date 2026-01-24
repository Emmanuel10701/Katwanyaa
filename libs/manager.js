// libs/superbase.js - UPDATED FOR YOUR DOMAIN
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-client-info': 'katwanyaa-vercel-app'
    }
  }
});

const BUCKET_NAME = 'Katwanyaa High';

export class FileManager {
  /**
   * Upload with CORS-friendly settings for your domain
   */
  static async uploadFile(file, folder = 'uploads') {
    if (!file || file.size === 0) return null;

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${folder}/${timestamp}-${sanitizedName}`;

      console.log(`📤 Uploading from katwanyaa.vercel.app:`, fileName);

      // CRITICAL: Force correct MIME types for your files
      let contentType = file.type;
      
      if (!contentType || contentType === '') {
        const extension = file.name.split('.').pop().toLowerCase();
        const mimeTypes = {
          // Videos
          'mp4': 'video/mp4',
          'mov': 'video/quicktime',
          'avi': 'video/x-msvideo',
          'mkv': 'video/x-matroska',
          'webm': 'video/webm',
          // Audio
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'ogg': 'audio/ogg',
          'm4a': 'audio/mp4',
          // Images
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          // Documents
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'ppt': 'application/vnd.ms-powerpoint',
          'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };
        contentType = mimeTypes[extension] || 'application/octet-stream';
      }

      // Browser-specific upload (for katwanyaa.vercel.app)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase upload error for katwanyaa.vercel.app:', error);
        
        // Special handling for CORS errors
        if (error.message.includes('CORS') || error.message.includes('origin')) {
          throw new Error(
            'CORS Error: Please check Supabase Storage CORS settings. ' +
            'Add "https://katwanyaa.vercel.app" to allowed origins.'
          );
        }
        
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get URL that works with your domain
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // Test if URL is accessible from your domain
      const testUrl = await this.testUrlAccessibility(publicUrl);
      
      if (!testUrl.accessible) {
        console.warn('⚠️ File uploaded but may not be accessible:', testUrl.error);
      }

      console.log('✅ Upload successful for katwanyaa.vercel.app:', {
        fileName,
        type: contentType,
        url: publicUrl,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      return {
        url: publicUrl,
        key: data.path,
        fileName: file.name,
        fileType: contentType,
        fileSize: file.size,
        storageType: 'supabase',
        accessible: testUrl.accessible
      };
    } catch (error) {
      console.error('Upload error for katwanyaa.vercel.app:', error);
      throw error;
    }
  }

  /**
   * Test if URL is accessible from your domain
   */
  static async testUrlAccessibility(url) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        headers: {
          'Origin': 'https://katwanyaa.vercel.app'
        }
      });
      
      return {
        accessible: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        url: url
      };
    }
  }

  /**
   * Get streaming-friendly URL (for video/audio playback)
   */
  static getStreamingUrl(fileUrl) {
    if (!fileUrl) return null;
    
    // Remove any existing query parameters
    const cleanUrl = fileUrl.split('?')[0];
    
    // Add cache busting and streaming headers
    return `${cleanUrl}?t=${Date.now()}`;
  }

  /**
   * Check if file is playable in browser
   */
  static async checkMediaPlayability(fileUrl) {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      const isPlayable = {
        video: ['video/mp4', 'video/webm', 'video/ogg'].some(type => 
          contentType?.includes(type)
        ),
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'].some(type => 
          contentType?.includes(type)
        ),
        image: contentType?.startsWith('image/')
      };
      
      return {
        playable: isPlayable.video || isPlayable.audio,
        type: contentType,
        supports: isPlayable
      };
    } catch (error) {
      return {
        playable: false,
        error: error.message
      };
    }
  }
}