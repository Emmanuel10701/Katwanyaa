import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Helper functions for Cloudinary upload
const uploadImageToCloudinary = async (file) => {
  if (!file || !file.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
    // Clean filename
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "school_news",
          public_id: `${timestamp}-${sanitizedFileName}`,
          transformation: [
            { width: 1200, height: 800, crop: "fill" }, // Optimized size for news
            { quality: "auto:good" } // Auto optimize quality
          ]
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

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split('.')[0];
    
    await cloudinary.uploader.destroy(`school_news/${publicId}`, {
      resource_type: "image",
    });
    console.log(`✅ Deleted news image from Cloudinary: ${publicId}`);
  } catch (err) {
    console.warn("⚠️ Could not delete Cloudinary image:", err.message);
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
      news: newsList,
      count: newsList.length 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ GET News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch news" 
    }, { status: 500 });
  }
}

// 🔹 POST new news item
export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.trim();
    const excerpt = formData.get("excerpt")?.trim();
    const fullContent = formData.get("fullContent")?.trim();
    const dateStr = formData.get("date");
    const category = formData.get("category")?.trim() || "General";
    const author = formData.get("author")?.trim() || "Admin";

    // Validate required fields
    if (!title || !excerpt || !fullContent || !dateStr) {
      return NextResponse.json(
        { success: false, error: "Title, excerpt, content, and date are required" },
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

    // Handle optional image upload
    let imageUrl = null;
    const file = formData.get("image");
    if (file && file.size > 0) {
      const result = await uploadImageToCloudinary(file);
      if (result) {
        imageUrl = result.secure_url;
      }
    }

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
      message: "News created successfully", 
      news: newNews 
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}