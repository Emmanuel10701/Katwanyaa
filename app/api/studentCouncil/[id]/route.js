import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// Helper: Upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "student_council",
          public_id: `${timestamp}-${sanitizedFileName}`,
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto:good" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;

  try {
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return;
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error);
    // Silent fail - don't block operation if delete fails
  }
};

// Helper function to map string positions to CouncilPosition enum
const mapPositionToEnum = (position) => {
  const positionMap = {
    'President': 'President',
    'DeputyPresident': 'DeputyPresident',
    'SchoolCaptain': 'SchoolCaptain',
    'DeputyCaptain': 'DeputyCaptain',
    'AcademicsSecretary': 'AcademicsSecretary',
    'SportsSecretary': 'SportsSecretary',
    'EntertainmentSecretary': 'EntertainmentSecretary',
    'CleaningSecretary': 'CleaningSecretary',
    'MealsSecretary': 'MealsSecretary',
    'BellRinger': 'BellRinger',
    'DisciplineSecretary': 'DisciplineSecretary',
    'HealthSecretary': 'HealthSecretary',
    'LibrarySecretary': 'LibrarySecretary',
    'TransportSecretary': 'TransportSecretary',
    'EnvironmentSecretary': 'EnvironmentSecretary',
    'SpiritualSecretary': 'SpiritualSecretary',
    'TechnologySecretary': 'TechnologySecretary',
    'Assistant': 'Assistant',
    'ClassRepresentative': 'ClassRepresentative',
    'ClassAssistant': 'ClassAssistant'
  };
  
  return positionMap[position];
};

// GET single council member
export async function GET(req, { params }) {
  const { id } = params;
  
  try {
    const councilMember = await prisma.studentCouncil.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            form: true,
            stream: true,
            gender: true,
            academicPerformance: true,
            dateOfBirth: true,
            parentName: true,
            parentPhone: true,
            address: true,
          }
        }
      }
    });

    if (!councilMember) {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, councilMember });
  } catch (error) {
    console.error("❌ Student Council GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch council member" },
      { status: 500 }
    );
  }
}

// UPDATE council member
export async function PUT(req, { params }) {
  const { id } = params;
  
  try {
    const formData = await req.formData();
    
    // Extract text fields
    const position = formData.get('position');
    const department = formData.get('department');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const responsibilities = formData.get('responsibilities');
    const achievements = formData.get('achievements');
    const status = formData.get('status');
    const imageFile = formData.get('image');
    const removeImage = formData.get('removeImage');
    const form = formData.get('form');
    const stream = formData.get('stream');

    // Map position to enum
    const mappedPosition = mapPositionToEnum(position);
    if (!mappedPosition) {
      return NextResponse.json(
        { success: false, error: "Invalid position" },
        { status: 400 }
      );
    }

    // Check if council member exists
    const existingMember = await prisma.studentCouncil.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }

    // Department is required for non-class roles
    if (!['ClassRepresentative', 'ClassAssistant'].includes(mappedPosition) && !department) {
      return NextResponse.json(
        { success: false, error: "Department is required for this position" },
        { status: 400 }
      );
    }

    // Form and stream are required for class roles
    if (['ClassRepresentative', 'ClassAssistant'].includes(mappedPosition) && (!form || !stream)) {
      return NextResponse.json(
        { success: false, error: "Form and stream are required for class roles" },
        { status: 400 }
      );
    }

    // If changing position/department/form/stream, check for conflicts
    if (mappedPosition !== existingMember.position || 
        department !== existingMember.department ||
        form !== existingMember.form || 
        stream !== existingMember.stream) {
      
      const conflict = await prisma.studentCouncil.findFirst({
        where: {
          position: mappedPosition,
          department: department || null,
          form: form || null,
          stream: stream || null,
          status: 'Active',
          id: { not: id }
        }
      });

      if (conflict) {
        const location = department ? `${department} department` : `${form} ${stream}`;
        return NextResponse.json(
          { success: false, error: `${position} position in ${location} is already occupied` },
          { status: 400 }
        );
      }
    }

    // Handle image operations
    let imagePath = existingMember.image;

    // Remove existing image from Cloudinary if requested
    if (removeImage === 'true' && existingMember.image && existingMember.image.includes('cloudinary.com')) {
      await deleteImageFromCloudinary(existingMember.image);
      imagePath = null;
    }

    // Handle new image upload to Cloudinary
    if (imageFile && imageFile instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
          { status: 400 }
        );
      }

      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "Image size too large. Maximum size is 5MB." },
          { status: 400 }
        );
      }

      // Remove old image from Cloudinary if exists
      if (existingMember.image && existingMember.image.includes('cloudinary.com')) {
        await deleteImageFromCloudinary(existingMember.image);
      }

      // Upload new image to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(imageFile);
      if (!cloudinaryUrl) {
        return NextResponse.json(
          { success: false, error: "Failed to upload image" },
          { status: 500 }
        );
      }
      imagePath = cloudinaryUrl;
    }

    const updatedMember = await prisma.studentCouncil.update({
      where: { id },
      data: {
        position: mappedPosition,
        department: department || null,
        form: form || null,
        stream: stream || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        responsibilities,
        achievements,
        status,
        image: imagePath
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            form: true,
            stream: true,
            gender: true,
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      councilMember: updatedMember,
      message: "Council member updated successfully" 
    });
  } catch (error) {
    console.error("❌ Student Council PUT Error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE council member
export async function DELETE(req, { params }) {
  const { id } = params;
  
  try {
    // Check if council member exists
    const existingMember = await prisma.studentCouncil.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }

    // Delete associated image from Cloudinary if exists
    if (existingMember.image && existingMember.image.includes('cloudinary.com')) {
      await deleteImageFromCloudinary(existingMember.image);
    }

    await prisma.studentCouncil.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Council member removed successfully",
      deletedMember: {
        id: existingMember.id,
        studentName: existingMember.student.name,
        position: existingMember.position,
        department: existingMember.department
      }
    });
  } catch (error) {
    console.error("❌ Student Council DELETE Error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Council member not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}