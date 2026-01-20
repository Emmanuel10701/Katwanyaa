// app/api/counseling/events/[id]/route.js - REPLACE THIS FILE
import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import { supabase } from "../../../../libs/superbase"; 
import { randomUUID } from "crypto";

// ✅ Helper: Extract file key from Supabase URL
function extractFileKeyFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // Remove the prefix to get just the key
    // URL format: https://xxx.supabase.co/storage/v1/object/public/Katwanyaa High/folder/file.jpg
    const path = urlObj.pathname;
    const prefix = '/storage/v1/object/public/Katwanyaa High/';
    if (path.startsWith(prefix)) {
      return path.substring(prefix.length);
    }
    return null;
  } catch {
    return null;
  }
}

// ✅ Helper: Delete file from Supabase
async function deleteFileFromSupabase(fileUrl) {
  if (!fileUrl) return true;
  
  try {
    const fileKey = extractFileKeyFromUrl(fileUrl);
    if (!fileKey) return false;
    
    const { error } = await supabase.storage
      .from('Katwanyaa High')
      .remove([fileKey]);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }
    
    console.log('✅ Deleted from Supabase:', fileKey);
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
}

// ✅ Helper: Upload file to Supabase
async function uploadFileToSupabase(file, folder = 'counseling/events') {
  if (!file || !file.name || file.size === 0) return null;
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = randomUUID();
    const sanitizedName = file.name.replace(/\s+/g, "-");
    const fileName = `${folder}/${uniqueId}-${sanitizedName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('Katwanyaa High')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('Katwanyaa High')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
}

// 🔹 GET single event (UNCHANGED - works fine)
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

// 🔹 PUT — update event (UPDATED for Supabase)
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

    // ✅ Handle file update with Supabase
    const file = formData.get("image");
    if (file && file.size > 0) {
      // Delete old file from Supabase if exists
      if (existingEvent.image) {
        await deleteFileFromSupabase(existingEvent.image);
      }
      
      // Upload new file to Supabase
      updateData.image = await uploadFileToSupabase(file, 'counseling/events');
    } else if (formData.get("removeImage") === "true") {
      // If user wants to remove image
      if (existingEvent.image) {
        await deleteFileFromSupabase(existingEvent.image);
      }
      updateData.image = null;
    }

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

// 🔹 DELETE — remove event (UPDATED for Supabase)
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

    const existingEvent = await prisma.counselingEvent.findUnique({ where: { id } });
    if (!existingEvent) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

    // ✅ Delete image from Supabase if exists
    if (existingEvent.image) {
      await deleteFileFromSupabase(existingEvent.image);
    }

    // Delete from database
    await prisma.counselingEvent.delete({ where: { id } });
    
    return NextResponse.json({ 
      success: true, 
      message: "Event deleted successfully" 
    });
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}