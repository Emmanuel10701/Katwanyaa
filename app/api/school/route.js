// app/api/school/enhanced/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { enhancedFileManager } from "@/libs/fileManager";

// Helper: Create file metadata object
function createFileMetadata(file, customMetadata = {}, fileType, category) {
  return {
    // Basic file info
    original_name: file.name,
    file_type: file.type,
    file_size: file.size,
    mime_type: file.type,
    file_extension: file.name.split('.').pop(),
    
    // Upload context
    uploaded_at: new Date().toISOString(),
    uploaded_by: 'system', // Get from auth
    
    // File categorization
    file_category: fileType,
    document_type: category,
    
    // School context
    academic_year: new Date().getFullYear(),
    is_official: true,
    version: 1,
    is_current: true,
    
    // Custom metadata
    ...customMetadata,
    
    // System metadata
    _system: {
      processing_status: 'complete',
      storage_provider: 'supabase',
      metadata_version: '2.0'
    }
  };
}

// Helper: File type to folder mapping
function getFolderByFileType(fileType) {
  const mappings = {
    curriculum: 'documents',
    fee_day: 'fee-documents',
    fee_boarding: 'fee-documents',
    admission_fee: 'admission-documents',
    video: 'videos',
    thumbnail: 'thumbnails',
    exam_result: 'exam-results',
    additional: 'additional-documents'
  };
  return mappings[fileType] || 'uploads';
}

// Helper: File type to Prisma field mapping
function getPrismaFieldByFileType(fileType, category = null) {
  const mappings = {
    curriculum: {
      urlField: 'curriculumPDF',
      nameField: 'curriculumPdfName',
      metadataField: 'curriculumPdfMetadata'
    },
    fee_day: {
      urlField: 'feesDayDistributionPdf',
      nameField: 'feesDayPdfName',
      metadataField: 'feesDayPdfMetadata'
    },
    fee_boarding: {
      urlField: 'feesBoardingDistributionPdf',
      nameField: 'feesBoardingPdfName',
      metadataField: 'feesBoardingPdfMetadata'
    },
    admission_fee: {
      urlField: 'admissionFeePdf',
      nameField: 'admissionFeePdfName',
      metadataField: 'admissionFeePdfMetadata'
    },
    video: {
      urlField: 'videoTour',
      nameField: null,
      metadataField: 'videoMetadata'
    },
    thumbnail: {
      urlField: 'videoThumbnail',
      nameField: null,
      metadataField: 'thumbnailMetadata'
    },
    exam_result: {
      urlField: category ? `${category}ResultsPdf` : null,
      nameField: category ? `${category}ResultsPdfName` : null,
      metadataField: category ? `${category}ResultsMetadata` : null
    }
  };
  
  return mappings[fileType] || {};
}

// ==================== ENHANCED API ENDPOINTS ====================

