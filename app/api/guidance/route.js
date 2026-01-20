// app/api/counseling/events/route.js - REPLACE THIS FILE
import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import { supabase } from "../../../libs/superbase"; // Add this import
import { randomUUID } from "crypto";

// 🔹 GET all events (UNCHANGED - works fine)
export async function GET() {
  try {
    const events = await prisma.counselingEvent.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch counseling events" },
      { status: 500 }
    );
  }
}

// 🔹 POST new event (UPDATED for Supabase)
export async function POST(req) {
  try {
    const formData = await req.formData();

    const counselor = formData.get("counselor");
    const category = formData.get("category");
    const description = formData.get("description");
    const notes = formData.get("notes") || null;
    const date = new Date(formData.get("date"));
    const time = formData.get("time");
    const type = formData.get("type");
    const priority = formData.get("priority");

    // ✅ Handle file upload to SUPABASE (NOT local filesystem)
    let imageUrl = null;
    const file = formData.get("image");

    if (file && file.size > 0) {
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Generate unique filename
      const uniqueId = randomUUID();
      const originalName = file.name.replace(/\s+/g, '-'); // Remove spaces
      const fileName = `counseling/events/${uniqueId}-${originalName}`;
      
      // ✅ Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('Katwanyaa High') // Your bucket name
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Katwanyaa High')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl; // ✅ This will be the Supabase URL
    }

    // Create event in database
    const newEvent = await prisma.counselingEvent.create({
      data: {
        counselor,
        category,
        description,
        notes,
        date,
        time,
        type,
        priority,
        image: imageUrl, // ✅ Now stores Supabase URL
      },
    });

    return NextResponse.json({
      success: true,
      message: "Counseling event recorded successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}