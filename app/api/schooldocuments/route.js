import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Upload PDF to Cloudinary
const uploadPdfToCloudinary = async (file, folder) => {
  if (!file || file.size === 0) return null;

  try {
    // Check file type by extension (not just mime type)
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      throw new Error(`Only PDF, DOC, and DOCX files are allowed`);
    }

    const maxSize = 4.5 * 1024 * 1024; // 4.5MB limit as per frontend
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Determine resource type based on file extension
    const resourceType = fileExtension === '.pdf' ? 'raw' : 'raw';
    const format = fileExtension === '.pdf' ? 'pdf' : 
                   fileExtension === '.doc' ? 'doc' : 'docx';
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `school/documents/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          format: format,
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
    // Check file type by extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      throw new Error(`Only PDF, DOC, and DOCX files are allowed`);
    }

    const maxSize = 4.5 * 1024 * 1024; // 4.5MB limit
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Determine resource type and format
    const resourceType = 'raw';
    const format = fileExtension === '.pdf' ? 'pdf' : 
                   fileExtension === '.doc' ? 'doc' : 'docx';
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `school/documents/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          format: format,
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

const parseStringField = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  return value.trim();
};

const cleanDocumentResponse = (document) => {
  if (!document) return null;
  
  return {
    id: document.id,
    
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
    form1ResultsTerm: document.form1ResultsTerm,
    form1ResultsUploadDate: document.form1ResultsUploadDate,
    
    form2ResultsPdf: document.form2ResultsPdf,
    form2ResultsPdfName: document.form2ResultsPdfName,
    form2ResultsPdfSize: document.form2ResultsPdfSize,
    form2ResultsDescription: document.form2ResultsDescription,
    form2ResultsYear: document.form2ResultsYear,
    form2ResultsTerm: document.form2ResultsTerm,
    form2ResultsUploadDate: document.form2ResultsUploadDate,
    
    form3ResultsPdf: document.form3ResultsPdf,
    form3ResultsPdfName: document.form3ResultsPdfName,
    form3ResultsPdfSize: document.form3ResultsPdfSize,
    form3ResultsDescription: document.form3ResultsDescription,
    form3ResultsYear: document.form3ResultsYear,
    form3ResultsTerm: document.form3ResultsTerm,
    form3ResultsUploadDate: document.form3ResultsUploadDate,
    
    form4ResultsPdf: document.form4ResultsPdf,
    form4ResultsPdfName: document.form4ResultsPdfName,
    form4ResultsPdfSize: document.form4ResultsPdfSize,
    form4ResultsDescription: document.form4ResultsDescription,
    form4ResultsYear: document.form4ResultsYear,
    form4ResultsTerm: document.form4ResultsTerm,
    form4ResultsUploadDate: document.form4ResultsUploadDate,
    
    mockExamsResultsPdf: document.mockExamsResultsPdf,
    mockExamsPdfName: document.mockExamsPdfName,
    mockExamsPdfSize: document.mockExamsPdfSize,
    mockExamsDescription: document.mockExamsDescription,
    mockExamsYear: document.mockExamsYear,
    mockExamsTerm: document.mockExamsTerm,
    mockExamsUploadDate: document.mockExamsUploadDate,
    
    kcseResultsPdf: document.kcseResultsPdf,
    kcsePdfName: document.kcsePdfName,
    kcsePdfSize: document.kcsePdfSize,
    kcseDescription: document.kcseDescription,
    kcseYear: document.kcseYear,
    kcseTerm: document.kcseTerm,
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
    console.log("📥 POST Request received");
    const formData = await req.formData();
    
    // Log all form data keys for debugging
    console.log("📋 Form data keys:", Array.from(formData.keys()));
    
    // Check if document already exists
    let existingDocument = await prisma.schoolDocument.findFirst({
      include: { additionalDocuments: true }
    });

    console.log("📄 Existing document:", existingDocument ? "Found" : "Not found");

    // Handle PDF uploads
    const uploadPromises = {};
    const uploadResults = {};

    // Main document fields - UPDATED TO MATCH PRISMA SCHEMA
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

    // Handle exam results - UPDATED WITH TERM FIELDS
    const examFields = [
      { 
        key: 'form1Results', 
        name: 'form1ResultsPdf', 
        year: 'form1ResultsYear', 
        term: 'form1ResultsTerm',
        description: 'form1ResultsDescription', 
        folder: 'exam-results' 
      },
      { 
        key: 'form2Results', 
        name: 'form2ResultsPdf', 
        year: 'form2ResultsYear', 
        term: 'form2ResultsTerm',
        description: 'form2ResultsDescription', 
        folder: 'exam-results' 
      },
      { 
        key: 'form3Results', 
        name: 'form3ResultsPdf', 
        year: 'form3ResultsYear', 
        term: 'form3ResultsTerm',
        description: 'form3ResultsDescription', 
        folder: 'exam-results' 
      },
      { 
        key: 'form4Results', 
        name: 'form4ResultsPdf', 
        year: 'form4ResultsYear', 
        term: 'form4ResultsTerm',
        description: 'form4ResultsDescription', 
        folder: 'exam-results' 
      },
      { 
        key: 'mockExams', 
        name: 'mockExamsResultsPdf', 
        year: 'mockExamsYear', 
        term: 'mockExamsTerm',
        description: 'mockExamsDescription', 
        folder: 'exam-results' 
      },
      { 
        key: 'kcse', 
        name: 'kcseResultsPdf', 
        year: 'kcseYear', 
        term: 'kcseTerm',
        description: 'kcseDescription', 
        folder: 'exam-results' 
      }
    ];

    // Handle main document uploads
    for (const doc of documentFields) {
      const pdfFile = formData.get(doc.name);
      if (pdfFile && pdfFile.size > 0) {
        console.log(`📤 Uploading ${doc.key} file:`, pdfFile.name);
        uploadPromises[doc.key] = uploadPdfToCloudinary(pdfFile, doc.folder);
      }
    }

    // Handle exam results uploads
    for (const exam of examFields) {
      const pdfFile = formData.get(exam.name);
      if (pdfFile && pdfFile.size > 0) {
        console.log(`📤 Uploading ${exam.key} file:`, pdfFile.name);
        uploadPromises[exam.key] = uploadPdfToCloudinary(pdfFile, exam.folder);
      }
    }

    // Execute all uploads
    const uploadEntries = Object.entries(uploadPromises);
    console.log("🔄 Total uploads to process:", uploadEntries.length);
    
    const results = await Promise.allSettled(uploadEntries.map(([key, promise]) => promise));
    
    // Process upload results
    results.forEach((result, index) => {
      const [key] = uploadEntries[index];
      if (result.status === 'fulfilled' && result.value) {
        uploadResults[key] = result.value;
        console.log(`✅ Upload successful for ${key}:`, result.value.original_name);
      } else if (result.status === 'rejected') {
        console.error(`❌ Upload failed for ${key}:`, result.reason);
      }
    });

    // Handle additional documents
    const additionalFilesData = [];
    const additionalFiles = formData.getAll("additionalFiles[]");
    
    if (additionalFiles && additionalFiles.length > 0) {
      console.log("📁 Processing additional files:", additionalFiles.length);
      const additionalUploadPromises = additionalFiles
        .filter(file => file.size > 0)
        .map((file, index) => {
          console.log(`📤 Uploading additional file ${index}:`, file.name);
          return uploadAdditionalFileToCloudinary(file, "additional-documents");
        });
      
      const additionalResults = await Promise.allSettled(additionalUploadPromises);
      
      additionalResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const description = formData.get(`additionalFilesDesc[${index}]`) || '';
          const year = formData.get(`additionalFilesYear[${index}]`) || '';
          const term = formData.get(`additionalFilesTerm[${index}]`) || '';
          
          additionalFilesData.push({
            filename: result.value.original_name,
            filepath: result.value.url,
            filetype: result.value.file_type,
            description: parseStringField(description),
            year: parseIntField(year),
            term: parseStringField(term),
            filesize: result.value.bytes
          });
          console.log(`✅ Additional file uploaded:`, result.value.original_name);
        } else if (result.status === 'rejected') {
          console.error(`❌ Additional file upload failed:`, result.reason);
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
            console.log(`🗑️ Marking additional document for deletion:`, doc.filename);
            filesToDelete.push(deleteFromCloudinary(doc.filepath));
          }
        }
      });
    }

    // Delete old files if new ones are uploaded
    for (const doc of documentFields) {
      const fieldName = doc.key === 'curriculum' ? 'curriculumPDF' : 
                       doc.key === 'feesDay' ? 'feesDayDistributionPdf' :
                       doc.key === 'feesBoarding' ? 'feesBoardingDistributionPdf' : 'admissionFeePdf';
      
      if (uploadResults[doc.key] && existingDocument && existingDocument[fieldName]) {
        console.log(`🗑️ Replacing old file for ${doc.key}:`, existingDocument[fieldName]);
        filesToDelete.push(deleteFromCloudinary(existingDocument[fieldName]));
      }
    }

    for (const exam of examFields) {
      if (uploadResults[exam.key] && existingDocument && existingDocument[exam.name]) {
        console.log(`🗑️ Replacing old file for ${exam.key}:`, existingDocument[exam.name]);
        filesToDelete.push(deleteFromCloudinary(existingDocument[exam.name]));
      }
    }

    // Delete old files
    if (filesToDelete.length > 0) {
      console.log("🗑️ Deleting old files:", filesToDelete.length);
      await Promise.all(filesToDelete);
    }

    // Parse fee breakdown JSON
    const feesDayDistributionJson = formData.get("feesDayDistributionJson");
    const feesBoardingDistributionJson = formData.get("feesBoardingDistributionJson");
    const admissionFeeDistribution = formData.get("admissionFeeDistribution");

    // Prepare update data - FIXED FIELD NAMES TO MATCH PRISMA SCHEMA
    const updateData = {
      updatedAt: new Date()
    };

    // Add fee breakdown JSON if provided
    if (feesDayDistributionJson) {
      try {
        updateData.feesDayDistributionJson = JSON.parse(feesDayDistributionJson);
      } catch (e) {
        console.error("❌ Error parsing feesDayDistributionJson:", e);
      }
    }
    
    if (feesBoardingDistributionJson) {
      try {
        updateData.feesBoardingDistributionJson = JSON.parse(feesBoardingDistributionJson);
      } catch (e) {
        console.error("❌ Error parsing feesBoardingDistributionJson:", e);
      }
    }
    
    if (admissionFeeDistribution) {
      try {
        updateData.admissionFeeDistribution = JSON.parse(admissionFeeDistribution);
      } catch (e) {
        console.error("❌ Error parsing admissionFeeDistribution:", e);
      }
    }

    // Handle main document fields - FIXED FIELD NAMES
    for (const doc of documentFields) {
      if (uploadResults[doc.key]) {
        // Map to correct Prisma field names
        const prismaFieldMap = {
          'curriculum': {
            pdf: 'curriculumPDF',
            name: 'curriculumPdfName',
            size: 'curriculumPdfSize',
            uploadDate: 'curriculumPdfUploadDate'
          },
          'feesDay': {
            pdf: 'feesDayDistributionPdf',
            name: 'feesDayPdfName',
            size: 'feesDayPdfSize',
            uploadDate: 'feesDayPdfUploadDate'
          },
          'feesBoarding': {
            pdf: 'feesBoardingDistributionPdf',
            name: 'feesBoardingPdfName',
            size: 'feesBoardingPdfSize',
            uploadDate: 'feesBoardingPdfUploadDate'
          },
          'admissionFee': {
            pdf: 'admissionFeePdf',
            name: 'admissionFeePdfName',
            size: 'admissionFeePdfSize',
            uploadDate: 'admissionFeePdfUploadDate'
          }
        };
        
        const fields = prismaFieldMap[doc.key];
        updateData[fields.pdf] = uploadResults[doc.key].url;
        updateData[fields.name] = uploadResults[doc.key].original_name;
        updateData[fields.size] = uploadResults[doc.key].bytes;
        updateData[fields.uploadDate] = new Date();
      }
      
      // Update metadata
      const year = formData.get(doc.year);
      const description = formData.get(doc.description);
      
      if (year !== null) {
        updateData[doc.year] = parseIntField(year);
      }
      if (description !== null) {
        updateData[doc.description] = parseStringField(description);
      }
    }

    // Handle exam results - FIXED FIELD NAMES AND ADDED TERM
    for (const exam of examFields) {
      if (uploadResults[exam.key]) {
        // Map to correct Prisma field names
        const prismaFieldMap = {
          'form1Results': {
            pdf: 'form1ResultsPdf',
            name: 'form1ResultsPdfName',
            size: 'form1ResultsPdfSize',
            uploadDate: 'form1ResultsUploadDate'
          },
          'form2Results': {
            pdf: 'form2ResultsPdf',
            name: 'form2ResultsPdfName',
            size: 'form2ResultsPdfSize',
            uploadDate: 'form2ResultsUploadDate'
          },
          'form3Results': {
            pdf: 'form3ResultsPdf',
            name: 'form3ResultsPdfName',
            size: 'form3ResultsPdfSize',
            uploadDate: 'form3ResultsUploadDate'
          },
          'form4Results': {
            pdf: 'form4ResultsPdf',
            name: 'form4ResultsPdfName',
            size: 'form4ResultsPdfSize',
            uploadDate: 'form4ResultsUploadDate'
          },
          'mockExams': {
            pdf: 'mockExamsResultsPdf',
            name: 'mockExamsPdfName',
            size: 'mockExamsPdfSize',
            uploadDate: 'mockExamsUploadDate'
          },
          'kcse': {
            pdf: 'kcseResultsPdf',
            name: 'kcsePdfName',
            size: 'kcsePdfSize',
            uploadDate: 'kcseUploadDate'
          }
        };
        
        const fields = prismaFieldMap[exam.key];
        updateData[fields.pdf] = uploadResults[exam.key].url;
        updateData[fields.name] = uploadResults[exam.key].original_name;
        updateData[fields.size] = uploadResults[exam.key].bytes;
        updateData[fields.uploadDate] = new Date();
      }
      
      // Update metadata including term
      const year = formData.get(exam.year);
      const term = formData.get(exam.term);
      const description = formData.get(exam.description);
      
      if (year !== null) {
        updateData[exam.year] = parseIntField(year);
      }
      if (term !== null) {
        updateData[exam.term] = parseStringField(term);
      }
      if (description !== null) {
        updateData[exam.description] = parseStringField(description);
      }
    }

    console.log("📝 Update data prepared:", updateData);

    // If document exists, update it
    if (existingDocument) {
      console.log("🔄 Updating existing document");
      const updatedDocument = await prisma.schoolDocument.update({
        where: { id: existingDocument.id },
        data: updateData
      });

      // Handle additional documents
      if (additionalFilesData.length > 0) {
        console.log("📁 Creating additional documents:", additionalFilesData.length);
        await prisma.additionalDocument.createMany({
          data: additionalFilesData.map(file => ({
            schoolDocumentId: existingDocument.id,
            filename: file.filename,
            filepath: file.filepath,
            filetype: file.filetype,
            description: file.description,
            year: file.year,
            term: file.term,
            filesize: file.filesize
          }))
        });
      }

      // Delete removed additional documents
      const additionalDocsToDelete = formData.getAll("additionalDocsToDelete[]");
      if (additionalDocsToDelete.length > 0) {
        console.log("🗑️ Deleting additional documents:", additionalDocsToDelete.length);
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

      console.log("✅ Document update successful");

      return NextResponse.json({
        success: true,
        message: "School documents updated successfully",
        document: cleanDocumentResponse(finalDocument)
      });

    } else {
      console.log("🆕 Creating new document");
      // Create new document
      const newDocument = await prisma.schoolDocument.create({
        data: updateData
      });

      // Create additional documents
      if (additionalFilesData.length > 0) {
        console.log("📁 Creating additional documents:", additionalFilesData.length);
        await prisma.additionalDocument.createMany({
          data: additionalFilesData.map(file => ({
            schoolDocumentId: newDocument.id,
            filename: file.filename,
            filepath: file.filepath,
            filetype: file.filetype,
            description: file.description,
            year: file.year,
            term: file.term,
            filesize: file.filesize
          }))
        });
      }

      // Get complete document
      const finalDocument = await prisma.schoolDocument.findUnique({
        where: { id: newDocument.id },
        include: { additionalDocuments: true }
      });

      console.log("✅ Document creation successful");

      return NextResponse.json({
        success: true,
        message: "School documents created successfully",
        document: cleanDocumentResponse(finalDocument)
      }, { status: 201 });
    }

  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        details: error.stack
      },
      { status: 500 }
    );
  }
}

// 🟡 GET School Documents (no school ID needed)
export async function GET() {
  try {
    console.log("📥 GET Request received");
    
    // Get the first (and only) document since we're not linking to school
    const document = await prisma.schoolDocument.findFirst({
      include: { additionalDocuments: true }
    });

    if (!document) {
      console.log("📭 No documents found");
      return NextResponse.json({
        success: true,
        message: "No documents found",
        document: null
      });
    }

    console.log("✅ Documents found:", document.id);
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
export async function DELETE() {
  try {
    console.log("🗑️ DELETE Request received");
    
    // Get the first document to delete
    const document = await prisma.schoolDocument.findFirst({
      include: { additionalDocuments: true }
    });

    if (!document) {
      console.log("📭 No document found to delete");
      return NextResponse.json(
        { success: false, message: "No document found to delete" },
        { status: 404 }
      );
    }

    console.log("🗑️ Deleting document:", document.id);

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

    console.log("🗑️ Files to delete:", filesToDelete.length);

    // Delete all files
    await Promise.all(filesToDelete.map(file => deleteFromCloudinary(file)));

    // Delete document from database (cascade will delete additional documents)
    await prisma.schoolDocument.delete({
      where: { id: document.id }
    });

    console.log("✅ Document deleted successfully");

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