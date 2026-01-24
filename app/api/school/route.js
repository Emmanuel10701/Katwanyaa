import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// ==================== SUPABASE CLIENT ====================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// ==================== HELPER FUNCTIONS ====================

// Helper: Extract path from Supabase URL
function extractPathFromUrl(url) {
  if (!url) return null;
  
  // Handle different Supabase URL formats
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract the part after /storage/v1/object/public/
    const storagePrefix = '/storage/v1/object/public/';
    const index = pathname.indexOf(storagePrefix);
    
    if (index !== -1) {
      return pathname.substring(index + storagePrefix.length);
    }
    
    return url; // Return as-is if not a standard Supabase URL
  } catch (error) {
    return url; // Return as-is if not a valid URL
  }
}

// Helper: Get file metadata from Supabase
async function getFileMetadataFromSupabase(filePath) {
  try {
    // Extract bucket name and file path
    const parts = filePath.split('/');
    if (parts.length < 2) {
      console.warn('Invalid file path format:', filePath);
      return null;
    }
    
    const bucketName = parts[0];
    const actualPath = parts.slice(1).join('/');
    
    // List files to get metadata
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1,
        search: actualPath
      });
    
    if (error) {
      console.warn('Failed to get file metadata:', error.message);
      return null;
    }
    
    if (data && data.length > 0 && data[0].metadata) {
      return {
        file_size: data[0].metadata?.file_size || 0,
        mime_type: data[0].metadata?.mime_type || '',
        uploaded_at: data[0].created_at
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting file metadata:', error.message);
    return null;
  }
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
      if (file.url || file.filepath) {
        totalCount++;
        fileUrls.push(file.url || file.filepath);
      }
    });
  }
  
  // Try to get file sizes from Supabase
  for (const url of fileUrls) {
    try {
      const path = extractPathFromUrl(url);
      if (path) {
        const metadata = await getFileMetadataFromSupabase(path);
        if (metadata?.file_size) {
          totalSizeBytes += parseInt(metadata.file_size);
        }
      }
    } catch (error) {
      console.warn('Could not fetch file size for URL:', url, error.message);
    }
  }
  
  return {
    totalCount,
    totalSizeBytes,
    totalSizeMB: totalSizeBytes / (1024 * 1024)
  };
}

// Helper: Create file storage summary
function createFileStorageSummary(data) {
  const summary = {
    videos: 0,
    pdfs: 0,
    images: 0,
    other: 0,
    by_category: {},
    total_count: 0,
    last_updated: new Date().toISOString()
  };
  
  // Count videos
  if (data.videoTour) summary.videos++;
  
  // Count images
  if (data.videoThumbnail) summary.images++;
  
  // Count PDFs from main fields
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
      if (file.url || file.filepath) {
        const type = file.type || file.filetype || '';
        const url = file.url || file.filepath || '';
        
        if (type.includes('pdf') || url.includes('.pdf')) {
          summary.pdfs++;
        } else if (type.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
          summary.images++;
        } else if (type.includes('video') || /\.(mp4|webm|mov|avi)$/i.test(url)) {
          summary.videos++;
        } else {
          summary.other++;
        }
      }
    });
  }
  
  summary.total_count = summary.videos + summary.pdfs + summary.images + summary.other;
  
  return summary;
}

// Helper: Parse JSON fields from database
function parseJsonFields(school) {
  if (!school) return school;
  
  const jsonFields = [
    'subjects', 'departments', 'admissionDocumentsRequired',
    'feesDayDistribution', 'feesDayDistributionJson',
    'feesBoardingDistribution', 'feesBoardingDistributionJson',
    'admissionFeeDistribution', 'additionalResultsFiles',
    'additionalFilesMetadata', 'fileStorageSummary',
    'fileOperationsHistory', 'systemMetadata',
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
    } else if (parsed[field] === undefined) {
      parsed[field] = null;
    }
  });
  
  // Handle exam results structure
  const examFields = ['form1', 'form2', 'form3', 'form4', 'mockExams', 'kcse'];
  parsed.examResults = {};
  
  examFields.forEach(exam => {
    const pdfField = `${exam}ResultsPdf`;
    const nameField = `${exam}ResultsPdfName`;
    const yearField = `${exam}ResultsYear`;
    const metadataField = `${exam}ResultsMetadata`;
    
    if (parsed[pdfField] || parsed[yearField]) {
      parsed.examResults[exam] = {
        pdf: parsed[pdfField] || null,
        name: parsed[nameField] || null,
        year: parsed[yearField] || null,
        metadata: parsed[metadataField] || null
      };
      
      // Remove individual fields from main object
      delete parsed[pdfField];
      delete parsed[nameField];
      delete parsed[yearField];
      delete parsed[metadataField];
    }
  });
  
  // Convert BigInt to Number for frontend
  if (parsed.totalFileSizeBytes && typeof parsed.totalFileSizeBytes === 'bigint') {
    parsed.totalFileSizeBytes = Number(parsed.totalFileSizeBytes);
    parsed.totalFileSizeMB = Number(parsed.totalFileSizeBytes) / (1024 * 1024);
  }
  
  return parsed;
}

