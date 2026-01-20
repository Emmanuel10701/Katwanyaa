// services/file-manager.js
import { supabase } from './superbase' // or '@/libs/supabase'

export class FileManager {
  /**
   * Extract file key from Supabase URL
   */
  static extractFileKey(fileUrl) {
    if (!fileUrl) return null
    
    try {
      const url = new URL(fileUrl)
      const path = url.pathname
      const prefix = '/storage/v1/object/public/Katwanyaa High/'
      
      if (path.startsWith(prefix)) {
        return decodeURIComponent(path.substring(prefix.length))
      }
    } catch (error) {
      console.error('Error extracting file key:', error)
    }
    return null
  }

  /**
   * Delete file from Supabase storage
   */
  static async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return { success: true }
      
      const fileKey = this.extractFileKey(fileUrl)
      if (!fileKey) {
        console.warn('Invalid file URL:', fileUrl)
        return { success: false, error: 'Invalid file URL' }
      }
      
      console.log('🗑️  Deleting from Supabase:', fileKey)
      
      const { error } = await supabase.storage
        .from('Katwanyaa High')
        .remove([fileKey])
      
      if (error) {
        console.error('Delete error:', error)
        return { success: false, error: error.message }
      }
      
      console.log('✅ Deleted from Supabase')
      return { success: true }
      
    } catch (error) {
      console.error('Delete file error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Upload file to Supabase
   */
  static async uploadFile(file, folder = 'uploads') {
    try {
      if (!file || file.size === 0) return null
      
      const buffer = Buffer.from(await file.arrayBuffer())
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(7)
      const sanitizedName = file.name.replace(/\s+/g, '-')
      const fileName = `${folder}/${uniqueId}-${sanitizedName}`
      
      console.log('📤 Uploading to Supabase:', fileName)
      
      const { data, error } = await supabase.storage
        .from('Katwanyaa High')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })
      
      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('Katwanyaa High')
        .getPublicUrl(fileName)
      
      console.log('✅ Uploaded:', publicUrl)
      
      return {
        url: publicUrl,
        key: data.path,
        fileName: file.name,
        fileType: file.type,
        fileSize: buffer.length
      }
      
    } catch (error) {
      console.error('Upload file error:', error)
      throw error
    }
  }

  /**
   * Update file (delete old, upload new)
   */
  static async updateFile(oldFileUrl, newFile, folder) {
    try {
      // Delete old file
      if (oldFileUrl) {
        await this.deleteFile(oldFileUrl)
      }
      
      // Upload new file
      if (newFile && newFile.size > 0) {
        return await this.uploadFile(newFile, folder)
      }
      
      return null
    } catch (error) {
      console.error('Update file error:', error)
      throw error
    }
  }
}