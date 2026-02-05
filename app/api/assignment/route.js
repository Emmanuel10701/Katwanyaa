import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";
import { randomUUID } from "crypto";

// ==================== TOKEN VERIFICATION FOR POST ONLY ====================
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
            message: 'User does not have permission to create assignments' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Assignment creation authentication successful for user:', adminPayload.name || 'Unknown');
      
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
          message: "Authentication required to create assignments.",
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

export async function POST(request) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📝 POST /api/assignments - Creating assignment");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    // ==================== END AUTHENTICATION ====================

    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim() || "";
    const subject = formData.get("subject")?.toString().trim() || "";
    const className = formData.get("className")?.toString().trim() || "";
    const teacher = formData.get("teacher")?.toString().trim() || "";
    const dueDate = formData.get("dueDate")?.toString() || "";
    const dateAssigned = formData.get("dateAssigned")?.toString() || new Date().toISOString();
    const status = formData.get("status")?.toString() || "assigned";
    const description = formData.get("description")?.toString().trim() || "";
    const instructions = formData.get("instructions")?.toString().trim() || "";
    const priority = formData.get("priority")?.toString() || "medium";
    const estimatedTime = formData.get("estimatedTime")?.toString().trim() || "";
    const additionalWork = formData.get("additionalWork")?.toString().trim() || "";
    const teacherRemarks = formData.get("teacherRemarks")?.toString().trim() || "";
    const learningObjectives = formData.get("learningObjectives")?.toString() || "[]";

    if (!title || !subject || !className || !teacher || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Title, subject, class, teacher, and due date are required" },
        { status: 400 }
      );
    }

    let assignmentFiles = [];
    let attachments = [];
    
    try {
      const assignmentFileInputs = formData.getAll("assignmentFiles");
      const uploadedAssignmentFiles = await uploadFilesToCloudinary(assignmentFileInputs, "assignment-files");
      assignmentFiles = uploadedAssignmentFiles.map(file => file.url);
      console.log(`✅ Uploaded assignment files:`, uploadedAssignmentFiles.map(f => f.name));
      
      const attachmentInputs = formData.getAll("attachments");
      const uploadedAttachments = await uploadFilesToCloudinary(attachmentInputs, "attachments");
      attachments = uploadedAttachments.map(file => file.url);
      console.log(`✅ Uploaded attachments:`, uploadedAttachments.map(f => f.name));
      
    } catch (fileError) {
      console.error("File upload error:", fileError);
      return NextResponse.json(
        { success: false, error: "Failed to upload files. Please try again." },
        { status: 500 }
      );
    }

    let learningObjectivesArray = [];
    try {
      learningObjectivesArray = JSON.parse(learningObjectives);
    } catch (error) {
      console.error("Error parsing learning objectives:", error);
      learningObjectivesArray = [];
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        subject,
        className,
        teacher,
        dueDate: new Date(dueDate),
        dateAssigned: new Date(dateAssigned),
        status,
        description,
        instructions,
        priority,
        estimatedTime,
        additionalWork,
        teacherRemarks,
        assignmentFiles: assignmentFiles,
        attachments: attachments,
        learningObjectives: learningObjectivesArray,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment created successfully",
        assignment,
        fileCounts: {
          assignmentFiles: assignmentFiles.length,
          attachments: attachments.length
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating assignment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const className = searchParams.get("class");
    const subject = searchParams.get("subject");
    const status = searchParams.get("status");
    const teacher = searchParams.get("teacher");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        className && className !== "all" ? { className } : {},
        subject && subject !== "all" ? { subject } : {},
        status && status !== "all" ? { status } : {},
        teacher && teacher !== "all" ? { teacher } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { teacher: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { className: { contains: search, mode: "insensitive" } },
          ],
        } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    };

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    const processedAssignments = assignments.map(assignment => {
      const assignmentFileAttachments = (assignment.assignmentFiles || []).map((url, index) => {
        const fileInfo = getFileInfoFromUrl(url);
        return fileInfo;
      }).filter(Boolean);
      
      const attachmentAttachments = (assignment.attachments || []).map((url, index) => {
        const fileInfo = getFileInfoFromUrl(url);
        return fileInfo;
      }).filter(Boolean);
      
      return {
        ...assignment,
        assignmentFileAttachments,
        attachmentAttachments
      };
    });

    return NextResponse.json(
      {
        success: true,
        assignments: processedAssignments,
        pagination: {
          current: page,
          totalPages: Math.ceil(total / limit),
          totalAssignments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}