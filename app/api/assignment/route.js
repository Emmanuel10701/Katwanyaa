import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Helper: Generate proper Cloudinary URL for raw files
const generateCloudinaryUrl = (publicId, resourceType, format = null, folder = null) => {
  const cloudName = cloudinary.config().cloud_name;
  let url = `https://res.cloudinary.com/${cloudName}`;
  
  if (resourceType === 'raw') {
    // For raw files, use different URL structure
    url += `/raw/upload`;
    if (folder) {
      url += `/${folder}`;
    }
    url += `/${publicId}`;
  } else {
    // For images/videos, use regular URL
    url += `/${resourceType}/upload`;
    if (folder) {
      url += `/${folder}`;
    }
    url += `/${publicId}`;
    if (format) {
      url += `.${format}`;
    }
  }
  
  return url;
};

// Helper: Upload file to Cloudinary with PROPER raw file handling
const uploadFileToCloudinary = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    
    // Get file extension (lowercase)
    const fileExt = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    // Determine resource type
    let resourceType = 'image'; // default
    let uploadOptions = {};
    
    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isPdf = file.type === 'application/pdf' || fileExt === '.pdf';
    const isDocument = file.type.includes('document') || 
                       file.type.includes('sheet') || 
                       file.type.includes('presentation') ||
                       ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(fileExt);
    const isText = file.type.includes('text') || fileExt === '.txt';
    const isArchive = fileExt.match(/\.(zip|rar|7z|tar|gz)$/i);
    
    if (isImage) {
      resourceType = 'image';
      uploadOptions = {
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" }
        ]
      };
    } else if (isVideo) {
      resourceType = 'video';
      uploadOptions = {
        transformation: [
          { width: 1280, crop: "limit" },
          { quality: "auto" }
        ]
      };
    } else if (isAudio) {
      resourceType = 'video';
      uploadOptions = {
        resource_type: 'video',
        format: 'mp3'
      };
    } else {
      // For ALL other files (PDFs, docs, etc.) - use 'raw' resource type
      resourceType = 'raw';
      uploadOptions = {
        resource_type: 'raw',
        // IMPORTANT: Use the original filename for raw files
        public_id: `${sanitizedFileName}${fileExt}`,
        // Set to true to use the original filename
        use_filename: true,
        // Don't add unique identifiers
        unique_filename: false,
        // Override the filename
        filename_override: originalName,
        // Don't apply transformations to raw files
        transformation: undefined
      };
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // Base options
          folder: `assignments/${folder}`,
          resource_type: resourceType,
          // For non-raw files, use timestamp in public_id
          ...(resourceType !== 'raw' && {
            public_id: `${timestamp}-${sanitizedFileName}`,
          }),
          // Merge with type-specific options
          ...uploadOptions,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error details:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload result:", {
              resource_type: result.resource_type,
              format: result.format,
              public_id: result.public_id,
              secure_url: result.secure_url
            });
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });
    
    // Generate a proper download URL
    let downloadUrl = result.secure_url;
    
    // If it's a raw file, we need to construct a direct download URL
    if (resourceType === 'raw') {
      // For raw files, Cloudinary doesn't always provide direct download URLs
      // We need to use the asset URL format
      const cloudName = cloudinary.config().cloud_name;
      // This is the format for direct download of raw files
      downloadUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${result.public_id}`;
      
      // Alternative: Use the delivery URL if available
      if (result.secure_url && result.secure_url.includes('cloudinary.com')) {
        // Keep the original secure_url but ensure it's the direct one
        downloadUrl = result.secure_url.replace('/upload/', '/raw/upload/');
      }
    }
    
    return {
      url: downloadUrl,
      originalUrl: result.secure_url, // Keep original for reference
      name: originalName,
      size: file.size,
      type: file.type,
      format: result.format || fileExt.replace('.', ''),
      resource_type: result.resource_type,
      extension: fileExt,
      public_id: result.public_id,
      isRawFile: resourceType === 'raw'
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete file from Cloudinary - FIXED for all types
const deleteFileFromCloudinary = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('cloudinary.com')) return;

  try {
    // Parse the URL
    const url = new URL(fileUrl);
    const pathname = url.pathname;
    
    // Extract public_id from URL pattern
    let publicId = '';
    let resourceType = 'image';
    
    // Match patterns like: /upload/v1234567890/folder/filename.ext
    // Or: /raw/upload/v1234567890/folder/filename.ext
    const rawMatch = pathname.match(/\/raw\/upload\/(?:v\d+\/)?(.*)/);
    const uploadMatch = pathname.match(/\/upload\/(?:v\d+\/)?(.*)/);
    
    if (rawMatch) {
      // This is a raw file
      publicId = rawMatch[1];
      resourceType = 'raw';
      // For raw files, keep the extension in public_id
    } else if (uploadMatch) {
      publicId = uploadMatch[1];
      
      // Determine resource type from URL pattern
      if (pathname.includes('/video/') || 
          pathname.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv|mp3|wav|m4a)$/i)) {
        resourceType = 'video';
        publicId = publicId.replace(/\.[^/.]+$/, '');
      } else if (pathname.includes('/image/') || 
                 pathname.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
        resourceType = 'image';
        publicId = publicId.replace(/\.[^/.]+$/, '');
      } else {
        // Assume it's raw if it has document extensions
        resourceType = 'raw';
        // Keep extension for raw files
      }
    }
    
    if (!publicId) return;
    
    console.log(`Deleting from Cloudinary: ${publicId} (${resourceType})`);
    
    // Delete the file
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    
    console.log(`✅ Deleted from Cloudinary: ${publicId} (${resourceType})`);
    return result;
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
    return null;
  }
};

// Helper: Upload multiple files
const uploadFilesToCloudinary = async (files, folder = "assignments") => {
  const uploadedFiles = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);
        const uploadedFile = await uploadFileToCloudinary(file, folder);
        if (uploadedFile) {
          console.log(`✅ Uploaded: ${uploadedFile.name} as ${uploadedFile.resource_type}`);
          uploadedFiles.push(uploadedFile);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  }
  
  return uploadedFiles;
};

// Helper: Get file info from URL (improved for raw files)
const getFileInfoFromUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract filename from URL
    const pathParts = pathname.split('/');
    let fileName = pathParts[pathParts.length - 1];
    
    // If it's a raw file URL, it might have version prefix
    if (fileName.startsWith('v')) {
      // Remove version prefix
      fileName = pathParts[pathParts.length - 1].substring(1);
    }
    
    // Extract extension
    const extension = fileName.includes('.') 
      ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      : '';
    
    // Determine file type
    const getFileType = (ext, urlStr) => {
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
        '.mp4': 'Video',
        '.mov': 'Video',
        '.avi': 'Video',
        '.mp3': 'Audio',
        '.wav': 'Audio',
        '.m4a': 'Audio',
        '.xls': 'Excel Spreadsheet',
        '.xlsx': 'Excel Spreadsheet',
        '.ppt': 'Presentation',
        '.pptx': 'Presentation',
        '.zip': 'Archive',
        '.rar': 'Archive'
      };
      
      if (ext in typeMap) {
        return typeMap[ext];
      }
      
      // Check URL pattern
      if (urlStr.includes('/raw/upload/')) {
        return 'Document';
      }
      
      return 'File';
    };

    return {
      url,
      fileName,
      extension,
      fileType: getFileType(extension, url),
      isRawFile: url.includes('/raw/upload/') || 
                 ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'].includes(extension)
    };
  } catch (error) {
    console.error("Error parsing URL:", url, error);
    return {
      url,
      fileName: 'download',
      extension: '',
      fileType: 'File',
      isRawFile: false
    };
  }
};

// Helper: Generate direct download URL for raw files
const getDirectDownloadUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return cloudinaryUrl;
  }
  
  try {
    const url = new URL(cloudinaryUrl);
    const pathname = url.pathname;
    
    // If it's already a raw URL, return as-is
    if (pathname.includes('/raw/upload/')) {
      return cloudinaryUrl;
    }
    
    // If it's a regular upload URL for documents, convert to raw
    if (pathname.includes('/upload/') && 
        cloudinaryUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i)) {
      // Convert /upload/ to /raw/upload/
      return cloudinaryUrl.replace('/upload/', '/raw/upload/');
    }
    
    return cloudinaryUrl;
  } catch (error) {
    console.error("Error generating direct download URL:", error);
    return cloudinaryUrl;
  }
};

// 🔹 POST — Create a new assignment (UPDATED with better file handling)
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract fields
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

    // Validate required fields
    if (!title || !subject || !className || !teacher || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Title, subject, class, teacher, and due date are required" },
        { status: 400 }
      );
    }

    // Handle file uploads
    let assignmentFiles = [];
    let attachments = [];
    let fileDetails = []; // Store details for debugging
    
    try {
      // Get files from form data
      const assignmentFileInputs = formData.getAll("assignmentFiles");
      const attachmentInputs = formData.getAll("attachments");
      
      console.log(`📤 Uploading ${assignmentFileInputs.length} assignment files and ${attachmentInputs.length} attachments`);
      
      // Upload assignment files
      if (assignmentFileInputs.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(assignmentFileInputs, "assignment-files");
        assignmentFiles = uploadedFiles.map(file => {
          // For raw files, use direct download URL
          const url = file.isRawFile ? getDirectDownloadUrl(file.url) : file.url;
          fileDetails.push({
            name: file.name,
            type: file.type,
            resource_type: file.resource_type,
            url: url,
            originalUrl: file.originalUrl
          });
          return url;
        });
        console.log(`✅ Uploaded assignment files:`, uploadedFiles.map(f => ({
          name: f.name,
          type: f.resource_type,
          url: f.url
        })));
      }
      
      // Upload attachments
      if (attachmentInputs.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(attachmentInputs, "attachments");
        attachments = uploadedFiles.map(file => {
          // For raw files, use direct download URL
          const url = file.isRawFile ? getDirectDownloadUrl(file.url) : file.url;
          fileDetails.push({
            name: file.name,
            type: file.type,
            resource_type: file.resource_type,
            url: url,
            originalUrl: file.originalUrl
          });
          return url;
        });
        console.log(`✅ Uploaded attachments:`, uploadedFiles.map(f => ({
          name: f.name,
          type: f.resource_type,
          url: f.url
        })));
      }
      
      console.log("📋 File details:", fileDetails);
      
    } catch (fileError) {
      console.error("File upload error:", fileError);
      return NextResponse.json(
        { success: false, error: "Failed to upload files. Please try again." },
        { status: 500 }
      );
    }

    // Parse learning objectives
    let learningObjectivesArray = [];
    try {
      learningObjectivesArray = JSON.parse(learningObjectives);
    } catch (error) {
      console.error("Error parsing learning objectives:", error);
      learningObjectivesArray = [];
    }

    // Create assignment in database
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
        fileDetails: fileDetails
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

// 🔹 GET — Fetch all assignments with filtering (UPDATED with better file info)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const className = searchParams.get("class");
    const subject = searchParams.get("subject");
    const status = searchParams.get("status");
    const teacher = searchParams.get("teacher");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
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

    // Get assignments with pagination
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    // Process assignments to add file information
    const processedAssignments = assignments.map(assignment => {
      // Convert file URLs to file info objects
      const assignmentFileAttachments = (assignment.assignmentFiles || []).map((url, index) => {
        const fileInfo = getFileInfoFromUrl(url);
        // Ensure we have a direct download URL for raw files
        if (fileInfo?.isRawFile) {
          fileInfo.downloadUrl = getDirectDownloadUrl(url);
        }
        return fileInfo;
      }).filter(Boolean);
      
      const attachmentAttachments = (assignment.attachments || []).map((url, index) => {
        const fileInfo = getFileInfoFromUrl(url);
        // Ensure we have a direct download URL for raw files
        if (fileInfo?.isRawFile) {
          fileInfo.downloadUrl = getDirectDownloadUrl(url);
        }
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