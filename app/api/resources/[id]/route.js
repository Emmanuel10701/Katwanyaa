import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// Helper functions (same as above, but consolidated)
const uploadFileToCloudinary = async (file) => {
  if (!file || !file.name) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
    // Clean filename and remove extension for public_id
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "nextjs_uploads",
          public_id: `${timestamp}-${sanitizedFileName}`,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
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
      uploadedFiles.push({
        url: result.secure_url,
        name: file.name,
        size: formatFileSize(file.size),
        extension: file.name.split(".").pop().toLowerCase(),
        uploadedAt: new Date().toISOString(),
      });
    }
  }

  return uploadedFiles;
};

const deleteFileFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract public ID from Cloudinary URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split('.')[0]; // Remove extension
    
    await cloudinary.uploader.destroy(`nextjs_uploads/${publicId}`, {
      resource_type: "auto",
    });
    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
  } catch (err) {
    console.warn("⚠️ Could not delete Cloudinary file:", err.message);
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();

  const typeMap = {
    pdf: "pdf",
    doc: "document",
    docx: "document",
    ppt: "presentation",
    pptx: "presentation",
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    csv: "spreadsheet",
    jpg: "image",
    jpeg: "image",
    png: "image",
    mp4: "video",
    mp3: "audio",
    zip: "archive",
  };

  return typeMap[ext] || "document";
};

const determineMainTypeFromFiles = (files) => {
  if (!files || files.length === 0) return "document";

  const types = files.map((file) => getFileType(file.name));
  const typeCount = {};
  types.forEach((type) => {
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.keys(typeCount).reduce((a, b) =>
    typeCount[a] > typeCount[b] ? a : b
  );
};

function getUpdateMessage(action, fileCount) {
  switch (action) {
    case "addFiles":
      return `Added ${fileCount} file(s) to resource`;
    case "removeFile":
      return "File removed from resource";
    default:
      return "Resource updated successfully";
  }
}

// 🔹 GET — Get single resource by ID
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

    return NextResponse.json({ success: true, resource }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching resource:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// 🔹 PUT — Update a resource
export async function PUT(request, { params }) {
  try {
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

    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      return await handleFormUpdate(request, resourceId, existingResource);
    } else {
      return await handleJsonUpdate(request, resourceId);
    }
  } catch (error) {
    console.error("❌ Error updating resource:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function handleJsonUpdate(request, id) {
  try {
    const body = await request.json();
    const { id: _, createdAt, downloads, files, ...updateData } = body;

    const resource = await prisma.resource.update({
      where: { id: id },
      data: { 
        ...updateData, 
        updatedAt: new Date() 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Resource updated successfully", 
      resource 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in JSON update:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function handleFormUpdate(request, id, existingResource) {
  try {
    const formData = await request.formData();
    const action = formData.get("action") || "update";

    let updateData = {};
    let uploadedFiles = [...(existingResource.files || [])];

    switch (action) {
      case "addFiles":
        const newFiles = formData.getAll("files");
        if (newFiles && newFiles.length > 0 && newFiles[0].name) {
          const uploadedNewFiles = await uploadMultipleFilesToCloudinary(newFiles);
          uploadedFiles = [...uploadedFiles, ...uploadedNewFiles];
          updateData.type = determineMainTypeFromFiles(uploadedFiles);
        }
        break;

      case "removeFile":
        const fileNameToRemove = formData.get("fileName");
        if (fileNameToRemove) {
          const fileToRemove = uploadedFiles.find((f) => f.name === fileNameToRemove);
          if (fileToRemove) {
            await deleteFileFromCloudinary(fileToRemove.url);
          }
          uploadedFiles = uploadedFiles.filter((f) => f.name !== fileNameToRemove);
        }
        break;

      case "update":
      default:
        const title = formData.get("title")?.trim();
        const subject = formData.get("subject")?.trim();
        const className = formData.get("className")?.trim();
        const teacher = formData.get("teacher")?.trim();
        const description = formData.get("description")?.trim();
        const category = formData.get("category")?.trim();
        const accessLevel = formData.get("accessLevel")?.trim();
        const uploadedBy = formData.get("uploadedBy")?.trim();
        const isActive = formData.get("isActive");

        if (title !== null) updateData.title = title;
        if (subject !== null) updateData.subject = subject;
        if (className !== null) updateData.className = className;
        if (teacher !== null) updateData.teacher = teacher;
        if (description !== null) updateData.description = description;
        if (category !== null) updateData.category = category;
        if (accessLevel !== null) updateData.accessLevel = accessLevel;
        if (uploadedBy !== null) updateData.uploadedBy = uploadedBy;
        if (isActive !== null) updateData.isActive = isActive === "true";
        break;
    }

    if (action === "addFiles" || action === "removeFile") {
      updateData.files = uploadedFiles;
    }
    
    updateData.updatedAt = new Date();

    const resource = await prisma.resource.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: getUpdateMessage(action, uploadedFiles.length), 
      resource 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in form update:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// 🔹 DELETE — Delete a resource
export async function DELETE(request, { params }) {
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

    // Delete files from Cloudinary
    if (resource.files && Array.isArray(resource.files)) {
      for (const file of resource.files) {
        await deleteFileFromCloudinary(file.url);
      }
    }

    await prisma.resource.delete({ where: { id: resourceId } });

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

// 🔹 PATCH — Increment download count
export async function PATCH(request, { params }) {
  try {
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

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: { 
        downloads: { increment: 1 }, 
        updatedAt: new Date() 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Download count updated", 
      downloads: resource.downloads 
    }, { status: 200 });
  } catch (Error) {
    console.error("❌ Error updating download count:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}