// GET: Fetch school with enhanced file metadata
export async function GET() {
  try {
    const school = await prisma.schoolInfo.findFirst();
    
    if (!school) {
      return NextResponse.json(
        { success: false, message: "No school found" },
        { status: 404 }
      );
    }
    
    // Enhance with file metadata from Supabase
    const enhancedSchool = await enhanceSchoolWithFileMetadata(school);
    
    return NextResponse.json({
      success: true,
      school: enhancedSchool
    });
    
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create school with file metadata
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Check existing school
    const existing = await prisma.schoolInfo.findFirst();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "School already exists" },
        { status: 400 }
      );
    }
    
    // Process file uploads and metadata
    const fileUploads = await processFileUploads(data);
    
    // Create school with metadata
    const school = await prisma.schoolInfo.create({
      data: {
        // Basic info
        name: data.name,
        description: data.description || null,
        motto: data.motto || null,
        vision: data.vision || null,
        mission: data.mission || null,
        
        // Video info with metadata
        videoTour: fileUploads.video?.url || data.videoTour,
        videoType: data.videoType || (fileUploads.video ? 'file' : null),
        videoThumbnail: fileUploads.thumbnail?.url || data.videoThumbnail,
        videoMetadata: fileUploads.video?.metadata || null,
        thumbnailMetadata: fileUploads.thumbnail?.metadata || null,
        
        // Basic counts
        studentCount: parseInt(data.studentCount) || 0,
        staffCount: parseInt(data.staffCount) || 0,
        openDate: new Date(data.openDate) || new Date(),
        closeDate: new Date(data.closeDate) || new Date(),
        
        // JSON arrays
        subjects: JSON.stringify(data.subjects || []),
        departments: JSON.stringify(data.departments || []),
        admissionDocumentsRequired: JSON.stringify(data.admissionDocumentsRequired || []),
        
        // Fee distributions
        feesDayDistributionJson: JSON.stringify(data.feesDayDistribution || {}),
        feesBoardingDistributionJson: JSON.stringify(data.feesBoardingDistribution || {}),
        admissionFeeDistribution: JSON.stringify(data.admissionFeeDistribution || {}),
        
        // Curriculum with metadata
        curriculumPDF: fileUploads.curriculum?.url || data.curriculumPDF,
        curriculumPdfName: fileUploads.curriculum?.originalName || data.curriculumPdfName,
        curriculumPdfMetadata: fileUploads.curriculum?.metadata || null,
        
        // Fee documents with metadata
        feesDayDistributionPdf: fileUploads.fee_day?.url || data.feesDayDistributionPdf,
        feesDayPdfName: fileUploads.fee_day?.originalName || data.feesDayPdfName,
        feesDayPdfMetadata: fileUploads.fee_day?.metadata || null,
        
        feesBoardingDistributionPdf: fileUploads.fee_boarding?.url || data.feesBoardingDistributionPdf,
        feesBoardingPdfName: fileUploads.fee_boarding?.originalName || data.feesBoardingPdfName,
        feesBoardingPdfMetadata: fileUploads.fee_boarding?.metadata || null,
        
        // Admission fee with metadata
        admissionFeePdf: fileUploads.admission_fee?.url || data.admissionFeePdf,
        admissionFeePdfName: fileUploads.admission_fee?.originalName || data.admissionFeePdfName,
        admissionFeePdfMetadata: fileUploads.admission_fee?.metadata || null,
        
        // Admission info
        admissionOpenDate: data.admissionOpenDate ? new Date(data.admissionOpenDate) : null,
        admissionCloseDate: data.admissionCloseDate ? new Date(data.admissionCloseDate) : null,
        admissionRequirements: data.admissionRequirements || null,
        admissionFee: parseFloat(data.admissionFee) || null,
        admissionCapacity: parseInt(data.admissionCapacity) || null,
        admissionContactEmail: data.admissionContactEmail || null,
        admissionContactPhone: data.admissionContactPhone || null,
        admissionWebsite: data.admissionWebsite || null,
        admissionLocation: data.admissionLocation || null,
        admissionOfficeHours: data.admissionOfficeHours || null,
        
        // Exam results with metadata (process each exam)
        ...await processExamResults(data, fileUploads),
        
        // Additional files
        additionalResultsFiles: JSON.stringify(fileUploads.additional_files || []),
        additionalFilesMetadata: JSON.stringify(
          (fileUploads.additional_files || []).map(f => f.metadata) || []
        ),
        
        // File tracking
        totalFileCount: calculateTotalFiles(fileUploads),
        totalFileSizeBytes: calculateTotalFileSize(fileUploads),
        fileStorageSummary: JSON.stringify(createStorageSummary(fileUploads))
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "School created with enhanced metadata",
      school: await enhanceSchoolWithFileMetadata(school)
    });
    
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update school with proper file linking
export async function PUT(request) {
  try {
    const data = await request.json();
    const existing = await prisma.schoolInfo.findFirst();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }
    
    // Process file updates with metadata
    const fileUpdates = await processFileUpdates(data, existing);
    
    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
      lastFileUpdate: new Date()
    };
    
    // Update basic fields
    const basicFields = [
      'name', 'description', 'motto', 'vision', 'mission',
      'studentCount', 'staffCount', 'admissionRequirements',
      'admissionContactEmail', 'admissionContactPhone',
      'admissionWebsite', 'admissionLocation', 'admissionOfficeHours'
    ];
    
    basicFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Update dates
    const dateFields = ['openDate', 'closeDate', 'admissionOpenDate', 'admissionCloseDate'];
    dateFields.forEach(field => {
      if (data[field]) {
        updateData[field] = new Date(data[field]);
      }
    });
    
    // Update JSON fields
    const jsonFields = [
      'subjects', 'departments', 'admissionDocumentsRequired',
      'feesDayDistributionJson', 'feesBoardingDistributionJson', 'admissionFeeDistribution'
    ];
    
    jsonFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = JSON.stringify(data[field]);
      }
    });
    
    // Update numeric fields
    const numericFields = ['admissionFee', 'admissionCapacity'];
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? parseFloat(data[field]) : null;
      }
    });
    
    // Update file fields from uploads
    Object.entries(fileUpdates).forEach(([fileType, uploadResult]) => {
      if (uploadResult) {
        const prismaFields = getPrismaFieldByFileType(fileType, uploadResult.category);
        
        if (prismaFields.urlField) {
          updateData[prismaFields.urlField] = uploadResult.url;
        }
        if (prismaFields.nameField && uploadResult.originalName) {
          updateData[prismaFields.nameField] = uploadResult.originalName;
        }
        if (prismaFields.metadataField && uploadResult.metadata) {
          updateData[prismaFields.metadataField] = uploadResult.metadata;
        }
      }
    });
    
    // Update exam year fields
    const examYearFields = [
      'form1ResultsYear', 'form2ResultsYear', 'form3ResultsYear',
      'form4ResultsYear', 'mockExamsYear', 'kcseYear'
    ];
    
    examYearFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? parseInt(data[field]) : null;
      }
    });
    
    // Update additional files if provided
    if (data.additionalResultsFiles || fileUpdates.additional_files) {
      const existingAdditional = existing.additionalResultsFiles ? 
        JSON.parse(existing.additionalResultsFiles) : [];
      
      const newAdditional = fileUpdates.additional_files || data.additionalResultsFiles || [];
      const allAdditional = [...existingAdditional, ...newAdditional];
      
      updateData.additionalResultsFiles = JSON.stringify(allAdditional);
      updateData.additionalFilesMetadata = JSON.stringify(
        allAdditional.map(f => f.metadata || {})
      );
    }
    
    // Update file statistics
    const currentFiles = await getCurrentFiles(existing);
    const newFiles = Object.values(fileUpdates).filter(f => f);
    const allFiles = [...currentFiles, ...newFiles];
    
    updateData.totalFileCount = allFiles.length;
    updateData.totalFileSizeBytes = allFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    
    // Save to database
    const updatedSchool = await prisma.schoolInfo.update({
      where: { id: existing.id },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      message: "School updated with enhanced file metadata",
      school: await enhanceSchoolWithFileMetadata(updatedSchool)
    });
    
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

