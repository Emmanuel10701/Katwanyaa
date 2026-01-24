// /libs/fileManager.js
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

  // Upload file to Supabase
  async uploadFile(file, folder = 'uploads') {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log(`📤 Uploading to Supabase: ${file.name} → ${filePath}`);

      // Upload to Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      console.log('✅ File uploaded to Supabase:', publicUrl);

      return {
        success: true,
        url: publicUrl,
        path: data.path,
        name: file.name,
        size: file.size,
        type: file.type,
        folder: folder
      };

    } catch (error) {
      console.error('❌ Supabase upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
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

            const thumbnailFile = new File(
              [blob], 
              `thumbnail_${Date.now()}.jpg`, 
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

  // Delete file from Supabase
  async deleteFile(filePath) {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}

// Singleton instance
const fileManager = new FileManager();
export { fileManager };