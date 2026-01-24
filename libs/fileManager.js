import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class FileManager {
  constructor() {
    this.bucketName = 'Katwanyaa High';
  }

  // ==================== FILE UPLOAD METHODS ====================
  
  async uploadFile(file, folder, metadata = {}) {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }

      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      const safeFileName = file.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      
      const filePath = `${folder}/${timestamp}_${uniqueId}_${safeFileName}`;
      
      const fileMetadata = {
        // File information
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        mime_type: file.type,
        file_extension: file.name.split('.').pop().toLowerCase(),
        
        // Upload information
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'school_portal',
        
        // System information
        system: {
          uploaded_via: 'school_portal',
          client_timestamp: Date.now(),
          processing_status: 'complete'
        },
        
        // Custom metadata
        ...metadata
      };
      
      console.log(`📤 Uploading ${file.name} to ${filePath}...`);
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: fileMetadata
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type,
        metadata: fileMetadata
      };
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  // ==================== FILE UPDATE METHODS ====================
  
  async updateFile(file, filePath, metadata = {}) {
    try {
      const existingMetadata = await this.getFileMetadata(filePath);
      
      const updatedMetadata = {
        ...existingMetadata,
        ...metadata,
        updated_at: new Date().toISOString(),
        updated_by: 'school_portal'
      };
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .update(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
          metadata: updatedMetadata
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        name: file.name,
        metadata: updatedMetadata
      };
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      throw error;
    }
  }

  // ==================== FILE DELETE METHODS ====================
  
  async deleteFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'File deleted successfully',
        path: filePath
      };
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      throw error;
    }
  }

  // ==================== FILE GET METHODS ====================
  
  async getFileMetadata(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('', {
          limit: 1,
          search: filePath.split('/').pop()
        });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0].metadata || {};
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Get metadata failed:', error);
      return null;
    }
  }

  async getFileUrl(filePath) {
    try {
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
      
    } catch (error) {
      console.error('❌ Get URL failed:', error);
      return null;
    }
  }

  async getSignedUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) throw error;
      
      return data.signedUrl;
      
    } catch (error) {
      console.error('❌ Get signed URL failed:', error);
      return null;
    }
  }

  // ==================== BULK OPERATIONS ====================
  
  async uploadMultipleFiles(files, folder, metadata = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, folder, metadata);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          name: file.name,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async deleteMultipleFiles(filePaths) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .remove(filePaths);
      
      if (error) throw error;
      
      return {
        success: true,
        message: `${filePaths.length} files deleted successfully`,
        deleted: filePaths
      };
      
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================
  
  async listFiles(folder = '') {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folder);
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('❌ List files failed:', error);
      throw error;
    }
  }

  async getStorageStats() {
    try {
      const files = await this.listFiles();
      
      let totalSize = 0;
      let fileCount = 0;
      const byType = {};
      
      for (const file of files) {
        totalSize += parseInt(file.metadata?.file_size || 0);
        fileCount++;
        
        const type = file.metadata?.file_type?.split('/')[0] || 'other';
        byType[type] = (byType[type] || 0) + 1;
      }
      
      return {
        totalFiles: fileCount,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        byType: byType
      };
      
    } catch (error) {
      console.error('❌ Get stats failed:', error);
      throw error;
    }
  }

  // ==================== FILE VALIDATION ====================
  
  validateFile(file, options = {}) {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    } = options;
    
    const errors = [];
    
    // Check size
    if (file.size > maxSize) {
      errors.push(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Check type
    const isAllowed = allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const category = allowedType.split('/')[0];
        return file.type.startsWith(category);
      }
      return file.type === allowedType;
    });
    
    if (!isAllowed) {
      errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create and export singleton instance
const fileManager = new FileManager();
export default fileManager;

// Also export the supabase client for direct use if needed
export { supabase };