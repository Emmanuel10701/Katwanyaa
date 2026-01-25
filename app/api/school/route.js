import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// Helper function to validate required fields
const validateRequiredFields = (formData) => {
  const required = [
    'name', 'studentCount', 'staffCount', 
    'openDate', 'closeDate', 'subjects', 'departments'
  ];
  
  const missing = required.filter(field => !formData.get(field));
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Helper to validate YouTube URL
const isValidYouTubeUrl = (url) => {
  if (!url || url.trim() === '') return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url.trim());
};

// Helper function to parse and validate date
const parseDate = (dateString) => {
  if (!dateString || dateString.trim() === '') {
    return null;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to parse numeric fields
const parseNumber = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Helper function to parse integer fields
const parseIntField = (value) => {
  if (!value || value.trim() === '') {
    return null;
  }
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

// Helper function to parse JSON fields
const parseJsonField = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return fieldName === 'subjects' || fieldName === 'departments' ? [] : null;
  }
  try {
    return JSON.parse(value);
  } catch (parseError) {
    throw new Error(`Invalid JSON format in ${fieldName}: ${parseError.message}`);
  }
};

// Helper to parse fee distribution JSON specifically
const parseFeeDistributionJson = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be a JSON object`);
    }
    return parsed;
  } catch (parseError) {
    throw new Error(`Invalid JSON format in ${fieldName}: ${parseError.message}`);
  }
};

// Upload file to Cloudinary
const uploadToCloudinary = async (file, folder, resourceType = 'auto') => {
  if (!file || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `school/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          ...(resourceType === 'raw' && { 
            resource_type: 'raw',
            format: file.type.includes('pdf') ? 'pdf' : undefined 
          }),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format
    };
  } catch (error) {
    console.error(`❌ Cloudinary upload error for ${folder}:`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  
  try {
    // Extract public_id from Cloudinary URL
    const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};

// Handle video upload with Cloudinary
const handleVideoUpload = async (youtubeLink, videoTourFile, thumbnailFile, existingVideo = null, isUpdateOperation = false) => {
  let videoUrl = existingVideo?.videoTour || null;
  let videoType = existingVideo?.videoType || null;
  let thumbnailUrl = existingVideo?.videoThumbnail || null;

  // If YouTube link is provided
  if (youtubeLink !== null && youtubeLink !== undefined && youtubeLink.trim() !== '') {
    // Delete old video from Cloudinary if exists
    if (existingVideo?.videoType === 'file' && existingVideo?.videoTour) {
      await deleteFromCloudinary(existingVideo.videoTour);
    }
    
    // Delete old thumbnail if exists
    if (thumbnailUrl) {
      await deleteFromCloudinary(thumbnailUrl);
    }
    
    if (!isValidYouTubeUrl(youtubeLink)) {
      throw new Error("Invalid YouTube URL format. Please provide a valid YouTube watch URL or youtu.be link.");
    }
    
    videoUrl = youtubeLink.trim();
    videoType = "youtube";
    thumbnailUrl = null;
    
    return { videoUrl, videoType, thumbnailUrl };
  }
  
  // If local video file upload is provided
  if (videoTourFile && videoTourFile.size > 0) {
    // Delete old video from Cloudinary if exists
    if (existingVideo?.videoTour && existingVideo?.videoType === 'file') {
      await deleteFromCloudinary(existingVideo.videoTour);
    }

    // Validate file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedVideoTypes.includes(videoTourFile.type)) {
      throw new Error("Invalid video format. Only MP4, WebM, and OGG files are allowed.");
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (videoTourFile.size > maxSize) {
      throw new Error("Video file too large. Maximum size: 100MB");
    }

    // Upload video to Cloudinary
    const videoResult = await uploadToCloudinary(videoTourFile, 'videos', 'video');
    videoUrl = videoResult.url;
    videoType = "file";
    
    // Handle thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      // Validate thumbnail is an image
      if (!thumbnailFile.type.startsWith('image/')) {
        throw new Error("Thumbnail must be an image file");
      }
      
      const thumbnailResult = await uploadToCloudinary(thumbnailFile, 'thumbnails', 'image');
      thumbnailUrl = thumbnailResult.url;
    }
    
    return { videoUrl, videoType, thumbnailUrl };
  }

  // If removing video
  if ((!youtubeLink || youtubeLink.trim() === '') && !videoTourFile) {
    if (videoUrl && videoType === 'file') {
      await deleteFromCloudinary(videoUrl);
    }
    if (thumbnailUrl) {
      await deleteFromCloudinary(thumbnailUrl);
    }
    return { videoUrl: null, videoType: null, thumbnailUrl: null };
  }

  // For updates, preserve existing if not changed
  if (isUpdateOperation && !youtubeLink && !videoTourFile) {
    return { videoUrl, videoType, thumbnailUrl };
  }

  return { videoUrl, videoType, thumbnailUrl };
};

// Helper to clean school response
const cleanSchoolResponse = (school) => {
  // Parse JSON fields
  const subjects = typeof school.subjects === 'object' ? school.subjects : JSON.parse(school.subjects || '[]');
  const departments = typeof school.departments === 'object' ? school.departments : JSON.parse(school.departments || '[]');
  const feesBoardingDistributionJson = typeof school.feesBoardingDistributionJson === 'object' ? school.feesBoardingDistributionJson : JSON.parse(school.feesBoardingDistributionJson || '{}');
  const admissionFeeDistribution = typeof school.admissionFeeDistribution === 'object' ? school.admissionFeeDistribution : JSON.parse(school.admissionFeeDistribution || '{}');
  const admissionDocumentsRequired = typeof school.admissionDocumentsRequired === 'object' ? school.admissionDocumentsRequired : JSON.parse(school.admissionDocumentsRequired || '[]');

  return {
    id: school.id,
    name: school.name,
    description: school.description,
    motto: school.motto,
    vision: school.vision,
    mission: school.mission,
    videoTour: school.videoTour,
    videoType: school.videoType,
    videoThumbnail: school.videoThumbnail,
    studentCount: school.studentCount,
    staffCount: school.staffCount,
    
    // Fees
    feesDay: school.feesDay,
    feesBoarding: school.feesBoarding,
    admissionFee: school.admissionFee,
    feesDayDistributionJson: feesBoardingDistributionJson,
    feesBoardingDistributionJson: feesBoardingDistributionJson,
    admissionFeeDistribution: admissionFeeDistribution,
    
    // Academic Calendar
    openDate: school.openDate,
    closeDate: school.closeDate,
    
    // Academic Information
    subjects,
    departments,
    
    // Admission Information
    admissionOpenDate: school.admissionOpenDate,
    admissionCloseDate: school.admissionCloseDate,
    admissionRequirements: school.admissionRequirements,
    admissionCapacity: school.admissionCapacity,
    admissionContactEmail: school.admissionContactEmail,
    admissionContactPhone: school.admissionContactPhone,
    admissionWebsite: school.admissionWebsite,
    admissionLocation: school.admissionLocation,
    admissionOfficeHours: school.admissionOfficeHours,
    admissionDocumentsRequired,
    
    // Timestamps
    createdAt: school.createdAt,
    updatedAt: school.updatedAt
  };
};

// 🟢 CREATE School Info
export async function POST(req) {
  try {
    const existing = await prisma.schoolInfo.findFirst();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "School info already exists. Please update instead." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    
    // Validate required fields
    try {
      validateRequiredFields(formData);
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: validationError.message },
        { status: 400 }
      );
    }

    // Handle video upload with thumbnail
    let videoUrl = null;
    let videoType = null;
    let thumbnailUrl = null;
    
    try {
      const youtubeLink = formData.get("youtubeLink");
      const videoTour = formData.get("videoTour");
      const thumbnail = formData.get("videoThumbnail");
      const videoResult = await handleVideoUpload(youtubeLink, videoTour, thumbnail, null, false);
      videoUrl = videoResult.videoUrl;
      videoType = videoResult.videoType;
      thumbnailUrl = videoResult.thumbnailUrl;
    } catch (videoError) {
      return NextResponse.json(
        { success: false, error: videoError.message },
        { status: 400 }
      );
    }

    // Parse JSON fields
    let subjects, departments, admissionDocumentsRequired;
    let feesBoardingDistributionJson, admissionFeeDistribution;
    
    try {
      // Parse academic JSON fields
      subjects = parseJsonField(formData.get("subjects") || "[]", "subjects");
      departments = parseJsonField(formData.get("departments") || "[]", "departments");
      
      const admissionDocsStr = formData.get("admissionDocumentsRequired");
      admissionDocumentsRequired = admissionDocsStr ? parseJsonField(admissionDocsStr, "admissionDocumentsRequired") : [];
      
      // Parse fee distribution JSON fields
      const boardingDistributionStr = formData.get("feesBoardingDistributionJson");
      if (boardingDistributionStr) {
        feesBoardingDistributionJson = parseFeeDistributionJson(boardingDistributionStr, "feesBoardingDistributionJson");
      }
      
      const admissionFeeDistributionStr = formData.get("admissionFeeDistribution");
      if (admissionFeeDistributionStr) {
        admissionFeeDistribution = parseFeeDistributionJson(admissionFeeDistributionStr, "admissionFeeDistribution");
      }
      
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: parseError.message },
        { status: 400 }
      );
    }

    const school = await prisma.schoolInfo.create({
      data: {
        name: formData.get("name"),
        description: formData.get("description") || null,
        motto: formData.get("motto") || null,
        vision: formData.get("vision") || null,
        mission: formData.get("mission") || null,
        videoTour: videoUrl,
        videoType,
        videoThumbnail: thumbnailUrl,
        studentCount: parseIntField(formData.get("studentCount")) || 0,
        staffCount: parseIntField(formData.get("staffCount")) || 0,
        
        // Fees
        feesDay: parseNumber(formData.get("feesDay")),
        feesBoarding: parseNumber(formData.get("feesBoarding")),
        admissionFee: parseNumber(formData.get("admissionFee")),
        feesBoardingDistributionJson: feesBoardingDistributionJson || {},
        admissionFeeDistribution: admissionFeeDistribution || {},
        
        // Academic Calendar
        openDate: parseDate(formData.get("openDate")) || new Date(),
        closeDate: parseDate(formData.get("closeDate")) || new Date(),
        
        // Academic Information
        subjects,
        departments,
        
        // Admission Information
        admissionOpenDate: parseDate(formData.get("admissionOpenDate")),
        admissionCloseDate: parseDate(formData.get("admissionCloseDate")),
        admissionRequirements: formData.get("admissionRequirements") || null,
        admissionCapacity: parseIntField(formData.get("admissionCapacity")),
        admissionContactEmail: formData.get("admissionContactEmail") || null,
        admissionContactPhone: formData.get("admissionContactPhone") || null,
        admissionWebsite: formData.get("admissionWebsite") || null,
        admissionLocation: formData.get("admissionLocation") || null,
        admissionOfficeHours: formData.get("admissionOfficeHours") || null,
        admissionDocumentsRequired,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "School info created successfully",
      school: cleanSchoolResponse(school)
    });
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}

