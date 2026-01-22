import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// Helper: Upload file to Cloudinary (same as in collection route)
const uploadFileToCloudinary = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    
    const fileExt = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    let resourceType = 'image';
    let transformation = {};
    let uploadOptions = {};
    
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isPdf = file.type === 'application/pdf' || fileExt === '.pdf';
    const isDocument = file.type.includes('document') || 
                       file.type.includes('sheet') || 
                       file.type.includes('presentation') ||
                       ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(fileExt);
    
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
      resourceType = 'video';
      transformation = {
        resource_type: 'video',
        format: 'mp3'
      };
    } else {
      resourceType = 'raw';
      uploadOptions = {
        resource_type: 'raw',
        public_id: `${timestamp}-${sanitizedFileName}${fileExt}`,
        filename_override: originalName,
        use_filename: true,
        unique_filename: false,
        transformation: undefined
      };
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `assignments/${folder}`,
          ...(resourceType !== 'raw' ? {
            public_id: `${timestamp}-${sanitizedFileName}`,
          } : {}),
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
    
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete file from Cloudinary
const deleteFileFromCloudinary = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('cloudinary.com')) return;

  try {
    const url = new URL(fileUrl);
    const pathname = url.pathname;
    
    let publicId = '';
    let resourceType = 'image';
    
    const uploadMatch = pathname.match(/\/upload\/(?:v\d+\/)?(.*)/);
    
    if (uploadMatch) {
      publicId = uploadMatch[1];
      
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
      }
    }
    
    if (!publicId) return;
    
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    
    console.log(`✅ Deleted: ${publicId} (${resourceType})`);
  } catch (error) {
    console.error("❌ Error deleting file:", error);
  }
};

// Helper: Delete multiple files
const deleteFilesFromCloudinary = async (fileUrls) => {
  if (!fileUrls || (Array.isArray(fileUrls) && fileUrls.length === 0)) return;

  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  
  for (const url of urls) {
    if (url) {
      await deleteFileFromCloudinary(url);
    }
  }
};

// Helper: Upload multiple files
const uploadFilesToCloudinary = async (files, folder = "assignments") => {
  const uploadedUrls = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        const uploadedUrl = await uploadFileToCloudinary(file, folder);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  }
  
  return uploadedUrls;
};

// 🔹 GET single assignment
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
    
    return NextResponse.json({ 
      success: true, 
      assignment 
    });
  } catch (error) {
    console.error("❌ GET Single Assignment Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignment" }, 
      { status: 500 }
    );
  }
}

// 🔹 PUT update assignment
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Extract updated fields (use existing values as defaults)
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
    const learningObjectives = formData.get("learningObjectives")?.toString() || JSON.stringify(existingAssignment.learningObjectives);

    // Handle file updates
    let updatedAssignmentFiles = [...existingAssignment.assignmentFiles];
    let updatedAttachments = [...existingAssignment.attachments];
    
    // Remove files if specified
    const assignmentFilesToRemove = formData.getAll("assignmentFilesToRemove");
    const attachmentsToRemove = formData.getAll("attachmentsToRemove");
    
    if (assignmentFilesToRemove.length > 0) {
      await deleteFilesFromCloudinary(assignmentFilesToRemove);
      updatedAssignmentFiles = updatedAssignmentFiles.filter(file => !assignmentFilesToRemove.includes(file));
    }
    
    if (attachmentsToRemove.length > 0) {
      await deleteFilesFromCloudinary(attachmentsToRemove);
      updatedAttachments = updatedAttachments.filter(file => !attachmentsToRemove.includes(file));
    }
    
    // Add new files
    const newAssignmentFiles = formData.getAll("assignmentFiles");
    const newAttachments = formData.getAll("attachments");
    
    if (newAssignmentFiles.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(newAssignmentFiles, "assignment-files");
      updatedAssignmentFiles = [...updatedAssignmentFiles, ...uploadedFiles];
    }
    
    if (newAttachments.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(newAttachments, "attachments");
      updatedAttachments = [...updatedAttachments, ...uploadedFiles];
    }
    
    // Parse learning objectives
    let learningObjectivesArray = existingAssignment.learningObjectives;
    try {
      learningObjectivesArray = JSON.parse(learningObjectives);
    } catch (error) {
      console.error("Error parsing learning objectives:", error);
    }
    
    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: { 
        title,
        subject,
        className,
        teacher,
        dueDate: new Date(dueDate),
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

// 🔹 DELETE assignment
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID is required" },
        { status: 400 }
      );
    }

    // Find assignment to get file URLs
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete all files from Cloudinary
    const allFiles = [
      ...(assignment.assignmentFiles || []),
      ...(assignment.attachments || [])
    ];
    
    if (allFiles.length > 0) {
      await deleteFilesFromCloudinary(allFiles);
    }

    // Delete from database
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