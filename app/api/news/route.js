import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Helper: Upload image to Cloudinary with better error handling
const uploadImageToCloudinary = async (file) => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
    // Extract filename and extension
    const originalName = file.name;
    const extension = originalName.split('.').pop().toLowerCase();
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    // Determine resource type based on extension
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const isImage = imageExtensions.includes(extension);
    const resourceType = isImage ? 'image' : 'auto';

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "school_news",
          public_id: `${timestamp}-${sanitizedFileName}`,
          transformation: isImage ? [
            { width: 1200, height: 800, crop: "fill" },
            { quality: "auto:good" }
          ] : undefined,
          allowed_formats: isImage ? ['jpg', 'jpeg', 'png', 'gif', 'webp'] : undefined
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload failed:", error.message);
            reject(new Error(`Upload failed: ${error.message}`));
          } else {
            console.log(`✅ Uploaded to Cloudinary: ${result.public_id}`);
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    return null;
  }
};

// Helper: Delete image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl?.includes('cloudinary.com')) return;

  try {
    // Extract public ID from Cloudinary URL
    const urlMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (!urlMatch) {
      console.warn(`⚠️ Could not parse Cloudinary URL: ${imageUrl}`);
      return;
    }
    
    const publicId = urlMatch[1];
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.warn(`⚠️ Could not delete Cloudinary file: ${error.message}`);
  }
};

// 🔹 GET all news
export async function GET() {
  try {
    const newsList = await prisma.news.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        excerpt: true,
        fullContent: true,
        date: true,
        category: true,
        author: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      data: newsList,
      count: newsList.length,
      message: newsList.length > 0 ? "News fetched successfully" : "No news found"
    }, { status: 200 });
  } catch (error) {
    console.error("❌ GET News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch news",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// 🔹 POST new news item
export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.trim() || "";
    const excerpt = formData.get("excerpt")?.trim() || "";
    const fullContent = formData.get("fullContent")?.trim() || "";
    const dateStr = formData.get("date");
    const category = formData.get("category")?.trim() || "General";
    const author = formData.get("author")?.trim() || "Admin";

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!excerpt) missingFields.push("excerpt");
    if (!fullContent) missingFields.push("content");
    if (!dateStr) missingFields.push("date");
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Parse and validate date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Handle image upload
    let imageUrl = null;
    const file = formData.get("image");
    
    if (file && file.size > 0) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "Image size must be less than 5MB" },
          { status: 400 }
        );
      }
      
      const result = await uploadImageToCloudinary(file);
      if (result) {
        imageUrl = result.secure_url;
      } else {
        return NextResponse.json(
          { success: false, error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Create news in database
    const newNews = await prisma.news.create({
      data: {
        title,
        excerpt,
        fullContent,
        date,
        category,
        author,
        image: imageUrl,
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        fullContent: true,
        date: true,
        category: true,
        author: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "News article created successfully",
      data: newNews,
      hasImage: !!imageUrl
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST News Error:", error);
    
    // Handle specific errors
    let errorMessage = "Failed to create news article";
    let statusCode = 500;
    
    if (error.code === 'P2002') { // Prisma unique constraint
      errorMessage = "A news article with similar details already exists";
      statusCode = 409;
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}