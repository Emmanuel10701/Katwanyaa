import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import { FileManager } from "../../../../libs/manager";

// Helper: Upload file to Supabase
const uploadFileToSupabase = async (file, folder = "assignments") => {
  if (!file?.name || file.size === 0) return null;

  try {
    const result = await FileManager.uploadFile(file, `assignments/${folder}`);
    return result?.url || null;
  } catch (error) {
    console.error("❌ Supabase upload error:", error);
    return null;
  }
};

// Helper: Delete file from Supabase
const deleteFileFromSupabase = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    await FileManager.deleteFile(fileUrl);
  } catch (error) {
    console.error("❌ Error deleting file from Supabase:", error);
  }
};

// Helper: Delete multiple files from Supabase
const deleteFilesFromSupabase = async (fileUrls) => {
  if (!fileUrls || (Array.isArray(fileUrls) && fileUrls.length === 0)) return;

  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  
  for (const url of urls) {
    if (url) {
      await deleteFileFromSupabase(url);
    }
  }
};

// Helper: Upload multiple files to Supabase
const uploadFilesToSupabase = async (files, folder = "assignments") => {
  const uploadedUrls = [];
  
  for (const file of files) {
    if (file && file.name && file.size > 0) {
      try {
        const uploadedUrl = await uploadFileToSupabase(file, folder);
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

    // Extract updated fields
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
      await deleteFilesFromSupabase(assignmentFilesToRemove);
      updatedAssignmentFiles = updatedAssignmentFiles.filter(file => !assignmentFilesToRemove.includes(file));
    }
    
    if (attachmentsToRemove.length > 0) {
      await deleteFilesFromSupabase(attachmentsToRemove);
      updatedAttachments = updatedAttachments.filter(file => !attachmentsToRemove.includes(file));
    }
    
    // Add new files
    const newAssignmentFiles = formData.getAll("assignmentFiles");
    const newAttachments = formData.getAll("attachments");
    
    if (newAssignmentFiles.length > 0) {
      const uploadedFiles = await uploadFilesToSupabase(newAssignmentFiles, "assignment-files");
      updatedAssignmentFiles = [...updatedAssignmentFiles, ...uploadedFiles];
    }
    
    if (newAttachments.length > 0) {
      const uploadedFiles = await uploadFilesToSupabase(newAttachments, "attachments");
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

    // Delete all files from Supabase
    const allFiles = [
      ...(assignment.assignmentFiles || []),
      ...(assignment.attachments || [])
    ];
    
    if (allFiles.length > 0) {
      await deleteFilesFromSupabase(allFiles);
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