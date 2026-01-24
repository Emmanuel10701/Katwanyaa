// app/api/school/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { enhancedFileManager } from "@/libs/fileManager";

// ==================== HELPER FUNCTIONS ====================

// Helper: Parse JSON fields from database
function parseJsonFields(school) {
  if (!school) return school;
  
  const jsonFields = [
    'subjects', 'departments', 'admissionDocumentsRequired',
    'feesDayDistributionJson', 'feesBoardingDistributionJson', 
    'admissionFeeDistribution', 'additionalResultsFiles',
    'additionalFilesMetadata', 'fileStorageSummary',
    'fileOperationsHistory', 'fileVersions', 'fileAccessLog',
    'fileMappings', 'fileCategories', 'storageConfig',
    'fileIntegrityChecks', 'retentionPolicy', 'systemMetadata',
    'videoMetadata', 'thumbnailMetadata',
    'curriculumPdfMetadata', 'feesDayPdfMetadata',
    'feesBoardingPdfMetadata', 'admissionFeePdfMetadata',
    'form1ResultsMetadata', 'form2ResultsMetadata',
    'form3ResultsMetadata', 'form4ResultsMetadata',
    'mockExamsMetadata', 'kcseMetadata'
  ];
  
  const parsed = { ...school };
  
  jsonFields.forEach(field => {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch (e) {
        console.warn(`Failed to parse ${field}:`, e.message);
        parsed[field] = null;
      }
    }
  });
  
  // Convert BigInt to Number for frontend
  if (parsed.totalFileSizeBytes && typeof parsed.totalFileSizeBytes === 'bigint') {
    parsed.totalFileSizeBytes = Number(parsed.totalFileSizeBytes);
    parsed.totalFileSizeMB = Number(parsed.totalFileSizeBytes) / (1024 * 1024);
  }
  
  return parsed;
}

// Helper: Prepare data for database
function prepareForDatabase(data) {
  const prepared = { ...data };
  
  // Stringify JSON fields
  const jsonFields = [
    'subjects', 'departments', 'admissionDocumentsRequired',
    'feesDayDistribution', 'feesDayDistributionJson',
    'feesBoardingDistribution', 'feesBoardingDistributionJson',
    'admissionFeeDistribution', 'additionalResultsFiles',
    'additionalFilesMetadata', 'videoMetadata', 'thumbnailMetadata',
    'curriculumPdfMetadata', 'feesDayPdfMetadata',
    'feesBoardingPdfMetadata', 'admissionFeePdfMetadata',
    'form1ResultsMetadata', 'form2ResultsMetadata',
    'form3ResultsMetadata', 'form4ResultsMetadata',
    'mockExamsMetadata', 'kcseMetadata'
  ];
  
  jsonFields.forEach(field => {
    if (prepared[field] && typeof prepared[field] === 'object') {
      prepared[field] = JSON.stringify(prepared[field]);
    }
  });
  
  // Convert numeric fields
  const numericFields = [
    'studentCount', 'staffCount', 'admissionCapacity',
    'feesDay', 'feesBoarding', 'admissionFee',
    'form1ResultsYear', 'form2ResultsYear', 'form3ResultsYear',
    'form4ResultsYear', 'mockExamsYear', 'kcseYear'
  ];
  
  numericFields.forEach(field => {
    if (prepared[field] !== undefined) {
      prepared[field] = prepared[field] ? parseInt(prepared[field]) : null;
    }
  });
  
  // Convert date fields
  const dateFields = [
    'openDate', 'closeDate', 'admissionOpenDate', 'admissionCloseDate'
  ];
  
  dateFields.forEach(field => {
    if (prepared[field]) {
      prepared[field] = new Date(prepared[field]);
    }
  });
  
  return prepared;
}

