import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";
import { randomUUID } from "crypto";

// Helper: Upload file to Cloudinary
const uploadFileToCloudinary = async (file) => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");

    const isVideo = file.type.startsWith('video/');
    
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: isVideo ? "video" : "image",
          folder: "school_gallery",
          public_id: `${timestamp}-${sanitizedFileName}`,
          ...(isVideo ? {
            transformation: [
              { width: 1280, crop: "scale" },
              { quality: "auto" }
            ]
          } : {
            transformation: [
              { width: 1200, height: 800, crop: "fill" },
              { quality: "auto:good" }
            ]
          })
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
  } catch {
    return null;
  }
};

// Helper: Delete files from Cloudinary
const deleteFilesFromCloudinary = async (fileUrls) => {
  if (!Array.isArray(fileUrls)) return;

  try {
    const deletePromises = fileUrls.map(async (fileUrl) => {
      if (!fileUrl?.includes('cloudinary.com')) return;

      try {
        const urlMatch = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+(?:$|\?)/);
        if (!urlMatch) return;
        
        const publicId = urlMatch[1];
        const isVideo = fileUrl.includes('/video/') || 
                       fileUrl.match(/\.(mp4|mpeg|avi|mov|wmv|flv|webm|mkv)$/i);
        
        await cloudinary.uploader.destroy(publicId, { 
          resource_type: isVideo ? "video" : "image" 
        });
      } catch {
        // Silent fail on individual file delete
      }
    });

    await Promise.all(deletePromises);
  } catch {
    // Silent fail
  }
};

// 🔹 GET all galleries
export async function GET() {
  try {
    const galleries = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, galleries });
  } catch (error) {
    console.error("❌ GET Gallery Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
}

// 🔹 POST new gallery
export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: "Title and category are required" },
        { status: 400 }
      );
    }

    // Valid categories
    const validCategories = [
      'GENERAL', 'CLASSROOMS', 'LABORATORIES', 'DORMITORIES', 
      'DINING_HALL', 'SPORTS_FACILITIES', 'TEACHING', 
      'SCIENCE_LAB', 'COMPUTER_LAB', 'SPORTS_DAY', 
      'MUSIC_FESTIVAL', 'DRAMA_PERFORMANCE', 'ART_EXHIBITION', 
      'DEBATE_COMPETITION', 'SCIENCE_FAIR', 'ADMIN_OFFICES', 'STAFF', 
      'PRINCIPAL', 'BOARD', 'GRADUATION', 'AWARD_CEREMONY', 'PARENTS_DAY', 
      'OPEN_DAY', 'VISITORS', 'STUDENT_ACTIVITIES', 'CLUBS', 'COUNCIL', 
      'LEADERSHIP', 'OTHER'
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    // Handle multiple files (images/videos)
    const files = [];
    const fileEntries = formData.getAll("files");
    
    if (fileEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one file is required" },
        { status: 400 }
      );
    }

    // Upload files to Cloudinary
    for (const file of fileEntries) {
      if (file && file.size > 0) {
        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
          'image/bmp', 'image/svg+xml',
          'video/mp4', 'video/mpeg', 'video/avi', 'video/mov',
          'video/wmv', 'video/flv', 'video/webm', 'video/mkv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: `Invalid file type: ${file.type}` },
            { status: 400 }
          );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          return NextResponse.json(
            { success: false, error: `File ${file.name} is too large. Max size is 10MB` },
            { status: 400 }
          );
        }

        const result = await uploadFileToCloudinary(file);
        if (result) {
          files.push(result.secure_url);
        }
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to upload files" },
        { status: 400 }
      );
    }

    // Create gallery entry
    const newGallery = await prisma.galleryImage.create({
      data: { 
        title, 
        description, 
        category,
        files 
      },
    });

    return NextResponse.json({ 
      success: true, 
      gallery: newGallery,
      message: "Gallery uploaded successfully" 
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST Gallery Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to upload gallery" 
    }, { status: 500 });
  }
}