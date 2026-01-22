import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";
import { FileManager } from "../../../libs/manager";

// Helper: Upload file - images/videos to Cloudinary, documents to Supabase
const uploadFileToStorage = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const originalName = file.name;
    const fileExt = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
    
    // Determine file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isDocument = file.type.includes('document') || 
                       file.type.includes('sheet') || 
                       file.type.includes('presentation') ||
                       file.type === 'application/pdf' ||
                       file.type.includes('text') ||
                       ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'].includes(fileExt);
    
    let result;
    
    if (isImage || isVideo || isAudio) {
      // Use Cloudinary for images, videos, audio
      result = await uploadFileToCloudinary(file, folder);
    } else if (isDocument) {
      // Use Supabase for documents
      result = await FileManager.uploadFile(file, `assignments/${folder}`);
    } else {
      // Default to Supabase for unknown types
      result = await FileManager.uploadFile(file, `assignments/${folder}`);
    }
    
    if (!result) return null;
    
    return {
      url: result.url || result.secure_url,
      name: originalName,
      size: file.size,
      type: file.type,
      extension: fileExt,
      isCloudinary: isImage || isVideo || isAudio,
      storageType: isImage || isVideo || isAudio ? 'cloudinary' : 'supabase'
    };
  } catch (error) {
    console.error("❌ File upload error:", error);
    return null;
  }
};

// Helper: Upload file to Cloudinary (for images/videos/audio)
const uploadFileToCloudinary = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    let resourceType = 'image';
    let transformation = {};
    
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
      transformation = {
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" }
        ]
      };
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
      transformation = {
        transformation: [
          { width: 1280, crop: "limit" },
          { quality: "auto" }
        ]
      };
    } else if (file.type.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio
      transformation = {
        resource_type: 'video',
        format: 'mp3'
      };
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `assignments/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          ...transformation
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return {
      secure_url: result.secure_url,
      name: originalName,
      size: file.size,
      type: file.type,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete file from appropriate storage
const deleteFileFromStorage = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (fileUrl.includes('cloudinary.com')) {
      await deleteFileFromCloudinary(fileUrl);
    } else if (fileUrl.includes('supabase.co')) {
      await FileManager.deleteFile(fileUrl);
    }
  } catch (error) {
    console.error("❌ Error deleting file:", error);
  }
};

// Helper: Delete file from Cloudinary
const deleteFileFromCloudinary = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('cloudinary.com')) return;

  try {
    const url = new URL(fileUrl);
    const pathname = url.pathname;
    
    const uploadMatch = pathname.match(/\/upload\/(?:v\d+\/)?(.*)/);
    
    if (uploadMatch) {
      let publicId = uploadMatch[1];
      let resourceType = 'image';
      
      if (pathname.includes('/video/')) {
        resourceType = 'video';
        publicId = publicId.replace(/\.[^/.]+$/, '');
      } else if (pathname.includes('/image/')) {
        resourceType = 'image';
        publicId = publicId.replace(/\.[^/.]+$/, '');
      } else {
        resourceType = 'raw';
      }
      
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true
      });
      
      console.log(`✅ Deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
  }
};

// Helper: Upload multiple files
const uploadFilesToStorage = async (files, folder = "assignments") => {
  const uploadedFiles = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        const uploadedFile = await uploadFileToStorage(file, folder);
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

// Helper: Get file info from URL
const getFileInfoFromUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract filename from URL
    const pathParts = pathname.split('/');
    let fileName = pathParts[pathParts.length - 1];
    
    // If it's a Cloudinary URL with version prefix
    if (fileName.startsWith('v')) {
      fileName = fileName.substring(1);
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
      
      return 'File';
    };

    return {
      url,
      fileName,
      extension,
      fileType: getFileType(extension, url),
      storageType: url.includes('cloudinary.com') ? 'cloudinary' : 'supabase'
    };
  } catch (error) {
    console.error("Error parsing URL:", url, error);
    return {
      url,
      fileName: 'download',
      extension: '',
      fileType: 'File',
      storageType: 'unknown'
    };
  }
};

// 🔹 POST — Create a new assignment
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
    
    try {
      // Upload assignment files
      const assignmentFileInputs = formData.getAll("assignmentFiles");
      const uploadedAssignmentFiles = await uploadFilesToStorage(assignmentFileInputs, "assignment-files");
      assignmentFiles = uploadedAssignmentFiles.map(file => file.url);
      console.log(`✅ Uploaded assignment files:`, uploadedAssignmentFiles.map(f => ({
        name: f.name,
        storage: f.storageType,
        url: f.url
      })));
      
      // Upload attachments
      const attachmentInputs = formData.getAll("attachments");
      const uploadedAttachments = await uploadFilesToStorage(attachmentInputs, "attachments");
      attachments = uploadedAttachments.map(file => file.url);
      console.log(`✅ Uploaded attachments:`, uploadedAttachments.map(f => ({
        name: f.name,
        storage: f.storageType,
        url: f.url
      })));
      
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

// 🔹 GET — Fetch all assignments with filtering
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