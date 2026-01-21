import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Helper: Upload file to Cloudinary
const uploadFileToCloudinary = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    // Determine resource type
    let resourceType = 'auto';
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
    } else if (file.type.includes('pdf') || file.type.includes('document') || 
               file.type.includes('sheet') || file.type.includes('presentation')) {
      resourceType = 'raw';
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
      url: result.secure_url,
      name: originalName,
      size: file.size,
      type: file.type,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete file from Cloudinary
const deleteFileFromCloudinary = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('cloudinary.com')) return;

  try {
    // Extract public ID from Cloudinary URL
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return;
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    // Determine resource type from URL
    let resourceType = 'auto';
    if (fileUrl.includes('/video/') || fileUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      resourceType = 'video';
    } else if (fileUrl.includes('/image/') || fileUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      resourceType = 'image';
    } else if (fileUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
      resourceType = 'raw';
    }
    
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("❌ Error deleting file from Cloudinary:", error);
  }
};

// Helper: Upload multiple files to Cloudinary
const uploadFilesToCloudinary = async (files, folder = "assignments") => {
  const uploadedFiles = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        const uploadedFile = await uploadFileToCloudinary(file, folder);
        if (uploadedFile) {
          uploadedFiles.push(uploadedFile.url);
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }
  }
  
  return uploadedFiles;
};

// 🔹 POST — Create a new assignment
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract all fields from FormData
    const title = formData.get("title") || "";
    const subject = formData.get("subject") || "";
    const className = formData.get("className") || "";
    const teacher = formData.get("teacher") || "";
    const dueDate = formData.get("dueDate") || "";
    const dateAssigned = formData.get("dateAssigned") || new Date().toISOString();
    const status = formData.get("status") || "assigned";
    const description = formData.get("description") || "";
    const instructions = formData.get("instructions") || "";
    const priority = formData.get("priority") || "medium";
    const estimatedTime = formData.get("estimatedTime") || "";
    const additionalWork = formData.get("additionalWork") || "";
    const teacherRemarks = formData.get("teacherRemarks") || "";
    const learningObjectives = formData.get("learningObjectives") || "[]";

    // Validate required fields
    if (!title || !subject || !className || !teacher || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Title, subject, class, teacher, and due date are required" },
        { status: 400 }
      );
    }

    // Handle file uploads to Cloudinary
    let assignmentFiles = [];
    let attachments = [];
    
    try {
      // Upload assignment files
      const assignmentFileInputs = formData.getAll("assignmentFiles");
      assignmentFiles = await uploadFilesToCloudinary(assignmentFileInputs, "assignment-files");
      
      // Upload attachment files
      const attachmentInputs = formData.getAll("attachments");
      attachments = await uploadFilesToCloudinary(attachmentInputs, "attachments");
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating assignment:", error);
    return NextResponse.json(
      { success: false, error: error.message },
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