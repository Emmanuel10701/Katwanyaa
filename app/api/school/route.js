import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'Katwanyaa High';

// ==================== FILE MANAGEMENT ====================

/**
 * Upload file to Supabase Storage
 * Can be called from frontend OR backend
 */
async function uploadToSupabase(file, folder = 'uploads') {
  try {
    console.log(`📤 Uploading to ${folder}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}-${sanitizedName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    console.log('✅ Upload successful:', fileName);
    
    return {
      url: publicUrl,
      path: fileName,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Delete file from Supabase Storage by URL or path
 */
async function deleteFromSupabase(fileIdentifier) {
  if (!fileIdentifier) return;
  
  try {
    let filePath;
    
    if (typeof fileIdentifier === 'string') {
      // Extract path from URL
      const urlMatch = fileIdentifier.match(/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/);
      if (urlMatch) {
        filePath = decodeURIComponent(urlMatch[1]);
      } else {
        filePath = fileIdentifier; // Assume it's already a path
      }
    } else if (fileIdentifier.path) {
      filePath = fileIdentifier.path;
    } else if (fileIdentifier.url) {
      const urlMatch = fileIdentifier.url.match(/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/);
      if (urlMatch) filePath = decodeURIComponent(urlMatch[1]);
    }
    
    if (!filePath) {
      console.warn('⚠️ Could not extract file path from:', fileIdentifier);
      return;
    }
    
    console.log(`🗑️ Deleting file: ${filePath}`);
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.warn('⚠️ Delete warning:', error.message);
    } else {
      console.log('✅ File deleted:', filePath);
    }
  } catch (error) {
    console.warn('⚠️ Delete error:', error.message);
  }
}

/**
 * Process base64 image/file data
 */
async function processBase64File(base64Data, fileName, folder) {
  try {
    // Extract mime type and base64 string
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data');
    }
    
    const mimeType = matches[1];
    const base64String = matches[2];
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Create file object
    const file = new File([buffer], fileName, { type: mimeType });
    
    // Upload to Supabase
    return await uploadToSupabase(file, folder);
  } catch (error) {
    console.error('❌ Base64 processing error:', error);
    throw error;
  }
}

// ==================== REQUEST PARSING ====================

/**
 * Parse multipart/form-data request
 * ONLY for small files or when needed
 */
async function parseMultipartRequest(request) {
  try {
    const formData = await request.formData();
    const result = {};
    const files = {};
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else {
        result[key] = value;
      }
    }
    
    // Parse JSON fields
    const jsonFields = [
      'subjects', 'departments', 'admissionDocumentsRequired',
      'feesDayDistributionJson', 'feesBoardingDistributionJson', 'admissionFeeDistribution'
    ];
    
    jsonFields.forEach(field => {
      if (result[field]) {
        try {
          result[field] = JSON.parse(result[field]);
        } catch {
          result[field] = result[field];
        }
      }
    });
    
    return { ...result, _files: files };
  } catch (error) {
    console.error('❌ Form parsing error:', error);
    throw new Error('Failed to parse form data');
  }
}

/**
 * Parse JSON request
 */
async function parseJsonRequest(request) {
  try {
    return await request.json();
  } catch (error) {
    console.error('❌ JSON parsing error:', error);
    throw new Error('Invalid JSON data');
  }
}

// ==================== FILE TYPE HANDLERS ====================

/**
 * Handle video upload/update
 */
async function handleVideoData(videoData, existingVideo) {
  let result = {
    videoTour: existingVideo?.videoTour || null,
    videoType: existingVideo?.videoType || null,
    videoThumbnail: existingVideo?.videoThumbnail || null
  };
  
  // If YouTube link provided
  if (videoData.youtubeLink && videoData.youtubeLink.trim() !== '') {
    // Delete existing video file if exists
    if (existingVideo?.videoType === 'file' && existingVideo.videoTour) {
      await deleteFromSupabase(existingVideo.videoTour);
    }
    // Delete existing thumbnail
    if (existingVideo?.videoThumbnail) {
      await deleteFromSupabase(existingVideo.videoThumbnail);
    }
    
    result.videoTour = videoData.youtubeLink.trim();
    result.videoType = 'youtube';
    result.videoThumbnail = null;
  }
  
  // If file upload provided
  if (videoData.videoFile && videoData.videoFile.size > 0) {
    // Delete existing video file if exists
    if (existingVideo?.videoTour && existingVideo.videoType === 'file') {
      await deleteFromSupabase(existingVideo.videoTour);
    }
    
    // Upload new video
    const uploadedVideo = await uploadToSupabase(videoData.videoFile, 'videos');
    result.videoTour = uploadedVideo.url;
    result.videoType = 'file';
    
    // Handle thumbnail
    if (videoData.videoThumbnail) {
      if (videoData.videoThumbnail instanceof File) {
        const uploadedThumbnail = await uploadToSupabase(videoData.videoThumbnail, 'thumbnails');
        result.videoThumbnail = uploadedThumbnail.url;
      } else if (typeof videoData.videoThumbnail === 'string' && 
                 videoData.videoThumbnail.startsWith('data:image/')) {
        const uploadedThumbnail = await processBase64File(
          videoData.videoThumbnail,
          `thumbnail-${Date.now()}.jpg`,
          'thumbnails'
        );
        result.videoThumbnail = uploadedThumbnail.url;
      }
    } else if (existingVideo?.videoThumbnail) {
      result.videoThumbnail = existingVideo.videoThumbnail;
    }
  }
  
  // If video is being removed
  if (videoData.removeVideo && existingVideo?.videoTour) {
    await deleteFromSupabase(existingVideo.videoTour);
    if (existingVideo.videoThumbnail) {
      await deleteFromSupabase(existingVideo.videoThumbnail);
    }
    result.videoTour = null;
    result.videoType = null;
    result.videoThumbnail = null;
  }
  
  return result;
}

/**
 * Handle PDF upload/update
 */
async function handlePdfData(pdfField, pdfFile, existingPdf) {
  if (!pdfFile || pdfFile.size === 0) {
    return {
      pdf: existingPdf || null,
      name: null,
      size: null
    };
  }
  
  // Delete old PDF if exists
  if (existingPdf) {
    await deleteFromSupabase(existingPdf);
  }
  
  // Upload new PDF
  const uploadedPdf = await uploadToSupabase(pdfFile, 'documents');
  
  return {
    pdf: uploadedPdf.url,
    name: uploadedPdf.name,
    size: uploadedPdf.size
  };
}

/**
 * Handle additional files
 */
async function handleAdditionalFiles(additionalData, existingAdditionalFiles = []) {
  const results = [];
  
  // Keep existing files unless marked for removal
  if (additionalData.keepExisting !== false) {
    results.push(...existingAdditionalFiles);
  }
  
  // Add new files
  if (additionalData.newFiles && Array.isArray(additionalData.newFiles)) {
    for (const file of additionalData.newFiles) {
      if (file && file.size > 0) {
        const uploadedFile = await uploadToSupabase(file, 'additional');
        results.push({
          url: uploadedFile.url,
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          year: file.year || '',
          description: file.description || ''
        });
      }
    }
  }
  
  // Remove files marked for deletion
  if (additionalData.filesToRemove && Array.isArray(additionalData.filesToRemove)) {
    for (const fileToRemove of additionalData.filesToRemove) {
      await deleteFromSupabase(fileToRemove);
      // Remove from results
      const index = results.findIndex(f => 
        f.url === fileToRemove.url || 
        f.name === fileToRemove.filename ||
        f.path === fileToRemove.filepath
      );
      if (index !== -1) {
        results.splice(index, 1);
      }
    }
  }
  
  return results;
}

// ==================== API ENDPOINTS ====================

export const dynamic = 'force-dynamic';

// 🟢 CREATE School Info
export async function POST(request) {
  try {
    console.log('📨 POST /api/school - Creating school info');
    
    // Check if school already exists
    const existing = await prisma.schoolInfo.findFirst();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "School info already exists. Please update instead." },
        { status: 400 }
      );
    }
    
    // Parse request based on content type
    let data;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      data = await parseMultipartRequest(request);
    } else if (contentType.includes('application/json')) {
      data = await parseJsonRequest(request);
    } else {
      throw new Error('Unsupported content type');
    }
    
    // Process files if in multipart
    let processedData = { ...data };
    
    if (data._files) {
      // Handle video if present
      if (data._files.videoFile) {
        const videoResult = await handleVideoData({
          videoFile: data._files.videoFile,
          videoThumbnail: data._files.videoThumbnail,
          youtubeLink: data.youtubeLink
        }, null);
        
        processedData.videoTour = videoResult.videoTour;
        processedData.videoType = videoResult.videoType;
        processedData.videoThumbnail = videoResult.videoThumbnail;
      }
      
      // Handle PDFs
      const pdfFields = [
        'curriculumPDF', 'feesDayDistributionPdf', 'feesBoardingDistributionPdf',
        'admissionFeePdf', 'form1ResultsPdf', 'form2ResultsPdf', 'form3ResultsPdf',
        'form4ResultsPdf', 'mockExamsResultsPdf', 'kcseResultsPdf'
      ];
      
      for (const field of pdfFields) {
        if (data._files[field]) {
          const pdfResult = await handlePdfData(field, data._files[field], null);
          processedData[field] = pdfResult.pdf;
          processedData[`${field}Name`] = pdfResult.name;
          processedData[`${field}Size`] = pdfResult.size;
        }
      }
      
      // Handle additional files
      if (data._files.additionalFiles) {
        const files = data._files.additionalFiles instanceof File ? 
          [data._files.additionalFiles] : 
          data._files.additionalFiles;
        
        const additionalResult = await handleAdditionalFiles({
          newFiles: files
        }, []);
        
        processedData.additionalResultsFiles = additionalResult;
      }
      
      delete processedData._files;
    }
    
    // Create school in database
    const school = await prisma.schoolInfo.create({
      data: {
        name: processedData.name,
        description: processedData.description || null,
        motto: processedData.motto || null,
        vision: processedData.vision || null,
        mission: processedData.mission || null,
        videoTour: processedData.videoTour || null,
        videoType: processedData.videoType || null,
        videoThumbnail: processedData.videoThumbnail || null,
        studentCount: parseInt(processedData.studentCount) || 0,
        staffCount: parseInt(processedData.staffCount) || 0,
        openDate: new Date(processedData.openDate) || new Date(),
        closeDate: new Date(processedData.closeDate) || new Date(),
        
        // JSON fields
        subjects: JSON.stringify(processedData.subjects || []),
        departments: JSON.stringify(processedData.departments || []),
        admissionDocumentsRequired: JSON.stringify(processedData.admissionDocumentsRequired || []),
        feesDayDistributionJson: JSON.stringify(processedData.feesDayDistributionJson || {}),
        feesBoardingDistributionJson: JSON.stringify(processedData.feesBoardingDistributionJson || {}),
        admissionFeeDistribution: JSON.stringify(processedData.admissionFeeDistribution || {}),
        
        // Day School Fees
        feesDay: parseFloat(processedData.feesDay) || null,
        feesDayDistributionPdf: processedData.feesDayDistributionPdf || null,
        feesDayPdfName: processedData.feesDayPdfName || null,
        feesDayPdfSize: processedData.feesDayPdfSize || null,
        
        // Boarding School Fees
        feesBoarding: parseFloat(processedData.feesBoarding) || null,
        feesBoardingDistributionPdf: processedData.feesBoardingDistributionPdf || null,
        feesBoardingPdfName: processedData.feesBoardingPdfName || null,
        feesBoardingPdfSize: processedData.feesBoardingPdfSize || null,
        
        // Curriculum
        curriculumPDF: processedData.curriculumPDF || null,
        curriculumPdfName: processedData.curriculumPdfName || null,
        curriculumPdfSize: processedData.curriculumPdfSize || null,
        
        // Admission Information
        admissionOpenDate: processedData.admissionOpenDate ? new Date(processedData.admissionOpenDate) : null,
        admissionCloseDate: processedData.admissionCloseDate ? new Date(processedData.admissionCloseDate) : null,
        admissionRequirements: processedData.admissionRequirements || null,
        admissionFee: parseFloat(processedData.admissionFee) || null,
        admissionCapacity: parseInt(processedData.admissionCapacity) || null,
        admissionContactEmail: processedData.admissionContactEmail || null,
        admissionContactPhone: processedData.admissionContactPhone || null,
        admissionWebsite: processedData.admissionWebsite || null,
        admissionLocation: processedData.admissionLocation || null,
        admissionOfficeHours: processedData.admissionOfficeHours || null,
        admissionFeePdf: processedData.admissionFeePdf || null,
        admissionFeePdfName: processedData.admissionFeePdfName || null,
        
        // Exam Results
        form1ResultsPdf: processedData.form1ResultsPdf || null,
        form1ResultsPdfName: processedData.form1ResultsPdfName || null,
        form1ResultsPdfSize: processedData.form1ResultsPdfSize || null,
        form1ResultsYear: parseInt(processedData.form1ResultsYear) || null,
        
        form2ResultsPdf: processedData.form2ResultsPdf || null,
        form2ResultsPdfName: processedData.form2ResultsPdfName || null,
        form2ResultsPdfSize: processedData.form2ResultsPdfSize || null,
        form2ResultsYear: parseInt(processedData.form2ResultsYear) || null,
        
        form3ResultsPdf: processedData.form3ResultsPdf || null,
        form3ResultsPdfName: processedData.form3ResultsPdfName || null,
        form3ResultsPdfSize: processedData.form3ResultsPdfSize || null,
        form3ResultsYear: parseInt(processedData.form3ResultsYear) || null,
        
        form4ResultsPdf: processedData.form4ResultsPdf || null,
        form4ResultsPdfName: processedData.form4ResultsPdfName || null,
        form4ResultsPdfSize: processedData.form4ResultsPdfSize || null,
        form4ResultsYear: parseInt(processedData.form4ResultsYear) || null,
        
        mockExamsResultsPdf: processedData.mockExamsResultsPdf || null,
        mockExamsPdfName: processedData.mockExamsPdfName || null,
        mockExamsPdfSize: processedData.mockExamsPdfSize || null,
        mockExamsYear: parseInt(processedData.mockExamsYear) || null,
        
        kcseResultsPdf: processedData.kcseResultsPdf || null,
        kcsePdfName: processedData.kcsePdfName || null,
        kcsePdfSize: processedData.kcsePdfSize || null,
        kcseYear: parseInt(processedData.kcseYear) || null,
        
        // Additional Results
        additionalResultsFiles: JSON.stringify(processedData.additionalResultsFiles || [])
      }
    });
    
    console.log('✅ School created successfully:', school.id);
    
    return NextResponse.json({
      success: true,
      message: "School information created successfully",
      school: cleanSchoolResponse(school)
    });
    
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🟡 UPDATE School Info
export async function PUT(request) {
  try {
    console.log('📨 PUT /api/school - Updating school info');
    
    const existing = await prisma.schoolInfo.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school info to update." },
        { status: 404 }
      );
    }
    
    // Parse request
    let data;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      data = await parseMultipartRequest(request);
    } else if (contentType.includes('application/json')) {
      data = await parseJsonRequest(request);
    } else {
      throw new Error('Unsupported content type');
    }
    
    // Start with existing data
    let updateData = {};
    
    // Process video updates
    if (data.videoFile || data.youtubeLink || data.removeVideo) {
      const videoResult = await handleVideoData({
        videoFile: data._files?.videoFile || data.videoFile,
        videoThumbnail: data._files?.videoThumbnail || data.videoThumbnail,
        youtubeLink: data.youtubeLink,
        removeVideo: data.removeVideo
      }, existing);
      
      updateData.videoTour = videoResult.videoTour;
      updateData.videoType = videoResult.videoType;
      updateData.videoThumbnail = videoResult.videoThumbnail;
    }
    
    // Process PDF updates
    const pdfFields = [
      'curriculumPDF', 'feesDayDistributionPdf', 'feesBoardingDistributionPdf',
      'admissionFeePdf', 'form1ResultsPdf', 'form2ResultsPdf', 'form3ResultsPdf',
      'form4ResultsPdf', 'mockExamsResultsPdf', 'kcseResultsPdf'
    ];
    
    for (const field of pdfFields) {
      const fileKey = field;
      const file = data._files?.[fileKey] || data[`${fileKey}File`];
      const removeFlag = data[`remove${field.charAt(0).toUpperCase() + field.slice(1)}`];
      
      if (file && file.size > 0) {
        const pdfResult = await handlePdfData(field, file, existing[field]);
        updateData[field] = pdfResult.pdf;
        updateData[`${field}Name`] = pdfResult.name;
        updateData[`${field}Size`] = pdfResult.size;
      } else if (removeFlag && existing[field]) {
        await deleteFromSupabase(existing[field]);
        updateData[field] = null;
        updateData[`${field}Name`] = null;
        updateData[`${field}Size`] = null;
      }
    }
    
    // Process additional files
    if (data.additionalFiles || data.filesToRemove) {
      const existingAdditional = existing.additionalResultsFiles ? 
        JSON.parse(existing.additionalResultsFiles) : [];
      
      const additionalResult = await handleAdditionalFiles({
        newFiles: data._files?.additionalFiles || data.additionalFiles,
        filesToRemove: data.filesToRemove,
        keepExisting: !data.replaceAllAdditional
      }, existingAdditional);
      
      updateData.additionalResultsFiles = JSON.stringify(additionalResult);
    }
    
    // Update text fields
    const textFields = [
      'name', 'description', 'motto', 'vision', 'mission',
      'admissionRequirements', 'admissionContactEmail', 'admissionContactPhone',
      'admissionWebsite', 'admissionLocation', 'admissionOfficeHours'
    ];
    
    textFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Update numeric fields
    const numericFields = [
      'studentCount', 'staffCount', 'feesDay', 'feesBoarding',
      'admissionFee', 'admissionCapacity'
    ];
    
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? parseInt(data[field]) : null;
      }
    });
    
    // Update date fields
    const dateFields = ['openDate', 'closeDate', 'admissionOpenDate', 'admissionCloseDate'];
    dateFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? new Date(data[field]) : null;
      }
    });
    
    // Update exam year fields
    const yearFields = [
      'form1ResultsYear', 'form2ResultsYear', 'form3ResultsYear',
      'form4ResultsYear', 'mockExamsYear', 'kcseYear'
    ];
    
    yearFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? parseInt(data[field]) : null;
      }
    });
    
    // Update JSON fields
    const jsonFields = [
      'subjects', 'departments', 'admissionDocumentsRequired',
      'feesDayDistributionJson', 'feesBoardingDistributionJson', 'admissionFeeDistribution'
    ];
    
    jsonFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = JSON.stringify(data[field] || (field.includes('Distribution') ? {} : []));
      }
    });
    
    // Add update timestamp
    updateData.updatedAt = new Date();
    
    // Update in database
    const updated = await prisma.schoolInfo.update({
      where: { id: existing.id },
      data: updateData
    });
    
    console.log('✅ School updated successfully:', updated.id);
    
    return NextResponse.json({
      success: true,
      message: "School information updated successfully",
      school: cleanSchoolResponse(updated)
    });
    
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🔵 GET School Info
export async function GET() {
  try {
    console.log('📨 GET /api/school - Fetching school info');
    
    const school = await prisma.schoolInfo.findFirst();
    
    if (!school) {
      return NextResponse.json(
        { success: false, message: "No school information found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      school: cleanSchoolResponse(school)
    });
    
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🔴 DELETE School Info
export async function DELETE() {
  try {
    console.log('📨 DELETE /api/school - Deleting school info');
    
    const existing = await prisma.schoolInfo.findFirst();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school information to delete" },
        { status: 404 }
      );
    }
    
    // Collect all files to delete
    const filesToDelete = [];
    
    // Video files
    if (existing.videoTour && existing.videoType === 'file') {
      filesToDelete.push(existing.videoTour);
    }
    if (existing.videoThumbnail) {
      filesToDelete.push(existing.videoThumbnail);
    }
    
    // PDF files
    const pdfFields = [
      'curriculumPDF', 'feesDayDistributionPdf', 'feesBoardingDistributionPdf',
      'admissionFeePdf', 'form1ResultsPdf', 'form2ResultsPdf', 'form3ResultsPdf',
      'form4ResultsPdf', 'mockExamsResultsPdf', 'kcseResultsPdf'
    ];
    
    pdfFields.forEach(field => {
      if (existing[field]) {
        filesToDelete.push(existing[field]);
      }
    });
    
    // Additional files
    if (existing.additionalResultsFiles) {
      try {
        const additionalFiles = JSON.parse(existing.additionalResultsFiles);
        additionalFiles.forEach(file => {
          if (file.url) filesToDelete.push(file.url);
        });
      } catch (e) {
        console.warn('Failed to parse additional files for deletion:', e);
      }
    }
    
    // Delete all files from Supabase
    console.log(`🗑️ Deleting ${filesToDelete.length} files from Supabase`);
    for (const file of filesToDelete) {
      await deleteFromSupabase(file);
    }
    
    // Delete from database
    await prisma.schoolInfo.delete({
      where: { id: existing.id }
    });
    
    console.log('✅ School deleted successfully:', existing.id);
    
    return NextResponse.json({
      success: true,
      message: "School information and all associated files deleted successfully"
    });
    
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Clean school response for frontend
 */
function cleanSchoolResponse(school) {
  const parseSafe = (jsonString, defaultValue = []) => {
    try {
      if (!jsonString) return defaultValue;
      if (typeof jsonString === 'object') return jsonString;
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  };
  
  return {
    id: school.id,
    name: school.name,
    description: school.description,
    motto: school.motto,
    vision: school.vision,
    mission: school.mission,
    
    // Video
    videoTour: school.videoTour,
    videoType: school.videoType,
    videoThumbnail: school.videoThumbnail,
    
    // Basic info
    studentCount: school.studentCount,
    staffCount: school.staffCount,
    openDate: school.openDate,
    closeDate: school.closeDate,
    
    // Subjects & Departments
    subjects: parseSafe(school.subjects, []),
    departments: parseSafe(school.departments, []),
    
    // Fee distributions
    feesDayDistribution: parseSafe(school.feesDayDistributionJson, {}),
    feesBoardingDistribution: parseSafe(school.feesBoardingDistributionJson, {}),
    admissionFeeDistribution: parseSafe(school.admissionFeeDistribution, {}),
    
    // Fees
    feesDay: school.feesDay,
    feesDayDistributionPdf: school.feesDayDistributionPdf,
    feesDayPdfName: school.feesDayPdfName,
    
    feesBoarding: school.feesBoarding,
    feesBoardingDistributionPdf: school.feesBoardingDistributionPdf,
    feesBoardingPdfName: school.feesBoardingPdfName,
    
    // Curriculum
    curriculumPDF: school.curriculumPDF,
    curriculumPdfName: school.curriculumPdfName,
    
    // Admission
    admissionOpenDate: school.admissionOpenDate,
    admissionCloseDate: school.admissionCloseDate,
    admissionRequirements: school.admissionRequirements,
    admissionFee: school.admissionFee,
    admissionCapacity: school.admissionCapacity,
    admissionContactEmail: school.admissionContactEmail,
    admissionContactPhone: school.admissionContactPhone,
    admissionWebsite: school.admissionWebsite,
    admissionLocation: school.admissionLocation,
    admissionOfficeHours: school.admissionOfficeHours,
    admissionDocumentsRequired: parseSafe(school.admissionDocumentsRequired, []),
    admissionFeePdf: school.admissionFeePdf,
    admissionFeePdfName: school.admissionFeePdfName,
    
    // Exam Results
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
    
    // Additional files
    additionalResultsFiles: parseSafe(school.additionalResultsFiles, []),
    
    // Timestamps
    createdAt: school.createdAt,
    updatedAt: school.updatedAt
  };
}

/**
 * Health check endpoint (optional)
 */
export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    message: "School API is running",
    endpoints: {
      GET: "Retrieve school information",
      POST: "Create school information (with file uploads)",
      PUT: "Update school information (with file management)",
      DELETE: "Delete school information and all files"
    },
    fileSupport: {
      maxSize: "100MB per file (Supabase limit)",
      supportedTypes: "All file types",
      storage: "Supabase Storage"
    }
  });
}