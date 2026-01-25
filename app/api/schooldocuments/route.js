import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Upload PDF to Cloudinary
const uploadPdfToCloudinary = async (file, folder) => {
  if (!file || file.size === 0) return null;

  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error(`Only PDF files are allowed`);
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`PDF file too large. Maximum size: 20MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `school/documents/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          format: 'pdf',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
      original_name: file.name
    };
  } catch (error) {
    console.error(`❌ Cloudinary PDF upload error:`, error);
    throw error;
  }
};

// Upload multiple file types (for additional files)
const uploadAdditionalFileToCloudinary = async (file, folder) => {
  if (!file || file.size === 0) return null;

  try {
    // Allowed file types
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

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, Images, Text`);
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: 50MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Determine resource type
    const resourceType = file.type.startsWith('image/') ? 'image' : 
                        file.type.includes('pdf') ? 'raw' : 'raw';
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `school/documents/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          ...(resourceType === 'raw' && { 
            format: file.type.includes('pdf') ? 'pdf' : 
                   file.type.includes('word') ? 'docx' :
                   file.type.includes('excel') ? 'xlsx' :
                   file.type.includes('powerpoint') ? 'pptx' : 'txt'
          }),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    // Determine file type for display
    const fileType = getFileTypeFromMime(file.type);
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
      original_name: file.name,
      file_type: fileType
    };
  } catch (error) {
    console.error(`❌ Cloudinary additional file upload error:`, error);
    throw error;
  }
};

// Helper to get file type from MIME
const getFileTypeFromMime = (mimeType) => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text')) return 'text';
  return 'document';
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  
  try {
    // Extract public_id from Cloudinary URL
    const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};

// Parse existing additional files
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
    return [];
  }
  try {
    return JSON.parse(value);
  } catch (parseError) {
    throw new Error(`Invalid JSON format in ${fieldName}: ${parseError.message}`);
  }
};

// Clean document response
const cleanDocumentResponse = (document) => {
  let additionalResultsFiles = [];
  
  try {
    if (document.additionalResultsFiles) {
      if (typeof document.additionalResultsFiles === 'string') {
        const parsed = JSON.parse(document.additionalResultsFiles || '[]');
        additionalResultsFiles = Array.isArray(parsed) ? parsed : [];
      } else if (Array.isArray(document.additionalResultsFiles)) {
        additionalResultsFiles = document.additionalResultsFiles;
      }
    }
  } catch (e) {
    console.warn('Failed to parse additionalResultsFiles:', e.message);
    additionalResultsFiles = [];
  }

  return {
    id: document.id,
    schoolId: document.schoolId,
    
    // Curriculum PDF
    curriculumPDF: document.curriculumPDF,
    curriculumPdfName: document.curriculumPdfName,
    curriculumPdfSize: document.curriculumPdfSize,
    curriculumPdfUploadDate: document.curriculumPdfUploadDate,
    
    // Day School Fees PDF
    feesDayDistributionPdf: document.feesDayDistributionPdf,
    feesDayPdfName: document.feesDayPdfName,
    feesDayPdfSize: document.feesDayPdfSize,
    feesDayPdfUploadDate: document.feesDayPdfUploadDate,
    
    // Boarding School Fees PDF
    feesBoardingDistributionPdf: document.feesBoardingDistributionPdf,
    feesBoardingPdfName: document.feesBoardingPdfName,
    feesBoardingPdfSize: document.feesBoardingPdfSize,
    feesBoardingPdfUploadDate: document.feesBoardingPdfUploadDate,
    
    // Admission Fee PDF
    admissionFeePdf: document.admissionFeePdf,
    admissionFeePdfName: document.admissionFeePdfName,
    admissionFeePdfSize: document.admissionFeePdfSize,
    admissionFeePdfUploadDate: document.admissionFeePdfUploadDate,
    
    // Exam Results PDFs
    form1ResultsPdf: document.form1ResultsPdf,
    form1ResultsPdfName: document.form1ResultsPdfName,
    form1ResultsPdfSize: document.form1ResultsPdfSize,
    form1ResultsYear: document.form1ResultsYear,
    form1ResultsUploadDate: document.form1ResultsUploadDate,
    
    form2ResultsPdf: document.form2ResultsPdf,
    form2ResultsPdfName: document.form2ResultsPdfName,
    form2ResultsPdfSize: document.form2ResultsPdfSize,
    form2ResultsYear: document.form2ResultsYear,
    form2ResultsUploadDate: document.form2ResultsUploadDate,
    
    form3ResultsPdf: document.form3ResultsPdf,
    form3ResultsPdfName: document.form3ResultsPdfName,
    form3ResultsPdfSize: document.form3ResultsPdfSize,
    form3ResultsYear: document.form3ResultsYear,
    form3ResultsUploadDate: document.form3ResultsUploadDate,
    
    form4ResultsPdf: document.form4ResultsPdf,
    form4ResultsPdfName: document.form4ResultsPdfName,
    form4ResultsPdfSize: document.form4ResultsPdfSize,
    form4ResultsYear: document.form4ResultsYear,
    form4ResultsUploadDate: document.form4ResultsUploadDate,
    
    mockExamsResultsPdf: document.mockExamsResultsPdf,
    mockExamsPdfName: document.mockExamsPdfName,
    mockExamsPdfSize: document.mockExamsPdfSize,
    mockExamsYear: document.mockExamsYear,
    mockExamsUploadDate: document.mockExamsUploadDate,
    
    kcseResultsPdf: document.kcseResultsPdf,
    kcsePdfName: document.kcsePdfName,
    kcsePdfSize: document.kcsePdfSize,
    kcseYear: document.kcseYear,
    kcseUploadDate: document.kcseUploadDate,
    
    // Additional Files
    additionalResultsFiles: additionalResultsFiles,
    additionalFilesUploadDate: document.additionalFilesUploadDate,
    
    // Timestamps
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };
};

