import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import { FileManager } from "../../../../libs/superbase"; // Changed from cloudinary

// Helper functions
const uploadFileToSupabase = async (file) => {
  if (!file || !file.name || file.size === 0) return null;

  try {
    const result = await FileManager.uploadFile(file, `resources/files`);
    
    if (!result) return null;
    
    return {
      url: result.url,
      name: result.fileName,
      size: result.fileSize,
      extension: result.fileName.substring(result.fileName.lastIndexOf('.')).toLowerCase(),
      uploadedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ Supabase upload error:", err);
    return null;
  }
};

const uploadMultipleFilesToSupabase = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadedFiles = [];

  for (const file of files) {
    if (!file.name || file.size === 0) continue;
    
    const result = await uploadFileToSupabase(file);
    if (result) {
      uploadedFiles.push({
        url: result.url,
        name: result.name,
        size: formatFileSize(result.size),
        extension: result.extension,
        uploadedAt: result.uploadedAt,
      });
    }
  }

  return uploadedFiles;
};

const deleteFileFromSupabase = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Use FileManager to delete file
    await FileManager.deleteFiles(fileUrl);
    console.log(`✅ Deleted from Supabase: ${fileUrl}`);
  } catch (err) {
    console.warn("⚠️ Could not delete Supabase file:", err.message);
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
    webp: "image",
    bmp: "image",
    svg: "image",
    mp4: "video",
    mov: "video",
    avi: "video",
    wmv: "video",
    flv: "video",
    webm: "video",
    mkv: "video",
    mp3: "audio",
    wav: "audio",
    m4a: "audio",
    ogg: "audio",
    zip: "archive",
    rar: "archive",
    "7z": "archive",
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
          const uploadedNewFiles = await uploadMultipleFilesToSupabase(newFiles);
          uploadedFiles = [...uploadedFiles, ...uploadedNewFiles];
          updateData.type = determineMainTypeFromFiles(uploadedFiles);
        }
        break;

      case "removeFile":
        const fileNameToRemove = formData.get("fileName");
        if (fileNameToRemove) {
          const fileToRemove = uploadedFiles.find((f) => f.name === fileNameToRemove);
          if (fileToRemove) {
            await deleteFileFromSupabase(fileToRemove.url);
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

    // Delete files from Supabase
    if (resource.files && Array.isArray(resource.files)) {
      const fileUrls = resource.files.map(file => file.url).filter(url => url);
      if (fileUrls.length > 0) {
        await FileManager.deleteFiles(fileUrls);
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
  } catch (error) {
    console.error("❌ Error updating download count:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}