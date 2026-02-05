import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import nodemailer from "nodemailer";
import cloudinary from "../../../libs/cloudinary";
import { v4 as uuidv4 } from "uuid";

// ====================================================================
// CONFIGURATION
// ====================================================================
const isProduction = process.env.NODE_ENV === 'production';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  rateDelta: 2000,
  rateLimit: 5,
});

// School Information
const SCHOOL_NAME = process.env.SCHOOL_NAME || 'Katwanyaa High School';
const SCHOOL_LOCATION = process.env.SCHOOL_LOCATION || 'Matungulu, Machakos County';
const SCHOOL_MOTTO = process.env.SCHOOL_MOTTO || 'Education is Light';
const CONTACT_PHONE = process.env.CONTACT_PHONE || '+254720123456';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'admissions@katwanyaahighschool.sc.ke';
const SCHOOL_WEBSITE = process.env.SCHOOL_WEBSITE || 'https://katwanyaa.vercel.app';

// Social Media Configuration
const SOCIAL_MEDIA = {
  facebook: {
    url: process.env.SCHOOL_FACEBOOK || 'https://facebook.com/katwanyaa-highschool',
    color: '#1877F2',
  },
  youtube: {
    url: process.env.SCHOOL_YOUTUBE || 'https://youtube.com/c/katwanyaahighschool',
    color: '#FF0000',
  },
  linkedin: {
    url: process.env.SCHOOL_LINKEDIN || 'https://linkedin.com/school/katwanyaa-high',
    color: '#0A66C2',
  },
  twitter: {
    url: process.env.SCHOOL_TWITTER || 'https://twitter.com/katwanyaaschool',
    color: '#1DA1F2',
  }
};

// ====================================================================
// CLOUDINARY HELPER FUNCTIONS
// ====================================================================

// Helper: Upload file to Cloudinary
const uploadFileToCloudinary = async (file) => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // "auto" for any file type
          folder: "school/email-campaigns/attachments",
          public_id: uniqueFileName,
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return {
      filename: result.public_id,
      originalName: originalName,
      fileType: fileExtension.substring(1), // Remove dot from extension
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      storageType: 'cloudinary'
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete file from Cloudinary
const deleteFileFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Error deleting file from Cloudinary:", error);
  }
};

// Helper to delete files from Cloudinary based on attachments data
const deleteCloudinaryFiles = async (attachments) => {
  if (!attachments || !Array.isArray(attachments)) return;

  try {
    const deletePromises = attachments
      .filter(attachment => attachment.storageType === 'cloudinary' && attachment.publicId)
      .map(attachment => deleteFileFromCloudinary(attachment.publicId));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("❌ Error deleting Cloudinary files:", error);
  }
};

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

function getRecipientTypeLabel(type) {
  const labels = {
    'all': 'All Recipients',
    'parents': 'Parents & Guardians',
    'teachers': 'Teaching Staff',
    'administration': 'Administration',
    'bom': 'Board of Management',
    'support': 'Support Staff',
    'staff': 'All School Staff'
  };
  return labels[type] || type;
}

