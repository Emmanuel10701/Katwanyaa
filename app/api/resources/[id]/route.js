import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

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
const uploadFileToCloudinary = async (file) => {
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
        folder: "school_resources",
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
              publicId: result.public_id
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

const uploadMultipleFilesToCloudinary = async (files) => {
  if (!files || files.length === 0) return [];
  
  const uploadedFiles = [];
  for (const file of files) {
    if (!file.name || file.size === 0) continue;
    
    const result = await uploadFileToCloudinary(file);
    if (result) {
      uploadedFiles.push(result);
    }
  }
  
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

// Helper: Parse form data
const parseFormData = (formData, existingResource = null) => {
  const updateData = {
    updatedAt: new Date()
  };

  // Text fields
  const title = formData.get("title")?.trim();
  const subject = formData.get("subject")?.trim();
  const className = formData.get("className")?.trim();
  const teacher = formData.get("teacher")?.trim();
  const description = formData.get("description")?.trim();
  const category = formData.get("category")?.trim();
  const accessLevel = formData.get("accessLevel")?.trim();
  const uploadedBy = formData.get("uploadedBy")?.trim();
  const isActive = formData.get("isActive");

  if (title !== null && title !== undefined) updateData.title = title;
  if (subject !== null && subject !== undefined) updateData.subject = subject;
  if (className !== null && className !== undefined) updateData.className = className;
  if (teacher !== null && teacher !== undefined) updateData.teacher = teacher;
  if (description !== null && description !== undefined) updateData.description = description;
  if (category !== null && category !== undefined) updateData.category = category;
  if (accessLevel !== null && accessLevel !== undefined) updateData.accessLevel = accessLevel;
  if (uploadedBy !== null && uploadedBy !== undefined) updateData.uploadedBy = uploadedBy;
  if (isActive !== null && isActive !== undefined) updateData.isActive = isActive === "true";

  return updateData;
};

// ==================== API ENDPOINTS ====================

// GET - Get single resource by ID (PUBLIC)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const resourceId = parseInt(id);
    
    if (isNaN(resourceId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid resource ID" 
      }, { status: 400 });
    }

    const resource = await prisma.resource.findUnique({ 
      where: { id: resourceId } 
    });
    
    if (!resource) {
      return NextResponse.json({ 
        success: false, 
        error: "Resource not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      resource: cleanResourceResponse(resource) 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching resource:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT - Update a resource completely (PROTECTED) - Like school-documents
export async function PUT(request, { params }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("✏️ PUT /api/resources/[id] - Full update");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    const resourceId = parseInt(id);
    
    if (isNaN(resourceId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid resource ID" 
      }, { status: 400 });
    }

    const existingResource = await prisma.resource.findUnique({ 
      where: { id: resourceId } 
    });
    
    if (!existingResource) {
      return NextResponse.json({ 
        success: false, 
        error: "Resource not found" 
      }, { status: 404 });
    }

    const formData = await request.formData();
    
    // Delete old files from Cloudinary
    if (existingResource.files && Array.isArray(existingResource.files)) {
      const deletePromises = existingResource.files
        .filter(file => file.url)
        .map(file => deleteFileFromCloudinary(file.url));
      
      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${deletePromises.length} old files from Cloudinary`);
    }

    // Upload new files
    const files = formData.getAll("files");
    const validFiles = Array.from(files).filter(file => file?.name && file.size > 0);
    
    let uploadedFiles = [];
    if (validFiles.length > 0) {
      console.log(`📤 Uploading ${validFiles.length} new file(s)...`);
      uploadedFiles = await uploadMultipleFilesToCloudinary(validFiles);
      console.log(`✅ Uploaded ${uploadedFiles.length} file(s)`);
    } else {
      // If no new files, keep empty array
      uploadedFiles = [];
    }

    // Parse form data
    const updateData = parseFormData(formData, existingResource);
    
    // Update files and type
    updateData.files = uploadedFiles;
    if (uploadedFiles.length > 0) {
      updateData.type = determineMainTypeFromFiles(uploadedFiles);
    } else {
      updateData.type = "document"; // Default type if no files
    }

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
    });

    console.log(`✅ Resource updated: ${updatedResource.title} (ID: ${updatedResource.id})`);

    return NextResponse.json({ 
      success: true, 
      message: "Resource updated successfully",
      resource: cleanResourceResponse(updatedResource)
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error updating resource:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PATCH - Partial update (e.g., update downloads) (PROTECTED)
export async function PATCH(request, { params }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📥 PATCH /api/resources/[id] - Partial update");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    const resourceId = parseInt(id);
    
    if (isNaN(resourceId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid resource ID" 
      }, { status: 400 });
    }

    const existingResource = await prisma.resource.findUnique({ 
      where: { id: resourceId } 
    });
    
    if (!existingResource) {
      return NextResponse.json({ 
        success: false, 
        error: "Resource not found" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { downloads, isActive } = body;

    const updateData = {
      updatedAt: new Date()
    };

    if (downloads !== undefined) {
      updateData.downloads = downloads;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Resource updated successfully", 
      resource: cleanResourceResponse(resource)
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in PATCH:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Delete a resource (PROTECTED)
export async function DELETE(request, { params }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("🗑️ DELETE /api/resources/[id]");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    const resourceId = parseInt(id);
    
    if (isNaN(resourceId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid resource ID" 
      }, { status: 400 });
    }

    const resource = await prisma.resource.findUnique({ 
      where: { id: resourceId } 
    });
    
    if (!resource) {
      return NextResponse.json({ 
        success: false, 
        error: "Resource not found" 
      }, { status: 404 });
    }

    // Delete files from Cloudinary
    if (resource.files && Array.isArray(resource.files)) {
      const fileUrls = resource.files.map(file => file.url).filter(url => url);
      if (fileUrls.length > 0) {
        const deletePromises = fileUrls.map(url => deleteFileFromCloudinary(url));
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${fileUrls.length} files from Cloudinary`);
      }
    }

    await prisma.resource.delete({ where: { id: resourceId } });

    console.log(`✅ Resource deleted: ${resource.title} (ID: ${resourceId})`);

    return NextResponse.json({ 
      success: true, 
      message: "Resource and all associated files deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error deleting resource:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}