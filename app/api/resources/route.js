import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// ==================== AUTHENTICATION ====================
class DeviceTokenManager {
  static validateTokensFromHeaders(headers) {
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
          message: `Device token error: ${deviceValid.error || 'Invalid token'}`
        };
      }

      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp && adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        const userRole = adminPayload.role || adminPayload.userRole || '';
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'TEACHER', 'teacher'];
        
        if (!validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage resources' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Authentication successful for user:', adminPayload.name || 'Unknown');
      
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
          message: validationResult.message,
          details: validationResult.reason
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validationResult.user,
    deviceInfo: validationResult.deviceInfo
  };
};

// ==================== CLOUDINARY HELPERS ====================
const uploadFileToCloudinary = async (file, folder = "school_resources") => {
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
    const isDocument = ['.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx', '.csv'].includes(extension);
    
    const resourceType = isVideo ? "video" : isImage ? "image" : "raw";
    
    return await new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: resourceType,
        folder: folder,
        public_id: `${timestamp}-${sanitizedFileName}`,
        overwrite: false,
      };

      if (isImage) {
        uploadOptions.transformation = [{ width: 1200, crop: "scale" }];
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else {
            let fileType = 'document';
            if (isImage) fileType = 'image';
            else if (isVideo) fileType = 'video';
            else if (isPDF) fileType = 'pdf';
            else if (isDocument) fileType = 'document';

            resolve({
              url: result.secure_url,
              name: originalName,
              size: file.size,
              extension: extension,
              uploadedAt: new Date().toISOString(),
              fileType: fileType,
              publicId: result.public_id,
              format: result.format
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

const uploadMultipleFilesToCloudinary = async (files, folder = "school_resources") => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => uploadFileToCloudinary(file, folder));
  const results = await Promise.allSettled(uploadPromises);
  
  const uploadedFiles = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      uploadedFiles.push(result.value);
    } else {
      console.error(`Failed to upload file ${files[index]?.name}:`, result.reason);
    }
  });
  
  return uploadedFiles;
};

const deleteFileFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    const urlMatch = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+/);
    if (!urlMatch) return;
    
    const publicId = urlMatch[1];
    const isVideo = fileUrl.includes('/video/');
    const isRaw = fileUrl.includes('/raw/') || fileUrl.match(/\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|csv)$/i);
    
    const resourceType = isVideo ? "video" : isRaw ? "raw" : "image";
    
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.warn("⚠️ Could not delete Cloudinary file:", error.message);
  }
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileType = (fileName) => {
  if (!fileName) return "document";
  
  const ext = fileName.split('.').pop().toLowerCase();
  const typeMap = {
    pdf: "pdf",
    doc: "document", docx: "document", txt: "document",
    ppt: "presentation", pptx: "presentation",
    xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet",
    jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image",
    mp4: "video", mov: "video", avi: "video", mkv: "video",
    mp3: "audio", wav: "audio", m4a: "audio",
    zip: "archive", rar: "archive",
  };

  return typeMap[ext] || "document";
};

const determineMainTypeFromFiles = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return "document";
  }

  const typeCount = {};
  files.forEach(file => {
    const type = file.fileType || getFileType(file.name);
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b);
};

// Helper: Clean resource response
const cleanResourceResponse = (resource) => {
  if (!resource) return null;
  
  return {
    id: resource.id,
    title: resource.title,
    subject: resource.subject,
    className: resource.className,
    teacher: resource.teacher,
    description: resource.description,
    category: resource.category,
    type: resource.type,
    files: (resource.files || []).map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size || 0)
    })),
    accessLevel: resource.accessLevel,
    uploadedBy: resource.uploadedBy,
    downloads: resource.downloads,
    isActive: resource.isActive,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt
  };
};

// ==================== API ENDPOINTS ====================

