import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";
import { FileManager } from "../../../../libs/manager";

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
    
    return result.url || result.secure_url;
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
      resourceType = 'video';
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

// Helper: Delete multiple files
const deleteFilesFromStorage = async (fileUrls) => {
  if (!fileUrls || (Array.isArray(fileUrls) && fileUrls.length === 0)) return;

  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  
  for (const url of urls) {
    if (url) {
      await deleteFileFromStorage(url);
    }
  }
};

// Helper: Upload multiple files
const uploadFilesToStorage = async (files, folder = "assignments") => {
  const uploadedUrls = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        const uploadedUrl = await uploadFileToStorage(file, folder);
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
      await deleteFilesFromStorage(assignmentFilesToRemove);
      updatedAssignmentFiles = updatedAssignmentFiles.filter(file => !assignmentFilesToRemove.includes(file));
    }
    
    if (attachmentsToRemove.length > 0) {
      await deleteFilesFromStorage(attachmentsToRemove);
      updatedAttachments = updatedAttachments.filter(file => !attachmentsToRemove.includes(file));
    }
    
    // Add new files
    const newAssignmentFiles = formData.getAll("assignmentFiles");
    const newAttachments = formData.getAll("attachments");
    
    if (newAssignmentFiles.length > 0) {
      const uploadedFiles = await uploadFilesToStorage(newAssignmentFiles, "assignment-files");
      updatedAssignmentFiles = [...updatedAssignmentFiles, ...uploadedFiles];
    }
    
    if (newAttachments.length > 0) {
      const uploadedFiles = await uploadFilesToStorage(newAttachments, "attachments");
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

    // Delete all files from storage
    const allFiles = [
      ...(assignment.assignmentFiles || []),
      ...(assignment.attachments || [])
    ];
    
    if (allFiles.length > 0) {
      await deleteFilesFromStorage(allFiles);
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