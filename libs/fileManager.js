'use client';

import { createClient } from '@supabase/supabase-js';

class FileManager {
  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables are not set');
      throw new Error('Supabase configuration is missing');
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    this.bucketName = 'Katwanyaa High';
  }

async uploadFile(file, folder = 'uploads') {
  try {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Preserve original filename but sanitize it
    const originalFileName = file.name;
    const fileExtension = originalFileName.slice((originalFileName.lastIndexOf(".") - 1 >>> 0) + 2);
    const fileNameWithoutExt = originalFileName.slice(0, originalFileName.lastIndexOf('.'));
    
    // Sanitize filename (remove special characters, keep only alphanumeric, dots, dashes, underscores)
    const sanitizedFileName = fileNameWithoutExt.replace(/[^a-zA-Z0-9\s\-_]/g, '_');
    
    // Add timestamp for uniqueness
    const timestamp = Date.now();
    const uniqueFileName = `${sanitizedFileName}_${timestamp}.${fileExtension}`;
    const filePath = `${folder}/${uniqueFileName}`;

    console.log(`📤 Uploading to Supabase: ${originalFileName} → ${filePath}`);

    // Upload to Supabase
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      // Handle file already exists error
      if (error.message.includes('already exists')) {
        // Try with a more unique name
        const moreUniqueFileName = `${sanitizedFileName}_${timestamp}_${Math.random().toString(36).substr(2, 6)}.${fileExtension}`;
        const newFilePath = `${folder}/${moreUniqueFileName}`;
        
        const { data: newData, error: newError } = await this.supabase.storage
          .from(this.bucketName)
          .upload(newFilePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });
          
        if (newError) throw newError;
        
        // Get public URL - IMPORTANT: Properly encode the bucket name
        const encodedBucketName = encodeURIComponent(this.bucketName);
        const encodedPath = encodeURIComponent(newData.path);
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${encodedBucketName}/${encodedPath}`;
        
        console.log('✅ File uploaded to Supabase (with unique name):', publicUrl);
        
        return {
          success: true,
          url: publicUrl,
          path: newData.path,
          originalName: originalFileName,
          storedName: moreUniqueFileName,
          size: file.size,
          type: file.type,
          folder: folder
        };
      }
      throw error;
    }

    // Get public URL - IMPORTANT: Properly encode the bucket name
    const encodedBucketName = encodeURIComponent(this.bucketName);
    const encodedPath = encodeURIComponent(data.path);
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${encodedBucketName}/${encodedPath}`;

    console.log('✅ File uploaded to Supabase:', publicUrl);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      originalName: originalFileName,
      storedName: uniqueFileName,
      size: file.size,
      type: file.type,
      folder: folder
    };

  } catch (error) {
    console.error('❌ Supabase upload failed:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
}

  // Update existing file (delete old, upload new)
  async updateFile(oldFilePath, newFile, folder = 'uploads') {
    try {
      // Delete old file if exists
      if (oldFilePath) {
        await this.deleteFile(oldFilePath);
      }
      
      // Upload new file with preserved name
      return await this.uploadFile(newFile, folder);
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  // Delete file from Supabase
  async deleteFile(filePath) {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
      console.log('✅ File deleted from Supabase:', filePath);
      return { success: true };
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  // Generate thumbnail from video
  async generateThumbnailFromVideo(videoFile, timeSeconds = 1) {
    return new Promise((resolve, reject) => {
      try {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        video.src = URL.createObjectURL(videoFile);
        
        video.onloadeddata = () => {
          video.currentTime = timeSeconds;
        };

        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create thumbnail blob'));
              return;
            }

            // Generate thumbnail filename based on video filename
            const videoName = videoFile.name.replace(/\.[^/.]+$/, "");
            const thumbnailFile = new File(
              [blob], 
              `${videoName}_thumbnail_${Date.now()}.jpg`, 
              { type: 'image/jpeg' }
            );

            // Upload thumbnail to Supabase
            const result = await this.uploadFile(thumbnailFile, 'thumbnails');
            
            // Clean up
            URL.revokeObjectURL(video.src);
            
            resolve(result);
          }, 'image/jpeg', 0.8);
        };

        video.onerror = (err) => {
          reject(new Error(`Video error: ${err}`));
        };

      } catch (error) {
        reject(new Error(`Thumbnail generation failed: ${error.message}`));
      }
    });
  }

  // Get file info from path
  async getFileInfo(filePath) {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Get file info failed:', error);
      throw error;
    }
  }
}

// Singleton instance
const fileManager = new FileManager();
export { fileManager };