// GET - Fetch all resources (PUBLIC)
export async function GET() {
  try {
    console.log("📥 GET /api/resources");
    
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedResources = resources.map(cleanResourceResponse);

    return NextResponse.json({ 
      success: true, 
      resources: formattedResources, 
      count: formattedResources.length 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch resources",
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Create or update ALL resources (PROTECTED) - Like school-documents
export async function POST(request) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📝 POST /api/resources - Processing bulk update");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);

    const formData = await request.formData();
    
    // Get all files
    const files = formData.getAll("files");
    const validFiles = Array.from(files).filter(file => file?.name && file.size > 0);
    
    if (validFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No valid files provided" 
      }, { status: 400 });
    }

    // Upload all files to Cloudinary
    console.log(`📤 Uploading ${validFiles.length} file(s)...`);
    const uploadedFiles = await uploadMultipleFilesToCloudinary(validFiles);
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to upload files" 
      }, { status: 500 });
    }

    // Process each uploaded file as a separate resource
    const resources = [];
    const errors = [];

    for (const uploadedFile of uploadedFiles) {
      try {
        // Extract metadata from filename or use defaults
        const fileName = uploadedFile.name.toLowerCase();
        
        // Auto-detect subject from filename patterns
        let detectedSubject = "General";
        let detectedCategory = "document";
        let detectedClassName = "All Classes";
        
        // Pattern matching for subject detection
        if (fileName.includes('math') || fileName.includes('mathematics')) detectedSubject = "Mathematics";
        else if (fileName.includes('eng') || fileName.includes('english')) detectedSubject = "English";
        else if (fileName.includes('kisw') || fileName.includes('kiswahili')) detectedSubject = "Kiswahili";
        else if (fileName.includes('bio') || fileName.includes('biology')) detectedSubject = "Biology";
        else if (fileName.includes('phy') || fileName.includes('physics')) detectedSubject = "Physics";
        else if (fileName.includes('chem') || fileName.includes('chemistry')) detectedSubject = "Chemistry";
        else if (fileName.includes('hist') || fileName.includes('history')) detectedSubject = "History";
        else if (fileName.includes('geo') || fileName.includes('geography')) detectedSubject = "Geography";
        else if (fileName.includes('cre') || fileName.includes('religious')) detectedSubject = "CRE";
        else if (fileName.includes('ire')) detectedSubject = "IRE";
        else if (fileName.includes('hre')) detectedSubject = "HRE";
        else if (fileName.includes('comp') || fileName.includes('computer')) detectedSubject = "Computer";
        
        // Pattern matching for class
        if (fileName.includes('form1') || fileName.includes('f1')) detectedClassName = "Form 1";
        else if (fileName.includes('form2') || fileName.includes('f2')) detectedClassName = "Form 2";
        else if (fileName.includes('form3') || fileName.includes('f3')) detectedClassName = "Form 3";
        else if (fileName.includes('form4') || fileName.includes('f4')) detectedClassName = "Form 4";
        
        // Get form data for this file (or use defaults)
        const title = formData.get("title")?.trim() || 
                     uploadedFile.name.split('.')[0] || 
                     "Resource Document";
        const subject = formData.get("subject")?.trim() || detectedSubject;
        const className = formData.get("className")?.trim() || detectedClassName;
        const teacher = formData.get("teacher")?.trim() || auth.user.name;
        const description = formData.get("description")?.trim() || 
                          `${uploadedFile.fileType.toUpperCase()} resource for ${className} - ${subject}`;
        const category = formData.get("category")?.trim() || uploadedFile.fileType;
        const accessLevel = formData.get("accessLevel")?.trim() || "student";
        const uploadedBy = formData.get("uploadedBy")?.trim() || auth.user.name;

        // Create resource for this file
        const resource = await prisma.resource.create({
          data: {
            title,
            subject,
            className,
            teacher,
            description,
            category,
            type: uploadedFile.fileType,
            files: [uploadedFile], // Single file per resource
            accessLevel,
            uploadedBy,
            downloads: 0,
            isActive: true,
          },
        });

        resources.push(cleanResourceResponse(resource));
        console.log(`✅ Created resource: ${resource.title} (ID: ${resource.id})`);
        
      } catch (fileError) {
        errors.push({
          file: uploadedFile.name,
          error: fileError.message
        });
        console.error(`❌ Failed to create resource for ${uploadedFile.name}:`, fileError);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Processed ${resources.length} resource(s) successfully`,
        resources: resources,
        errors: errors.length > 0 ? errors : undefined,
        count: resources.length
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process resources",
      message: error.message 
    }, { status: 500 });
  }
}