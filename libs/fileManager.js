import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const fileManager = {
  // Upload file to Supabase
  async uploadFile(file, folder, existingFilePath = null, metadata = {}) {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }

      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      const safeFileName = file.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      
      const filePath = existingFilePath || `${folder}/${timestamp}_${uniqueId}_${safeFileName}`;
      
      const uploadOptions = {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
        metadata: {
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
          ...metadata
        }
      };
      
      const { data, error } = await supabase.storage
        .from('school-documents')
        .upload(filePath, file, uploadOptions);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('school-documents')
        .getPublicUrl(filePath);
      
      return {
        url: urlData.publicUrl,
        path: filePath,
        originalName: file.name
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },

  // Get file metadata
  async getFileMetadata(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('school-documents')
        .list('', {
          limit: 1,
          search: filePath
        });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          file_size: data[0].metadata?.file_size || 0,
          mime_type: data[0].metadata?.mime_type || '',
          uploaded_at: data[0].created_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      return null;
    }
  },

  // Delete file
  async deleteFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('school-documents')
        .remove([filePath]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  },

  // List files in folder
  async listFiles(folder = '') {
    try {
      const { data, error } = await supabase.storage
        .from('school-documents')
        .list(folder);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to list files:', error);
      throw error;
    }
  },

  // Get signed URL for private files
  async getSignedUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from('school-documents')
        .createSignedUrl(filePath, expiresIn);
      
      if (error) throw error;
      return data?.signedUrl;
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      throw error;
    }
  },

  // Update file metadata
  async updateFileMetadata(filePath, metadata) {
    try {
      const { data, error } = await supabase.storage
        .from('school-documents')
        .update(filePath, null, {
          metadata: metadata
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update file metadata:', error);
      throw error;
    }
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.fileManager = fileManager;
}