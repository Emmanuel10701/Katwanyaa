// app/api/counseling/events/[id]/route.js - USING FILEMANAGER SERVICE
import { NextResponse } from "next/server";
import { prisma } from '../../../../libs/prisma'; // ✅ named import
import { FileManager } from "../../../../libs/file-manager"; 

// 🔹 GET single event (UNCHANGED)
export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

    const event = await prisma.counselingEvent.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 🔹 PUT — update event (UPDATED with FileManager)
export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

    const existingEvent = await prisma.counselingEvent.findUnique({ where: { id } });
    if (!existingEvent) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

    const formData = await req.formData();
    const updateData = {
      counselor: formData.get("counselor"),
      category: formData.get("category"),
      description: formData.get("description"),
      notes: formData.get("notes") || null,
      date: formData.get("date") ? new Date(formData.get("date")) : undefined,
      time: formData.get("time"),
      type: formData.get("type"),
      priority: formData.get("priority"),
    };

    // ✅ Handle file update with FileManager
    const file = formData.get("image");
    const removeImage = formData.get("removeImage") === "true";
    
    if (file && file.size > 0) {
      console.log('🔄 Updating counseling event image...');
      
      // Use FileManager to delete old and upload new
      const uploadResult = await FileManager.updateFile(
        existingEvent.image, // Old file URL (will be deleted)
        file,                // New file
        'counseling/events'  // Folder
      );
      
      if (uploadResult && uploadResult.url) {
        updateData.image = uploadResult.url;
        console.log('✅ Image updated:', uploadResult.url);
      }
    } else if (removeImage && existingEvent.image) {
      console.log('🗑️ Removing counseling event image...');
      
      // Delete existing image using FileManager
      const deleteResult = await FileManager.deleteFile(existingEvent.image);
      
      if (deleteResult.success) {
        updateData.image = null;
        console.log('✅ Image removed from Supabase');
      } else {
        console.warn('⚠️ Could not delete image:', deleteResult.error);
      }
    }

    // Update database record
    const updatedEvent = await prisma.counselingEvent.update({ 
      where: { id }, 
      data: updateData 
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Event updated successfully", 
      event: updatedEvent 
    });
  } catch (error) {
    console.error("❌ PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 🔹 DELETE — remove event (UPDATED with FileManager)
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

    const existingEvent = await prisma.counselingEvent.findUnique({ where: { id } });
    if (!existingEvent) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

    // ✅ Delete image from Supabase using FileManager
    if (existingEvent.image) {
      console.log('🗑️ Deleting counseling event image from Supabase...');
      
      const deleteResult = await FileManager.deleteFile(existingEvent.image);
      
      if (deleteResult.success) {
        console.log('✅ Image deleted from Supabase');
      } else {
        console.warn('⚠️ Could not delete image from Supabase:', deleteResult.error);
        // Continue with database deletion even if Supabase delete fails
      }
    }

    // Delete from database
    await prisma.counselingEvent.delete({ where: { id } });
    
    console.log('✅ Counseling event deleted from database');
    
    return NextResponse.json({ 
      success: true, 
      message: "Event deleted successfully" 
    });
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}