function sanitizeContent(content) {
  // Reduce font-size styles
  let safeContent = content
    .replace(/font-size\s*:\s*[^;]+;/gi, '')
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/size\s*=\s*["'][^"']*["']/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
  
  // Convert newlines to <br> tags
  safeContent = safeContent.replace(/\n/g, '<br>');
  
  // Remove extra font styles
  safeContent = safeContent.replace(/style\s*=\s*["'][^"']*font[^"']*["']/gi, '');

  return safeContent;
}

// COMPLETE EMAIL TEMPLATE FUNCTION WITH INLINE STYLING
function getModernEmailTemplate({ 
  subject = '', 
  content = '',
  senderName = 'School Administration',
  recipientType = 'all',
  attachments = []
}) {
  const recipientTypeLabel = getRecipientTypeLabel(recipientType);
  const sanitizedContent = sanitizeContent(content);
  
  // Generate attachments HTML if there are attachments
  const attachmentsHTML = attachments && attachments.length > 0 ? `
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <div style="font-size: 15px; font-weight: 600; color: #1e3c72; margin-bottom: 14px;">📎 Attachments</div>
      <ul style="list-style: none;">
        ${attachments.map(attachment => `
          <li style="display: flex; align-items: center; gap: 10px; padding: 10px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 18px;">📄</span>
            <div style="flex: 1; min-width: 0;">
              <a href="${attachment.url}" target="_blank" style="color: #1e3c72; text-decoration: none; font-weight: 500; font-size: 13px; word-break: break-word;">${attachment.originalName || attachment.filename}</a>
              <small style="color: #64748b; font-size: 12px; display: block; margin-top: 2px;">${attachment.fileType ? attachment.fileType.toUpperCase() : 'File'} • ${formatFileSize(attachment.fileSize)}</small>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  ` : '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject} • ${SCHOOL_NAME}</title>
</head>
<body style="margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 32px 20px; text-align: center; position: relative; overflow: hidden;">
            <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px; position: relative; z-index: 1;">${SCHOOL_NAME}</h1>
            <p style="font-size: 14px; opacity: 0.95; margin-bottom: 16px; font-weight: 500; position: relative; z-index: 1;">${SCHOOL_MOTTO}</p>
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 6px 16px; border-radius: 24px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid rgba(255, 255, 255, 0.2); position: relative; z-index: 1;">${recipientTypeLabel}</div>
        </div>
        
        <!-- Content -->
        <div style="padding: 28px 20px;">
            <h2 style="font-size: 22px; font-weight: 700; color: #1e3c72; margin-bottom: 20px; line-height: 1.4; border-left: 4px solid #4c7cf3; padding-left: 16px;">${subject}</h2>
            
            <!-- Recipient Information -->
            <div style="background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%); border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #dbeafe;">
                <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13px;">
                    <span style="width: 18px; height: 18px; color: #4c7cf3; flex-shrink: 0; margin-top: 2px;">👤</span>
                    <span style="font-size: 13px; color: #475569;">For: <strong>${recipientTypeLabel}</strong></span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13px;">
                    <span style="width: 18px; height: 18px; color: #4c7cf3; flex-shrink: 0; margin-top: 2px;">📅</span>
                    <span style="font-size: 13px; color: #475569;">Date: <strong>${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })}</strong></span>
                </div>
            </div>
            
            <!-- Message Content -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; line-height: 1.7; font-size: 14px;">
                ${sanitizedContent}
            </div>
            
            <!-- Attachments Section -->
            ${attachmentsHTML}
            
            <!-- Important Notice -->
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px; padding: 14px; margin: 20px 0; text-align: center;">
                <p style="font-size: 12px; color: #92400e; margin: 0; word-break: break-word;">📧 Official communication from ${SCHOOL_NAME}. Do not reply to this email.</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #cbd5e1; padding: 28px 20px; text-align: center;">
            <!-- School Information -->
            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 20px; font-weight: 900; color: white; margin-bottom: 6px; letter-spacing: -0.025em;">${SCHOOL_NAME}</h3>
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px; color: #94a3b8; font-size: 13px; font-weight: 500;">📍 ${SCHOOL_LOCATION}</div>
            </div>
            
            <!-- Contact Details -->
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                <a href="mailto:${CONTACT_EMAIL}" style="text-decoration: none; display: flex; align-items: center; gap: 12px; padding: 14px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.2s ease;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #e0f2fe; color: #0ea5e9;">✉</div>
                    <div style="min-width: 0; flex: 1;">
                        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0ea5e9; letter-spacing: 0.05em; margin-bottom: 2px;">Email</div>
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; word-break: break-word;">${CONTACT_EMAIL}</div>
                    </div>
                </a>
                
                <a href="tel:${CONTACT_PHONE}" style="text-decoration: none; display: flex; align-items: center; gap: 12px; padding: 14px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.2s ease;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #f0fdf4; color: #22c55e;">☎</div>
                    <div style="min-width: 0; flex: 1;">
                        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #22c55e; letter-spacing: 0.05em; margin-bottom: 2px;">Call Us</div>
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; word-break: break-word;">${CONTACT_PHONE}</div>
                    </div>
                </a>
                
                <a href="${SCHOOL_WEBSITE}" target="_blank" style="text-decoration: none; display: flex; align-items: center; gap: 12px; padding: 14px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.2s ease;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #fce7f3; color: #db2777;">🌐</div>
                    <div style="min-width: 0; flex: 1;">
                        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #db2777; letter-spacing: 0.05em; margin-bottom: 2px;">Visit</div>
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; word-break: break-word;">Our Website</div>
                    </div>
                </a>
            </div>
            
            <!-- Social Media Buttons -->
            <div style="margin-bottom: 20px; padding: 16px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; font-weight: 700; color: #94a3b8;">Follow Us</div>
                <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <a href="${SOCIAL_MEDIA.facebook.url}" target="_blank" style="width: 44px; height: 44px; border-radius: 12px; border: 2px solid #1877F2; display: flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 700; font-size: 12px; text-transform: uppercase; transition: all 0.3s ease; color: white; background: #1877F2;" title="Facebook">f</a>
                    <a href="${SOCIAL_MEDIA.youtube.url}" target="_blank" style="width: 44px; height: 44px; border-radius: 12px; border: 2px solid #FF0000; display: flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 700; font-size: 12px; text-transform: uppercase; transition: all 0.3s ease; color: white; background: #FF0000;" title="YouTube">▶</a>
                    <a href="${SOCIAL_MEDIA.linkedin.url}" target="_blank" style="width: 44px; height: 44px; border-radius: 12px; border: 2px solid #0A66C2; display: flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 700; font-size: 12px; text-transform: uppercase; transition: all 0.3s ease; color: white; background: #0A66C2;" title="LinkedIn">in</a>
                    <a href="${SOCIAL_MEDIA.twitter.url}" target="_blank" style="width: 44px; height: 44px; border-radius: 12px; border: 2px solid #000000; display: flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 700; font-size: 12px; text-transform: uppercase; transition: all 0.3s ease; color: white; background: #000000;" title="Twitter">𝕏</a>
                </div>
            </div>
            
            <!-- Sender Information -->
            <div style="padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; color: #94a3b8;">
                <p style="margin-bottom: 3px;">Sent by: <strong>${senderName}</strong></p>
                <p style="margin-bottom: 3px;">${SCHOOL_NAME}</p>
                <p style="margin-top: 8px; color: #64748b;"><em>Confidential communication for authorized recipients only.</em></p>
            </div>
        </div>
    </div>
</body>
</html>`;
}




function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function sendModernEmails(campaign) {
  const startTime = Date.now();
  
  const recipients = campaign.recipients.split(",").map(r => r.trim());
  const recipientType = campaign.recipientType || 'all';
  
  const sentRecipients = [];
  const failedRecipients = [];
  
  // Parse attachments
  let attachmentsArray = [];
  try {
    if (campaign.attachments) {
      attachmentsArray = Array.isArray(campaign.attachments) ? 
        campaign.attachments : 
        JSON.parse(campaign.attachments);
    }
  } catch (error) {
    console.error('Error parsing attachments:', error);
  }
  
  // Prepare email attachments for nodemailer (Cloudinary URLs as links, not attachments)
  const emailAttachments = attachmentsArray.map(attachment => {
    return {
      filename: attachment.originalName || attachment.filename,
      path: attachment.url,
      contentType: getContentType(attachment.fileType)
    };
  });

  // Optimized sequential processing
  for (const recipient of recipients) {
    try {
      // Generate email content with attachments section
      const htmlContent = getModernEmailTemplate({
        subject: campaign.subject,
        content: campaign.content,
        senderName: 'School Administration',
        recipientType: recipientType,
        attachments: attachmentsArray
      });

      const mailOptions = {
        from: `"${SCHOOL_NAME} Administration" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `${campaign.subject} • ${SCHOOL_NAME}`,
        html: htmlContent,
        text: campaign.content.replace(/<[^>]*>/g, ''),
        attachments: emailAttachments,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const info = await transporter.sendMail(mailOptions);
      
      sentRecipients.push({
        email: recipient,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });

      // Small delay between emails to prevent rate limiting
      if (sentRecipients.length % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      failedRecipients.push({ 
        recipient, 
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });
      
      // If we get a timeout error, wait a bit before continuing
      if (error.message.includes('Timeout') || error.code === 'ETIMEDOUT') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  try {
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { 
        sentAt: new Date(),
        sentCount: sentRecipients.length,
        failedCount: failedRecipients.length,
        status: 'published',
      },
    });
  } catch (dbError) {
    console.error(`Failed to update campaign statistics:`, dbError);
  }

  const processingTime = Date.now() - startTime;
  const summary = {
    total: recipients.length,
    successful: sentRecipients.length,
    failed: failedRecipients.length,
    successRate: recipients.length > 0 ? Math.round((sentRecipients.length / recipients.length) * 100) : 0,
    processingTime: `${processingTime}ms`
  };

  return { 
    sentRecipients, 
    failedRecipients,
    summary
  };
}

function getContentType(fileType) {
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'txt': 'text/plain',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  
  return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
}

// Helper to validate email addresses
function validateEmailList(emailList) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = [];
  const invalidEmails = [];
  
  emailList.forEach(email => {
    if (emailRegex.test(email.trim())) {
      validEmails.push(email.trim());
    } else {
      invalidEmails.push(email);
    }
  });
  
  return { validEmails, invalidEmails };
}

// Helper to save uploaded file to Cloudinary
async function saveUploadedFile(file) {
  if (!file || file.size === 0) return null;
  
  // Validate file size (max 20MB for Cloudinary)
  const maxSize = 20 * 1024 * 1024; // 20MB (Cloudinary supports up to 100MB)
  if (file.size > maxSize) {
    throw new Error(`File ${file.name} is too large. Maximum size is 20MB.`);
  }
  
  // Upload to Cloudinary
  const cloudinaryResult = await uploadFileToCloudinary(file);
  
  if (!cloudinaryResult) {
    throw new Error(`Failed to upload file ${file.name} to Cloudinary`);
  }
  
  return cloudinaryResult;
}

// Validate attachment size before saving
function validateAttachmentSize(attachmentsArray) {
  const MAX_ATTACHMENTS_SIZE = 50000; // 50KB max for metadata
  
  const jsonString = JSON.stringify(attachmentsArray);
  if (jsonString.length > MAX_ATTACHMENTS_SIZE) {
    throw new Error(`Attachments metadata is too large (${jsonString.length} bytes). Maximum allowed is ${MAX_ATTACHMENTS_SIZE} bytes.`);
  }
  return true;
}

// ====================================================================
// API HANDLERS - POST AND GET ONLY
// ====================================================================

// 🔹 POST - Create a new email campaign with FormData
export async function POST(req) {
  let campaign = null;
  
  try {
    // Check if request is FormData (for file uploads)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file uploads
      const formData = await req.formData();
      
      // Extract text fields
      const title = formData.get('title')?.toString() || '';
      const subject = formData.get('subject')?.toString() || '';
      const content = formData.get('content')?.toString() || '';
      const recipients = formData.get('recipients')?.toString() || '';
      const status = formData.get('status')?.toString() || 'draft';
      const recipientType = formData.get('recipientType')?.toString() || 'all';
      const existingAttachmentsJson = formData.get('existingAttachments')?.toString();
      
      // Parse existing attachments if provided
      let existingAttachments = [];
      if (existingAttachmentsJson) {
        try {
          existingAttachments = JSON.parse(existingAttachmentsJson);
        } catch (error) {
          console.error('Error parsing existing attachments:', error);
        }
      }
      
      // Process new file uploads
      const newAttachments = [];
      const attachmentFiles = formData.getAll('attachments');
      
      for (const file of attachmentFiles) {
        if (file && file.size > 0) {
          const savedFile = await saveUploadedFile(file);
          if (savedFile) {
            newAttachments.push(savedFile);
          }
        }
      }
      
      // Combine existing and new attachments
      const allAttachments = [...existingAttachments, ...newAttachments];
      
      // Validate attachment size
      if (allAttachments.length > 0) {
        validateAttachmentSize(allAttachments);
      }
      
      // Validate required fields
      if (!title || !subject || !content || !recipients) {
        return NextResponse.json({ 
          success: false, 
          error: "All fields are required: title, subject, content, and recipients" 
        }, { status: 400 });
      }
      
      // Validate content length
      const MAX_CONTENT_LENGTH = 65535;
      if (content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json({ 
          success: false, 
          error: `Content is too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.`,
          currentLength: content.length
        }, { status: 400 });
      }
      
      // Validate recipients
      const emailList = recipients.split(",").map(r => r.trim()).filter(r => r.length > 0);
      if (emailList.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: "At least one valid email address is required" 
        }, { status: 400 });
      }
      
      const { validEmails, invalidEmails } = validateEmailList(emailList);
      if (invalidEmails.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid email addresses detected",
          invalidEmails 
        }, { status: 400 });
      }
      
      // Deduplicate emails
      const uniqueEmails = [...new Set(validEmails)];
      
      // Optimize attachment data to reduce size
      const optimizedAttachments = allAttachments.map(attachment => ({
        filename: attachment.filename,
        originalName: attachment.originalName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        uploadedAt: attachment.uploadedAt,
        url: attachment.url,
        publicId: attachment.publicId,
        storageType: attachment.storageType || 'cloudinary'
      }));
      
      // Create campaign in database
      campaign = await prisma.emailCampaign.create({
        data: { 
          title, 
          subject, 
          content, 
          recipients: uniqueEmails.join(', '),
          recipientType,
          status,
          attachments: optimizedAttachments.length > 0 ? JSON.stringify(optimizedAttachments) : null,
          ...(status === 'published' && { sentAt: new Date() })
        },
      });
      
      let emailResults = null;
      
      // Send emails immediately if published
      if (status === "published") {
        try {
          emailResults = await sendModernEmails(campaign);
          
          // Update campaign with email results
          await prisma.emailCampaign.update({
            where: { id: campaign.id },
            data: { 
              sentCount: emailResults.summary.successful,
              failedCount: emailResults.summary.failed
            },
          });
        } catch (emailError) {
          console.error(`Email sending failed:`, emailError);
          
          // Update campaign to reflect failure
          await prisma.emailCampaign.update({
            where: { id: campaign.id },
            data: { 
              failedCount: uniqueEmails.length,
              status: 'draft',
            },
          });
          
          emailResults = {
            error: emailError.message,
            sentRecipients: [],
            failedRecipients: uniqueEmails.map(email => ({ 
              recipient: email, 
              error: emailError.message 
            })),
            summary: {
              total: uniqueEmails.length,
              successful: 0,
              failed: uniqueEmails.length,
              successRate: 0
            }
          };
        }
      }
      
      // Format response
      const responseData = {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        content: campaign.content,
        recipients: campaign.recipients,
        recipientCount: uniqueEmails.length,
        recipientType: campaign.recipientType || 'all',
        recipientTypeLabel: getRecipientTypeLabel(campaign.recipientType || 'all'),
        status: campaign.status,
        sentAt: campaign.sentAt,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        attachments: optimizedAttachments,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      };
      
      const response = {
        success: true, 
        campaign: responseData,
        emailResults,
        message: status === "published" 
          ? `Campaign created and ${emailResults?.summary?.successful || 0} emails sent successfully` 
          : `Campaign saved as draft successfully`
      };
      
      return NextResponse.json(response, { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
    } else {
      // Handle JSON request (for backwards compatibility)
      const { title, subject, content, recipients, status = "draft", recipientType = "all", attachments = null } = await req.json();
      
      // Validate required fields
      if (!title || !subject || !content || !recipients) {
        return NextResponse.json({ 
          success: false, 
          error: "All fields are required: title, subject, content, and recipients" 
        }, { status: 400 });
      }
      
      // Validate content length
      const MAX_CONTENT_LENGTH = 65535;
      if (content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json({ 
          success: false, 
          error: `Content is too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.`,
          currentLength: content.length
        }, { status: 400 });
      }
      
      // Validate recipients format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailList = recipients.split(",").map(r => r.trim()).filter(r => r.length > 0);
      
      if (emailList.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: "At least one valid email address is required" 
        }, { status: 400 });
      }
      
      const invalidEmails = emailList.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid email addresses detected",
          invalidEmails 
        }, { status: 400 });
      }
      
      // Deduplicate emails
      const uniqueEmails = [...new Set(emailList)];
      
      // Create campaign in database
      campaign = await prisma.emailCampaign.create({
        data: { 
          title, 
          subject, 
          content, 
          recipients: uniqueEmails.join(', '),
          recipientType,
          status: status || "draft",
          attachments: attachments,
        },
      });
      
      let emailResults = null;
      
      // Send emails immediately if published
      if (status === "published") {
        try {
          emailResults = await sendModernEmails(campaign);
        } catch (emailError) {
          console.error(`Email sending failed:`, emailError);
          
          // Update campaign to reflect failure
          await prisma.emailCampaign.update({
            where: { id: campaign.id },
            data: { 
              failedCount: uniqueEmails.length,
              status: 'draft',
            },
          });
          
          emailResults = {
            error: emailError.message,
            sentRecipients: [],
            failedRecipients: uniqueEmails.map(email => ({ 
              recipient: email, 
              error: emailError.message 
            })),
            summary: {
              total: uniqueEmails.length,
              successful: 0,
              failed: uniqueEmails.length,
              successRate: 0
            }
          };
        }
      }
      
      // Format response
      const responseData = {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        content: campaign.content.substring(0, 200) + (campaign.content.length > 200 ? '...' : ''),
        recipients: campaign.recipients,
        recipientCount: uniqueEmails.length,
        recipientType: campaign.recipientType || 'all',
        recipientTypeLabel: getRecipientTypeLabel(campaign.recipientType || 'all'),
        status: campaign.status,
        sentAt: campaign.sentAt,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        attachments: campaign.attachments ? JSON.parse(campaign.attachments) : [],
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      };
      
      const response = {
        success: true, 
        campaign: responseData,
        emailResults,
        message: status === "published" 
          ? `Campaign created and ${emailResults?.summary?.successful || 0} emails sent successfully` 
          : `Campaign saved as draft successfully`
      };
      
      return NextResponse.json(response, { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
  } catch (error) {
    console.error(`POST Error:`, error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to create campaign";
    
    if (error.code === 'P2000') {
      statusCode = 400;
      errorMessage = "Data too long for database column. Please shorten your content or attachments metadata.";
    } else if (error.code === 'P2002') {
      statusCode = 409;
      errorMessage = "A campaign with similar data already exists";
    } else if (error.code === 'P2021' || error.code === 'P1001') {
      errorMessage = "Database connection error. Please try again later.";
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: error.message
    }, { status: statusCode });
  }
}

// 🔹 GET - Get all campaigns with filtering and pagination
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Build filter conditions
    const where = {};
    
    if (searchParams.has('status')) {
      where.status = searchParams.get('status');
    }
    
    if (searchParams.has('recipientType')) {
      where.recipientType = searchParams.get('recipientType');
    }
    
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { subject: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    
    // Get total count and campaigns
    const [totalCount, campaigns] = await Promise.all([
      prisma.emailCampaign.count({ where }),
      prisma.emailCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          subject: true,
          content: true,
          recipients: true,
          recipientType: true,
          status: true,
          sentAt: true,
          sentCount: true,
          failedCount: true,
          attachments: true,
          createdAt: true,
          updatedAt: true,
        }
      })
    ]);
    
    // Format response
    const formattedCampaigns = campaigns.map(campaign => {
      const recipientCount = campaign.recipients.split(',').length;
      const recipientType = campaign.recipientType || 'all';
      
      // Parse attachments
      let attachments = [];
      try {
        if (campaign.attachments) {
          attachments = JSON.parse(campaign.attachments);
        }
      } catch (error) {
        console.error('Error parsing attachments:', error);
      }
      
      return {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        content: campaign.content.length > 500 
          ? campaign.content.substring(0, 500) + '...' 
          : campaign.content,
        recipients: campaign.recipients,
        recipientCount,
        recipientType,
        recipientTypeLabel: getRecipientTypeLabel(recipientType),
        status: campaign.status,
        sentAt: campaign.sentAt,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        attachments,
        hasAttachments: attachments.length > 0,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        successRate: campaign.sentCount && recipientCount > 0 
          ? Math.round((campaign.sentCount / recipientCount) * 100)
          : 0
      };
    });
    
    // Calculate summary statistics
    const summary = {
      totalCampaigns: totalCount,
      sentEmails: formattedCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
      failedEmails: formattedCampaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0),
      totalRecipients: formattedCampaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
      draftCampaigns: formattedCampaigns.filter(c => c.status === 'draft').length,
      publishedCampaigns: formattedCampaigns.filter(c => c.status === 'published').length,
      campaignsWithAttachments: formattedCampaigns.filter(c => c.hasAttachments).length,
      averageSuccessRate: formattedCampaigns.length > 0
        ? Math.round(formattedCampaigns.reduce((sum, c) => sum + c.successRate, 0) / formattedCampaigns.length)
        : 0
    };
    
    const response = {
      success: true,
      campaigns: formattedCampaigns,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        'CDN-Cache-Control': 'public, max-age=60',
      }
    });
    
  } catch (error) {
    console.error(`GET Error:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to retrieve campaigns"
    }, { status: 500 });
  }
}