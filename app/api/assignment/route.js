import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

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
    let transformation = {};
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
      transformation = {
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" }
        ]
      };
    } else if (isVideo) {
      resourceType = 'video';
      transformation = {
        transformation: [
          { width: 1280, crop: "limit" },
          { quality: "auto" }
        ]
      };
    } else if (isAudio) {
      resourceType = 'video'; // Cloudinary treats audio as video
      transformation = {
        resource_type: 'video',
        format: 'mp3' // Convert audio to mp3
      };
    } else {
      // For ALL other files (PDFs, docs, etc.) - use 'raw' resource type
      resourceType = 'raw';
      uploadOptions = {
        resource_type: 'raw',
        // IMPORTANT: For raw files, use the full filename with extension
        public_id: `${timestamp}-${sanitizedFileName}${fileExt}`,
        // Preserve the original filename
        filename_override: originalName,
        // These settings preserve the original file
        use_filename: true,
        unique_filename: false,
        // Don't apply any transformations to raw files
        transformation: undefined
      };
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // Base options
          folder: `assignments/${folder}`,
          // Merge with type-specific options
          ...(resourceType !== 'raw' ? {
            public_id: `${timestamp}-${sanitizedFileName}`,
          } : {}),
          // Type-specific options override base
          ...transformation,
          ...uploadOptions,
          resource_type: resourceType
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
      name: originalName,
      size: file.size,
      type: file.type,
      format: result.format || fileExt.replace('.', ''),
      resource_type: result.resource_type,
      extension: fileExt,
      public_id: result.public_id
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
    const uploadMatch = pathname.match(/\/upload\/(?:v\d+\/)?(.*)/);
    
    if (uploadMatch) {
      publicId = uploadMatch[1];
      
      // Remove file extension for non-raw files
      if (pathname.includes('/image/') || 
          pathname.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
        resourceType = 'image';
        publicId = publicId.replace(/\.[^/.]+$/, '');
      } else if (pathname.includes('/video/') || 
                 pathname.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv|mp3|wav|m4a)$/i)) {
        resourceType = 'video';
        publicId = publicId.replace(/\.[^/.]+$/, '');
      } else if (pathname.includes('/raw/') || 
                 pathname.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i)) {
        resourceType = 'raw';
        // For raw files, keep the extension in public_id
      }
    }
    
    if (!publicId) return;
    
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

// Helper: Get file info from URL
const getFileInfoFromUrl = (url) => {
  if (!url) return null;
  
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  const extension = filename.substring(filename.lastIndexOf('.'));
  
  return {
    url,
    name: filename,
    extension: extension.toLowerCase()
  };
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
      // Get files from form data
      const assignmentFileInputs = formData.getAll("assignmentFiles");
      const attachmentInputs = formData.getAll("attachments");
      
      console.log(`📤 Uploading ${assignmentFileInputs.length} assignment files and ${attachmentInputs.length} attachments`);
      
      // Upload assignment files
      if (assignmentFileInputs.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(assignmentFileInputs, "assignment-files");
        assignmentFiles = uploadedFiles.map(file => file.url);
        console.log(`✅ Uploaded assignment files:`, uploadedFiles.map(f => f.name));
      }
      
      // Upload attachments
      if (attachmentInputs.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(attachmentInputs, "attachments");
        attachments = uploadedFiles.map(file => file.url);
        console.log(`✅ Uploaded attachments:`, uploadedFiles.map(f => f.name));
      }
      
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

    return NextResponse.json(
      {
        success: true,
        assignments,
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