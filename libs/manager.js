// services/file-manager.js - FIXED VERSION
import { supabase as client } from './supabase';

export class FileManager {
  /**
   * Extract file key from Supabase URL - FIXED for URL encoding
   */
  static extractFileKey(fileUrl) {
    if (!fileUrl) return null
    
    try {
      const url = new URL(fileUrl)
      const path = decodeURIComponent(url.pathname) // ✅ DECODE URL FIRST
      const prefix = '/storage/v1/object/public/Katwanyaa High/'
      
      if (path.startsWith(prefix)) {
        return path.substring(prefix.length)
      }
      
      // Also try with encoded space just in case
      const encodedPath = url.pathname
      const encodedPrefix = '/storage/v1/object/public/Katwanyaa%20High/'
      if (encodedPath.startsWith(encodedPrefix)) {
        return decodeURIComponent(encodedPath.substring(encodedPrefix.length))
      }
      
    } catch (error) {
      console.error('Error extracting file key:', error)
    }
    return null
  }

  /**
   * Better version: Handle multiple URL formats
   */
  static extractFileKeyV2(fileUrl) {
    if (!fileUrl) return null
    
    // Remove any query parameters
    const cleanUrl = fileUrl.split('?')[0]
    
    // Different possible URL patterns
    const patterns = [
      /https:\/\/[^\/]+\/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/, // Encoded space
      /https:\/\/[^\/]+\/storage\/v1\/object\/public\/Katwanyaa High\/(.+)/,    // Actual space
      /\/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/,                  // Relative with encoded
      /\/storage\/v1\/object\/public\/Katwanyaa High\/(.+)/                     // Relative with space
    ]
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }
    }
    
    console.warn('Could not extract file key from URL:', fileUrl)
    return null
  }

  /**
   * Delete file from Supabase storage - FIXED
   */
  static async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return { success: true }
      
      // Use the improved extractor
      const fileKey = this.extractFileKeyV2(fileUrl)
      
      if (!fileKey) {
        console.warn('Invalid file URL:', fileUrl)
        
        // Try manual extraction as last resort
        const manualKey = this.extractFileKeyManually(fileUrl)
        if (manualKey) {
          console.log('Retrying with manual extraction:', manualKey)
          return await this.deleteByKey(manualKey)
        }
        
        return { success: false, error: 'Invalid file URL' }
      }
      
      console.log('🗑️  Deleting from Supabase:', fileKey)
      
      return await this.deleteByKey(fileKey)
      
    } catch (error) {
      console.error('Delete file error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete file by key directly
   */
  static async deleteByKey(fileKey) {
    try {
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
      console.error('Delete by key error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Manual extraction for tricky URLs
   */
  static extractFileKeyManually(fileUrl) {
    try {
      // Try to find the pattern after "Katwanyaa High"
      const patterns = [
        'Katwanyaa High/',
        'Katwanyaa%20High/'
      ]
      
      for (const pattern of patterns) {
        const index = fileUrl.indexOf(pattern)
        if (index !== -1) {
          const key = fileUrl.substring(index + pattern.length)
          // Remove any query parameters
          return decodeURIComponent(key.split('?')[0])
        }
      }
    } catch (error) {
      console.error('Manual extraction error:', error)
    }
    return null
  }

  // Keep your existing uploadFile and updateFile methods...
  // They should work fine as they generate URLs correctly

  /**
   * Upload file to Supabase - UPDATED to generate proper URLs
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
      
      // Get public URL - this should generate the correct format
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
   * Update file (delete old, upload new) - UPDATED
   */
  static async updateFile(oldFileUrl, newFile, folder) {
    try {
      // Delete old file
      if (oldFileUrl) {
        console.log('Updating file, deleting old:', oldFileUrl)
        const deleteResult = await this.deleteFile(oldFileUrl)
        if (!deleteResult.success) {
          console.warn('Could not delete old file, but continuing...')
        }
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