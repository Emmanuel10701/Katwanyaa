// libs/superbase.js - UPDATED VERSION

import { createClient } from '@supabase/supabase-js';

// --- INITIALIZATION ---
const cleanEnv = (value) => {
  if (!value) return '';
  return value.toString().replace(/^["']|["']$/g, '').trim();
};

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Create client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
});

// --- FILE MANAGER CLASS ---
const BUCKET_NAME = 'Katwanyaa High';

export class FileManager {
  /**
   * Check if running in browser
   */
  static isBrowser() {
    return typeof window !== 'undefined';
  }

  /**
   * Upload file to Supabase - Works in both browser and Node.js
   */
  static async uploadFile(file, folder = 'uploads') {
    if (!file || file.size === 0) return null;

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${folder}/${timestamp}-${sanitizedName}`;

      console.log(`📤 Uploading to [${BUCKET_NAME}]:`, fileName, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);

      let uploadData;
      
      if (this.isBrowser()) {
        // Browser environment - use File/Blob directly
        uploadData = file;
      } else {
        // Node.js environment - convert to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        uploadData = Buffer.from(arrayBuffer);
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, uploadData, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('✅ Upload Successful:', fileName);

      return {
        url: publicUrl,
        key: data.path,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageType: 'supabase'
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Extract file key from Supabase URL
   */
  static extractFileKey(fileUrl) {
    if (!fileUrl) return null;
    try {
      const cleanUrl = fileUrl.split('?')[0];
      const patterns = [
        /storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/,
        /storage\/v1\/object\/public\/Katwanyaa High\/(.+)/,
        /supabase\.co\/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match?.[1]) return decodeURIComponent(match[1]);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete single or multiple files
   */
  static async deleteFiles(fileUrls) {
    const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
    if (!urls.length) return { success: true };

    try {
      const keys = urls
        .map(url => this.extractFileKey(url))
        .filter(Boolean);

      if (!keys.length) {
        console.warn('⚠️ No valid file keys to delete');
        return { success: true };
      }

      console.log(`🗑️ Deleting ${keys.length} files from Supabase:`, keys);
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(keys);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Files deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update file (Deletes old, uploads new) - Works anywhere
   */
  static async updateFile(oldFileUrl, newFile, folder) {
    if (oldFileUrl) {
      console.log('🔄 Replacing file:', oldFileUrl);
      await this.deleteFiles(oldFileUrl);
    }
    
    if (newFile?.size > 0) {
      return this.uploadFile(newFile, folder);
    }
    
    return null;
  }

  /**
   * Upload multiple files in parallel
   */
  static async uploadMultipleFiles(files, folder = 'uploads') {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder)
    );

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = [];
    const failedUploads = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successfulUploads.push(result.value);
      } else {
        failedUploads.push({
          file: files[index]?.name || `File ${index}`,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    if (failedUploads.length > 0) {
      console.warn(`⚠️ ${failedUploads.length} files failed to upload:`, failedUploads);
    }

    return {
      successful: successfulUploads,
      failed: failedUploads
    };
  }

  /**
   * Get file metadata from URL
   */
  static async getFileMetadata(fileUrl) {
    const key = this.extractFileKey(fileUrl);
    if (!key) return null;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(key.split('/')[0], {
          search: key.split('/').pop()
        });

      if (error || !data || data.length === 0) return null;

      return {
        name: data[0].name,
        size: data[0].metadata?.size,
        type: data[0].metadata?.mimetype,
        lastModified: data[0].updated_at
      };
    } catch (error) {
      console.error('Get metadata error:', error);
      return null;
    }
  }

  /**
   * Check if file exists
   */
  static async fileExists(fileUrl) {
    const key = this.extractFileKey(fileUrl);
    if (!key) return false;

    try {
      const { data } = await supabase.storage
        .from(BUCKET_NAME)
        .list(key.split('/')[0], {
          search: key.split('/').pop(),
          limit: 1
        });

      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate signed URL (for temporary access)
   */
  static async generateSignedUrl(fileUrl, expiresIn = 3600) {
    const key = this.extractFileKey(fileUrl);
    if (!key) return null;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(key, expiresIn);

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      console.error('Generate signed URL error:', error);
      return null;
    }
  }
}

/**
 * Direct upload utility for frontend-only usage
 */
export const frontendUpload = {
  /**
   * Upload file from browser WITHOUT going through API
   */
  async uploadDirectly(file, folder = 'uploads', onProgress = null) {
    if (!file || file.size === 0) return null;
    
    if (!this.isBrowser()) {
      throw new Error('This method can only be used in the browser');
    }

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${folder}/${timestamp}-${sanitizedName}`;

      console.log(`📤 Direct upload from browser: ${fileName}`);

      // Upload with progress tracking
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('✅ Direct upload successful:', fileName);

      return {
        url: publicUrl,
        key: data.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };

    } catch (error) {
      console.error('Direct upload error:', error);
      throw error;
    }
  },

  /**
   * Check if running in browser
   */
  isBrowser() {
    return typeof window !== 'undefined';
  }
};