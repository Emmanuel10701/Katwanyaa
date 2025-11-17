import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Ensure upload folder exists
const uploadDir = path.join(process.cwd(), "public", "council");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

    // If changing position/department, check for conflicts
    if (position !== existingMember.position || department !== existingMember.department) {
      const conflict = await prisma.studentCouncil.findFirst({
        where: {
          position,
          department,
          status: 'Active',
          id: { not: id }
        }
      });

      if (conflict) {
        return NextResponse.json(
          { success: false, error: `${position} position in ${department} is already occupied` },
          { status: 400 }
        );
      }
    }

    // Handle image operations
    let imagePath = existingMember.image;

    // Remove existing image if requested
    if (removeImage === 'true' && existingMember.image) {
      const oldImagePath = path.join(process.cwd(), 'public', existingMember.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      imagePath = null;
    }

    // Handle new image upload
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

      // Remove old image if exists
      if (existingMember.image) {
        const oldImagePath = path.join(process.cwd(), 'public', existingMember.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Generate unique filename and save new image
      const fileExtension = path.extname(imageFile.name);
      const fileName = `council_${randomUUID()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      imagePath = `/council/${fileName}`;
    }

    const updatedMember = await prisma.studentCouncil.update({
      where: { id },
      data: {
        position,
        department,
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

    // Delete associated image file if exists
    if (existingMember.image) {
      const imagePath = path.join(process.cwd(), 'public', existingMember.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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