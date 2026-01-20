import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// Helper: Upload image to Cloudinary (reusable)
const uploadImageToCloudinary = async (file) => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
    const originalName = file.name;
    const extension = originalName.split('.').pop().toLowerCase();
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
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

// 🔹 GET single news item
export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid news ID format" },
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
        { success: false, error: "News article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: newsItem,
      message: "News article retrieved successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("❌ GET Single News Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to retrieve news article",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// 🔹 PUT (update) news item
export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid news ID format" },
        { status: 400 }
      );
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({ 
      where: { id },
      select: { id: true, title: true, image: true }
    });
    
    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News article not found" },
        { status: 404 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let updateData = {};
    let imageAction = "none"; // 'none', 'update', 'remove'

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      // Extract form fields
      const title = formData.get("title")?.trim();
      const excerpt = formData.get("excerpt")?.trim();
      const fullContent = formData.get("fullContent")?.trim();
      const dateStr = formData.get("date");
      const category = formData.get("category")?.trim();
      const author = formData.get("author")?.trim();

      // Update fields if provided
      if (title !== null && title !== undefined) updateData.title = title;
      if (excerpt !== null && excerpt !== undefined) updateData.excerpt = excerpt;
      if (fullContent !== null && fullContent !== undefined) updateData.fullContent = fullContent;
      if (category !== null && category !== undefined) updateData.category = category;
      if (author !== null && author !== undefined) updateData.author = author;
      
      // Handle date
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          updateData.date = date;
        }
      }

      // Handle image operations
      const file = formData.get("image");
      const removeImage = formData.get("removeImage") === "true";
      
      if (file && file.size > 0) {
        // Validate file size
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          return NextResponse.json(
            { success: false, error: "Image size must be less than 5MB" },
            { status: 400 }
          );
        }
        
        // Delete old image if exists
        if (existingNews.image) {
          await deleteImageFromCloudinary(existingNews.image);
        }
        
        // Upload new image
        const result = await uploadImageToCloudinary(file);
        if (result) {
          updateData.image = result.secure_url;
          imageAction = "updated";
        } else {
          return NextResponse.json(
            { success: false, error: "Failed to upload new image" },
            { status: 500 }
          );
        }
      } else if (removeImage && existingNews.image) {
        // Remove existing image
        await deleteImageFromCloudinary(existingNews.image);
        updateData.image = null;
        imageAction = "removed";
      }
    } else {
      // Handle JSON update
      try {
        const body = await req.json();
        const { id: _, image, ...updateFields } = body;
        updateData = updateFields;
      } catch (jsonError) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
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

      let message = "News article updated successfully";
      if (imageAction === "updated") message += " with new image";
      if (imageAction === "removed") message += " and image removed";

      return NextResponse.json({ 
        success: true, 
        message,
        data: updatedNews 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "No changes provided for update" 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ PUT News Error:", error);
    
    // Handle specific errors
    let errorMessage = "Failed to update news article";
    let statusCode = 500;
    
    if (error.code === 'P2025') { // Record not found
      errorMessage = "News article not found";
      statusCode = 404;
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}

// 🔹 DELETE news item
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid news ID format" },
        { status: 400 }
      );
    }

    // Check if news exists and get image info
    const existingNews = await prisma.news.findUnique({ 
      where: { id },
      select: { id: true, title: true, image: true }
    });
    
    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News article not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (existingNews.image) {
      await deleteImageFromCloudinary(existingNews.image);
    }

    // Delete from database
    await prisma.news.delete({ where: { id } });

    return NextResponse.json({ 
      success: true, 
      message: "News article deleted successfully",
      deletedItem: {
        id: existingNews.id,
        title: existingNews.title,
        hadImage: !!existingNews.image
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE News Error:", error);
    
    let errorMessage = "Failed to delete news article";
    let statusCode = 500;
    
    if (error.code === 'P2025') {
      errorMessage = "News article not found";
      statusCode = 404;
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}