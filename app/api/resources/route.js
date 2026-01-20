import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Helper functions
const uploadFileToCloudinary = async (file) => {
  if (!file || !file.name) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
    // Clean filename and remove extension for public_id
    const originalName = file.name;
    const extension = originalName.split('.').pop().toLowerCase();
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "nextjs_uploads",
          public_id: `${timestamp}-${sanitizedFileName}`,
          // Don't add extension to public_id, Cloudinary will handle it
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
    // Skip empty files
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
    txt: "document",
    ppt: "presentation",
    pptx: "presentation",
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    csv: "spreadsheet",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    mp4: "video",
    mov: "video",
    mp3: "audio",
    wav: "audio",
    zip: "archive",
    rar: "archive",
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

// 🔹 GET — Fetch all resources
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      success: true, 
      resources, 
      count: resources.length 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching resources:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// 🔹 POST — Create resource with multiple files
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract fields
    const title = formData.get("title")?.trim() || "";
    const subject = formData.get("subject")?.trim() || "";
    const className = formData.get("className")?.trim() || "";
    const teacher = formData.get("teacher")?.trim() || "";
    const description = formData.get("description")?.trim() || "";
    const category = formData.get("category")?.trim() || "general";
    const accessLevel = formData.get("accessLevel")?.trim() || "student";
    const uploadedBy = formData.get("uploadedBy")?.trim() || "System";
    const isActive = formData.get("isActive") !== "false";

    if (!title || !subject || !className || !teacher) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Title, subject, class, and teacher are required" 
        },
        { status: 400 }
      );
    }

    const files = formData.getAll("files");
    const validFiles = files.filter(file => file && file.name && file.size > 0);
    
    if (validFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "At least one valid file is required" 
      }, { status: 400 });
    }

    // Upload files to Cloudinary
    const uploadedFiles = await uploadMultipleFilesToCloudinary(validFiles);
    if (uploadedFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to upload files" 
      }, { status: 500 });
    }

    const mainType = determineMainTypeFromFiles(validFiles);

    // Save resource to database
    const resource = await prisma.resource.create({
      data: {
        title,
        subject,
        className,
        teacher,
        description,
        category,
        type: mainType,
        files: uploadedFiles,
        accessLevel,
        uploadedBy,
        downloads: 0,
        isActive,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `Resource created with ${uploadedFiles.length} file(s)`, 
        resource 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating resource:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}