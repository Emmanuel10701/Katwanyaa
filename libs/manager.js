import { supabase } from "./superbase";

export class FileManager {
  /**
   * Upload file to Supabase - FOR ALL FILE TYPES
   */
  static async uploadFile(file, folder = 'uploads') {
    if (!file || file.size === 0) return null;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const originalName = file.name;
      
      // Sanitize filename
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${folder}/${timestamp}-${sanitizedName}`;
      
      console.log('📤 Uploading to Supabase:', fileName, 'Type:', file.type);
      
      const { data, error } = await supabase.storage
        .from('Katwanyaa High')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Katwanyaa High')
        .getPublicUrl(fileName);
      
      console.log('✅ Uploaded to Supabase:', publicUrl);
      
      return {
        url: publicUrl,
        key: data.path,
        fileName: originalName,
        fileType: file.type,
        fileSize: buffer.length,
        storageType: 'supabase'
      };
      
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  /**
   * Extract file key from Supabase URL
   */
  static extractFileKey(fileUrl) {
    if (!fileUrl) return null;
    
    try {
      // Remove query parameters
      const cleanUrl = fileUrl.split('?')[0];
      
      // Different possible URL patterns
      const patterns = [
        /https:\/\/[^\/]+\/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/,
        /https:\/\/[^\/]+\/storage\/v1\/object\/public\/Katwanyaa High\/(.+)/,
        /\/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/,
        /\/storage\/v1\/object\/public\/Katwanyaa High\/(.+)/
      ];
      
      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
      }
      
      console.warn('Could not extract file key from URL:', fileUrl);
      return null;
    } catch (error) {
      console.error('Error extracting file key:', error);
      return null;
    }
  }

  /**
   * Delete file from Supabase storage
   */
  static async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return { success: true };
      
      const fileKey = this.extractFileKey(fileUrl);
      
      if (!fileKey) {
        console.warn('Invalid file URL:', fileUrl);
        return { success: false, error: 'Invalid file URL' };
      }
      
      console.log('🗑️  Deleting from Supabase:', fileKey);
      
      const { error } = await supabase.storage
        .from('Katwanyaa High')
        .remove([fileKey]);
      
      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Deleted from Supabase');
      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete multiple files from Supabase
   */
  static async deleteFiles(fileUrls) {
    if (!fileUrls || fileUrls.length === 0) return { success: true };
    
    try {
      const keys = fileUrls
        .map(url => this.extractFileKey(url))
        .filter(key => key !== null);
      
      if (keys.length === 0) return { success: true };
      
      console.log('🗑️  Deleting multiple files from Supabase:', keys);
      
      const { error } = await supabase.storage
        .from('Katwanyaa High')
        .remove(keys);
      
      if (error) {
        console.error('Delete multiple error:', error);
        return { success: false, error: error.message };
      }
      
      console.log(`✅ Deleted ${keys.length} files from Supabase`);
      return { success: true };
    } catch (error) {
      console.error('Delete files error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update file (delete old, upload new)
   */
  static async updateFile(oldFileUrl, newFile, folder) {
    try {
      // Delete old file
      if (oldFileUrl) {
        console.log('Updating file, deleting old:', oldFileUrl);
        const deleteResult = await this.deleteFile(oldFileUrl);
        if (!deleteResult.success) {
          console.warn('Could not delete old file, but continuing...');
        }
      }
      
      // Upload new file
      if (newFile && newFile.size > 0) {
        return await this.uploadFile(newFile, folder);
      }
      
      return null;
    } catch (error) {
      console.error('Update file error:', error);
      throw error;
    }
  }
}