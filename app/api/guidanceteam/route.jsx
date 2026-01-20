import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import cloudinary from "@/libs/cloudinary";

// Helper: upload image to Cloudinary
async function uploadImageToCloudinary(file) {
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
          folder: "school_team",
          public_id: `${timestamp}-${sanitizedFileName}`,
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
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
}

// Helper: delete image from Cloudinary
async function deleteImageFromCloudinary(imageUrl) {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
    
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split('.')[0];
    
    await cloudinary.uploader.destroy(`school_team/${publicId}`, {
      resource_type: "image",
    });
    console.log(`✅ Deleted team image from Cloudinary: ${publicId}`);
  } catch (err) {
    console.warn("⚠️ Could not delete Cloudinary image:", err.message);
  }
}

// 🔹 GET single team member
export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid member ID" },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        title: true,
        phone: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      member,
    }, { status: 200 });
  } catch (error) {
    console.error("❌ GET Single Team Member Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 🔹 PUT update team member
export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid member ID" },
        { status: 400 }
      );
    }

    // Check if member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    
    const name = formData.get("name")?.trim() || "";
    const role = formData.get("role")?.trim() || "teacher";
    const title = formData.get("title")?.trim() || null;
    const phone = formData.get("phone")?.trim() || null;
    const email = formData.get("email")?.trim() || null;
    const bio = formData.get("bio")?.trim() || null;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }
    
    let imageUrl = existingMember.image; // Keep existing image by default
    
    // Handle image upload/replacement
    const imageFile = formData.get("image");
    const removeImage = formData.get("removeImage") === "true";
    
    // If new image is uploaded
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (existingMember.image) {
        await deleteImageFromCloudinary(existingMember.image);
      }
      // Upload new image
      const result = await uploadImageToCloudinary(imageFile);
      if (result) {
        imageUrl = result.secure_url;
      }
    } 
    // If image should be removed
    else if (removeImage) {
      if (existingMember.image) {
        await deleteImageFromCloudinary(existingMember.image);
      }
      imageUrl = null;
    }
    
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        name,
        role,
        title,
        phone,
        email,
        bio,
        image: imageUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        role: true,
        title: true,
        phone: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Team member updated successfully",
      member: updatedMember,
    }, { status: 200 });
  } catch (error) {
    console.error("❌ PUT Team Member Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 🔹 DELETE team member
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid member ID" },
        { status: 400 }
      );
    }

    // Check if member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
      }
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (existingMember.image) {
      await deleteImageFromCloudinary(existingMember.image);
    }

    // Delete member from database
    await prisma.teamMember.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully",
      deletedMember: {
        id: existingMember.id,
        name: existingMember.name,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE Team Member Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}