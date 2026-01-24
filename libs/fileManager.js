'use client';

import { createClient } from '@supabase/supabase-js';
// libs/fileManager.js - Enhanced version
class EnhancedFileManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    this.bucketName = 'Katwanyaa High';
  }
  
  // Upload file with comprehensive metadata
  async uploadFileWithMetadata(file, folder = 'uploads', metadata = {}) {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }
      
      // Generate structured filename with metadata hash
      const originalName = file.name;
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substr(2, 9);
      
      // Create metadata hash for unique identification
      const metadataHash = await this.generateMetadataHash({
        originalName,
        ...metadata,
        timestamp
      });
      
      // Sanitize filename and create unique path
      const sanitizedBase = originalName.replace(/[^a-zA-Z0-9\s\-_\.]/g, '_');
      const fileExt = originalName.slice((originalName.lastIndexOf(".") - 1 >>> 0) + 2);
      const uniqueFileName = `${sanitizedBase.replace(`.${fileExt}`, '')}_${metadataHash}_${timestamp}_${uniqueId}.${fileExt}`;
      const filePath = `${folder}/${uniqueFileName}`;
      
      // Prepare comprehensive metadata for Supabase
      const supabaseMetadata = {
        // File info
        original_name: originalName,
        file_type: file.type,
        file_size: file.size,
        mime_type: file.type,
        file_extension: fileExt,
        
        // Upload context
        uploaded_at: new Date().toISOString(),
        metadata_hash: metadataHash,
        
        // Application metadata
        ...metadata,
        
        // System metadata
        _system: {
          bucket: this.bucketName,
          folder: folder,
          upload_method: 'direct',
          version: '2.0'
        }
      };
      
      console.log(`📤 Uploading with metadata: ${originalName}`, {
        path: filePath,
        metadata: supabaseMetadata
      });
      
      // Upload to Supabase with metadata
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: supabaseMetadata  // ✅ Metadata stored with file in Supabase
        });
      
      if (error) throw error;
      
      // Generate public URL
      const publicUrl = await this.getPublicUrl(filePath);
      
      return {
        success: true,
        url: publicUrl,
        path: data.path,
        originalName: originalName,
        storedName: uniqueFileName,
        size: file.size,
        type: file.type,
        folder: folder,
        metadata: supabaseMetadata,
        metadataHash: metadataHash
      };
      
    } catch (error) {
      console.error('❌ Upload with metadata failed:', error);
      throw error;
    }
  }
  
  // Generate hash from metadata for unique identification
  async generateMetadataHash(metadata) {
    const metadataString = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const data = encoder.encode(metadataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
  }
  
  // Get file metadata from Supabase
  async getFileMetadata(filePath) {
    try {
      // List files to get metadata
      const folderPath = filePath.split('/').slice(0, -1).join('/');
      const fileName = filePath.split('/').pop();
      
      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(folderPath, {
          search: fileName,
          limit: 1
        });
      
      if (error || !files || files.length === 0) {
        throw new Error('File not found');
      }
      
      return {
        ...files[0].metadata,
        name: files[0].name,
        id: files[0].id,
        created_at: files[0].created_at,
        updated_at: files[0].updated_at
      };
      
    } catch (error) {
      console.error('❌ Get metadata failed:', error);
      return null;
    }
  }
  
  // Get public URL
  async getPublicUrl(filePath) {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    return data?.publicUrl;
  }
  
  // Get signed URL for downloads
  async getSignedUrl(filePath, expiresIn = 3600) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
  }
  
  // Delete file
  async deleteFile(filePath) {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);
    
    if (error) throw error;
    return { success: true };
  }
  
  // Search files by metadata
  async searchFilesByMetadata(filters = {}) {
    try {
      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', {
          limit: 1000
        });
      
      if (error) throw error;
      
      // Filter files by metadata
      return files.filter(file => {
        if (!file.metadata) return false;
        
        return Object.entries(filters).every(([key, value]) => {
          const fileValue = file.metadata[key];
          
          if (typeof value === 'object' && value.operator) {
            switch (value.operator) {
              case 'contains':
                return fileValue?.toLowerCase().includes(value.value.toLowerCase());
              case 'equals':
                return fileValue === value.value;
              default:
                return fileValue === value;
            }
          }
          
          return fileValue === value;
        });
      });
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }
}

// Export singleton
const enhancedFileManager = new EnhancedFileManager();
export { enhancedFileManager };

// Singleton instance
const fileManager = new FileManager();
export { fileManager };