async function processFileUploads(data) {
  const uploads = {};
  
  // Process curriculum PDF
  if (data.curriculumPDF && data.curriculumPDF instanceof File) {
    const metadata = createFileMetadata(
      data.curriculumPDF, 
      { document_title: 'School Curriculum' },
      'curriculum',
      'academic_curriculum'
    );
    
    uploads.curriculum = await enhancedFileManager.uploadFileWithMetadata(
      data.curriculumPDF,
      'documents',
      metadata
    );
  }
  
  // Process video
  if (data.videoFile && data.videoFile instanceof File) {
    const metadata = createFileMetadata(
      data.videoFile,
      { media_type: 'school_tour', has_thumbnail: !!data.videoThumbnail },
      'video',
      'virtual_tour'
    );
    
    uploads.video = await enhancedFileManager.uploadFileWithMetadata(
      data.videoFile,
      'videos',
      metadata
    );
  }
  
  // Process thumbnail
  if (data.videoThumbnail && data.videoThumbnail instanceof File) {
    const metadata = createFileMetadata(
      data.videoThumbnail,
      { parent_video: data.videoFile?.name, is_custom: true },
      'thumbnail',
      'video_thumbnail'
    );
    
    uploads.thumbnail = await enhancedFileManager.uploadFileWithMetadata(
      data.videoThumbnail,
      'thumbnails',
      metadata
    );
  }
  
  // Process exam results
  const examTypes = ['form1', 'form2', 'form3', 'form4', 'mockExams', 'kcse'];
  for (const examType of examTypes) {
    const fileKey = `${examType}ResultsPdf`;
    if (data[fileKey] && data[fileKey] instanceof File) {
      const metadata = createFileMetadata(
        data[fileKey],
        { 
          exam_type: examType,
          exam_year: data[`${examType}Year`] || new Date().getFullYear(),
          grading_system: 'kcse'
        },
        'exam_result',
        examType
      );
      
      uploads[`exam_${examType}`] = await enhancedFileManager.uploadFileWithMetadata(
        data[fileKey],
        'exam-results',
        metadata
      );
    }
  }
  
  // Process additional files
  if (data.additionalFiles && Array.isArray(data.additionalFiles)) {
    uploads.additional_files = await Promise.all(
      data.additionalFiles.map(async (fileObj) => {
        const metadata = createFileMetadata(
          fileObj.file,
          {
            year: fileObj.year,
            description: fileObj.description,
            is_supplementary: true
          },
          'additional',
          'supplementary'
        );
        
        const result = await enhancedFileManager.uploadFileWithMetadata(
          fileObj.file,
          'additional-documents',
          metadata
        );
        
        return {
          ...result,
          year: fileObj.year,
          description: fileObj.description
        };
      })
    );
  }
  
  return uploads;
}

