import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import { FileManager } from "../../../libs/superbase";

// ✅ FIX: Remove 'nodejs' runtime which causes 4.5MB limit on Vercel free plan
export const dynamic = 'force-dynamic';
// REMOVED: export const runtime = 'nodejs'; // ← THIS WAS THE PROBLEM

// ✅ ADD: Configuration for larger file uploads (up to 100MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Explicitly set to 100MB
    },
  },
};

// =============== HELPER FUNCTIONS ===============

// Helper to check request size and prevent 413 errors
async function checkRequestSize(request) {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const sizeMB = parseInt(contentLength) / (1024 * 1024);
    console.log(`📊 Request size check: ${sizeMB.toFixed(2)} MB`);
    
    // Warn if approaching Vercel limits
    if (sizeMB > 95) {
      throw new Error(
        `Request size ${sizeMB.toFixed(2)}MB is too close to 100MB limit. ` +
        `Please reduce file sizes. Multipart form data adds ~10-20% overhead.`
      );
    }
  }
}

// Enhanced parseFormData with size validation
async function parseFormData(request) {
  // First check request size
  await checkRequestSize(request);
  
  const contentType = request.headers.get('content-type');
  
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data');
  }

  try {
    return await request.formData();
  } catch (error) {
    console.error('FormData parsing error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('413') || error.message.includes('request entity too large')) {
      const contentLength = request.headers.get('content-length');
      const sizeMB = contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) : 'unknown';
      
      throw new Error(
        `Request too large (${sizeMB} MB). ` +
        `Solution: Remove "export const runtime = 'nodejs';" from this file to use higher limits.`
      );
    }
    
    throw new Error(`Failed to parse form data: ${error.message}`);
  }
}

// Helper function to validate required fields
const validateRequiredFields = (formData) => {
  const required = [
    'name', 'studentCount', 'staffCount', 
    'openDate', 'closeDate', 'subjects', 'departments'
  ];
  
  const missing = required.filter(field => !formData.get(field));
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Helper to delete old files from Supabase
const deleteOldFileFromSupabase = async (filePath) => {
  if (!filePath || filePath.includes('youtube.com') || filePath.includes('youtu.be')) {
    return; // Skip YouTube URLs
  }

  try {
    // Only delete Supabase files
    if (filePath.includes('supabase.co')) {
      await FileManager.deleteFiles(filePath);
    }
  } catch (error) {
    console.warn('⚠️ Could not delete old file from Supabase:', error.message);
  }
};

// Helper to validate YouTube URL
const isValidYouTubeUrl = (url) => {
  if (!url || url.trim() === '') return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url.trim());
};

// Helper function to parse and validate date
const parseDate = (dateString) => {
  if (!dateString || dateString.trim() === '') {
    return null;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to parse numeric fields
const parseNumber = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Helper function to parse integer fields
const parseIntField = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

// Helper function to parse JSON fields
const parseJsonField = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (parseError) {
    throw new Error(`Invalid JSON format in ${fieldName}: ${parseError.message}`);
  }
};

// Helper to parse fee distribution JSON specifically
const parseFeeDistributionJson = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    // Validate it's an object (not array or other types)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be a JSON object`);
    }
    return parsed;
  } catch (parseError) {
    throw new Error(`Invalid JSON format in ${fieldName}: ${parseError.message}`);
  }
};

