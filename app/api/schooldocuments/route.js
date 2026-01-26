import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Upload PDF to Cloudinary
const uploadPdfToCloudinary = async (file, folder) => {
  if (!file || file.size === 0) return null;

  try {
    if (file.type !== 'application/pdf') {
      throw new Error(`Only PDF files are allowed`);
    }

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
      'image/webp',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, Images, Text`);
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: 50MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
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

const getFileTypeFromMime = (mimeType) => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text')) return 'text';
  return 'document';
};

const deleteFromCloudinary = async (url) => {
  if (!url) return;
  
  try {
    const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};

const parseIntField = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

const parseDescriptionField = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  return value.trim();
};

const cleanDocumentResponse = (document) => {
  return {
    id: document.id,
    schoolId: document.schoolId,
    
    // Curriculum PDF
    curriculumPDF: document.curriculumPDF,
    curriculumPdfName: document.curriculumPdfName,
    curriculumPdfSize: document.curriculumPdfSize,
    curriculumPdfUploadDate: document.curriculumPdfUploadDate,
    curriculumDescription: document.curriculumDescription,
    curriculumYear: document.curriculumYear,
    
    // Day School Fees PDF
    feesDayDistributionPdf: document.feesDayDistributionPdf,
    feesDayPdfName: document.feesDayPdfName,
    feesDayPdfSize: document.feesDayPdfSize,
    feesDayPdfUploadDate: document.feesDayPdfUploadDate,
    feesDayDescription: document.feesDayDescription,
    feesDayYear: document.feesDayYear,
    
    // Boarding School Fees PDF
    feesBoardingDistributionPdf: document.feesBoardingDistributionPdf,
    feesBoardingPdfName: document.feesBoardingPdfName,
    feesBoardingPdfSize: document.feesBoardingPdfSize,
    feesBoardingPdfUploadDate: document.feesBoardingPdfUploadDate,
    feesBoardingDescription: document.feesBoardingDescription,
    feesBoardingYear: document.feesBoardingYear,
    
    // Admission Fee PDF
    admissionFeePdf: document.admissionFeePdf,
    admissionFeePdfName: document.admissionFeePdfName,
    admissionFeePdfSize: document.admissionFeePdfSize,
    admissionFeePdfUploadDate: document.admissionFeePdfUploadDate,
    admissionFeeDescription: document.admissionFeeDescription,
    admissionFeeYear: document.admissionFeeYear,
    
    // Fee breakdown JSON fields
    feesDayDistributionJson: document.feesDayDistributionJson,
    feesBoardingDistributionJson: document.feesBoardingDistributionJson,
    admissionFeeDistribution: document.admissionFeeDistribution,
    
    // Exam Results PDFs
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
    
    // Additional Documents (loaded separately)
    additionalDocuments: document.additionalDocuments || [],
    
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

    // Check if document already exists for this school
    let existingDocument = await prisma.schoolDocument.findFirst({
      where: { schoolId },
      include: { additionalDocuments: true }
    });

    // Handle PDF uploads
    const uploadPromises = {};
    const uploadResults = {};

    // Main document fields
    const documentFields = [
      { 
        key: 'curriculum', 
        name: 'curriculumPDF', 
        year: 'curriculumYear', 
        description: 'curriculumDescription',
        folder: 'curriculum' 
      },
      { 
        key: 'feesDay', 
        name: 'feesDayDistributionPdf', 
        year: 'feesDayYear', 
        description: 'feesDayDescription',
        folder: 'day-fees' 
      },
      { 
        key: 'feesBoarding', 
        name: 'feesBoardingDistributionPdf', 
        year: 'feesBoardingYear', 
        description: 'feesBoardingDescription',
        folder: 'boarding-fees' 
      },
      { 
        key: 'admissionFee', 
        name: 'admissionFeePdf', 
        year: 'admissionFeeYear', 
        description: 'admissionFeeDescription',
        folder: 'admission' 
      },
    ];

    // Handle exam results
    const examFields = [
      { key: 'form1Results', name: 'form1ResultsPdf', year: 'form1ResultsYear', description: 'form1ResultsDescription', folder: 'exam-results' },
      { key: 'form2Results', name: 'form2ResultsPdf', year: 'form2ResultsYear', description: 'form2ResultsDescription', folder: 'exam-results' },
      { key: 'form3Results', name: 'form3ResultsPdf', year: 'form3ResultsYear', description: 'form3ResultsDescription', folder: 'exam-results' },
      { key: 'form4Results', name: 'form4ResultsPdf', year: 'form4ResultsYear', description: 'form4ResultsDescription', folder: 'exam-results' },
      { key: 'mockExams', name: 'mockExamsResultsPdf', year: 'mockExamsYear', description: 'mockExamsDescription', folder: 'exam-results' },
      { key: 'kcse', name: 'kcseResultsPdf', year: 'kcseYear', description: 'kcseDescription', folder: 'exam-results' }
    ];

    // Handle main document uploads
    for (const doc of documentFields) {
      const pdfFile = formData.get(doc.name);
      if (pdfFile && pdfFile.size > 0) {
        uploadPromises[doc.key] = uploadPdfToCloudinary(pdfFile, doc.folder);
      }
    }

    // Handle exam results uploads
    for (const exam of examFields) {
      const pdfFile = formData.get(exam.name);
      if (pdfFile && pdfFile.size > 0) {
        uploadPromises[exam.key] = uploadPdfToCloudinary(pdfFile, exam.folder);
      }
    }

    // Execute all uploads
    const uploadEntries = Object.entries(uploadPromises);
    const results = await Promise.allSettled(uploadEntries.map(([key, promise]) => promise));
    
    // Process upload results
    results.forEach((result, index) => {
      const [key] = uploadEntries[index];
      if (result.status === 'fulfilled' && result.value) {
        uploadResults[key] = result.value;
      }
    });

    // Handle additional documents
    const additionalFilesData = [];
    const additionalFiles = formData.getAll("additionalFiles[]");
    
    if (additionalFiles && additionalFiles.length > 0) {
      const additionalUploadPromises = additionalFiles
        .filter(file => file.size > 0)
        .map(file => uploadAdditionalFileToCloudinary(file, "additional-documents"));
      
      const additionalResults = await Promise.allSettled(additionalUploadPromises);
      
      additionalResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const description = formData.get(`additionalFilesDesc[${index}]`) || '';
          const year = formData.get(`additionalFilesYear[${index}]`) || '';
          
          additionalFilesData.push({
            filename: result.value.original_name,
            filepath: result.value.url,
            filetype: result.value.file_type,
            description: parseDescriptionField(description),
            year: parseIntField(year),
            filesize: result.value.bytes
          });
        }
      });
    }

    // Handle file deletions
    const filesToDelete = [];
    
    // Check for removed additional documents
    if (existingDocument) {
      const existingAdditionalIds = existingDocument.additionalDocuments.map(doc => doc.id);
      const additionalDocsToDelete = formData.getAll("additionalDocsToDelete[]");
      
      additionalDocsToDelete.forEach(id => {
        const docId = parseInt(id);
        if (existingAdditionalIds.includes(docId)) {
          const doc = existingDocument.additionalDocuments.find(d => d.id === docId);
          if (doc) {
            filesToDelete.push(deleteFromCloudinary(doc.filepath));
          }
        }
      });
    }

    // Delete old files if new ones are uploaded
    for (const doc of documentFields) {
      if (uploadResults[doc.key] && existingDocument && existingDocument[doc.key === 'curriculum' ? 'curriculumPDF' : 
          doc.key === 'feesDay' ? 'feesDayDistributionPdf' :
          doc.key === 'feesBoarding' ? 'feesBoardingDistributionPdf' : 'admissionFeePdf']) {
        filesToDelete.push(deleteFromCloudinary(existingDocument[doc.key === 'curriculum' ? 'curriculumPDF' : 
          doc.key === 'feesDay' ? 'feesDayDistributionPdf' :
          doc.key === 'feesBoarding' ? 'feesBoardingDistributionPdf' : 'admissionFeePdf']));
      }
    }

    for (const exam of examFields) {
      if (uploadResults[exam.key] && existingDocument && existingDocument[exam.name]) {
        filesToDelete.push(deleteFromCloudinary(existingDocument[exam.name]));
      }
    }

    // Delete old files
    await Promise.all(filesToDelete);

    // Parse fee breakdown JSON
    const feesDayDistributionJson = formData.get("feesDayDistributionJson");
    const feesBoardingDistributionJson = formData.get("feesBoardingDistributionJson");
    const admissionFeeDistribution = formData.get("admissionFeeDistribution");

    // Prepare update data
    const updateData = {
      // Fee breakdown JSON
      feesDayDistributionJson: feesDayDistributionJson ? JSON.parse(feesDayDistributionJson) : existingDocument?.feesDayDistributionJson,
      feesBoardingDistributionJson: feesBoardingDistributionJson ? JSON.parse(feesBoardingDistributionJson) : existingDocument?.feesBoardingDistributionJson,
      admissionFeeDistribution: admissionFeeDistribution ? JSON.parse(admissionFeeDistribution) : existingDocument?.admissionFeeDistribution,
      
      updatedAt: new Date()
    };

    // Handle main document fields
    for (const doc of documentFields) {
      if (uploadResults[doc.key]) {
        const fieldName = doc.key === 'curriculum' ? 'curriculum' : 
                         doc.key === 'feesDay' ? 'feesDayDistribution' :
                         doc.key === 'feesBoarding' ? 'feesBoardingDistribution' : 'admissionFee';
        
        updateData[`${fieldName}Pdf`] = uploadResults[doc.key].url;
        updateData[`${fieldName}PdfName`] = uploadResults[doc.key].original_name;
        updateData[`${fieldName}PdfSize`] = uploadResults[doc.key].bytes;
        updateData[`${fieldName}PdfUploadDate`] = new Date();
      }
      
      // Update metadata
      const year = formData.get(doc.year);
      const description = formData.get(doc.description);
      
      if (year !== null) {
        updateData[`${doc.key === 'curriculum' ? 'curriculum' : 
                     doc.key === 'feesDay' ? 'feesDay' :
                     doc.key === 'feesBoarding' ? 'feesBoarding' : 'admissionFee'}Year`] = parseIntField(year);
      }
      if (description !== null) {
        updateData[`${doc.key === 'curriculum' ? 'curriculum' : 
                     doc.key === 'feesDay' ? 'feesDay' :
                     doc.key === 'feesBoarding' ? 'feesBoarding' : 'admissionFee'}Description`] = parseDescriptionField(description);
      }
    }

    // Handle exam results
    for (const exam of examFields) {
      if (uploadResults[exam.key]) {
        updateData[exam.name] = uploadResults[exam.key].url;
        updateData[`${exam.key}PdfName`] = uploadResults[exam.key].original_name;
        updateData[`${exam.key}PdfSize`] = uploadResults[exam.key].bytes;
        updateData[`${exam.key}UploadDate`] = new Date();
      }
      
      // Update metadata
      const year = formData.get(exam.year);
      const description = formData.get(exam.description);
      
      if (year !== null) {
        updateData[`${exam.key}Year`] = parseIntField(year);
      }
      if (description !== null) {
        updateData[`${exam.key}Description`] = parseDescriptionField(description);
      }
    }

    // If document exists, update it
    if (existingDocument) {
      // Update document
      const updatedDocument = await prisma.schoolDocument.update({
        where: { id: existingDocument.id },
        data: updateData
      });

      // Handle additional documents
      if (additionalFilesData.length > 0) {
        await prisma.additionalDocument.createMany({
          data: additionalFilesData.map(file => ({
            schoolDocumentId: existingDocument.id,
            ...file
          }))
        });
      }

      // Delete removed additional documents
      const additionalDocsToDelete = formData.getAll("additionalDocsToDelete[]");
      if (additionalDocsToDelete.length > 0) {
        await prisma.additionalDocument.deleteMany({
          where: {
            id: {
              in: additionalDocsToDelete.map(id => parseInt(id))
            }
          }
        });
      }

      // Get updated document with additional documents
      const finalDocument = await prisma.schoolDocument.findUnique({
        where: { id: existingDocument.id },
        include: { additionalDocuments: true }
      });

      return NextResponse.json({
        success: true,
        message: "School documents updated successfully",
        document: cleanDocumentResponse(finalDocument)
      });

    } else {
      // Create new document
      const createData = {
        schoolId,
        ...updateData
      };

      const newDocument = await prisma.schoolDocument.create({
        data: createData
      });

      // Create additional documents
      if (additionalFilesData.length > 0) {
        await prisma.additionalDocument.createMany({
          data: additionalFilesData.map(file => ({
            schoolDocumentId: newDocument.id,
            ...file
          }))
        });
      }

      // Get complete document
      const finalDocument = await prisma.schoolDocument.findUnique({
        where: { id: newDocument.id },
        include: { additionalDocuments: true }
      });

      return NextResponse.json({
        success: true,
        message: "School documents created successfully",
        document: cleanDocumentResponse(finalDocument)
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
      where: { schoolId: parseInt(schoolId) },
      include: { additionalDocuments: true }
    });

    if (!document) {
      return NextResponse.json({
        success: true,
        message: "No documents found for this school",
        document: null
      });
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
      where: { id: parseInt(documentId) },
      include: { additionalDocuments: true }
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
    document.additionalDocuments.forEach(file => {
      if (file.filepath) filesToDelete.push(file.filepath);
    });

    // Delete all files
    await Promise.all(filesToDelete.map(file => deleteFromCloudinary(file)));

    // Delete document from database (cascade will delete additional documents)
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