async function processFileUpdates(data, existingSchool) {
  const updates = {};
  
  // Helper: Update a specific file
  const updateFile = async (fileKey, fileType, category, customMetadata = {}) => {
    if (data[fileKey] && data[fileKey] instanceof File) {
      const existingUrl = existingSchool[getPrismaFieldByFileType(fileType, category)?.urlField];
      
      const metadata = createFileMetadata(
        data[fileKey],
        {
          ...customMetadata,
          previous_version: existingUrl ? extractPathFromUrl(existingUrl) : null,
          version: (existingUrl ? 2 : 1)
        },
        fileType,
        category
      );
      
      return await enhancedFileManager.uploadFileWithMetadata(
        data[fileKey],
        getFolderByFileType(fileType),
        metadata
      );
    }
    return null;
  };
  
  // Check for file updates
  updates.curriculum = await updateFile(
    'curriculumPDF',
    'curriculum',
    'academic_curriculum',
    { document_title: 'School Curriculum' }
  );
  
  updates.video = await updateFile(
    'videoFile',
    'video',
    'virtual_tour',
    { media_type: 'school_tour' }
  );
  
  // Process exam updates
  const examTypes = ['form1', 'form2', 'form3', 'form4', 'mockExams', 'kcse'];
  for (const examType of examTypes) {
    const fileKey = `${examType}ResultsPdf`;
    updates[`exam_${examType}`] = await updateFile(
      fileKey,
      'exam_result',
      examType,
      {
        exam_type: examType,
        exam_year: data[`${examType}Year`] || new Date().getFullYear()
      }
    );
  }
  
  return updates;
}

async function enhanceSchoolWithFileMetadata(school) {
  const enhanced = { ...school };
  
  // Helper to enhance a file field with metadata
  const enhanceFileField = async (urlField, metadataField, fileType) => {
    if (school[urlField]) {
      try {
        const path = extractPathFromUrl(school[urlField]);
        if (path) {
          const supabaseMetadata = await enhancedFileManager.getFileMetadata(path);
          
          // Combine database metadata with Supabase metadata
          enhanced[metadataField] = {
            ...(school[metadataField] || {}),
            ...supabaseMetadata,
            signed_url: await enhancedFileManager.getSignedUrl(path, 3600),
            download_info: {
              filename: extractFilenameFromUrl(school[urlField]),
              url: school[urlField],
              signed_url: await enhancedFileManager.getSignedUrl(path, 3600),
              expires_at: new Date(Date.now() + 3600000).toISOString()
            }
          };
        }
      } catch (error) {
        console.warn(`Could not enhance ${urlField}:`, error.message);
      }
    }
  };
  
  // Enhance all file fields
  await enhanceFileField('curriculumPDF', 'curriculumPdfMetadata', 'curriculum');
  await enhanceFileField('feesDayDistributionPdf', 'feesDayPdfMetadata', 'fee_day');
  await enhanceFileField('feesBoardingDistributionPdf', 'feesBoardingPdfMetadata', 'fee_boarding');
  await enhanceFileField('admissionFeePdf', 'admissionFeePdfMetadata', 'admission_fee');
  await enhanceFileField('videoTour', 'videoMetadata', 'video');
  await enhanceFileField('videoThumbnail', 'thumbnailMetadata', 'thumbnail');
  
  // Enhance exam results
  const examTypes = ['form1', 'form2', 'form3', 'form4', 'mockExams', 'kcse'];
  for (const examType of examTypes) {
    const urlField = `${examType}ResultsPdf`;
    const metadataField = `${examType}ResultsMetadata`;
    await enhanceFileField(urlField, metadataField, 'exam_result');
  }
  
  // Parse JSON fields
  const jsonFields = [
    'subjects', 'departments', 'admissionDocumentsRequired',
    'feesDayDistributionJson', 'feesBoardingDistributionJson', 
    'admissionFeeDistribution', 'additionalResultsFiles',
    'additionalFilesMetadata'
  ];
  
  jsonFields.forEach(field => {
    if (school[field]) {
      try {
        enhanced[field] = JSON.parse(school[field]);
      } catch {
        enhanced[field] = school[field];
      }
    }
  });
  
  // Add file statistics
  enhanced.fileStatistics = {
    total_files: school.totalFileCount || 0,
    total_size_bytes: school.totalFileSizeBytes || 0,
    total_size_mb: school.totalFileSizeBytes ? (school.totalFileSizeBytes / 1024 / 1024).toFixed(2) : 0,
    last_updated: school.lastFileUpdate
  };
  
  return enhanced;
}