// 🟢 CREATE or UPDATE School Documents
export async function POST(req) {
  try {
    const formData = await req.formData();
    const schoolId = parseIntField(formData.get("schoolId"));
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      );
    }

    // Check if school exists
    const school = await prisma.schoolInfo.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      );
    }

    // Check if document already exists for this school
    let existingDocument = await prisma.schoolDocument.findFirst({
      where: { schoolId }
    });

    // Handle PDF uploads
    const uploadPromises = {};
    const uploadResults = {};

    // Curriculum PDF
    const curriculumPDF = formData.get("curriculumPDF");
    if (curriculumPDF && curriculumPDF.size > 0) {
      uploadPromises.curriculum = uploadPdfToCloudinary(curriculumPDF, "curriculum");
    }

    // Day School Fees PDF
    const feesDayDistributionPdf = formData.get("feesDayDistributionPdf");
    if (feesDayDistributionPdf && feesDayDistributionPdf.size > 0) {
      uploadPromises.feesDay = uploadPdfToCloudinary(feesDayDistributionPdf, "day-fees");
    }

    // Boarding School Fees PDF
    const feesBoardingDistributionPdf = formData.get("feesBoardingDistributionPdf");
    if (feesBoardingDistributionPdf && feesBoardingDistributionPdf.size > 0) {
      uploadPromises.feesBoarding = uploadPdfToCloudinary(feesBoardingDistributionPdf, "boarding-fees");
    }

    // Admission Fee PDF
    const admissionFeePdf = formData.get("admissionFeePdf");
    if (admissionFeePdf && admissionFeePdf.size > 0) {
      uploadPromises.admissionFee = uploadPdfToCloudinary(admissionFeePdf, "admission");
    }

    // Exam Results PDFs with years
    const examFields = [
      { key: 'form1', name: 'form1ResultsPdf', year: 'form1ResultsYear' },
      { key: 'form2', name: 'form2ResultsPdf', year: 'form2ResultsYear' },
      { key: 'form3', name: 'form3ResultsPdf', year: 'form3ResultsYear' },
      { key: 'form4', name: 'form4ResultsPdf', year: 'form4ResultsYear' },
      { key: 'mockExams', name: 'mockExamsResultsPdf', year: 'mockExamsYear' },
      { key: 'kcse', name: 'kcseResultsPdf', year: 'kcseYear' }
    ];

    for (const exam of examFields) {
      const pdfFile = formData.get(exam.name);
      if (pdfFile && pdfFile.size > 0) {
        uploadPromises[exam.key] = uploadPdfToCloudinary(pdfFile, "exam-results");
      }
    }

    // Execute all uploads in parallel
    const uploadEntries = Object.entries(uploadPromises);
    const results = await Promise.allSettled(uploadEntries.map(([key, promise]) => promise));
    
    // Process upload results
    results.forEach((result, index) => {
      const [key] = uploadEntries[index];
      if (result.status === 'fulfilled' && result.value) {
        uploadResults[key] = result.value;
      } else if (result.status === 'rejected') {
        console.error(`Upload failed for ${key}:`, result.reason);
      }
    });

    // Handle additional results files
    let additionalResultsFiles = [];
    const additionalFiles = formData.getAll("additionalFiles[]");
    
    if (additionalFiles && additionalFiles.length > 0) {
      const additionalUploadPromises = additionalFiles
        .filter(file => file.size > 0)
        .map(file => uploadAdditionalFileToCloudinary(file, "additional-results"));
      
      const additionalResults = await Promise.allSettled(additionalUploadPromises);
      
      additionalResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const description = formData.get(`additionalFileDesc_${index}`) || '';
          const year = formData.get(`additionalFileYear_${index}`) || '';
          
          additionalResultsFiles.push({
            filename: result.value.original_name,
            filepath: result.value.url,
            filetype: result.value.file_type,
            year: year.trim() || null,
            description: description.trim() || null,
            filesize: result.value.bytes,
            uploaded_at: new Date().toISOString()
          });
        }
      });
    }

    // If document exists, update it
    if (existingDocument) {
      // Delete old files if new ones are uploaded
      if (uploadResults.curriculum && existingDocument.curriculumPDF) {
        await deleteFromCloudinary(existingDocument.curriculumPDF);
      }
      if (uploadResults.feesDay && existingDocument.feesDayDistributionPdf) {
        await deleteFromCloudinary(existingDocument.feesDayDistributionPdf);
      }
      if (uploadResults.feesBoarding && existingDocument.feesBoardingDistributionPdf) {
        await deleteFromCloudinary(existingDocument.feesBoardingDistributionPdf);
      }
      if (uploadResults.admissionFee && existingDocument.admissionFeePdf) {
        await deleteFromCloudinary(existingDocument.admissionFeePdf);
      }

      // Merge existing additional files with new ones
      let existingAdditionalFiles = parseExistingAdditionalFiles(existingDocument.additionalResultsFiles);
      const finalAdditionalFiles = [...existingAdditionalFiles, ...additionalResultsFiles];

      // Update document
      const updatedDocument = await prisma.schoolDocument.update({
        where: { id: existingDocument.id },
        data: {
          // Update only fields that have new uploads
          curriculumPDF: uploadResults.curriculum?.url || existingDocument.curriculumPDF,
          curriculumPdfName: uploadResults.curriculum?.original_name || existingDocument.curriculumPdfName,
          curriculumPdfSize: uploadResults.curriculum?.bytes || existingDocument.curriculumPdfSize,
          curriculumPdfUploadDate: uploadResults.curriculum ? new Date() : existingDocument.curriculumPdfUploadDate,
          
          feesDayDistributionPdf: uploadResults.feesDay?.url || existingDocument.feesDayDistributionPdf,
          feesDayPdfName: uploadResults.feesDay?.original_name || existingDocument.feesDayPdfName,
          feesDayPdfSize: uploadResults.feesDay?.bytes || existingDocument.feesDayPdfSize,
          feesDayPdfUploadDate: uploadResults.feesDay ? new Date() : existingDocument.feesDayPdfUploadDate,
          
          feesBoardingDistributionPdf: uploadResults.feesBoarding?.url || existingDocument.feesBoardingDistributionPdf,
          feesBoardingPdfName: uploadResults.feesBoarding?.original_name || existingDocument.feesBoardingPdfName,
          feesBoardingPdfSize: uploadResults.feesBoarding?.bytes || existingDocument.feesBoardingPdfSize,
          feesBoardingPdfUploadDate: uploadResults.feesBoarding ? new Date() : existingDocument.feesBoardingPdfUploadDate,
          
          admissionFeePdf: uploadResults.admissionFee?.url || existingDocument.admissionFeePdf,
          admissionFeePdfName: uploadResults.admissionFee?.original_name || existingDocument.admissionFeePdfName,
          admissionFeePdfSize: uploadResults.admissionFee?.bytes || existingDocument.admissionFeePdfSize,
          admissionFeePdfUploadDate: uploadResults.admissionFee ? new Date() : existingDocument.admissionFeePdfUploadDate,
          
          // Exam Results
          ...(uploadResults.form1 && {
            form1ResultsPdf: uploadResults.form1.url,
            form1ResultsPdfName: uploadResults.form1.original_name,
            form1ResultsPdfSize: uploadResults.form1.bytes,
            form1ResultsYear: parseIntField(formData.get("form1ResultsYear")),
            form1ResultsUploadDate: new Date()
          }),
          ...(uploadResults.form2 && {
            form2ResultsPdf: uploadResults.form2.url,
            form2ResultsPdfName: uploadResults.form2.original_name,
            form2ResultsPdfSize: uploadResults.form2.bytes,
            form2ResultsYear: parseIntField(formData.get("form2ResultsYear")),
            form2ResultsUploadDate: new Date()
          }),
          ...(uploadResults.form3 && {
            form3ResultsPdf: uploadResults.form3.url,
            form3ResultsPdfName: uploadResults.form3.original_name,
            form3ResultsPdfSize: uploadResults.form3.bytes,
            form3ResultsYear: parseIntField(formData.get("form3ResultsYear")),
            form3ResultsUploadDate: new Date()
          }),
          ...(uploadResults.form4 && {
            form4ResultsPdf: uploadResults.form4.url,
            form4ResultsPdfName: uploadResults.form4.original_name,
            form4ResultsPdfSize: uploadResults.form4.bytes,
            form4ResultsYear: parseIntField(formData.get("form4ResultsYear")),
            form4ResultsUploadDate: new Date()
          }),
          ...(uploadResults.mockExams && {
            mockExamsResultsPdf: uploadResults.mockExams.url,
            mockExamsPdfName: uploadResults.mockExams.original_name,
            mockExamsPdfSize: uploadResults.mockExams.bytes,
            mockExamsYear: parseIntField(formData.get("mockExamsYear")),
            mockExamsUploadDate: new Date()
          }),
          ...(uploadResults.kcse && {
            kcseResultsPdf: uploadResults.kcse.url,
            kcsePdfName: uploadResults.kcse.original_name,
            kcsePdfSize: uploadResults.kcse.bytes,
            kcseYear: parseIntField(formData.get("kcseYear")),
            kcseUploadDate: new Date()
          }),
          
          // Additional Files
          ...(additionalResultsFiles.length > 0 && {
            additionalResultsFiles: JSON.stringify(finalAdditionalFiles),
            additionalFilesUploadDate: new Date()
          }),
          
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "School documents updated successfully",
        document: cleanDocumentResponse(updatedDocument)
      });

    } else {
      // Create new document
      const newDocument = await prisma.schoolDocument.create({
        data: {
          schoolId,
          
          // Curriculum
          curriculumPDF: uploadResults.curriculum?.url || null,
          curriculumPdfName: uploadResults.curriculum?.original_name || null,
          curriculumPdfSize: uploadResults.curriculum?.bytes || null,
          curriculumPdfUploadDate: uploadResults.curriculum ? new Date() : null,
          
          // Day Fees
          feesDayDistributionPdf: uploadResults.feesDay?.url || null,
          feesDayPdfName: uploadResults.feesDay?.original_name || null,
          feesDayPdfSize: uploadResults.feesDay?.bytes || null,
          feesDayPdfUploadDate: uploadResults.feesDay ? new Date() : null,
          
          // Boarding Fees
          feesBoardingDistributionPdf: uploadResults.feesBoarding?.url || null,
          feesBoardingPdfName: uploadResults.feesBoarding?.original_name || null,
          feesBoardingPdfSize: uploadResults.feesBoarding?.bytes || null,
          feesBoardingPdfUploadDate: uploadResults.feesBoarding ? new Date() : null,
          
          // Admission Fee
          admissionFeePdf: uploadResults.admissionFee?.url || null,
          admissionFeePdfName: uploadResults.admissionFee?.original_name || null,
          admissionFeePdfSize: uploadResults.admissionFee?.bytes || null,
          admissionFeePdfUploadDate: uploadResults.admissionFee ? new Date() : null,
          
          // Exam Results
          form1ResultsPdf: uploadResults.form1?.url || null,
          form1ResultsPdfName: uploadResults.form1?.original_name || null,
          form1ResultsPdfSize: uploadResults.form1?.bytes || null,
          form1ResultsYear: uploadResults.form1 ? parseIntField(formData.get("form1ResultsYear")) : null,
          form1ResultsUploadDate: uploadResults.form1 ? new Date() : null,
          
          form2ResultsPdf: uploadResults.form2?.url || null,
          form2ResultsPdfName: uploadResults.form2?.original_name || null,
          form2ResultsPdfSize: uploadResults.form2?.bytes || null,
          form2ResultsYear: uploadResults.form2 ? parseIntField(formData.get("form2ResultsYear")) : null,
          form2ResultsUploadDate: uploadResults.form2 ? new Date() : null,
          
          form3ResultsPdf: uploadResults.form3?.url || null,
          form3ResultsPdfName: uploadResults.form3?.original_name || null,
          form3ResultsPdfSize: uploadResults.form3?.bytes || null,
          form3ResultsYear: uploadResults.form3 ? parseIntField(formData.get("form3ResultsYear")) : null,
          form3ResultsUploadDate: uploadResults.form3 ? new Date() : null,
          
          form4ResultsPdf: uploadResults.form4?.url || null,
          form4ResultsPdfName: uploadResults.form4?.original_name || null,
          form4ResultsPdfSize: uploadResults.form4?.bytes || null,
          form4ResultsYear: uploadResults.form4 ? parseIntField(formData.get("form4ResultsYear")) : null,
          form4ResultsUploadDate: uploadResults.form4 ? new Date() : null,
          
          mockExamsResultsPdf: uploadResults.mockExams?.url || null,
          mockExamsPdfName: uploadResults.mockExams?.original_name || null,
          mockExamsPdfSize: uploadResults.mockExams?.bytes || null,
          mockExamsYear: uploadResults.mockExams ? parseIntField(formData.get("mockExamsYear")) : null,
          mockExamsUploadDate: uploadResults.mockExams ? new Date() : null,
          
          kcseResultsPdf: uploadResults.kcse?.url || null,
          kcsePdfName: uploadResults.kcse?.original_name || null,
          kcsePdfSize: uploadResults.kcse?.bytes || null,
          kcseYear: uploadResults.kcse ? parseIntField(formData.get("kcseYear")) : null,
          kcseUploadDate: uploadResults.kcse ? new Date() : null,
          
          // Additional Files
          additionalResultsFiles: additionalResultsFiles.length > 0 ? JSON.stringify(additionalResultsFiles) : '[]',
          additionalFilesUploadDate: additionalResultsFiles.length > 0 ? new Date() : null,
        }
      });

      return NextResponse.json({
        success: true,
        message: "School documents created successfully",
        document: cleanDocumentResponse(newDocument)
      }, { status: 201 });
    }

  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🟡 GET School Documents by School ID
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      );
    }

    const document = await prisma.schoolDocument.findFirst({
      where: { schoolId: parseInt(schoolId) }
    });

    if (!document) {
      return NextResponse.json(
        { success: false, message: "No documents found for this school" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document: cleanDocumentResponse(document)
    });

  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE School Document
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await prisma.schoolDocument.findUnique({
      where: { id: parseInt(documentId) }
    });

    if (!document) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404 }
      );
    }

    // Delete all files from Cloudinary
    const filesToDelete = [
      document.curriculumPDF,
      document.feesDayDistributionPdf,
      document.feesBoardingDistributionPdf,
      document.admissionFeePdf,
      document.form1ResultsPdf,
      document.form2ResultsPdf,
      document.form3ResultsPdf,
      document.form4ResultsPdf,
      document.mockExamsResultsPdf,
      document.kcseResultsPdf,
    ].filter(Boolean);

    // Delete additional files
    const additionalFiles = parseExistingAdditionalFiles(document.additionalResultsFiles);
    additionalFiles.forEach(file => {
      if (file.filepath) filesToDelete.push(file.filepath);
    });

    // Delete all files
    await Promise.all(filesToDelete.map(file => deleteFromCloudinary(file)));

    // Delete document from database
    await prisma.schoolDocument.delete({
      where: { id: parseInt(documentId) }
    });

    return NextResponse.json({
      success: true,
      message: "School documents deleted successfully"
    });

  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}