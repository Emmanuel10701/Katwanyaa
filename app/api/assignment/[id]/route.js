import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

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
          uploadedFiles.push(uploadedFile);
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }
  }
  
  return uploadedFiles;
};

// Helper: Delete multiple files from Cloudinary
const deleteFilesFromCloudinary = async (fileUrls) => {
  if (!fileUrls || !Array.isArray(fileUrls)) return;
  
  for (const fileUrl of fileUrls) {
    try {
      await deleteFileFromCloudinary(fileUrl);
    } catch (error) {
      console.error(`❌ Error deleting file ${fileUrl}:`, error);
    }
  }
};

// 🔹 PUT — Update assignment with file upload support
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const assignmentId = parseInt(id);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid assignment ID" },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    // Initialize update data
    const updateData = {};

    // Handle text fields
    const textFields = [
      'title', 'subject', 'className', 'teacher', 'status', 'description',
      'instructions', 'priority', 'estimatedTime', 'additionalWork',
      'teacherRemarks', 'feedback', 'grade'
    ];

    for (const field of textFields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        updateData[field] = value;
      }
    }

    // Handle date fields
    const dueDate = formData.get('dueDate');
    const dateAssigned = formData.get('dateAssigned');
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (dateAssigned) updateData.dateAssigned = new Date(dateAssigned);

    // Handle learning objectives
    const learningObjectives = formData.get('learningObjectives');
    if (learningObjectives && learningObjectives !== '') {
      try {
        updateData.learningObjectives = JSON.parse(learningObjectives);
      } catch (error) {
        console.error("Error parsing learning objectives:", error);
        updateData.learningObjectives = existingAssignment.learningObjectives || [];
      }
    }

    // Start with existing files
    let finalAssignmentFiles = existingAssignment.assignmentFiles || [];
    let finalAttachments = existingAssignment.attachments || [];

    console.log('📂 Existing assignment files:', finalAssignmentFiles);
    console.log('📂 Existing attachments:', finalAttachments);

    // Handle new assignment files upload
    const newAssignmentFiles = formData.getAll("assignmentFiles");
    if (newAssignmentFiles.length > 0 && newAssignmentFiles[0].name) {
      console.log(`📁 Uploading ${newAssignmentFiles.length} new assignment files`);
      
      const uploadedFiles = await uploadFilesToCloudinary(newAssignmentFiles, "assignment-files");
      console.log(`✅ New assignment files uploaded:`, uploadedFiles);
      
      // Add new files to existing ones
      finalAssignmentFiles = [...finalAssignmentFiles, ...uploadedFiles];
    }

    // Handle new attachments upload
    const newAttachments = formData.getAll("attachments");
    if (newAttachments.length > 0 && newAttachments[0].name) {
      console.log(`📁 Uploading ${newAttachments.length} new attachments`);
      
      const uploadedAttachments = await uploadFilesToCloudinary(newAttachments, "attachments");
      console.log(`✅ New attachments uploaded:`, uploadedAttachments);
      
      // Add new files to existing ones
      finalAttachments = [...finalAttachments, ...uploadedAttachments];
    }

    // Handle existing assignment files that should be kept
    const existingAssignmentFiles = formData.getAll("existingAssignmentFiles");
    if (existingAssignmentFiles.length > 0) {
      console.log(`📋 Keeping ${existingAssignmentFiles.length} existing assignment files`);
      
      // Filter to keep only the existing files that are in the list
      finalAssignmentFiles = finalAssignmentFiles.filter(file => 
        existingAssignmentFiles.includes(file)
      );
    }

    // Handle existing attachments that should be kept
    const existingAttachments = formData.getAll("existingAttachments");
    if (existingAttachments.length > 0) {
      console.log(`📋 Keeping ${existingAttachments.length} existing attachments`);
      
      // Filter to keep only the existing files that are in the list
      finalAttachments = finalAttachments.filter(file => 
        existingAttachments.includes(file)
      );
    }

    // Handle file removal flags (for complete removal)
    const removeAssignmentFiles = formData.get("removeAssignmentFiles");
    const removeAttachments = formData.get("removeAttachments");

    if (removeAssignmentFiles === "true") {
      console.log("🗑️ Removing all assignment files");
      // Delete old assignment files from Cloudinary
      if (existingAssignment.assignmentFiles && Array.isArray(existingAssignment.assignmentFiles)) {
        await deleteFilesFromCloudinary(existingAssignment.assignmentFiles);
      }
      finalAssignmentFiles = [];
    }

    if (removeAttachments === "true") {
      console.log("🗑️ Removing all attachments");
      // Delete old attachments from Cloudinary
      if (existingAssignment.attachments && Array.isArray(existingAssignment.attachments)) {
        await deleteFilesFromCloudinary(existingAssignment.attachments);
      }
      finalAttachments = [];
    }

    // Clean up files that were removed from the list but not flagged for complete removal
    const removedAssignmentFiles = existingAssignment.assignmentFiles?.filter(file => 
      !finalAssignmentFiles.includes(file)
    ) || [];
    
    const removedAttachments = existingAssignment.attachments?.filter(file => 
      !finalAttachments.includes(file)
    ) || [];

    if (removedAssignmentFiles.length > 0) {
      console.log(`🗑️ Cleaning up ${removedAssignmentFiles.length} removed assignment files`);
      await deleteFilesFromCloudinary(removedAssignmentFiles);
    }

    if (removedAttachments.length > 0) {
      console.log(`🗑️ Cleaning up ${removedAttachments.length} removed attachments`);
      await deleteFilesFromCloudinary(removedAttachments);
    }

    // Update the file arrays in the database
    updateData.assignmentFiles = finalAssignmentFiles;
    updateData.attachments = finalAttachments;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();

    console.log("📝 Final update data:", updateData);
    console.log("📂 Final assignment files:", finalAssignmentFiles);
    console.log("📂 Final attachments:", finalAttachments);

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment updated successfully",
        assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating assignment:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 🔹 GET — Get single assignment by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const assignmentId = parseInt(id);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid assignment ID" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching assignment:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 🔹 DELETE — Delete assignment with file cleanup
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const assignmentId = parseInt(id);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid assignment ID" },
        { status: 400 }
      );
    }

    // Check if assignment exists and get file paths
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete associated files from Cloudinary
    if (existingAssignment.assignmentFiles && Array.isArray(existingAssignment.assignmentFiles)) {
      await deleteFilesFromCloudinary(existingAssignment.assignmentFiles);
    }
    
    if (existingAssignment.attachments && Array.isArray(existingAssignment.attachments)) {
      await deleteFilesFromCloudinary(existingAssignment.attachments);
    }

    // Delete the assignment from database
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting assignment:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}