function extractPathFromUrl(url) {
  if (!url) return null;
  const match = url.match(/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return url; // Assume it's already a path
}

function extractFilenameFromUrl(url) {
  if (!url) return null;
  const path = extractPathFromUrl(url);
  return path ? path.split('/').pop() : null;
}

function calculateTotalFiles(uploads) {
  return Object.values(uploads).reduce((count, upload) => {
    if (Array.isArray(upload)) {
      return count + upload.length;
    }
    return count + (upload ? 1 : 0);
  }, 0);
}

function calculateTotalFileSize(uploads) {
  return Object.values(uploads).reduce((size, upload) => {
    if (Array.isArray(upload)) {
      return size + upload.reduce((sum, file) => sum + (file.size || 0), 0);
    }
    return size + (upload?.size || 0);
  }, 0);
}

function createStorageSummary(uploads) {
  const summary = {
    by_type: {},
    by_folder: {},
    total_count: 0,
    total_size_bytes: 0
  };
  
  Object.entries(uploads).forEach(([type, upload]) => {
    if (Array.isArray(upload)) {
      upload.forEach(file => {
        const folder = file.folder || 'uploads';
        summary.by_type[type] = (summary.by_type[type] || 0) + 1;
        summary.by_folder[folder] = (summary.by_folder[folder] || 0) + 1;
        summary.total_count++;
        summary.total_size_bytes += file.size || 0;
      });
    } else if (upload) {
      const folder = upload.folder || 'uploads';
      summary.by_type[type] = (summary.by_type[type] || 0) + 1;
      summary.by_folder[folder] = (summary.by_folder[folder] || 0) + 1;
      summary.total_count++;
      summary.total_size_bytes += upload.size || 0;
    }
  });
  
  return summary;
}

async function getCurrentFiles(school) {
  const files = [];
  
  // Helper to add file info
  const addFile = async (url, type, metadata = {}) => {
    if (url) {
      const path = extractPathFromUrl(url);
      if (path) {
        try {
          const fileMetadata = await enhancedFileManager.getFileMetadata(path);
          files.push({
            url,
            path,
            type,
            size: fileMetadata?.file_size,
            metadata: { ...metadata, ...fileMetadata }
          });
        } catch (error) {
          files.push({ url, path, type, metadata });
        }
      }
    }
  };
  
  // Add all file types
  await addFile(school.curriculumPDF, 'curriculum');
  await addFile(school.feesDayDistributionPdf, 'fee_day');
  await addFile(school.feesBoardingDistributionPdf, 'fee_boarding');
  await addFile(school.admissionFeePdf, 'admission_fee');
  await addFile(school.videoTour, 'video');
  await addFile(school.videoThumbnail, 'thumbnail');
  
  // Add exam files
  const examTypes = ['form1', 'form2', 'form3', 'form4', 'mockExams', 'kcse'];
  examTypes.forEach(async (examType) => {
    const url = school[`${examType}ResultsPdf`];
    if (url) {
      await addFile(url, 'exam_result', { exam_type: examType });
    }
  });
  
  // Add additional files
  if (school.additionalResultsFiles) {
    try {
      const additionalFiles = JSON.parse(school.additionalResultsFiles);
      additionalFiles.forEach(file => {
        if (file.url) {
          files.push({
            url: file.url,
            type: 'additional',
            size: file.size,
            metadata: file.metadata || {}
          });
        }
      });
    } catch (error) {
      console.warn('Could not parse additional files:', error);
    }
  }
  
  return files;
}

async function processExamResults(data, fileUploads) {
  const result = {};
  const examTypes = ['form1', 'form2', 'form3', 'form4', 'mockExams', 'kcse'];
  
  for (const examType of examTypes) {
    const fileKey = `${examType}ResultsPdf`;
    const yearKey = `${examType}Year`;
    const metadataKey = `${examType}ResultsMetadata`;
    const nameKey = `${examType}ResultsPdfName`;
    const sizeKey = `${examType}ResultsPdfSize`;
    
    const uploadKey = `exam_${examType}`;
    
    if (fileUploads[uploadKey]) {
      result[fileKey] = fileUploads[uploadKey].url;
      result[nameKey] = fileUploads[uploadKey].originalName;
      result[sizeKey] = fileUploads[uploadKey].size;
      result[metadataKey] = fileUploads[uploadKey].metadata;
    } else if (data[fileKey]) {
      result[fileKey] = data[fileKey];
    }
    
    if (data[yearKey] !== undefined) {
      result[yearKey] = data[yearKey] ? parseInt(data[yearKey]) : null;
    }
  }
  
  return result;
}