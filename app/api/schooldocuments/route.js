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

// Helper function to parse description fields
const parseDescriptionField = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  return value.trim();
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
    
    // Exam Results PDFs with description and year
    form1ResultsPdf: document.form1ResultsPdf,
    form1ResultsPdfName: document.form1ResultsPdfName,
    form1ResultsPdfSize: document.form1ResultsPdfSize,
    form1ResultsDescription: document.form1ResultsDescription,
    form1ResultsYear: document.form1ResultsYear,
    form1ResultsUploadDate: document.form1ResultsUploadDate,
    
    form2ResultsPdf: document.form2ResultsPdf,
    form2ResultsPdfName: document.form2ResultsPdfName,
    form2ResultsPdfSize: document.form2ResultsPdfSize,
    form2ResultsDescription: document.form2ResultsDescription,
    form2ResultsYear: document.form2ResultsYear,
    form2ResultsUploadDate: document.form2ResultsUploadDate,
    
    form3ResultsPdf: document.form3ResultsPdf,
    form3ResultsPdfName: document.form3ResultsPdfName,
    form3ResultsPdfSize: document.form3ResultsPdfSize,
    form3ResultsDescription: document.form3ResultsDescription,
    form3ResultsYear: document.form3ResultsYear,
    form3ResultsUploadDate: document.form3ResultsUploadDate,
    
    form4ResultsPdf: document.form4ResultsPdf,
    form4ResultsPdfName: document.form4ResultsPdfName,
    form4ResultsPdfSize: document.form4ResultsPdfSize,
    form4ResultsDescription: document.form4ResultsDescription,
    form4ResultsYear: document.form4ResultsYear,
    form4ResultsUploadDate: document.form4ResultsUploadDate,
    
    mockExamsResultsPdf: document.mockExamsResultsPdf,
    mockExamsPdfName: document.mockExamsPdfName,
    mockExamsPdfSize: document.mockExamsPdfSize,
    mockExamsDescription: document.mockExamsDescription,
    mockExamsYear: document.mockExamsYear,
    mockExamsUploadDate: document.mockExamsUploadDate,
    
    kcseResultsPdf: document.kcseResultsPdf,
    kcsePdfName: document.kcsePdfName,
    kcsePdfSize: document.kcsePdfSize,
    kcseDescription: document.kcseDescription,
    kcseYear: document.kcseYear,
    kcseUploadDate: document.kcseUploadDate,
    
    // Additional Files
    additionalResultsFiles: additionalResultsFiles,
    additionalResultsFilesDescription: document.additionalResultsFilesDescription,
    additionalResultsFilesYear: document.additionalResultsFilesYear,
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

    // Exam Results PDFs with years and descriptions
    const examFields = [
      { key: 'form1', name: 'form1ResultsPdf', year: 'form1ResultsYear', description: 'form1ResultsDescription' },
      { key: 'form2', name: 'form2ResultsPdf', year: 'form2ResultsYear', description: 'form2ResultsDescription' },
      { key: 'form3', name: 'form3ResultsPdf', year: 'form3ResultsYear', description: 'form3ResultsDescription' },
      { key: 'form4', name: 'form4ResultsPdf', year: 'form4ResultsYear', description: 'form4ResultsDescription' },
      { key: 'mockExams', name: 'mockExamsResultsPdf', year: 'mockExamsYear', description: 'mockExamsDescription' },
      { key: 'kcse', name: 'kcseResultsPdf', year: 'kcseYear', description: 'kcseDescription' }
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
          const description = formData.get(`additionalFilesDesc[${index}]`) || '';
          const year = formData.get(`additionalFilesYear[${index}]`) || '';
          
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

    // Prepare update data
    const updateData = {
      // Update only fields that have new uploads
      curriculumPDF: uploadResults.curriculum?.url || existingDocument?.curriculumPDF,
      curriculumPdfName: uploadResults.curriculum?.original_name || existingDocument?.curriculumPdfName,
      curriculumPdfSize: uploadResults.curriculum?.bytes || existingDocument?.curriculumPdfSize,
      curriculumPdfUploadDate: uploadResults.curriculum ? new Date() : existingDocument?.curriculumPdfUploadDate,
      
      feesDayDistributionPdf: uploadResults.feesDay?.url || existingDocument?.feesDayDistributionPdf,
      feesDayPdfName: uploadResults.feesDay?.original_name || existingDocument?.feesDayPdfName,
      feesDayPdfSize: uploadResults.feesDay?.bytes || existingDocument?.feesDayPdfSize,
      feesDayPdfUploadDate: uploadResults.feesDay ? new Date() : existingDocument?.feesDayPdfUploadDate,
      
      feesBoardingDistributionPdf: uploadResults.feesBoarding?.url || existingDocument?.feesBoardingDistributionPdf,
      feesBoardingPdfName: uploadResults.feesBoarding?.original_name || existingDocument?.feesBoardingPdfName,
      feesBoardingPdfSize: uploadResults.feesBoarding?.bytes || existingDocument?.feesBoardingPdfSize,
      feesBoardingPdfUploadDate: uploadResults.feesBoarding ? new Date() : existingDocument?.feesBoardingPdfUploadDate,
      
      admissionFeePdf: uploadResults.admissionFee?.url || existingDocument?.admissionFeePdf,
      admissionFeePdfName: uploadResults.admissionFee?.original_name || existingDocument?.admissionFeePdfName,
      admissionFeePdfSize: uploadResults.admissionFee?.bytes || existingDocument?.admissionFeePdfSize,
      admissionFeePdfUploadDate: uploadResults.admissionFee ? new Date() : existingDocument?.admissionFeePdfUploadDate,
      
      // Additional Files description and year
      additionalResultsFilesDescription: parseDescriptionField(formData.get("additionalResultsFilesDescription")),
      additionalResultsFilesYear: parseIntField(formData.get("additionalResultsFilesYear")),
      additionalFilesUploadDate: additionalResultsFiles.length > 0 ? new Date() : existingDocument?.additionalFilesUploadDate,
      
      updatedAt: new Date()
    };

    // Add exam results data only if files were uploaded
    for (const exam of examFields) {
      if (uploadResults[exam.key]) {
        updateData[`${exam.key}ResultsPdf`] = uploadResults[exam.key].url;
        updateData[`${exam.key}ResultsPdfName`] = uploadResults[exam.key].original_name;
        updateData[`${exam.key}ResultsPdfSize`] = uploadResults[exam.key].bytes;
        updateData[`${exam.key}ResultsYear`] = parseIntField(formData.get(exam.year));
        updateData[`${exam.key}ResultsDescription`] = parseDescriptionField(formData.get(exam.description));
        updateData[`${exam.key}ResultsUploadDate`] = new Date();
      } else if (formData.get(exam.description)) {
        // Allow updating description even without new file upload
        updateData[`${exam.key}ResultsDescription`] = parseDescriptionField(formData.get(exam.description));
      }
      if (formData.get(exam.year)) {
        // Allow updating year even without new file upload
        updateData[`${exam.key}ResultsYear`] = parseIntField(formData.get(exam.year));
      }
    }

    // Handle additional results files
    if (additionalResultsFiles.length > 0) {
      let existingAdditionalFiles = [];
      if (existingDocument) {
        existingAdditionalFiles = parseExistingAdditionalFiles(existingDocument.additionalResultsFiles);
      }
      const finalAdditionalFiles = [...existingAdditionalFiles, ...additionalResultsFiles];
      updateData.additionalResultsFiles = JSON.stringify(finalAdditionalFiles);
      updateData.additionalFilesUploadDate = new Date();
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

      // Update document
      const updatedDocument = await prisma.schoolDocument.update({
        where: { id: existingDocument.id },
        data: updateData
      });

      return NextResponse.json({
        success: true,
        message: "School documents updated successfully",
        document: cleanDocumentResponse(updatedDocument)
      });

    } else {
      // Create new document
      const createData = {
        schoolId,
        ...updateData
      };

      // Add empty fields for new documents
      const newDocument = await prisma.schoolDocument.create({
        data: createData
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