// 🟡 GET school info
export async function GET() {
  try {
    const school = await prisma.schoolInfo.findFirst();
    if (!school) {
      return NextResponse.json(
        { success: false, message: "No school info found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      school: cleanSchoolResponse(school)
    });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}

// 🟠 PUT update existing info
export async function PUT(req) {
  try {
    const existing = await prisma.schoolInfo.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school info to update." }, 
        { status: 404 }
      );
    }

    const formData = await req.formData();
    
    // Handle video upload with thumbnail
    let videoUrl = existing.videoTour;
    let videoType = existing.videoType;
    let thumbnailUrl = existing.videoThumbnail;
    
    try {
      const youtubeLink = formData.get("youtubeLink");
      const videoTour = formData.get("videoTour");
      const thumbnail = formData.get("videoThumbnail");
      
      const videoResult = await handleVideoUpload(
        youtubeLink, 
        videoTour, 
        thumbnail, 
        existing,
        true
      );
      
      videoUrl = videoResult.videoUrl !== undefined ? videoResult.videoUrl : existing.videoTour;
      videoType = videoResult.videoType !== undefined ? videoResult.videoType : existing.videoType;
      thumbnailUrl = videoResult.thumbnailUrl !== undefined ? videoResult.thumbnailUrl : existing.videoThumbnail;
    } catch (videoError) {
      return NextResponse.json(
        { success: false, error: videoError.message },
        { status: 400 }
      );
    }

    // Parse JSON fields
    let subjects = existing.subjects;
    let departments = existing.departments;
    let admissionDocumentsRequired = existing.admissionDocumentsRequired;
    let feesBoardingDistributionJson = existing.feesBoardingDistributionJson;
    let admissionFeeDistribution = existing.admissionFeeDistribution;

    // Parse subjects
    if (formData.get("subjects")) {
      try {
        subjects = parseJsonField(formData.get("subjects"), "subjects");
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: parseError.message },
          { status: 400 }
        );
      }
    }

    // Parse departments
    if (formData.get("departments")) {
      try {
        departments = parseJsonField(formData.get("departments"), "departments");
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: parseError.message },
          { status: 400 }
        );
      }
    }

    // Parse admission documents
    if (formData.get("admissionDocumentsRequired")) {
      try {
        admissionDocumentsRequired = parseJsonField(formData.get("admissionDocumentsRequired"), "admissionDocumentsRequired");
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: parseError.message },
          { status: 400 }
        );
      }
    }

    // Parse fee distribution JSON fields
    try {
      if (formData.get("feesBoardingDistributionJson")) {
        feesBoardingDistributionJson = parseFeeDistributionJson(formData.get("feesBoardingDistributionJson"), "feesBoardingDistributionJson");
      }
      
      if (formData.get("admissionFeeDistribution")) {
        admissionFeeDistribution = parseFeeDistributionJson(formData.get("admissionFeeDistribution"), "admissionFeeDistribution");
      }
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: parseError.message },
        { status: 400 }
      );
    }

    // Update school with all fields
    const updated = await prisma.schoolInfo.update({
      where: { id: existing.id },
      data: {
        name: formData.get("name") || existing.name,
        description: formData.get("description") !== null ? formData.get("description") : existing.description,
        motto: formData.get("motto") !== null ? formData.get("motto") : existing.motto,
        vision: formData.get("vision") !== null ? formData.get("vision") : existing.vision,
        mission: formData.get("mission") !== null ? formData.get("mission") : existing.mission,
        videoTour: videoUrl,
        videoType,
        videoThumbnail: thumbnailUrl,
        studentCount: formData.get("studentCount") ? parseIntField(formData.get("studentCount")) : existing.studentCount,
        staffCount: formData.get("staffCount") ? parseIntField(formData.get("staffCount")) : existing.staffCount,
        
        // Fees
        feesDay: formData.get("feesDay") ? parseNumber(formData.get("feesDay")) : existing.feesDay,
        feesBoarding: formData.get("feesBoarding") ? parseNumber(formData.get("feesBoarding")) : existing.feesBoarding,
        admissionFee: formData.get("admissionFee") ? parseNumber(formData.get("admissionFee")) : existing.admissionFee,
        feesBoardingDistributionJson: feesBoardingDistributionJson !== undefined ? feesBoardingDistributionJson : existing.feesBoardingDistributionJson,
        admissionFeeDistribution: admissionFeeDistribution !== undefined ? admissionFeeDistribution : existing.admissionFeeDistribution,
        
        // Academic Calendar
        openDate: formData.get("openDate") ? parseDate(formData.get("openDate")) : existing.openDate,
        closeDate: formData.get("closeDate") ? parseDate(formData.get("closeDate")) : existing.closeDate,
        
        // Academic Information
        subjects,
        departments,
        
        // Admission Information
        admissionOpenDate: formData.get("admissionOpenDate") ? parseDate(formData.get("admissionOpenDate")) : existing.admissionOpenDate,
        admissionCloseDate: formData.get("admissionCloseDate") ? parseDate(formData.get("admissionCloseDate")) : existing.admissionCloseDate,
        admissionRequirements: formData.get("admissionRequirements") !== null ? formData.get("admissionRequirements") : existing.admissionRequirements,
        admissionCapacity: formData.get("admissionCapacity") ? parseIntField(formData.get("admissionCapacity")) : existing.admissionCapacity,
        admissionContactEmail: formData.get("admissionContactEmail") !== null ? formData.get("admissionContactEmail") : existing.admissionContactEmail,
        admissionContactPhone: formData.get("admissionContactPhone") !== null ? formData.get("admissionContactPhone") : existing.admissionContactPhone,
        admissionWebsite: formData.get("admissionWebsite") !== null ? formData.get("admissionWebsite") : existing.admissionWebsite,
        admissionLocation: formData.get("admissionLocation") !== null ? formData.get("admissionLocation") : existing.admissionLocation,
        admissionOfficeHours: formData.get("admissionOfficeHours") !== null ? formData.get("admissionOfficeHours") : existing.admissionOfficeHours,
        admissionDocumentsRequired,
        
        // Update timestamp
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "School info updated successfully",
      school: cleanSchoolResponse(updated)
    });
  } catch (error) {
    console.error("❌ PUT Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}

// 🔴 DELETE all info
export async function DELETE() {
  try {
    const existing = await prisma.schoolInfo.findFirst();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "No school info to delete" }, 
        { status: 404 }
      );
    }

    // Delete files from Cloudinary
    if (existing.videoType === 'file' && existing.videoTour) {
      await deleteFromCloudinary(existing.videoTour);
    }
    if (existing.videoThumbnail) {
      await deleteFromCloudinary(existing.videoThumbnail);
    }

    await prisma.schoolInfo.deleteMany();
    return NextResponse.json({ 
      success: true, 
      message: "School info deleted successfully" 
    });
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}