// Helper: Calculate total file size from URLs
async function calculateFileStatsFromUrls(data) {
  let totalCount = 0;
  let totalSizeBytes = 0;
  const fileUrls = [];
  
  // Collect all file URLs
  const urlFields = [
    'videoTour', 'videoThumbnail', 'curriculumPDF',
    'feesDayDistributionPdf', 'feesBoardingDistributionPdf',
    'admissionFeePdf', 'form1ResultsPdf', 'form2ResultsPdf',
    'form3ResultsPdf', 'form4ResultsPdf', 'mockExamsResultsPdf',
    'kcseResultsPdf'
  ];
  
  urlFields.forEach(field => {
    if (data[field]) {
      totalCount++;
      fileUrls.push(data[field]);
    }
  });
  
  // Check additional files
  if (data.additionalResultsFiles && Array.isArray(data.additionalResultsFiles)) {
    data.additionalResultsFiles.forEach(file => {
      if (file.url) {
        totalCount++;
        fileUrls.push(file.url);
      }
    });
  }
  
  // Try to get file sizes from Supabase metadata
  try {
    for (const url of fileUrls) {
      const path = extractPathFromUrl(url);
      if (path) {
        const metadata = await enhancedFileManager.getFileMetadata(path);
        if (metadata?.file_size) {
          totalSizeBytes += parseInt(metadata.file_size);
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch file sizes from Supabase:', error.message);
  }
  
  return {
    totalCount,
    totalSizeBytes,
    totalSizeMB: totalSizeBytes / (1024 * 1024)
  };
}

// Helper: Extract path from Supabase URL
function extractPathFromUrl(url) {
  if (!url) return null;
  
  // Handle different Supabase URL formats
  const patterns = [
    /storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/,
    /storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/,
    /katwanyaa-high\.storage\.supabase\.in\/storage\/v1\/object\/public\/Katwanyaa%20High\/(.+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  
  // If no pattern matches, assume it's already a path
  return url;
}

// Helper: Create file storage summary
function createFileStorageSummary(data) {
  const summary = {
    videos: 0,
    pdfs: 0,
    images: 0,
    by_category: {},
    total_count: 0,
    last_updated: new Date().toISOString()
  };
  
  // Count files by type
  if (data.videoTour) summary.videos++;
  if (data.videoThumbnail) summary.images++;
  
  // Count PDFs
  const pdfFields = [
    'curriculumPDF', 'feesDayDistributionPdf', 'feesBoardingDistributionPdf',
    'admissionFeePdf', 'form1ResultsPdf', 'form2ResultsPdf',
    'form3ResultsPdf', 'form4ResultsPdf', 'mockExamsResultsPdf',
    'kcseResultsPdf'
  ];
  
  pdfFields.forEach(field => {
    if (data[field]) summary.pdfs++;
  });
  
  // Count additional files
  if (data.additionalResultsFiles && Array.isArray(data.additionalResultsFiles)) {
    data.additionalResultsFiles.forEach(file => {
      if (file.url) {
        if (file.type?.includes('pdf')) summary.pdfs++;
        else if (file.type?.includes('image')) summary.images++;
        else if (file.type?.includes('video')) summary.videos++;
      }
    });
  }
  
  summary.total_count = summary.videos + summary.pdfs + summary.images;
  
  return summary;
}

// ==================== API ENDPOINTS ====================

// GET: Fetch school information
export async function GET() {
  try {
    console.log('🔍 Fetching school info...');
    
    // Note: Using school_info (lowercase) because of @@map("school_info")
    const school = await prisma.school_info.findFirst();
    
    if (!school) {
      console.log('📭 No school found');
      return NextResponse.json({
        success: true,
        school: null,
        message: "No school information found"
      });
    }
    
    console.log('✅ School found, parsing JSON fields...');
    
    // Parse JSON fields
    const parsedSchool = parseJsonFields(school);
    
    return NextResponse.json({
      success: true,
      school: parsedSchool,
      message: "School information retrieved successfully"
    });
    
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to fetch school information"
      },
      { status: 500 }
    );
  }
}

// POST: Create new school (receives URLs only)
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('📥 POST Data received:', Object.keys(data));
    
    // Check if school already exists
    const existing = await prisma.school_info.findFirst();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "School already exists. Use PUT to update." },
        { status: 400 }
      );
    }
    
    // Calculate file statistics
    const fileStats = await calculateFileStatsFromUrls(data);
    const fileStorageSummary = createFileStorageSummary(data);
    
    // Prepare data for database
    const schoolData = {
      // Basic info
      name: data.name || '',
      description: data.description || null,
      motto: data.motto || null,
      vision: data.vision || null,
      mission: data.mission || null,
      
      // Video info (URLs only)
      videoTour: data.videoTour || data.videoUrl || null,
      videoType: data.videoType || (data.videoTour ? 'file' : (data.youtubeLink ? 'youtube' : null)),
      videoThumbnail: data.videoThumbnail || null,
      videoMetadata: data.videoMetadata ? JSON.stringify(data.videoMetadata) : null,
      thumbnailMetadata: data.thumbnailMetadata ? JSON.stringify(data.thumbnailMetadata) : null,
      
      // Academic info
      studentCount: data.studentCount ? parseInt(data.studentCount) : 0,
      staffCount: data.staffCount ? parseInt(data.staffCount) : 0,
      openDate: data.openDate ? new Date(data.openDate) : new Date(),
      closeDate: data.closeDate ? new Date(data.closeDate) : new Date(),
      
      // JSON arrays
      subjects: JSON.stringify(data.subjects || []),
      departments: JSON.stringify(data.departments || []),
      
      // Fee info
      feesDay: data.feesDay ? parseFloat(data.feesDay) : null,
      feesDayDistributionJson: JSON.stringify(data.feesDayDistribution || {}),
      
      feesBoarding: data.feesBoarding ? parseFloat(data.feesBoarding) : null,
      feesBoardingDistributionJson: JSON.stringify(data.feesBoardingDistribution || {}),
      
      // Curriculum (URL only)
      curriculumPDF: data.curriculumPDF || null,
      curriculumPdfName: data.curriculumPdfName || null,
      curriculumPdfMetadata: data.curriculumPdfMetadata ? JSON.stringify(data.curriculumPdfMetadata) : null,
      
      // Day fees (URL only)
      feesDayDistributionPdf: data.feesDayDistributionPdf || null,
      feesDayPdfName: data.feesDayPdfName || null,
      feesDayPdfMetadata: data.feesDayPdfMetadata ? JSON.stringify(data.feesDayPdfMetadata) : null,
      
      // Boarding fees (URL only)
      feesBoardingDistributionPdf: data.feesBoardingDistributionPdf || null,
      feesBoardingPdfName: data.feesBoardingPdfName || null,
      feesBoardingPdfMetadata: data.feesBoardingPdfMetadata ? JSON.stringify(data.feesBoardingPdfMetadata) : null,
      
      // Admission info
      admissionOpenDate: data.admissionOpenDate ? new Date(data.admissionOpenDate) : null,
      admissionCloseDate: data.admissionCloseDate ? new Date(data.admissionCloseDate) : null,
      admissionRequirements: data.admissionRequirements || null,
      admissionFee: data.admissionFee ? parseFloat(data.admissionFee) : null,
      admissionFeeDistribution: JSON.stringify(data.admissionFeeDistribution || {}),
      admissionCapacity: data.admissionCapacity ? parseInt(data.admissionCapacity) : null,
      admissionContactEmail: data.admissionContactEmail || null,
      admissionContactPhone: data.admissionContactPhone || null,
      admissionWebsite: data.admissionWebsite || null,
      admissionLocation: data.admissionLocation || null,
      admissionOfficeHours: data.admissionOfficeHours || null,
      admissionDocumentsRequired: JSON.stringify(data.admissionDocumentsRequired || []),
      
      // Admission fee PDF (URL only)
      admissionFeePdf: data.admissionFeePdf || null,
      admissionFeePdfName: data.admissionFeePdfName || null,
      admissionFeePdfMetadata: data.admissionFeePdfMetadata ? JSON.stringify(data.admissionFeePdfMetadata) : null,
      
      // Exam results (URLs only)
      form1ResultsPdf: data.form1ResultsPdf || null,
      form1ResultsPdfName: data.form1ResultsPdfName || null,
      form1ResultsYear: data.form1ResultsYear ? parseInt(data.form1ResultsYear) : null,
      form1ResultsMetadata: data.form1ResultsMetadata ? JSON.stringify(data.form1ResultsMetadata) : null,
      
      form2ResultsPdf: data.form2ResultsPdf || null,
      form2ResultsPdfName: data.form2ResultsPdfName || null,
      form2ResultsYear: data.form2ResultsYear ? parseInt(data.form2ResultsYear) : null,
      form2ResultsMetadata: data.form2ResultsMetadata ? JSON.stringify(data.form2ResultsMetadata) : null,
      
      form3ResultsPdf: data.form3ResultsPdf || null,
      form3ResultsPdfName: data.form3ResultsPdfName || null,
      form3ResultsYear: data.form3ResultsYear ? parseInt(data.form3ResultsYear) : null,
      form3ResultsMetadata: data.form3ResultsMetadata ? JSON.stringify(data.form3ResultsMetadata) : null,
      
      form4ResultsPdf: data.form4ResultsPdf || null,
      form4ResultsPdfName: data.form4ResultsPdfName || null,
      form4ResultsYear: data.form4ResultsYear ? parseInt(data.form4ResultsYear) : null,
      form4ResultsMetadata: data.form4ResultsMetadata ? JSON.stringify(data.form4ResultsMetadata) : null,
      
      mockExamsResultsPdf: data.mockExamsResultsPdf || null,
      mockExamsPdfName: data.mockExamsPdfName || null,
      mockExamsYear: data.mockExamsYear ? parseInt(data.mockExamsYear) : null,
      mockExamsMetadata: data.mockExamsMetadata ? JSON.stringify(data.mockExamsMetadata) : null,
      
      kcseResultsPdf: data.kcseResultsPdf || null,
      kcsePdfName: data.kcsePdfName || null,
      kcseYear: data.kcseYear ? parseInt(data.kcseYear) : null,
      kcseMetadata: data.kcseMetadata ? JSON.stringify(data.kcseMetadata) : null,
      
      // Additional files
      additionalResultsFiles: JSON.stringify(data.additionalResultsFiles || []),
      additionalFilesMetadata: JSON.stringify(data.additionalFilesMetadata || []),
      
      // File statistics
      totalFileCount: fileStats.totalCount,
      totalFileSizeBytes: BigInt(fileStats.totalSizeBytes),
      totalFileSizeMB: fileStats.totalSizeMB,
      
      // File storage summary
      fileStorageSummary: JSON.stringify(fileStorageSummary),
      fileOperationsHistory: JSON.stringify([{
        action: 'create',
        timestamp: new Date().toISOString(),
        files_count: fileStats.totalCount,
        total_size_mb: fileStats.totalSizeMB
      }]),
      
      // System metadata
      systemMetadata: JSON.stringify({
        schemaVersion: '2.0',
        hasEnhancedMetadata: true,
        createdAt: new Date().toISOString()
      }),
      
      // Audit
      lastFileUpdate: new Date(),
      lastFileUpdateBy: 'system',
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 Creating school with data:', {
      name: schoolData.name,
      fileCount: schoolData.totalFileCount,
      totalSizeMB: schoolData.totalFileSizeMB
    });
    
    // Create school in database
    const school = await prisma.school_info.create({
      data: schoolData
    });
    
    console.log('✅ School created with ID:', school.id);
    
    return NextResponse.json({
      success: true,
      message: "School information created successfully",
      school: parseJsonFields(school)
    });
    
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to create school information"
      },
      { status: 500 }
    );
  }
}

