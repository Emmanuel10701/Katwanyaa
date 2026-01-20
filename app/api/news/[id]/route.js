import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// Helper functions (same as above)
const uploadImageToCloudinary = async (file) => {
  if (!file || !file.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
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
            { width: 1200, height: 800, crop: "fill" },
            { quality: "auto:good" }
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
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
    
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

// 🔹 GET single news item
export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid news ID" },
        { status: 400 }
      );
    }

    const newsItem = await prisma.news.findUnique({ 
      where: { id },
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

    if (!newsItem) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      news: newsItem 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ GET News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// 🔹 PUT (update) news item
export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid news ID" },
        { status: 400 }
      );
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({ where: { id } });
    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const contentType = req.headers.get("content-type") || "";

    let updateData = {};

    if (contentType.includes("multipart/form-data")) {
      // Handle form data with potential image upload
      const title = formData.get("title")?.trim();
      const excerpt = formData.get("excerpt")?.trim();
      const fullContent = formData.get("fullContent")?.trim();
      const dateStr = formData.get("date");
      const category = formData.get("category")?.trim();
      const author = formData.get("author")?.trim();

      if (title !== null) updateData.title = title;
      if (excerpt !== null) updateData.excerpt = excerpt;
      if (fullContent !== null) updateData.fullContent = fullContent;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          updateData.date = date;
        }
      }
      if (category !== null) updateData.category = category;
      if (author !== null) updateData.author = author;

      // Handle image upload/replacement
      const file = formData.get("image");
      if (file && file.size > 0) {
        // Delete old image if exists
        if (existingNews.image) {
          await deleteImageFromCloudinary(existingNews.image);
        }
        
        // Upload new image
        const result = await uploadImageToCloudinary(file);
        if (result) {
          updateData.image = result.secure_url;
        }
      } else if (formData.get("removeImage") === "true") {
        // Remove image if requested
        if (existingNews.image) {
          await deleteImageFromCloudinary(existingNews.image);
        }
        updateData.image = null;
      }
    } else {
      // Handle JSON update (for non-image fields)
      const body = await req.json();
      const { id: _, image, ...updateFields } = body;
      updateData = updateFields;
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    const updatedNews = await prisma.news.update({
      where: { id },
      data: updateData,
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
      message: "News updated successfully",
      news: updatedNews 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ PUT News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// 🔹 DELETE news item
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid news ID" },
        { status: 400 }
      );
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({ where: { id } });
    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (existingNews.image) {
      await deleteImageFromCloudinary(existingNews.image);
    }

    // Delete from database
    const deletedNews = await prisma.news.delete({ 
      where: { id },
      select: {
        id: true,
        title: true,
        date: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "News deleted successfully",
      news: deletedNews 
    }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}