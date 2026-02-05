import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// ==================== TOKEN VERIFICATION FOR DELETE/UPDATE ====================
class DeviceTokenManager {
  static validateTokensFromHeaders(headers, options = {}) {
    try {
      const adminToken = headers.get('x-admin-token') || headers.get('authorization')?.replace('Bearer ', '');
      const deviceToken = headers.get('x-device-token');

      if (!adminToken) {
        return { valid: false, reason: 'no_admin_token', message: 'Admin token is required' };
      }

      if (!deviceToken) {
        return { valid: false, reason: 'no_device_token', message: 'Device token is required' };
      }

      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_admin_token_format', message: 'Invalid admin token format' };
      }

      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return { 
          valid: false, 
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ''}`
        };
      }

      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'TEACHER', 'teacher'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage assignments' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Assignment management authentication successful for user:', adminPayload.name || 'Unknown');
      
      return { 
        valid: true, 
        user: {
          id: adminPayload.userId || adminPayload.id,
          name: adminPayload.name,
          email: adminPayload.email,
          role: adminPayload.role || adminPayload.userRole
        },
        deviceInfo: deviceValid.payload
      };

    } catch (error) {
      console.error('❌ Token validation error:', error);
      return { 
        valid: false, 
        reason: 'validation_error', 
        message: 'Authentication validation failed',
        error: error.message 
      };
    }
  }

  static validateDeviceToken(token) {
    try {
      const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, reason: 'expired', payload, error: 'Device token has expired' };
      }
      
      const createdAt = new Date(payload.createdAt || payload.iat * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (createdAt < thirtyDaysAgo) {
        return { valid: false, reason: 'age_expired', payload, error: 'Device token is too old' };
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, reason: 'invalid_format', error: error.message };
    }
  }
}

const authenticateRequest = (req) => {
  const headers = req.headers;
  
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(headers);
  
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Access Denied",
          message: "Authentication required to manage assignments.",
          details: validationResult.message
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validationResult.user,
    deviceInfo: validationResult.devInfo
  };
};
// ==================== END TOKEN VERIFICATION ====================

const uploadFileToCloudinary = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    const extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const isPDF = extension === '.pdf';
    const isDocument = ['.doc', '.docx', '.txt'].includes(extension);
    const isSpreadsheet = ['.xls', '.xlsx'].includes(extension);
    const isPresentation = ['.ppt', '.pptx'].includes(extension);
    const isArchive = ['.zip', '.rar', '.7z'].includes(extension);
    
    const resourceType = isVideo ? "video" : "raw";
    
    return await new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: resourceType,
        folder: `school_assignments/${folder}`,
        public_id: `${timestamp}-${sanitizedFileName}`,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      };

      if (isImage) {
        uploadOptions.transformation = [
          { width: 1200, crop: "scale" },
          { quality: "auto:good" }
        ];
      } else if (isVideo) {
        uploadOptions.transformation = [
          { width: 1280, crop: "scale" },
          { quality: "auto" }
        ];
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else {
            let fileType = 'File';
            if (isImage) fileType = 'Image';
            else if (isVideo) fileType = 'Video';
            else if (isPDF) fileType = 'PDF Document';
            else if (isDocument) fileType = 'Word Document';
            else if (isSpreadsheet) fileType = 'Excel Spreadsheet';
            else if (isPresentation) fileType = 'Presentation';
            else if (isArchive) fileType = 'Archive';
            else if (file.type.startsWith('audio/')) fileType = 'Audio';

            resolve({
              url: result.secure_url,
              name: originalName,
              size: file.size,
              type: fileType,
              extension: extension,
              storageType: 'cloudinary',
              publicId: result.public_id,
              format: result.format,
              resourceType: result.resource_type
            });
          }
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

const deleteFilesFromCloudinary = async (fileUrls) => {
  if (!Array.isArray(fileUrls) && !fileUrls) return;

  try {
    const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
    
    const deletePromises = urls.map(async (fileUrl) => {
      if (!fileUrl?.includes('cloudinary.com')) return;

      try {
        const urlMatch = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+(?:$|\?)/);
        if (!urlMatch) return;
        
        const publicId = urlMatch[1];
        const isVideo = fileUrl.includes('/video/') || 
                       fileUrl.match(/\.(mp4|mpeg|avi|mov|wmv|flv|webm|mkv)$/i);
        const isRaw = fileUrl.includes('/raw/') || 
                     fileUrl.match(/\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx|zip|rar|7z)$/i);
        
        const resourceType = isVideo ? "video" : isRaw ? "raw" : "image";
        
        await cloudinary.uploader.destroy(publicId, { 
          resource_type: resourceType 
        });
      } catch {
      }
    });

    await Promise.all(deletePromises);
  } catch {
  }
};

const getFileInfoFromUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    const pathParts = pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    let fileName = lastPart.includes('.') ? lastPart : `${lastPart}.jpg`;
    
    fileName = fileName.replace(/^\d+-/, '');
    
    const extension = fileName.includes('.') 
      ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      : '';
    
    const getFileType = (ext, url) => {
      const typeMap = {
        '.pdf': 'PDF Document',
        '.doc': 'Word Document',
        '.docx': 'Word Document',
        '.txt': 'Text File',
        '.jpg': 'Image',
        '.jpeg': 'Image',
        '.png': 'Image',
        '.gif': 'Image',
        '.webp': 'Image',
        '.bmp': 'Image',
        '.svg': 'Image',
        '.mp4': 'Video',
        '.mov': 'Video',
        '.avi': 'Video',
        '.wmv': 'Video',
        '.flv': 'Video',
        '.webm': 'Video',
        '.mkv': 'Video',
        '.mp3': 'Audio',
        '.wav': 'Audio',
        '.m4a': 'Audio',
        '.ogg': 'Audio',
        '.xls': 'Excel Spreadsheet',
        '.xlsx': 'Excel Spreadsheet',
        '.ppt': 'Presentation',
        '.pptx': 'Presentation',
        '.zip': 'Archive',
        '.rar': 'Archive',
        '.7z': 'Archive'
      };
      
      if (url.includes('/video/')) return 'Video';
      if (url.includes('/raw/')) return typeMap[ext] || 'Document';
      return typeMap[ext] || 'Image';
    };

    return {
      url,
      fileName: decodeURIComponent(fileName),
      extension,
      fileType: getFileType(extension, url),
      storageType: 'cloudinary'
    };
  } catch (error) {
    console.error("Error parsing URL:", url, error);
    return {
      url,
      fileName: 'download',
      extension: '',
      fileType: 'File',
      storageType: 'cloudinary'
    };
  }
};

const uploadFilesToCloudinary = async (files, folder = "assignments") => {
  const uploadedFiles = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        const uploadedFile = await uploadFileToCloudinary(file, folder);
        if (uploadedFile) {
          uploadedFiles.push(uploadedFile);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  }
  
  return uploadedFiles;
};

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID is required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({ 
      where: { id: parseInt(id) } 
    });
    
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" }, 
        { status: 404 }
      );
    }
    
    const assignmentFileAttachments = (assignment.assignmentFiles || []).map((url) => {
      return getFileInfoFromUrl(url);
    }).filter(Boolean);
    
    const attachmentAttachments = (assignment.attachments || []).map((url) => {
      return getFileInfoFromUrl(url);
    }).filter(Boolean);
    
    const processedAssignment = {
      ...assignment,
      assignmentFileAttachments,
      attachmentAttachments
    };
    
    return NextResponse.json({ 
      success: true, 
      assignment: processedAssignment 
    });
  } catch (error) {
    console.error("❌ GET Single Assignment Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignment" }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("✏️ PUT /api/assignments - Updating assignment");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    // ==================== END AUTHENTICATION ====================

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    console.log('📥 PUT Update - Received form fields:', Array.from(formData.keys()));

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const title = formData.get("title")?.toString().trim() || existingAssignment.title;
    const subject = formData.get("subject")?.toString().trim() || existingAssignment.subject;
    const className = formData.get("className")?.toString().trim() || existingAssignment.className;
    const teacher = formData.get("teacher")?.toString().trim() || existingAssignment.teacher;
    const dueDate = formData.get("dueDate")?.toString() || existingAssignment.dueDate;
    const status = formData.get("status")?.toString() || existingAssignment.status;
    const description = formData.get("description")?.toString().trim() || existingAssignment.description;
    const instructions = formData.get("instructions")?.toString().trim() || existingAssignment.instructions;
    const priority = formData.get("priority")?.toString() || existingAssignment.priority;
    const estimatedTime = formData.get("estimatedTime")?.toString().trim() || existingAssignment.estimatedTime;
    const additionalWork = formData.get("additionalWork")?.toString().trim() || existingAssignment.additionalWork;
    const teacherRemarks = formData.get("teacherRemarks")?.toString().trim() || existingAssignment.teacherRemarks;
    const learningObjectives = formData.get("learningObjectives")?.toString();
    
    console.log('📝 Fields extracted:', { title, subject, className, teacher, dueDate });

    let updatedAssignmentFiles = [...existingAssignment.assignmentFiles];
    let updatedAttachments = [...existingAssignment.attachments];
    
    const existingAssignmentFilesStr = formData.get("existingAssignmentFiles");
    const existingAttachmentsStr = formData.get("existingAttachments");
    
    console.log('📁 File data:', {
      existingAssignmentFilesStr: existingAssignmentFilesStr?.substring(0, 100),
      existingAttachmentsStr: existingAttachmentsStr?.substring(0, 100)
    });
    
    if (existingAssignmentFilesStr) {
      try {
        const existingFiles = JSON.parse(existingAssignmentFilesStr);
        updatedAssignmentFiles = existingFiles.filter(file => typeof file === 'string' && file.trim() !== '');
        console.log('✅ Parsed existing assignment files:', updatedAssignmentFiles.length);
      } catch (error) {
        console.error('❌ Error parsing existingAssignmentFiles:', error);
      }
    }
    
    if (existingAttachmentsStr) {
      try {
        const existingFiles = JSON.parse(existingAttachmentsStr);
        updatedAttachments = existingFiles.filter(file => typeof file === 'string' && file.trim() !== '');
        console.log('✅ Parsed existing attachments:', updatedAttachments.length);
      } catch (error) {
        console.error('❌ Error parsing existingAttachments:', error);
      }
    }
    
    const assignmentFilesToRemoveStr = formData.get("assignmentFilesToRemove");
    const attachmentsToRemoveStr = formData.get("attachmentsToRemove");
    
    console.log('🗑️ Files to remove:', {
      assignmentFilesToRemoveStr: assignmentFilesToRemoveStr?.substring(0, 100),
      attachmentsToRemoveStr: attachmentsToRemoveStr?.substring(0, 100)
    });
    
    if (assignmentFilesToRemoveStr) {
      try {
        const filesToRemove = JSON.parse(assignmentFilesToRemoveStr);
        if (Array.isArray(filesToRemove) && filesToRemove.length > 0) {
          await deleteFilesFromCloudinary(filesToRemove);
          console.log('✅ Removed assignment files from Cloudinary:', filesToRemove.length);
        }
      } catch (error) {
        console.error('❌ Error parsing assignmentFilesToRemove:', error);
      }
    }
    
    if (attachmentsToRemoveStr) {
      try {
        const filesToRemove = JSON.parse(attachmentsToRemoveStr);
        if (Array.isArray(filesToRemove) && filesToRemove.length > 0) {
          await deleteFilesFromCloudinary(filesToRemove);
          console.log('✅ Removed attachments from Cloudinary:', filesToRemove.length);
        }
      } catch (error) {
        console.error('❌ Error parsing attachmentsToRemove:', error);
      }
    }
    
    const newAssignmentFiles = formData.getAll("assignmentFiles");
    const newAttachments = formData.getAll("attachments");
    
    console.log('📤 New files to upload:', {
      newAssignmentFiles: newAssignmentFiles.length,
      newAttachments: newAttachments.length
    });
    
    if (newAssignmentFiles.length > 0 && newAssignmentFiles[0].name) {
      try {
        const uploadedFiles = await uploadFilesToCloudinary(newAssignmentFiles, "assignment-files");
        const newUrls = uploadedFiles.map(f => f.url).filter(url => url);
        updatedAssignmentFiles = [...updatedAssignmentFiles, ...newUrls];
        console.log('✅ Added new assignment files:', newUrls.length);
      } catch (error) {
        console.error('❌ Error uploading new assignment files:', error);
      }
    }
    
    if (newAttachments.length > 0 && newAttachments[0].name) {
      try {
        const uploadedFiles = await uploadFilesToCloudinary(newAttachments, "attachments");
        const newUrls = uploadedFiles.map(f => f.url).filter(url => url);
        updatedAttachments = [...updatedAttachments, ...newUrls];
        console.log('✅ Added new attachments:', newUrls.length);
      } catch (error) {
        console.error('❌ Error uploading new attachments:', error);
      }
    }
    
    let learningObjectivesArray = existingAssignment.learningObjectives;
    if (learningObjectives) {
      try {
        learningObjectivesArray = JSON.parse(learningObjectives);
        console.log('✅ Parsed learning objectives:', learningObjectivesArray?.length || 0);
      } catch (error) {
        console.error('❌ Error parsing learning objectives:', error);
      }
    }
    
    console.log('💾 Saving to database...');
    const updatedAssignment = await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: { 
        title,
        subject,
        className,
        teacher,
        dueDate: dueDate ? new Date(dueDate) : existingAssignment.dueDate,
        status,
        description,
        instructions,
        priority,
        estimatedTime,
        additionalWork,
        teacherRemarks,
        assignmentFiles: updatedAssignmentFiles,
        attachments: updatedAttachments,
        learningObjectives: learningObjectivesArray,
      },
    });

    console.log('✅ Update successful:', updatedAssignment.id);
    
    return NextResponse.json({ 
      success: true, 
      assignment: updatedAssignment,
      message: "Assignment updated successfully" 
    });
  } catch (error) {
    console.error("❌ PUT Assignment Error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update assignment" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("🗑️ DELETE /api/assignments - Deleting assignment");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    // ==================== END AUTHENTICATION ====================

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID is required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const allFiles = [
      ...(assignment.assignmentFiles || []),
      ...(assignment.attachments || [])
    ];
    
    if (allFiles.length > 0) {
      await deleteFilesFromCloudinary(allFiles);
    }

    await prisma.assignment.delete({ 
      where: { id: parseInt(id) } 
    });

    return NextResponse.json({ 
      success: true, 
      message: "Assignment deleted successfully" 
    });
  } catch (error) {
    console.error("❌ DELETE Assignment Error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete assignment" }, 
      { status: 500 }
    );
  }
}