// PUT: Update school (receives URLs only)
export async function PUT(request) {
  try {
    const data = await request.json();
    console.log('📥 PUT Data received:', Object.keys(data));
    
    // Check if school exists
    const existing = await prisma.school_info.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "School not found. Use POST to create." },
        { status: 404 }
      );
    }
    
    // Calculate file statistics
    const fileStats = await calculateFileStatsFromUrls(data);
    const fileStorageSummary = createFileStorageSummary(data);
    
    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
      lastFileUpdate: new Date(),
      lastFileUpdateBy: 'system'
    };
    
    // Update basic fields if provided
    const basicFields = [
      'name', 'description', 'motto', 'vision', 'mission',
      'admissionRequirements', 'admissionContactEmail',
      'admissionContactPhone', 'admissionWebsite',
      'admissionLocation', 'admissionOfficeHours'
    ];
    
    basicFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Update numeric fields
    const numericFields = [
      'studentCount', 'staffCount', 'admissionCapacity',
      'feesDay', 'feesBoarding', 'admissionFee'
    ];
    
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? parseInt(data[field]) : null;
      }
    });
    
    // Update date fields
    const dateFields = ['openDate', 'closeDate', 'admissionOpenDate', 'admissionCloseDate'];
    dateFields.forEach(field => {
      if (data[field]) {
        updateData[field] = new Date(data[field]);
      }
    });
    
    // Update JSON string fields
    const jsonFields = [
      'subjects', 'departments', 'admissionDocumentsRequired',
      'feesDayDistributionJson', 'feesBoardingDistributionJson',
      'admissionFeeDistribution'
    ];
    
    jsonFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = JSON.stringify(data[field]);
      }
    });
    
    // Update file URL fields
    const fileFields = [
      { field: 'videoTour', typeField: 'videoType' },
      { field: 'videoThumbnail' },
      { field: 'curriculumPDF', nameField: 'curriculumPdfName', metadataField: 'curriculumPdfMetadata' },
      { field: 'feesDayDistributionPdf', nameField: 'feesDayPdfName', metadataField: 'feesDayPdfMetadata' },
      { field: 'feesBoardingDistributionPdf', nameField: 'feesBoardingPdfName', metadataField: 'feesBoardingPdfMetadata' },
      { field: 'admissionFeePdf', nameField: 'admissionFeePdfName', metadataField: 'admissionFeePdfMetadata' }
    ];
    
    fileFields.forEach(({ field, typeField, nameField, metadataField }) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
        
        if (nameField && data[nameField] !== undefined) {
          updateData[nameField] = data[nameField];
        }
        
        if (metadataField && data[metadataField] !== undefined) {
          updateData[metadataField] = JSON.stringify(data[metadataField]);
        }
        
        // Special handling for video type
        if (field === 'videoTour' && typeField) {
          if (data[field] && data[field].includes('youtube.com')) {
            updateData[typeField] = 'youtube';
          } else if (data[field]) {
            updateData[typeField] = 'file';
          } else {
            updateData[typeField] = null;
          }
        }
      }
    });
    
    // Update exam results
    const examFields = [
      'form1ResultsPdf', 'form1ResultsPdfName', 'form1ResultsYear', 'form1ResultsMetadata',
      'form2ResultsPdf', 'form2ResultsPdfName', 'form2ResultsYear', 'form2ResultsMetadata',
      'form3ResultsPdf', 'form3ResultsPdfName', 'form3ResultsYear', 'form3ResultsMetadata',
      'form4ResultsPdf', 'form4ResultsPdfName', 'form4ResultsYear', 'form4ResultsMetadata',
      'mockExamsResultsPdf', 'mockExamsPdfName', 'mockExamsYear', 'mockExamsMetadata',
      'kcseResultsPdf', 'kcsePdfName', 'kcseYear', 'kcseMetadata'
    ];
    
    examFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field.includes('Metadata') && data[field]) {
          updateData[field] = JSON.stringify(data[field]);
        } else if (field.includes('Year') && data[field]) {
          updateData[field] = parseInt(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    });
    
    // Update additional files
    if (data.additionalResultsFiles !== undefined) {
      updateData.additionalResultsFiles = JSON.stringify(data.additionalResultsFiles || []);
    }
    
    if (data.additionalFilesMetadata !== undefined) {
      updateData.additionalFilesMetadata = JSON.stringify(data.additionalFilesMetadata || []);
    }
    
    // Update file statistics
    updateData.totalFileCount = fileStats.totalCount;
    updateData.totalFileSizeBytes = BigInt(fileStats.totalSizeBytes);
    updateData.totalFileSizeMB = fileStats.totalSizeMB;
    updateData.fileStorageSummary = JSON.stringify(fileStorageSummary);
    
    // Add to file operations history
    const existingHistory = existing.fileOperationsHistory ? 
      JSON.parse(existing.fileOperationsHistory) : [];
    
    existingHistory.push({
      action: 'update',
      timestamp: new Date().toISOString(),
      files_count: fileStats.totalCount,
      total_size_mb: fileStats.totalSizeMB,
      updated_fields: Object.keys(updateData).filter(k => k !== 'updatedAt' && k !== 'lastFileUpdate')
    });
    
    updateData.fileOperationsHistory = JSON.stringify(existingHistory);
    
    console.log('💾 Updating school:', {
      id: existing.id,
      updateFields: Object.keys(updateData)
    });
    
    // Update school in database
    const school = await prisma.school_info.update({
      where: { id: existing.id },
      data: updateData
    });
    
    console.log('✅ School updated:', school.id);
    
    return NextResponse.json({
      success: true,
      message: "School information updated successfully",
      school: parseJsonFields(school)
    });
    
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to update school information"
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove school
export async function DELETE() {
  try {
    const existing = await prisma.school_info.findFirst();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school found to delete" },
        { status: 404 }
      );
    }
    
    console.log('🗑️ Deleting school:', existing.id);
    
    // Delete from database
    await prisma.school_info.delete({
      where: { id: existing.id }
    });
    
    // Note: Files in Supabase remain (you might want to clean them up separately)
    
    return NextResponse.json({
      success: true,
      message: "School information deleted successfully"
    });
    
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to delete school information"
      },
      { status: 500 }
    );
  }
}

// PATCH: Update specific fields (for exam results, etc.)
export async function PATCH(request) {
  try {
    const data = await request.json();
    console.log('📥 PATCH Data received:', Object.keys(data));
    
    const existing = await prisma.school_info.findFirst();
    
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };
    
    // Handle exam year updates
    const examYearFields = [
      'form1ResultsYear', 'form2ResultsYear', 'form3ResultsYear',
      'form4ResultsYear', 'mockExamsYear', 'kcseYear'
    ];
    
    examYearFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field] ? parseInt(data[field]) : null;
      }
    });
    
    // Handle additional files updates
    if (data.additionalResultsFiles !== undefined) {
      updateData.additionalResultsFiles = JSON.stringify(data.additionalResultsFiles || []);
    }
    
    if (data.additionalFilesMetadata !== undefined) {
      updateData.additionalFilesMetadata = JSON.stringify(data.additionalFilesMetadata || []);
    }
    
    // Update school
    const school = await prisma.school_info.update({
      where: { id: existing.id },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      message: "School information updated successfully",
      school: parseJsonFields(school)
    });
    
  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Failed to update school information"
      },
      { status: 500 }
    );
  }
}