// ==================== IN-MEMORY DATABASE SIMULATION ====================
// Since you're having issues with Prisma, let's use an in-memory store for now

let schoolStore = null;

// Initialize with a dummy school for testing
function initializeStore() {
  if (!schoolStore) {
    schoolStore = {
      id: 1,
      name: 'Katwanyaa High School',
      description: 'A leading educational institution',
      motto: 'Education for Excellence',
      vision: 'To be the best school',
      mission: 'Providing quality education',
      studentCount: 500,
      staffCount: 50,
      openDate: new Date('2024-01-10'),
      closeDate: new Date('2024-12-20'),
      subjects: JSON.stringify(['Math', 'English', 'Science']),
      departments: JSON.stringify(['Science', 'Arts']),
      videoTour: null,
      videoType: null,
      videoThumbnail: null,
      videoMetadata: null,
      thumbnailMetadata: null,
      feesDay: 50000,
      feesDayDistributionJson: JSON.stringify({ tuition: 40000, activity: 10000 }),
      feesBoarding: 150000,
      feesBoardingDistributionJson: JSON.stringify({ tuition: 40000, boarding: 110000 }),
      curriculumPDF: null,
      curriculumPdfName: null,
      curriculumPdfMetadata: null,
      feesDayDistributionPdf: null,
      feesDayPdfName: null,
      feesDayPdfMetadata: null,
      feesBoardingDistributionPdf: null,
      feesBoardingPdfName: null,
      feesBoardingPdfMetadata: null,
      admissionOpenDate: new Date('2024-01-01'),
      admissionCloseDate: new Date('2024-03-31'),
      admissionRequirements: 'Passing grade in previous class',
      admissionFee: 10000,
      admissionFeeDistribution: JSON.stringify({ registration: 5000, medical: 5000 }),
      admissionCapacity: 100,
      admissionContactEmail: 'admissions@katwanyaa.edu',
      admissionContactPhone: '+254712345678',
      admissionWebsite: 'https://katwanyaa.edu',
      admissionLocation: 'Main Campus',
      admissionOfficeHours: '8 AM - 5 PM',
      admissionDocumentsRequired: JSON.stringify(['Birth Certificate', 'Report Card']),
      admissionFeePdf: null,
      admissionFeePdfName: null,
      admissionFeePdfMetadata: null,
      form1ResultsPdf: null,
      form1ResultsPdfName: null,
      form1ResultsYear: 2023,
      form1ResultsMetadata: null,
      form2ResultsPdf: null,
      form2ResultsPdfName: null,
      form2ResultsYear: 2023,
      form2ResultsMetadata: null,
      form3ResultsPdf: null,
      form3ResultsPdfName: null,
      form3ResultsYear: 2023,
      form3ResultsMetadata: null,
      form4ResultsPdf: null,
      form4ResultsPdfName: null,
      form4ResultsYear: 2023,
      form4ResultsMetadata: null,
      mockExamsResultsPdf: null,
      mockExamsPdfName: null,
      mockExamsYear: 2023,
      mockExamsMetadata: null,
      kcseResultsPdf: null,
      kcsePdfName: null,
      kcseYear: 2023,
      kcseMetadata: null,
      additionalResultsFiles: JSON.stringify([]),
      additionalFilesMetadata: JSON.stringify([]),
      totalFileCount: 0,
      totalFileSizeBytes: 0,
      totalFileSizeMB: 0,
      fileStorageSummary: JSON.stringify({ total_count: 0 }),
      fileOperationsHistory: JSON.stringify([]),
      systemMetadata: JSON.stringify({ schemaVersion: '2.0' }),
      lastFileUpdate: new Date(),
      lastFileUpdateBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// ==================== API ENDPOINTS ====================

// GET: Fetch school information
export async function GET() {
  try {
    console.log('🔍 Fetching school info...');
    
    initializeStore();
    
    if (!schoolStore) {
      console.log('📭 No school found');
      return NextResponse.json({
        success: true,
        school: null,
        message: "No school information found"
      });
    }
    
    console.log('✅ School found, parsing JSON fields...');
    
    // Parse JSON fields
    const parsedSchool = parseJsonFields(schoolStore);
    
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
    if (schoolStore) {
      return NextResponse.json(
        { success: false, message: "School already exists. Use PUT to update." },
        { status: 400 }
      );
    }
    
    // Calculate file statistics
    const fileStats = await calculateFileStatsFromUrls(data);
    const fileStorageSummary = createFileStorageSummary(data);
    
    // Prepare data
    const schoolData = {
      id: 1,
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
      totalFileSizeBytes: fileStats.totalSizeBytes,
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
    
    // Create school
    schoolStore = schoolData;
    
    console.log('✅ School created with ID:', schoolStore.id);
    
    return NextResponse.json({
      success: true,
      message: "School information created successfully",
      school: parseJsonFields(schoolStore)
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
    if (!schoolStore) {
      return NextResponse.json(
        { success: false, message: "School not found. Use POST to create." },
        { status: 404 }
      );
    }
    
    // Calculate file statistics
    const fileStats = await calculateFileStatsFromUrls(data);
    const fileStorageSummary = createFileStorageSummary(data);
    
    // Update school data
    const updateData = {
      updatedAt: new Date(),
      lastFileUpdate: new Date(),
      lastFileUpdateBy: 'system'
    };
    
    // Update all provided fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        // Handle special cases
        if (key.includes('Year') && typeof data[key] === 'number') {
          updateData[key] = data[key];
        } else if (key.includes('Metadata') && data[key]) {
          updateData[key] = JSON.stringify(data[key]);
        } else if (['subjects', 'departments', 'admissionDocumentsRequired', 
                   'feesDayDistribution', 'feesBoardingDistribution', 
                   'admissionFeeDistribution'].includes(key) && data[key]) {
          updateData[key + (key.includes('Distribution') ? 'Json' : '')] = JSON.stringify(data[key]);
        } else if (['studentCount', 'staffCount', 'admissionCapacity'].includes(key)) {
          updateData[key] = parseInt(data[key]) || null;
        } else if (['feesDay', 'feesBoarding', 'admissionFee'].includes(key)) {
          updateData[key] = parseFloat(data[key]) || null;
        } else if (['openDate', 'closeDate', 'admissionOpenDate', 'admissionCloseDate'].includes(key) && data[key]) {
          updateData[key] = new Date(data[key]);
        } else {
          updateData[key] = data[key];
        }
      }
    });
    
    // Update file statistics
    updateData.totalFileCount = fileStats.totalCount;
    updateData.totalFileSizeBytes = fileStats.totalSizeBytes;
    updateData.totalFileSizeMB = fileStats.totalSizeMB;
    updateData.fileStorageSummary = JSON.stringify(fileStorageSummary);
    
    // Add to file operations history
    const existingHistory = schoolStore.fileOperationsHistory ? 
      JSON.parse(schoolStore.fileOperationsHistory) : [];
    
    existingHistory.push({
      action: 'update',
      timestamp: new Date().toISOString(),
      files_count: fileStats.totalCount,
      total_size_mb: fileStats.totalSizeMB,
      updated_fields: Object.keys(data)
    });
    
    updateData.fileOperationsHistory = JSON.stringify(existingHistory);
    
    // Apply updates
    schoolStore = { ...schoolStore, ...updateData };
    
    console.log('✅ School updated:', schoolStore.id);
    
    return NextResponse.json({
      success: true,
      message: "School information updated successfully",
      school: parseJsonFields(schoolStore)
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
    if (!schoolStore) {
      return NextResponse.json(
        { success: false, message: "No school found to delete" },
        { status: 404 }
      );
    }
    
    console.log('🗑️ Deleting school:', schoolStore.id);
    
    // Delete from store
    schoolStore = null;
    
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

// PATCH: Update specific fields
export async function PATCH(request) {
  try {
    const data = await request.json();
    console.log('📥 PATCH Data received:', Object.keys(data));
    
    if (!schoolStore) {
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
    
    // Apply updates
    schoolStore = { ...schoolStore, ...updateData };
    
    return NextResponse.json({
      success: true,
      message: "School information updated successfully",
      school: parseJsonFields(schoolStore)
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