// ✅ ENHANCED: Upload file to Supabase with better error handling
const uploadFileToSupabase = async (file, folder, fieldName) => {
  if (!file || file.size === 0) {
    return null;
  }

  try {
    console.log(`📤 Uploading ${fieldName}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    const result = await FileManager.uploadFile(file, `school-info/${folder}`);
    
    if (!result) {
      throw new Error(`Supabase returned null result for ${fieldName}`);
    }
    
    return {
      url: result.url,
      name: result.fileName,
      size: result.fileSize,
      type: result.fileType,
      extension: result.fileName.substring(result.fileName.lastIndexOf('.')).toLowerCase(),
      storageType: 'supabase'
    };
  } catch (error) {
    console.error(`❌ Supabase upload error for ${fieldName}:`, error);
    
    // Provide more specific error messages
    if (error.message.includes('Payload too large')) {
      throw new Error(`File "${file.name}" is too large. Maximum size for ${fieldName}: 100MB`);
    }
    
    throw new Error(`Failed to upload ${fieldName}: ${error.message}`);
  }
};

// ✅ ENHANCED: Handle PDF upload with improved error handling
const handlePdfUpload = async (pdfFile, folder, fieldName, existingFilePath = null) => {
  if (!pdfFile || pdfFile.size === 0) {
    return {
      path: existingFilePath,
      name: null,
      size: null
    };
  }

  // Delete old file from Supabase if exists
  if (existingFilePath && existingFilePath.includes('supabase.co')) {
    try {
      await FileManager.deleteFiles(existingFilePath);
      console.log(`🗑️ Deleted old ${fieldName} file`);
    } catch (deleteError) {
      console.warn(`⚠️ Could not delete old ${fieldName} file:`, deleteError.message);
    }
  }

  // Validate file type
  if (pdfFile.type !== 'application/pdf') {
    throw new Error(`Only PDF files are allowed for ${fieldName}`);
  }

  // Validate file size (20MB limit)
  const maxSize = 20 * 1024 * 1024;
  if (pdfFile.size > maxSize) {
    const fileMB = (pdfFile.size / 1024 / 1024).toFixed(2);
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    throw new Error(`${fieldName} file too large (${fileMB} MB). Maximum size: ${maxMB}MB`);
  }

  // Upload to Supabase
  const supabaseResult = await uploadFileToSupabase(pdfFile, folder, fieldName);
  
  return {
    path: supabaseResult.url,
    name: supabaseResult.name,
    size: supabaseResult.size
  };
};

// ✅ OPTIMIZED: Handle additional files with parallel processing
const handleAdditionalFileUpload = async (file, existingFilePath = null) => {
  if (!file || file.size === 0) {
    return {
      path: existingFilePath,
      name: null,
      size: null,
      type: null
    };
  }

  // Delete old file from Supabase if exists
  if (existingFilePath && existingFilePath.includes('supabase.co')) {
    try {
      await FileManager.deleteFiles(existingFilePath);
    } catch (deleteError) {
      console.warn('⚠️ Could not delete old additional file:', deleteError.message);
    }
  }

  // Allowed file types for additional results
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(t => {
      if (t.includes('pdf')) return 'PDF';
      if (t.includes('word') || t.includes('document')) return 'Word';
      if (t.includes('excel') || t.includes('sheet')) return 'Excel';
      if (t.includes('powerpoint') || t.includes('presentation')) return 'PowerPoint';
      if (t.includes('image')) return 'Images (JPEG, PNG, GIF)';
      if (t.includes('text')) return 'Text';
      return '';
    }).filter(Boolean).join(', ');
    
    throw new Error(`Invalid file type "${file.type}". Allowed: ${allowedExtensions}`);
  }

  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    const fileMB = (file.size / 1024 / 1024).toFixed(2);
    throw new Error(`File too large (${fileMB} MB). Maximum size: 50MB`);
  }

  // Upload to Supabase
  const supabaseResult = await uploadFileToSupabase(file, 'additional-results', 'additional');
  
  // Determine file type for display
  const fileType = getFileTypeFromMime(file.type);
  
  return {
    path: supabaseResult.url,
    name: supabaseResult.name,
    size: supabaseResult.size,
    type: fileType
  };
};

// Helper to determine file type from MIME type
const getFileTypeFromMime = (mimeType) => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text')) return 'text';
  return 'document';
};

// Helper to handle thumbnail upload
const handleThumbnailUpload = async (thumbnailData, existingThumbnail = null, isUpdateOperation = false) => {
  // If no thumbnail data is provided
  if (!thumbnailData || (typeof thumbnailData === 'string' && thumbnailData.trim() === '')) {
    // During update operations, preserve existing thumbnail if no new one is provided
    if (isUpdateOperation) {
      return existingThumbnail ? {
        path: existingThumbnail.path,
        type: 'existing'
      } : null;
    }
    // During create operations, delete existing thumbnail if provided
    if (existingThumbnail && existingThumbnail.path.includes('supabase.co')) {
      await deleteOldFileFromSupabase(existingThumbnail.path);
    }
    return null;
  }

  // Delete old thumbnail from Supabase if exists (only when explicitly replacing)
  if (existingThumbnail && existingThumbnail.path && existingThumbnail.path.includes('supabase.co')) {
    await deleteOldFileFromSupabase(existingThumbnail.path);
  }

  // If it's a File object
  if (thumbnailData instanceof File || (typeof thumbnailData === 'object' && thumbnailData.name)) {
    try {
      // Validate it's an image file
      if (!thumbnailData.type.startsWith('image/')) {
        throw new Error("Thumbnail must be an image file");
      }

      // Validate file size (max 2MB for thumbnails)
      if (thumbnailData.size > 2 * 1024 * 1024) {
        throw new Error("Thumbnail too large. Maximum size: 2MB");
      }

      // Upload to Supabase
      const supabaseResult = await uploadFileToSupabase(thumbnailData, 'thumbnails', 'thumbnail');
      
      return {
        path: supabaseResult.url,
        type: 'generated'
      };
    } catch (fileError) {
      console.error('File thumbnail upload error:', fileError);
      throw fileError;
    }
  }

  // Check if it's a data URL (base64)
  if (typeof thumbnailData === 'string' && thumbnailData.startsWith('data:image/')) {
    try {
      // Extract base64 data
      const matches = thumbnailData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 thumbnail data");
      }

      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to File object
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: `image/${extension}` });
      const file = new File([blob], `thumbnail.${extension}`, { type: `image/${extension}` });
      
      // Validate file size (max 2MB for thumbnails)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Thumbnail too large. Maximum size: 2MB");
      }

      // Upload to Supabase
      const supabaseResult = await uploadFileToSupabase(file, 'thumbnails', 'thumbnail');
      
      return {
        path: supabaseResult.url,
        type: 'generated'
      };
    } catch (base64Error) {
      console.error('Base64 thumbnail upload error:', base64Error);
      throw base64Error;
    }
  }

  // If it's already a file path/URL, return as-is
  if (typeof thumbnailData === 'string' && (thumbnailData.startsWith('/') || thumbnailData.includes('supabase.co'))) {
    return {
      path: thumbnailData,
      type: 'existing'
    };
  }

  throw new Error("Invalid thumbnail data format");
};

// ✅ IMPROVED: Video upload handler with comprehensive size validation
const handleVideoUpload = async (youtubeLink, videoTourFile, thumbnailData, existingVideo = null, existingThumbnail = null, isUpdateOperation = false) => {
  let videoPath = existingVideo?.videoTour || null;
  let videoType = existingVideo?.videoType || null;
  let thumbnailPath = existingThumbnail?.path || null;
  let thumbnailType = existingThumbnail?.type || null;

  // If YouTube link is provided
  if (youtubeLink !== null && youtubeLink !== undefined) {
    if (youtubeLink.trim() !== '') {
      // Delete old video file from Supabase if exists (if it was a supabase file)
      if (existingVideo?.videoType === 'file' && existingVideo?.videoTour && existingVideo.videoTour.includes('supabase.co')) {
        await deleteOldFileFromSupabase(existingVideo.videoTour);
      }
      
      // Delete old thumbnail from Supabase when switching to YouTube
      if (thumbnailPath && thumbnailPath.includes('supabase.co')) {
        await deleteOldFileFromSupabase(thumbnailPath);
        thumbnailPath = null;
        thumbnailType = null;
      }
      
      if (!isValidYouTubeUrl(youtubeLink)) {
        throw new Error("Invalid YouTube URL format. Please provide a valid YouTube watch URL or youtu.be link.");
      }
      videoPath = youtubeLink.trim();
      videoType = "youtube";
      // YouTube doesn't need custom thumbnail storage
      thumbnailPath = null;
      thumbnailType = null;
    } else if (existingVideo?.videoType === 'youtube') {
      videoPath = null;
      videoType = null;
    }
  }
  
  // If local video file upload is provided (MP4 mode)
  if (videoTourFile && videoTourFile.size > 0) {
    // Log video size for debugging
    console.log(`🎥 Video file size: ${(videoTourFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Delete old video file from Supabase if exists
    if (existingVideo?.videoTour && existingVideo?.videoType === 'file' && existingVideo.videoTour.includes('supabase.co')) {
      await deleteOldFileFromSupabase(existingVideo.videoTour);
    }

    // Validate file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v'];
    if (!allowedVideoTypes.includes(videoTourFile.type)) {
      throw new Error(`Invalid video format "${videoTourFile.type}". Only MP4, WebM, and OGG files are allowed.`);
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (videoTourFile.size > maxSize) {
      const fileMB = (videoTourFile.size / 1024 / 1024).toFixed(2);
      throw new Error(`Video file too large (${fileMB} MB). Maximum size: 100MB`);
    }

    // Upload to Supabase with progress logging
    console.log(`📤 Uploading video file: ${videoTourFile.name}`);
    const supabaseResult = await uploadFileToSupabase(videoTourFile, 'videos', 'video_tour');
    videoPath = supabaseResult.url;
    videoType = "file";
    
    // Handle thumbnail for MP4 videos
    if (thumbnailData) {
      try {
        const thumbnailResult = await handleThumbnailUpload(thumbnailData, { path: thumbnailPath }, isUpdateOperation);
        if (thumbnailResult) {
          thumbnailPath = thumbnailResult.path;
          thumbnailType = thumbnailResult.type;
        }
      } catch (thumbnailError) {
        console.warn('Thumbnail upload failed:', thumbnailError.message);
        // Don't fail the whole upload if thumbnail fails
      }
    } else if (isUpdateOperation && existingVideo?.videoType === 'file' && thumbnailPath) {
      // During update, preserve existing thumbnail if no new one provided
      thumbnailType = existingVideo?.videoThumbnailType || 'existing';
    } else {
      // No thumbnail for this MP4 video
      thumbnailPath = null;
      thumbnailType = null;
    }
  } else if (isUpdateOperation && existingVideo?.videoType === 'file' && !videoTourFile) {
    // During update, if video is not changed, preserve existing thumbnail
    if (existingVideo?.videoThumbnail) {
      thumbnailPath = existingVideo.videoThumbnail;
      thumbnailType = existingVideo.videoThumbnailType || 'existing';
    }
  }

  // If video is being removed completely, also remove thumbnail from Supabase
  if ((!youtubeLink || youtubeLink.trim() === '') && !videoTourFile && existingVideo?.videoTour) {
    if (thumbnailPath && thumbnailPath.includes('supabase.co')) {
      await deleteOldFileFromSupabase(thumbnailPath);
      thumbnailPath = null;
      thumbnailType = null;
    }
  }

  return { videoPath, videoType, thumbnailPath, thumbnailType };
};

// Helper to parse existing additional files from database
const parseExistingAdditionalFiles = (existingAdditionalFilesString) => {
  try {
    if (!existingAdditionalFilesString) return [];
    
    if (typeof existingAdditionalFilesString === 'string') {
      return JSON.parse(existingAdditionalFilesString);
    } else if (Array.isArray(existingAdditionalFilesString)) {
      return existingAdditionalFilesString;
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse existing additional files:', e.message);
    return [];
  }
};

// ✅ ENHANCED: Calculate total request size for better error messages
const calculateTotalRequestSize = async (formData) => {
  let totalSize = 0;
  const fileSizes = {};
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const sizeMB = value.size / (1024 * 1024);
      totalSize += value.size;
      fileSizes[key] = {
        name: value.name,
        size: value.size,
        sizeMB: sizeMB.toFixed(2)
      };
    }
  }
  
  const totalMB = totalSize / (1024 * 1024);
  
  return {
    totalSize,
    totalMB: totalMB.toFixed(2),
    fileCount: Object.keys(fileSizes).length,
    fileSizes
  };
};

// ✅ OPTIMIZED: Batch upload function for multiple files
const batchUploadFiles = async (files, folder, fieldName) => {
  const uploadPromises = files.map(file => 
    uploadFileToSupabase(file, folder, fieldName)
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
};

// =============== API ENDPOINTS ===============

// 🟢 CREATE (only once) - COMPLETELY REFINED
export async function POST(req) {
  try {
    console.log('📨 POST /api/school called');
    
    // Check request size before processing
    const contentLength = req.headers.get('content-length');
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024);
      console.log(`📦 Total request size: ${sizeMB.toFixed(2)} MB`);
      
      // Vercel free plan Node.js runtime has 4.5MB limit
      if (sizeMB > 4.5) {
        console.warn(`⚠️ Request may exceed Vercel free plan limit (4.5MB for Node.js runtime)`);
      }
    }

    const existing = await prisma.schoolInfo.findFirst();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "School info already exists. Please update instead." },
        { status: 400 }
      );
    }

    // Parse form data with size checking
    const formData = await parseFormData(req);
    
    // Calculate and log file sizes for debugging
    const sizeInfo = await calculateTotalRequestSize(formData);
    console.log('📊 File upload summary:', {
      totalMB: sizeInfo.totalMB,
      fileCount: sizeInfo.fileCount,
      files: sizeInfo.fileSizes
    });
    
    // Validate required fields
    try {
      validateRequiredFields(formData);
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: validationError.message },
        { status: 400 }
      );
    }

    // Handle video upload with thumbnail
    let videoPath = null;
    let videoType = null;
    let thumbnailPath = null;
    let thumbnailType = null;
    try {
      const youtubeLink = formData.get("youtubeLink");
      const videoTour = formData.get("videoTour");
      const thumbnail = formData.get("videoThumbnail");
      const videoResult = await handleVideoUpload(youtubeLink, videoTour, thumbnail, null, null, false);
      videoPath = videoResult.videoPath;
      videoType = videoResult.videoType;
      thumbnailPath = videoResult.thumbnailPath;
      thumbnailType = videoResult.thumbnailType;
    } catch (videoError) {
      return NextResponse.json(
        { success: false, error: `Video upload failed: ${videoError.message}` },
        { status: 400 }
      );
    }

    // Handle ALL PDF uploads to Supabase - USING PARALLEL UPLOADS
    let pdfUploads = {};
    const pdfPromises = [];
    
    // Main PDF fields
    const mainPdfFields = [
      { key: 'curriculum', name: 'curriculumPDF', folder: 'curriculum' },
      { key: 'dayFees', name: 'feesDayDistributionPdf', folder: 'day-fees' },
      { key: 'boardingFees', name: 'feesBoardingDistributionPdf', folder: 'boarding-fees' },
      { key: 'admissionFee', name: 'admissionFeePdf', folder: 'admission' },
    ];

    for (const field of mainPdfFields) {
      const pdfFile = formData.get(field.name);
      if (pdfFile && pdfFile.size > 0) {
        pdfPromises.push(
          handlePdfUpload(pdfFile, field.folder, field.name)
            .then(result => {
              pdfUploads[field.key] = result;
            })
            .catch(error => {
              console.error(`❌ PDF upload failed for ${field.name}:`, error);
              throw error;
            })
        );
      }
    }

    // Exam results PDFs
    const examFields = [
      { key: 'form1', name: 'form1ResultsPdf', year: 'form1ResultsYear', folder: 'exam-results' },
      { key: 'form2', name: 'form2ResultsPdf', year: 'form2ResultsYear', folder: 'exam-results' },
      { key: 'form3', name: 'form3ResultsPdf', year: 'form3ResultsYear', folder: 'exam-results' },
      { key: 'form4', name: 'form4ResultsPdf', year: 'form4ResultsYear', folder: 'exam-results' },
      { key: 'mockExams', name: 'mockExamsResultsPdf', year: 'mockExamsYear', folder: 'exam-results' },
      { key: 'kcse', name: 'kcseResultsPdf', year: 'kcseYear', folder: 'exam-results' }
    ];

    for (const exam of examFields) {
      const pdfFile = formData.get(exam.name);
      if (pdfFile && pdfFile.size > 0) {
        pdfPromises.push(
          handlePdfUpload(pdfFile, exam.folder, exam.name)
            .then(result => {
              pdfUploads[exam.key] = {
                pdfData: result,
                year: formData.get(exam.year) ? parseIntField(formData.get(exam.year)) : null
              };
            })
            .catch(error => {
              console.error(`❌ Exam PDF upload failed for ${exam.name}:`, error);
              throw error;
            })
        );
      }
    }

    // Wait for all PDF uploads
    if (pdfPromises.length > 0) {
      await Promise.all(pdfPromises);
    }

    // Handle additional results files to Supabase
    let additionalResultsFiles = [];

    try {
      // Helper to push uploaded file object into array
      const pushUploadedAdditional = (arr, uploadResult, year = '', description = '') => {
        if (!uploadResult || !uploadResult.path) return;
        arr.push({
          filename: uploadResult.name,
          filepath: uploadResult.path,
          filetype: uploadResult.type || getFileTypeFromMime(uploadResult.name),
          year: year ? year.trim() : null,
          description: description ? description.trim() : null,
          filesize: uploadResult.size
        });
      };

      // Handle "modal" style multiple files: formData.getAll('additionalFiles')
      const modalFiles = formData.getAll('additionalFiles') || [];
      const modalUploadPromises = [];
      
      for (let i = 0; i < modalFiles.length; i++) {
        const file = modalFiles[i];
        if (file && file.size > 0) {
          modalUploadPromises.push(
            handleAdditionalFileUpload(file, null)
              .then(uploadResult => {
                pushUploadedAdditional(additionalResultsFiles, uploadResult, null, null);
              })
              .catch(err => {
                console.warn(`Failed to upload modal additional file ${i}:`, err.message);
              })
          );
        }
      }

      // Handle indexed pattern additionalResultsFile_{i} (with year/desc)
      const newFileEntries = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('additionalResultsFile_')) {
          const index = key.replace('additionalResultsFile_', '');
          newFileEntries.push({
            index,
            file: value,
            year: formData.get(`additionalResultsYear_${index}`) || '',
            description: formData.get(`additionalResultsDesc_${index}`) || ''
          });
        }
      }

      for (const entry of newFileEntries) {
        if (entry.file && entry.file.size > 0) {
          modalUploadPromises.push(
            handleAdditionalFileUpload(
              entry.file, 
              formData.get(`existingAdditionalFilepath_${entry.index}`) || 
              formData.get(`replaceAdditionalFilepath_${entry.index}`) || 
              null
            )
            .then(uploadResult => {
              pushUploadedAdditional(additionalResultsFiles, uploadResult, entry.year, entry.description);
            })
            .catch(err => {
              console.warn(`Failed to upload indexed additional file ${entry.index}:`, err.message);
            })
          );
        }
      }

      // Wait for all additional file uploads
      if (modalUploadPromises.length > 0) {
        await Promise.all(modalUploadPromises);
      }

      // Deduplicate by filepath (keep first seen)
      const unique = [];
      const seenPaths = new Set();
      for (const f of additionalResultsFiles) {
        const p = f.filepath;
        if (p && !seenPaths.has(p)) {
          seenPaths.add(p);
          unique.push(f);
        }
      }
      additionalResultsFiles = unique;

    } catch (additionalError) {
      console.warn('Additional files upload error:', additionalError.message);
      additionalResultsFiles = [];
    }
    

    // Parse JSON fields
    let subjects, departments, admissionDocumentsRequired;
    let feesDayDistributionJson, feesBoardingDistributionJson, admissionFeeDistribution;
    
    try {
      // Parse academic JSON fields
      subjects = parseJsonField(formData.get("subjects") || "[]", "subjects");
      departments = parseJsonField(formData.get("departments") || "[]", "departments");
      
      const admissionDocsStr = formData.get("admissionDocumentsRequired");
      admissionDocumentsRequired = admissionDocsStr ? parseJsonField(admissionDocsStr, "admissionDocumentsRequired") : [];
      
      // Parse fee distribution JSON fields
      const dayDistributionStr = formData.get("feesDayDistributionJson");
      if (dayDistributionStr) {
        feesDayDistributionJson = parseFeeDistributionJson(dayDistributionStr, "feesDayDistributionJson");
      }
      
      const boardingDistributionStr = formData.get("feesBoardingDistributionJson");
      if (boardingDistributionStr) {
        feesBoardingDistributionJson = parseFeeDistributionJson(boardingDistributionStr, "feesBoardingDistributionJson");
      }
      
      const admissionFeeDistributionStr = formData.get("admissionFeeDistribution");
      if (admissionFeeDistributionStr) {
        admissionFeeDistribution = parseFeeDistributionJson(admissionFeeDistributionStr, "admissionFeeDistribution");
      }
      
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: parseError.message },
        { status: 400 }
      );
    }

    const school = await prisma.schoolInfo.create({
      data: {
        name: formData.get("name"),
        description: formData.get("description") || null,
        motto: formData.get("motto") || null,
        vision: formData.get("vision") || null,
        mission: formData.get("mission") || null,
        videoTour: videoPath,
        videoType,
        videoThumbnail: thumbnailPath,
        videoThumbnailType: thumbnailType,
        studentCount: parseIntField(formData.get("studentCount")) || 0,
        staffCount: parseIntField(formData.get("staffCount")) || 0,
        
        // Day School Fees - BOTH JSON AND PDF
        feesDay: parseNumber(formData.get("feesDay")),
        feesDayDistributionJson: feesDayDistributionJson || {},
        feesDayDistributionPdf: pdfUploads.dayFees?.path || null,
        feesDayPdfName: pdfUploads.dayFees?.name || null,
        feesDayPdfSize: pdfUploads.dayFees?.size || null,
        feesDayPdfUploadDate: pdfUploads.dayFees?.path ? new Date() : null,
        
        // Boarding School Fees - BOTH JSON AND PDF
        feesBoarding: parseNumber(formData.get("feesBoarding")),
        feesBoardingDistributionJson: feesBoardingDistributionJson || {},
        feesBoardingDistributionPdf: pdfUploads.boardingFees?.path || null,
        feesBoardingPdfName: pdfUploads.boardingFees?.name || null,
        feesBoardingPdfSize: pdfUploads.boardingFees?.size || null,
        feesBoardingPdfUploadDate: pdfUploads.boardingFees?.path ? new Date() : null,
        
        // Academic Calendar
        openDate: parseDate(formData.get("openDate")) || new Date(),
        closeDate: parseDate(formData.get("closeDate")) || new Date(),
        
        // Academic Information
        subjects,
        departments,
        
        // Curriculum
        curriculumPDF: pdfUploads.curriculum?.path || null,
        curriculumPdfName: pdfUploads.curriculum?.name || null,
        curriculumPdfSize: pdfUploads.curriculum?.size || null,
        
        // Admission Information - BOTH JSON AND PDF
        admissionOpenDate: parseDate(formData.get("admissionOpenDate")),
        admissionCloseDate: parseDate(formData.get("admissionCloseDate")),
        admissionRequirements: formData.get("admissionRequirements") || null,
        admissionFee: parseNumber(formData.get("admissionFee")),
        admissionFeeDistribution: admissionFeeDistribution || {},
        admissionCapacity: parseIntField(formData.get("admissionCapacity")),
        admissionContactEmail: formData.get("admissionContactEmail") || null,
        admissionContactPhone: formData.get("admissionContactPhone") || null,
        admissionWebsite: formData.get("admissionWebsite") || null,
        admissionLocation: formData.get("admissionLocation") || null,
        admissionOfficeHours: formData.get("admissionOfficeHours") || null,
        admissionDocumentsRequired,
        admissionFeePdf: pdfUploads.admissionFee?.path || null,
        admissionFeePdfName: pdfUploads.admissionFee?.name || null,
        
        // Exam Results
        form1ResultsPdf: pdfUploads.form1?.pdfData.path || null,
        form1ResultsPdfName: pdfUploads.form1?.pdfData.name || null,
        form1ResultsPdfSize: pdfUploads.form1?.pdfData.size || null,
        form1ResultsYear: pdfUploads.form1?.year || null,
        
        form2ResultsPdf: pdfUploads.form2?.pdfData.path || null,
        form2ResultsPdfName: pdfUploads.form2?.pdfData.name || null,
        form2ResultsPdfSize: pdfUploads.form2?.pdfData.size || null,
        form2ResultsYear: pdfUploads.form2?.year || null,
        
        form3ResultsPdf: pdfUploads.form3?.pdfData.path || null,
        form3ResultsPdfName: pdfUploads.form3?.pdfData.name || null,
        form3ResultsPdfSize: pdfUploads.form3?.pdfData.size || null,
        form3ResultsYear: pdfUploads.form3?.year || null,
        
        form4ResultsPdf: pdfUploads.form4?.pdfData.path || null,
        form4ResultsPdfName: pdfUploads.form4?.pdfData.name || null,
        form4ResultsPdfSize: pdfUploads.form4?.pdfData.size || null,
        form4ResultsYear: pdfUploads.form4?.year || null,
        
        mockExamsResultsPdf: pdfUploads.mockExams?.pdfData.path || null,
        mockExamsPdfName: pdfUploads.mockExams?.pdfData.name || null,
        mockExamsPdfSize: pdfUploads.mockExams?.pdfData.size || null,
        mockExamsYear: pdfUploads.mockExams?.year || null,
        
        kcseResultsPdf: pdfUploads.kcse?.pdfData.path || null,
        kcsePdfName: pdfUploads.kcse?.pdfData.name || null,
        kcsePdfSize: pdfUploads.kcse?.pdfData.size || null,
        kcseYear: pdfUploads.kcse?.year || null,
        
        // Additional Results
        additionalResultsFiles: additionalResultsFiles.length > 0 ? JSON.stringify(additionalResultsFiles) : '[]',
      },
    });

    console.log('✅ School info created successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: "School info created successfully",
      school: cleanSchoolResponse(school),
      uploadStats: {
        totalMB: sizeInfo.totalMB,
        fileCount: sizeInfo.fileCount
      }
    });
  } catch (error) {
    console.error("❌ POST Error:", error);
    
    // Handle specific error cases
    let statusCode = 500;
    let errorMessage = error.message || "Internal server error";
    
    if (error.message.includes('413') || error.message.includes('too large')) {
      statusCode = 413;
      errorMessage = `Request too large. ${error.message}. Try reducing file sizes or uploading fewer files at once.`;
    } else if (error.message.includes('Vercel') || error.message.includes('4.5MB')) {
      statusCode = 413;
      errorMessage = `Vercel free plan limit exceeded. ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        suggestion: "Remove 'export const runtime = \"nodejs\";' from this file or upgrade to Vercel Pro plan."
      }, 
      { status: statusCode }
    );
  }
}

// 🟡 GET school info - CLEANED RESPONSE
export async function GET() {
  try {
    const school = await prisma.schoolInfo.findFirst();
    if (!school) {
      return NextResponse.json(
        { success: false, message: "No school info found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      school: cleanSchoolResponse(school)
    });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}

// Helper function to clean school response
const cleanSchoolResponse = (school) => {
  // Parse JSON fields
  const subjects = typeof school.subjects === 'object' ? school.subjects : JSON.parse(school.subjects || '[]');
  const departments = typeof school.departments === 'object' ? school.departments : JSON.parse(school.departments || '[]');
  const feesDayDistributionJson = typeof school.feesDayDistributionJson === 'object' ? school.feesDayDistributionJson : JSON.parse(school.feesDayDistributionJson || '{}');
  const feesBoardingDistributionJson = typeof school.feesBoardingDistributionJson === 'object' ? school.feesBoardingDistributionJson : JSON.parse(school.feesBoardingDistributionJson || '{}');
  const admissionFeeDistribution = typeof school.admissionFeeDistribution === 'object' ? school.admissionFeeDistribution : JSON.parse(school.admissionFeeDistribution || '{}');
  const admissionDocumentsRequired = typeof school.admissionDocumentsRequired === 'object' ? school.admissionDocumentsRequired : JSON.parse(school.admissionDocumentsRequired || '[]');
  
  // Parse additional results files - handle both array and JSON string
  let additionalResultsFiles = [];
  try {
    if (school.additionalResultsFiles) {
      if (typeof school.additionalResultsFiles === 'string') {
        const parsed = JSON.parse(school.additionalResultsFiles || '[]');
        // Normalize the structure
        additionalResultsFiles = Array.isArray(parsed) ? parsed.map(file => ({
          filename: file.filename || file.name || 'Document',
          filepath: file.filepath || file.pdf || file.path || '',
          filetype: file.filetype || getFileTypeFromMime(file.type) || 'pdf',
          year: file.year || null,
          description: file.description || file.desc || '',
          filesize: file.filesize || file.size || 0
        })) : [];
      } else if (Array.isArray(school.additionalResultsFiles)) {
        additionalResultsFiles = school.additionalResultsFiles.map(file => ({
          filename: file.filename || file.name || 'Document',
          filepath: file.filepath || file.pdf || file.path || '',
          filetype: file.filetype || getFileTypeFromMime(file.type) || 'pdf',
          year: file.year || null,
          description: file.description || file.desc || '',
          filesize: file.filesize || file.size || 0
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse additionalResultsFiles:', e.message);
    additionalResultsFiles = [];
  }

  // Build clean response
  const response = {
    id: school.id,
    name: school.name,
    description: school.description,
    motto: school.motto,
    vision: school.vision,
    mission: school.mission,
    videoTour: school.videoTour,
    videoType: school.videoType,
    videoThumbnail: school.videoThumbnail, // Make sure this is included
    videoThumbnailType: school.videoThumbnailType, // Include thumbnail type
    studentCount: school.studentCount,
    staffCount: school.staffCount,
    
    // Day School Fees - BOTH JSON AND PDF
    feesDay: school.feesDay,
    feesDayDistribution: feesDayDistributionJson,
    ...(school.feesDayDistributionPdf && { feesDayDistributionPdf: school.feesDayDistributionPdf }),
    ...(school.feesDayPdfName && { feesDayPdfName: school.feesDayPdfName }),
    
    // Boarding School Fees - BOTH JSON AND PDF
    feesBoarding: school.feesBoarding,
    feesBoardingDistribution: feesBoardingDistributionJson,
    ...(school.feesBoardingDistributionPdf && { feesBoardingDistributionPdf: school.feesBoardingDistributionPdf }),
    ...(school.feesBoardingPdfName && { feesBoardingPdfName: school.feesBoardingPdfName }),
    
    // Academic Calendar
    openDate: school.openDate,
    closeDate: school.closeDate,
    
    // Academic Information
    subjects,
    departments,
    
    // Curriculum
    ...(school.curriculumPDF && { curriculumPDF: school.curriculumPDF }),
    ...(school.curriculumPdfName && { curriculumPdfName: school.curriculumPdfName }),
    
    // Admission Information - BOTH JSON AND PDF
    admissionOpenDate: school.admissionOpenDate,
    admissionCloseDate: school.admissionCloseDate,
    admissionRequirements: school.admissionRequirements,
    admissionFee: school.admissionFee,
    admissionFeeDistribution: admissionFeeDistribution,
    admissionCapacity: school.admissionCapacity,
    admissionContactEmail: school.admissionContactEmail,
    admissionContactPhone: school.admissionContactPhone,
    admissionWebsite: school.admissionWebsite,
    admissionLocation: school.admissionLocation,
    admissionOfficeHours: school.admissionOfficeHours,
    admissionDocumentsRequired: admissionDocumentsRequired,
    ...(school.admissionFeePdf && { admissionFeePdf: school.admissionFeePdf }),
    ...(school.admissionFeePdfName && { admissionFeePdfName: school.admissionFeePdfName }),
    
    // Exam Results - Clean format
    examResults: {
      ...(school.form1ResultsPdf && {
        form1: {
          pdf: school.form1ResultsPdf,
          name: school.form1ResultsPdfName,
          year: school.form1ResultsYear,
          size: school.form1ResultsPdfSize
        }
      }),
      ...(school.form2ResultsPdf && {
        form2: {
          pdf: school.form2ResultsPdf,
          name: school.form2ResultsPdfName,
          year: school.form2ResultsYear,
          size: school.form2ResultsPdfSize
        }
      }),
      ...(school.form3ResultsPdf && {
        form3: {
          pdf: school.form3ResultsPdf,
          name: school.form3ResultsPdfName,
          year: school.form3ResultsYear,
          size: school.form3ResultsPdfSize
        }
      }),
      ...(school.form4ResultsPdf && {
        form4: {
          pdf: school.form4ResultsPdf,
          name: school.form4ResultsPdfName,
          year: school.form4ResultsYear,
          size: school.form4ResultsPdfSize
        }
      }),
      ...(school.mockExamsResultsPdf && {
        mockExams: {
          pdf: school.mockExamsResultsPdf,
          name: school.mockExamsPdfName,
          year: school.mockExamsYear,
          size: school.mockExamsPdfSize
        }
      }),
      ...(school.kcseResultsPdf && {
        kcse: {
          pdf: school.kcseResultsPdf,
          name: school.kcsePdfName,
          year: school.kcseYear,
          size: school.kcsePdfSize
        }
      })
    },
    
    // Additional Results Files
    additionalResultsFiles: additionalResultsFiles,
    
    // Timestamps
    createdAt: school.createdAt,
    updatedAt: school.updatedAt
  };

  // Remove empty examResults object
  if (Object.keys(response.examResults).length === 0) {
    delete response.examResults;
  }

  return response;
};

// 🟠 PUT update existing info - COMPLETE VERSION WITH MULTIPLE FILE SUPPORT
export async function PUT(req) {
  try {
    console.log('📨 PUT /api/school called');
    
    // Check request size
    const contentLength = req.headers.get('content-length');
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024);
      console.log(`📦 Total request size: ${sizeMB.toFixed(2)} MB`);
    }

    const existing = await prisma.schoolInfo.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school info to update." }, 
        { status: 404 }
      );
    }

    const formData = await parseFormData(req);
    
    // Calculate and log file sizes
    const sizeInfo = await calculateTotalRequestSize(formData);
    console.log('📊 File upload summary for update:', {
      totalMB: sizeInfo.totalMB,
      fileCount: sizeInfo.fileCount,
      files: sizeInfo.fileSizes
    });

    // Handle video upload with thumbnail - PRESERVE existing thumbnail by default
    let videoPath = existing.videoTour;
    let videoType = existing.videoType;
    let thumbnailPath = existing.videoThumbnail;
    let thumbnailType = existing.videoThumbnailType;
    
    try {
      const youtubeLink = formData.get("youtubeLink");
      const videoTour = formData.get("videoTour");
      const thumbnail = formData.get("videoThumbnail");
      
      // Check if video is being modified
      const isVideoModified = (youtubeLink && youtubeLink.trim() !== '' && youtubeLink !== existing.videoTour) || 
                              (videoTour && videoTour.size > 0);
      
      const videoResult = await handleVideoUpload(
        youtubeLink, 
        videoTour, 
        thumbnail, 
        existing,
        { path: existing.videoThumbnail, type: existing.videoThumbnailType },
        true // true = update operation (preserve by default)
      );
      
      // Only update if we have new values
      videoPath = videoResult.videoPath !== undefined ? videoResult.videoPath : existing.videoTour;
      videoType = videoResult.videoType !== undefined ? videoResult.videoType : existing.videoType;
      thumbnailPath = videoResult.thumbnailPath !== undefined ? videoResult.thumbnailPath : existing.videoThumbnail;
      thumbnailType = videoResult.thumbnailType !== undefined ? videoResult.thumbnailType : existing.videoThumbnailType;
    } catch (videoError) {
      return NextResponse.json(
        { success: false, error: `Video upload failed: ${videoError.message}` },
        { status: 400 }
      );
    }

    // Handle ALL PDF uploads to Supabase
    let pdfUploads = {};
    const pdfPromises = [];
    
    try {
      // Curriculum PDF
      const curriculumPDF = formData.get("curriculumPDF");
      if (curriculumPDF) {
        pdfPromises.push(
          handlePdfUpload(curriculumPDF, "curriculum", "curriculum", existing.curriculumPDF)
            .then(result => pdfUploads.curriculum = result)
        );
      }

      // Day fees PDF
      const feesDayDistributionPdf = formData.get("feesDayDistributionPdf");
      if (feesDayDistributionPdf) {
        pdfPromises.push(
          handlePdfUpload(feesDayDistributionPdf, "day-fees", "day_fees", existing.feesDayDistributionPdf)
            .then(result => pdfUploads.dayFees = result)
        );
      }

      // Boarding fees PDF
      const feesBoardingDistributionPdf = formData.get("feesBoardingDistributionPdf");
      if (feesBoardingDistributionPdf) {
        pdfPromises.push(
          handlePdfUpload(feesBoardingDistributionPdf, "boarding-fees", "boarding_fees", existing.feesBoardingDistributionPdf)
            .then(result => pdfUploads.boardingFees = result)
        );
      }

      // Admission fee PDF
      const admissionFeePdf = formData.get("admissionFeePdf");
      if (admissionFeePdf) {
        pdfPromises.push(
          handlePdfUpload(admissionFeePdf, "admission", "admission_fee", existing.admissionFeePdf)
            .then(result => pdfUploads.admissionFee = result)
        );
      }

      // Exam results PDFs
      const examFields = [
        { key: 'form1', name: 'form1ResultsPdf', year: 'form1ResultsYear', existing: existing.form1ResultsPdf, folder: 'exam-results' },
        { key: 'form2', name: 'form2ResultsPdf', year: 'form2ResultsYear', existing: existing.form2ResultsPdf, folder: 'exam-results' },
        { key: 'form3', name: 'form3ResultsPdf', year: 'form3ResultsYear', existing: existing.form3ResultsPdf, folder: 'exam-results' },
        { key: 'form4', name: 'form4ResultsPdf', year: 'form4ResultsYear', existing: existing.form4ResultsPdf, folder: 'exam-results' },
        { key: 'mockExams', name: 'mockExamsResultsPdf', year: 'mockExamsYear', existing: existing.mockExamsResultsPdf, folder: 'exam-results' },
        { key: 'kcse', name: 'kcseResultsPdf', year: 'kcseYear', existing: existing.kcseResultsPdf, folder: 'exam-results' }
      ];

      for (const exam of examFields) {
        const pdfFile = formData.get(exam.name);
        if (pdfFile) {
          pdfPromises.push(
            handlePdfUpload(pdfFile, exam.folder, exam.name, exam.existing)
              .then(result => {
                pdfUploads[exam.key] = {
                  pdfData: result,
                  year: formData.get(exam.year) ? parseIntField(formData.get(exam.year)) : null
                };
              })
          );
        }
      }
      
      // Wait for all PDF uploads
      if (pdfPromises.length > 0) {
        await Promise.all(pdfPromises);
      }
    } catch (pdfError) {
      return NextResponse.json(
        { success: false, error: pdfError.message },
        { status: 400 }
      );
    }

    // Handle additional results files from form data - SUPPORTING MULTIPLE NEW FILES
    let additionalResultsFiles = [];
    try {
      let existingAdditionalFiles = parseExistingAdditionalFiles(existing.additionalResultsFiles);

      const removedAdditionalFilesJson = formData.get('removedAdditionalFiles');
      let removedFiles = [];
      
      if (removedAdditionalFilesJson && removedAdditionalFilesJson.trim() !== '') {
        try {
          removedFiles = JSON.parse(removedAdditionalFilesJson);
          if (!Array.isArray(removedFiles)) {
            removedFiles = [];
          }
        } catch (e) {
          console.warn('Failed to parse removedAdditionalFiles:', e.message);
          removedFiles = [];
        }
      }

      // Parse replaced files from form data
      const cancelledAdditionalFilesJson = formData.get('cancelledAdditionalFiles');
      let replacedFiles = [];
      
      if (cancelledAdditionalFilesJson && cancelledAdditionalFilesJson.trim() !== '') {
        try {
          replacedFiles = JSON.parse(cancelledAdditionalFilesJson);
          if (!Array.isArray(replacedFiles)) {
            replacedFiles = [];
          }
        } catch (e) {
          console.warn('Failed to parse cancelledAdditionalFiles:', e.message);
          replacedFiles = [];
        }
      }

      // Start with existing files, remove marked ones
      let finalFiles = existingAdditionalFiles.filter(file => {
        const filepath = file.filepath || file.filename || '';
        const shouldRemove = removedFiles.some(removedFile => 
          (removedFile.filepath || removedFile.filename) === filepath
        );
        const shouldReplace = replacedFiles.some(replacedFile => 
          (replacedFile.filepath || replacedFile.filename) === filepath
        );
        return !shouldRemove && !shouldReplace; // Keep if not removed or replaced
      });

      // Process metadata updates for existing files
      const existingUpdateEntries = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('existingAdditionalFilepath_')) {
          const index = key.replace('existingAdditionalFilepath_', '');
          existingUpdateEntries.push({
            index,
            filepath: value,
            year: formData.get(`existingAdditionalYear_${index}`) || '',
            description: formData.get(`existingAdditionalDesc_${index}`) || ''
          });
        }
      }

      // Apply updates to existing files
      for (const update of existingUpdateEntries) {
        if (update.filepath) {
          const existingFileIndex = finalFiles.findIndex(file => 
            (file.filepath === update.filepath || file.filename === update.filepath)
          );
          
          if (existingFileIndex !== -1) {
            // Update metadata
            if (update.year !== null && update.year !== undefined && update.year.trim() !== '') {
              finalFiles[existingFileIndex].year = update.year.trim();
            }
            if (update.description !== null && update.description !== undefined && update.description.trim() !== '') {
              finalFiles[existingFileIndex].description = update.description.trim();
            }
          }
        }
      }

      // Process NEW additional files (including replacements)
      const newFileEntries = [];
      
      // Collect all indexed file entries
      for (let i = 0; i < 100; i++) { // Assume max 100 files
        const fileField = `additionalResultsFile_${i}`;
        const file = formData.get(fileField);
        
        if (!file) break;
        
        newFileEntries.push({
          index: i,
          file: file,
          year: formData.get(`additionalResultsYear_${i}`) || '',
          description: formData.get(`additionalResultsDesc_${i}`) || '',
          // Check if this replaces an existing file
          replacesFilepath: formData.get(`replacesAdditionalFilepath_${i}`) || null
        });
      }

      // Process each new file entry with parallel uploads
      const additionalFilePromises = [];
      for (const entry of newFileEntries) {
        if (entry.file && entry.file.size > 0) {
          additionalFilePromises.push(
            (async () => {
              try {
                // Check if this is a replacement
                let oldFilePath = null;
                if (entry.replacesFilepath) {
                  oldFilePath = entry.replacesFilepath;
                  // Remove the old file from finalFiles if it exists
                  finalFiles = finalFiles.filter(f => 
                    (f.filepath || f.filename) !== oldFilePath
                  );
                }

                const uploadResult = await handleAdditionalFileUpload(entry.file, oldFilePath);
                
                if (uploadResult && uploadResult.path) {
                  finalFiles.push({
                    filename: uploadResult.name,
                    filepath: uploadResult.path,
                    filetype: uploadResult.type,
                    year: entry.year ? entry.year.trim() : null,
                    description: entry.description ? entry.description.trim() : null,
                    filesize: uploadResult.size
                  });
                }
              } catch (uploadError) {
                console.warn(`Failed to upload additional file ${entry.index}:`, uploadError.message);
                // Continue with other files
              }
            })()
          );
        }
      }

      // Wait for all additional file uploads
      if (additionalFilePromises.length > 0) {
        await Promise.all(additionalFilePromises);
      }

      // Remove duplicates
      const uniqueFiles = [];
      const seenFilepaths = new Set();
      
      for (const file of finalFiles) {
        const filepath = file.filepath;
        if (filepath && !seenFilepaths.has(filepath)) {
          seenFilepaths.add(filepath);
          uniqueFiles.push(file);
        }
      }
      
      additionalResultsFiles = uniqueFiles;

    } catch (additionalError) {
      console.error('❌ Additional files processing error:', additionalError);
      // In case of error, keep existing files from database
      additionalResultsFiles = parseExistingAdditionalFiles(existing.additionalResultsFiles);
    }

    // Parse JSON fields
    let subjects = existing.subjects;
    let departments = existing.departments;
    let admissionDocumentsRequired = existing.admissionDocumentsRequired;
    let feesDayDistributionJson = existing.feesDayDistributionJson;
    let feesBoardingDistributionJson = existing.feesBoardingDistributionJson;
    let admissionFeeDistribution = existing.admissionFeeDistribution;

    // Parse subjects
    if (formData.get("subjects")) {
      try {
        subjects = parseJsonField(formData.get("subjects"), "subjects");
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: parseError.message },
          { status: 400 }
        );
      }
    }

    // Parse departments
    if (formData.get("departments")) {
      try {
        departments = parseJsonField(formData.get("departments"), "departments");
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: parseError.message },
          { status: 400 }
        );
      }
    }

    // Parse admission documents
    if (formData.get("admissionDocumentsRequired")) {
      try {
        admissionDocumentsRequired = parseJsonField(formData.get("admissionDocumentsRequired"), "admissionDocumentsRequired");
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: parseError.message },
          { status: 400 }
        );
      }
    }

    // Parse fee distribution JSON fields
    try {
      if (formData.get("feesDayDistributionJson")) {
        feesDayDistributionJson = parseFeeDistributionJson(formData.get("feesDayDistributionJson"), "feesDayDistributionJson");
      }
      
      if (formData.get("feesBoardingDistributionJson")) {
        feesBoardingDistributionJson = parseFeeDistributionJson(formData.get("feesBoardingDistributionJson"), "feesBoardingDistributionJson");
      }
      
      if (formData.get("admissionFeeDistribution")) {
        admissionFeeDistribution = parseFeeDistributionJson(formData.get("admissionFeeDistribution"), "admissionFeeDistribution");
      }
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: parseError.message },
        { status: 400 }
      );
    }

    // Update school with all fields - WITH JSON DISTRIBUTIONS
    const updated = await prisma.schoolInfo.update({
      where: { id: existing.id },
      data: {
        name: formData.get("name") || existing.name,
        description: formData.get("description") !== null ? formData.get("description") : existing.description,
        motto: formData.get("motto") !== null ? formData.get("motto") : existing.motto,
        vision: formData.get("vision") !== null ? formData.get("vision") : existing.vision,
        mission: formData.get("mission") !== null ? formData.get("mission") : existing.mission,
        videoTour: videoPath,
        videoType,
        videoThumbnail: thumbnailPath,
        videoThumbnailType: thumbnailType,
        studentCount: formData.get("studentCount") ? parseIntField(formData.get("studentCount")) : existing.studentCount,
        staffCount: formData.get("staffCount") ? parseIntField(formData.get("staffCount")) : existing.staffCount,
        
        // Day School Fees - WITH JSON DISTRIBUTION
        feesDay: formData.get("feesDay") ? parseNumber(formData.get("feesDay")) : existing.feesDay,
        feesDayDistributionJson: feesDayDistributionJson !== undefined ? feesDayDistributionJson : existing.feesDayDistributionJson,
        feesDayDistributionPdf: pdfUploads.dayFees?.path || existing.feesDayDistributionPdf,
        feesDayPdfName: pdfUploads.dayFees?.name || existing.feesDayPdfName,
        feesDayPdfSize: pdfUploads.dayFees?.size || existing.feesDayPdfSize,
        feesDayPdfUploadDate: pdfUploads.dayFees?.path ? new Date() : existing.feesDayPdfUploadDate,
        
        // Boarding School Fees - WITH JSON DISTRIBUTION
        feesBoarding: formData.get("feesBoarding") ? parseNumber(formData.get("feesBoarding")) : existing.feesBoarding,
        feesBoardingDistributionJson: feesBoardingDistributionJson !== undefined ? feesBoardingDistributionJson : existing.feesBoardingDistributionJson,
        feesBoardingDistributionPdf: pdfUploads.boardingFees?.path || existing.feesBoardingDistributionPdf,
        feesBoardingPdfName: pdfUploads.boardingFees?.name || existing.feesBoardingPdfName,
        feesBoardingPdfSize: pdfUploads.boardingFees?.size || existing.feesBoardingPdfSize,
        feesBoardingPdfUploadDate: pdfUploads.boardingFees?.path ? new Date() : existing.feesBoardingPdfUploadDate,
        
        // Academic Calendar
        openDate: formData.get("openDate") ? parseDate(formData.get("openDate")) : existing.openDate,
        closeDate: formData.get("closeDate") ? parseDate(formData.get("closeDate")) : existing.closeDate,
        
        // Academic Information
        subjects,
        departments,
        
        // Curriculum
        curriculumPDF: pdfUploads.curriculum?.path || existing.curriculumPDF,
        curriculumPdfName: pdfUploads.curriculum?.name || existing.curriculumPdfName,
        curriculumPdfSize: pdfUploads.curriculum?.size || existing.curriculumPdfSize,
        
        // Admission Information - WITH JSON DISTRIBUTION
        admissionOpenDate: formData.get("admissionOpenDate") ? parseDate(formData.get("admissionOpenDate")) : existing.admissionOpenDate,
        admissionCloseDate: formData.get("admissionCloseDate") ? parseDate(formData.get("admissionCloseDate")) : existing.admissionCloseDate,
        admissionRequirements: formData.get("admissionRequirements") !== null ? formData.get("admissionRequirements") : existing.admissionRequirements,
        admissionFee: formData.get("admissionFee") ? parseNumber(formData.get("admissionFee")) : existing.admissionFee,
        admissionFeeDistribution: admissionFeeDistribution !== undefined ? admissionFeeDistribution : existing.admissionFeeDistribution,
        admissionCapacity: formData.get("admissionCapacity") ? parseIntField(formData.get("admissionCapacity")) : existing.admissionCapacity,
        admissionContactEmail: formData.get("admissionContactEmail") !== null ? formData.get("admissionContactEmail") : existing.admissionContactEmail,
        admissionContactPhone: formData.get("admissionContactPhone") !== null ? formData.get("admissionContactPhone") : existing.admissionContactPhone,
        admissionWebsite: formData.get("admissionWebsite") !== null ? formData.get("admissionWebsite") : existing.admissionWebsite,
        admissionLocation: formData.get("admissionLocation") !== null ? formData.get("admissionLocation") : existing.admissionLocation,
        admissionOfficeHours: formData.get("admissionOfficeHours") !== null ? formData.get("admissionOfficeHours") : existing.admissionOfficeHours,
        admissionDocumentsRequired,
        admissionFeePdf: pdfUploads.admissionFee?.path || existing.admissionFeePdf,
        admissionFeePdfName: pdfUploads.admissionFee?.name || existing.admissionFeePdfName,
        
        // Exam Results
        form1ResultsPdf: pdfUploads.form1?.pdfData.path || existing.form1ResultsPdf,
        form1ResultsPdfName: pdfUploads.form1?.pdfData.name || existing.form1ResultsPdfName,
        form1ResultsPdfSize: pdfUploads.form1?.pdfData.size || existing.form1ResultsPdfSize,
        form1ResultsYear: pdfUploads.form1?.year !== undefined ? pdfUploads.form1?.year : existing.form1ResultsYear,
        
        form2ResultsPdf: pdfUploads.form2?.pdfData.path || existing.form2ResultsPdf,
        form2ResultsPdfName: pdfUploads.form2?.pdfData.name || existing.form2ResultsPdfName,
        form2ResultsPdfSize: pdfUploads.form2?.pdfData.size || existing.form2ResultsPdfSize,
        form2ResultsYear: pdfUploads.form2?.year !== undefined ? pdfUploads.form2?.year : existing.form2ResultsYear,
        
        form3ResultsPdf: pdfUploads.form3?.pdfData.path || existing.form3ResultsPdf,
        form3ResultsPdfName: pdfUploads.form3?.pdfData.name || existing.form3ResultsPdfName,
        form3ResultsPdfSize: pdfUploads.form3?.pdfData.size || existing.form3ResultsPdfSize,
        form3ResultsYear: pdfUploads.form3?.year !== undefined ? pdfUploads.form3?.year : existing.form3ResultsYear,
        
        form4ResultsPdf: pdfUploads.form4?.pdfData.path || existing.form4ResultsPdf,
        form4ResultsPdfName: pdfUploads.form4?.pdfData.name || existing.form4ResultsPdfName,
        form4ResultsPdfSize: pdfUploads.form4?.pdfData.size || existing.form4ResultsPdfSize,
        form4ResultsYear: pdfUploads.form4?.year !== undefined ? pdfUploads.form4?.year : existing.form4ResultsYear,
        
        mockExamsResultsPdf: pdfUploads.mockExams?.pdfData.path || existing.mockExamsResultsPdf,
        mockExamsPdfName: pdfUploads.mockExams?.pdfData.name || existing.mockExamsPdfName,
        mockExamsPdfSize: pdfUploads.mockExams?.pdfData.size || existing.mockExamsPdfSize,
        mockExamsYear: pdfUploads.mockExams?.year !== undefined ? pdfUploads.mockExams?.year : existing.mockExamsYear,
        
        kcseResultsPdf: pdfUploads.kcse?.pdfData.path || existing.kcseResultsPdf,
        kcsePdfName: pdfUploads.kcse?.pdfData.name || existing.kcsePdfName,
        kcsePdfSize: pdfUploads.kcse?.pdfData.size || existing.kcsePdfSize,
        kcseYear: pdfUploads.kcse?.year !== undefined ? pdfUploads.kcse?.year : existing.kcseYear,
        
        // Additional Results - FIXED: Properly stringify the array
        additionalResultsFiles: additionalResultsFiles.length > 0 ? JSON.stringify(additionalResultsFiles) : '[]',
        
        // Update timestamp
        updatedAt: new Date(),
      },
    });

    console.log('✅ School info updated successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: "School info updated successfully",
      school: cleanSchoolResponse(updated),
      uploadStats: {
        totalMB: sizeInfo.totalMB,
        fileCount: sizeInfo.fileCount
      }
    });
  } catch (error) {
    console.error("❌ PUT Error:", error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Internal server error";
    
    if (error.message.includes('413') || error.message.includes('too large')) {
      statusCode = 413;
      errorMessage = `Request too large. ${error.message}`;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: statusCode }
    );
  }
}

// 🔴 DELETE all info
export async function DELETE() {
  try {
    const existing = await prisma.schoolInfo.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school info to delete" }, 
        { status: 404 }
      );
    }

    // Delete all associated files from Supabase
    const filesToDelete = [
      existing.videoType === 'file' ? existing.videoTour : null,
      existing.videoThumbnail, // Add thumbnail to deletion list
      existing.curriculumPDF,
      existing.feesDayDistributionPdf,
      existing.feesBoardingDistributionPdf,
      existing.admissionFeePdf,
      existing.form1ResultsPdf,
      existing.form2ResultsPdf,
      existing.form3ResultsPdf,
      existing.form4ResultsPdf,
      existing.mockExamsResultsPdf,
      existing.kcseResultsPdf,
    ].filter(Boolean);

    // Delete additional results files from Supabase
    let additionalResultsFiles = parseExistingAdditionalFiles(existing.additionalResultsFiles);

    // Add additional results files to deletion list
    additionalResultsFiles.forEach(result => {
      if (result.filepath || result.pdf || result.path) {
        filesToDelete.push(result.filepath || result.pdf || result.path);
      }
    });

    // Delete each file from Supabase
    for (const filePath of filesToDelete) {
      await deleteOldFileFromSupabase(filePath);
    }

    await prisma.schoolInfo.deleteMany();
    return NextResponse.json({ 
      success: true, 
      message: "School info deleted successfully" 
    });
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}