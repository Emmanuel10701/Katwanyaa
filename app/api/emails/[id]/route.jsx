import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import nodemailer from "nodemailer";
import cloudinary from "../../../../libs/cloudinary";
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
          resource_type: "auto",
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
      fileType: fileExtension.substring(1),
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
  
  safeContent = safeContent.replace(/\n/g, '<br>');
  safeContent = safeContent.replace(/style\s*=\s*["'][^"']*font[^"']*["']/gi, '');

  return safeContent;
}

// FULLY MOBILE-RESPONSIVE EMAIL TEMPLATE FUNCTION
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
  let attachmentsHTML = '';
  if (attachments && attachments.length > 0) {
    attachmentsHTML = `
      <div class="attachments-section" style="
        background: #f8fafc;
        border-radius: 12px;
        padding: 20px;
        margin: 24px 0;
        border: 1px solid #e2e8f0;
      ">
        <div class="attachments-title" style="
          font-size: 16px;
          font-weight: 600;
          color: #1e3c72;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Attachments (${attachments.length})
        </div>
        <div class="attachments-list" style="list-style: none;">
          ${attachments.map(attachment => {
            const fileSize = formatFileSize(attachment.fileSize);
            return `
            <div class="attachment-item" style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: white;
              border-radius: 8px;
              margin-bottom: 8px;
              border: 1px solid #e2e8f0;
            ">
              <div class="attachment-icon" style="
                font-size: 20px;
                color: #4c7cf3;
              ">
                ${getFileIcon(attachment.fileType)}
              </div>
              <div class="attachment-name" style="flex: 1; min-width: 0;">
                <a href="${attachment.url}" target="_blank" style="
                  color: #1e3c72;
                  text-decoration: none;
                  font-weight: 500;
                  font-size: 14px;
                  display: block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">
                  ${attachment.originalName || attachment.filename}
                </a>
                <small style="
                  color: #64748b;
                  font-size: 12px;
                  display: block;
                  margin-top: 2px;
                ">
                  ${fileSize} • ${attachment.fileType ? attachment.fileType.toUpperCase() : 'File'}
                </small>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>${subject} • ${SCHOOL_NAME}</title>
    <style>
        /* RESET & BASE STYLES */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            mso-line-height-rule: exactly;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
            padding: 0;
            margin: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            width: 100% !important;
            min-height: 100vh;
        }
        
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            max-width: 100%;
        }
        
        table {
            border-collapse: collapse !important;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        /* EMAIL CONTAINER */
        .email-container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }
        
        @media only screen and (max-width: 640px) {
            .email-container {
                border-radius: 12px;
                margin: 8px;
                width: calc(100% - 16px) !important;
            }
        }
        
        /* HEADER STYLES */
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        @media only screen and (max-width: 640px) {
            .header {
                padding: 32px 16px;
            }
        }
        
        .school-logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
            line-height: 1.2;
        }
        
        @media only screen and (max-width: 640px) {
            .school-logo {
                font-size: 26px;
            }
        }
        
        @media only screen and (max-width: 480px) {
            .school-logo {
                font-size: 22px;
            }
        }
        
        .school-motto {
            font-size: 15px;
            opacity: 0.95;
            margin-bottom: 20px;
            font-weight: 500;
            line-height: 1.4;
        }
        
        @media only screen and (max-width: 480px) {
            .school-motto {
                font-size: 14px;
            }
        }
        
        .email-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 8px 20px;
            border-radius: 24px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* CONTENT AREA */
        .content {
            padding: 40px 32px;
        }
        
        @media only screen and (max-width: 640px) {
            .content {
                padding: 24px 16px;
            }
        }
        
        .subject {
            font-size: 24px;
            font-weight: 700;
            color: #1e3c72;
            margin-bottom: 24px;
            line-height: 1.4;
            border-left: 4px solid #4c7cf3;
            padding-left: 16px;
        }
        
        @media only screen and (max-width: 640px) {
            .subject {
                font-size: 20px;
                padding-left: 12px;
                margin-bottom: 20px;
            }
        }
        
        @media only screen and (max-width: 480px) {
            .subject {
                font-size: 18px;
            }
        }
        
        /* RECIPIENT INFO */
        .recipient-info {
            background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #dbeafe;
        }
        
        @media only screen and (max-width: 640px) {
            .recipient-info {
                padding: 16px;
                margin: 20px 0;
            }
        }
        
        .info-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .info-item:last-child {
            margin-bottom: 0;
        }
        
        .info-icon {
            width: 20px;
            height: 20px;
            color: #4c7cf3;
            flex-shrink: 0;
            margin-top: 2px;
        }
        
        .info-text {
            font-size: 14px;
            color: #475569;
            line-height: 1.5;
        }
        
        /* MESSAGE CONTENT */
        .message-content {
            background: #f8fafc;
            border-radius: 12px;
            padding: 28px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
            line-height: 1.7;
            font-size: 15px;
        }
        
        @media only screen and (max-width: 640px) {
            .message-content {
                padding: 20px;
                font-size: 14px;
            }
        }
        
        .message-content p {
            margin-bottom: 16px;
        }
        
        .message-content p:last-child {
            margin-bottom: 0;
        }
        
        .message-content img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 8px;
            margin: 16px 0;
        }
        
        .message-content a {
            color: #4c7cf3;
            text-decoration: none;
        }
        
        .message-content a:hover {
            text-decoration: underline;
        }
        
        /* IMPORTANT NOTICE */
        .important-notice {
            background: rgba(234, 179, 8, 0.1);
            border: 1px solid rgba(234, 179, 8, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
        }
        
        .important-notice p {
            font-size: 13px;
            color: #92400e;
            margin: 0;
            line-height: 1.5;
        }
        
        /* CONTACT CARDS */
        .contact-cards {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
            padding: 0 20px;
            max-width: 900px;
            margin: 0 auto 32px;
        }
        
        @media only screen and (max-width: 768px) {
            .contact-cards {
                padding: 0 16px;
                gap: 12px;
            }
        }
        
        .contact-card {
            text-decoration: none;
            flex: 1 1 280px;
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            transition: all 0.2s ease;
            min-width: 0;
        }
        
        @media only screen and (max-width: 640px) {
            .contact-card {
                flex: 1 1 100%;
                min-width: 100%;
            }
        }
        
        .contact-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e1;
        }
        
        .contact-icon {
            background: #e0f2fe;
            border-radius: 12px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .contact-icon.email {
            background: #fef3c7;
        }
        
        .contact-icon.phone {
            background: #dcfce7;
        }
        
        .contact-icon.website {
            background: #fce7f3;
        }
        
        .contact-details {
            min-width: 0;
        }
        
        .contact-label {
            margin: 0;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 0.05em;
        }
        
        .contact-value {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        /* SOCIAL MEDIA */
        .social-media {
            text-align: center;
            padding: 20px;
        }
        
        .social-title {
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
            font-weight: 700;
        }
        
        .social-icons {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .social-icon {
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .social-icon:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* FOOTER STYLES */
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #cbd5e1;
            padding: 40px 20px;
            text-align: center;
        }
        
        @media only screen and (max-width: 640px) {
            .footer {
                padding: 32px 16px;
            }
        }
        
        .school-header {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .school-name {
            font-size: 28px;
            font-weight: 900;
            color: #ffffff;
            margin: 0 0 8px 0;
            letter-spacing: -0.025em;
            line-height: 1.2;
        }
        
        @media only screen and (max-width: 640px) {
            .school-name {
                font-size: 24px;
            }
        }
        
        .school-location {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 14px;
            font-weight: 500;
        }
        
        /* SENDER INFO */
        .sender-info {
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.5;
        }
        
        .sender-info p {
            margin-bottom: 4px;
        }
        
        .sender-info p:last-child {
            margin-bottom: 0;
        }
        
        /* PRIVACY NOTICE */
        .privacy-notice {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .privacy-text {
            font-size: 12px;
            color: #94a3b8;
            margin: 0;
            line-height: 1.6;
            font-style: italic;
        }
        
        /* UTILITY CLASSES FOR MOBILE */
        .mobile-block {
            display: block;
            width: 100%;
        }
        
        .mobile-center {
            text-align: center !important;
        }
        
        .mobile-padding {
            padding: 16px !important;
        }
        
        .mobile-hide {
            display: none !important;
        }
        
        .mobile-show {
            display: block !important;
        }
        
        /* iOS SPECIFIC FIXES */
        @media screen and (max-width: 480px) {
            u + .body .gmail {
                display: none !important;
            }
            
            /* Prevent font boosting on mobile */
            * {
                -webkit-text-size-adjust: none !important;
            }
            
            /* Better spacing on small screens */
            .message-content p {
                margin-bottom: 12px;
            }
        }
        
        /* ANDROID FIXES */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
            /* Fix for some Android devices */
            .contact-card {
                -webkit-text-size-adjust: 100%;
            }
        }
        
        /* OUTLOOK FIXES */
        [owa] .email-container {
            width: 600px !important;
        }
    </style>
    
    <!--[if mso]>
    <style type="text/css">
        .email-container {
            width: 600px !important;
        }
        table {
            font-family: Arial, sans-serif !important;
        }
        .contact-cards {
            display: table !important;
            width: 100% !important;
        }
        .contact-card {
            display: table-cell !important;
            vertical-align: top !important;
        }
    </style>
    <![endif]-->
    
    <!--[if IE]>
    <style>
        .email-container {
            width: 600px;
        }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <!--[if mso]>
    <div style="background-color: #f8fafc;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px;">
    <![endif]-->
    
    <div class="email-container">
        <!-- HEADER -->
        <div class="header">
            <h1 class="school-logo">${SCHOOL_NAME}</h1>
            <p class="school-motto">${SCHOOL_MOTTO}</p>
            <div class="email-badge">${recipientTypeLabel}</div>
        </div>
        
        <!-- CONTENT -->
        <div class="content">
            <h2 class="subject">${subject}</h2>
            
            <!-- Recipient Information -->
            <div class="recipient-info">
                <div class="info-item">
                    <svg class="info-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                    <span class="info-text">This message is intended for: <strong>${recipientTypeLabel}</strong></span>
                </div>
                <div class="info-item">
                    <svg class="info-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    <span class="info-text">Sent: ${new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
            </div>
            
            <!-- Message Content -->
            <div class="message-content">
                ${sanitizedContent}
            </div>
            
            <!-- Attachments Section -->
            ${attachmentsHTML}
            
            <!-- Important Notice -->
            <div class="important-notice">
                <p>📧 This is an official communication from ${SCHOOL_NAME}. Please do not reply directly to this email.</p>
            </div>
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
            <!-- School Header -->
            <div class="school-header">
                <h3 class="school-name">${SCHOOL_NAME}</h3>
                <div class="school-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${SCHOOL_LOCATION}
                </div>
            </div>
            
            <!-- Contact Cards -->
            <div class="contact-cards">
                <a href="mailto:${CONTACT_EMAIL}" class="contact-card">
                    <div class="contact-icon email">
                        <svg width="20" height="20" fill="none" stroke="#92400e" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>
                    <div class="contact-details">
                        <p class="contact-label">Email Us</p>
                        <p class="contact-value">${CONTACT_EMAIL}</p>
                    </div>
                </a>

                <a href="tel:${CONTACT_PHONE}" class="contact-card">
                    <div class="contact-icon phone">
                        <svg width="20" height="20" fill="none" stroke="#166534" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                    </div>
                    <div class="contact-details">
                        <p class="contact-label">Call Support</p>
                        <p class="contact-value">${CONTACT_PHONE}</p>
                    </div>
                </a>

                <a href="${SCHOOL_WEBSITE}" target="_blank" class="contact-card">
                    <div class="contact-icon website">
                        <svg width="20" height="20" fill="none" stroke="#db2777" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                    </div>
                    <div class="contact-details">
                        <p class="contact-label" style="color: #db2777;">Web Portal</p>
                        <p class="contact-value">Visit Website</p>
                    </div>
                </a>
            </div>
            
            <!-- Social Media -->
            <div class="social-media">
                <h4 class="social-title">Stay Connected</h4>
                <div class="social-icons">
                    <a href="${SOCIAL_MEDIA.facebook.url}" target="_blank" class="social-icon" style="color: #1877F2;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>

                    <a href="${SOCIAL_MEDIA.youtube.url}" target="_blank" class="social-icon" style="color: #FF0000;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                    </a>

                    <a href="${SOCIAL_MEDIA.linkedin.url}" target="_blank" class="social-icon" style="color: #0A66C2;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>

                    <a href="${SOCIAL_MEDIA.twitter.url}" target="_blank" class="social-icon" style="color: #1DA1F2;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
                        </svg>
                    </a>
                </div>
            </div>
            
            <!-- Sender Information -->
            <div class="sender-info">
                <p>Sent by: <strong>${senderName}</strong></p>
                <p>${SCHOOL_NAME} Administration</p>
                <p>This email was sent to ${recipientTypeLabel.toLowerCase()} of ${SCHOOL_NAME}</p>
            </div>
            
            <!-- Privacy Notice -->
            <div class="privacy-notice">
                <p class="privacy-text">
                    Please note: This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error, please notify the sender immediately and delete it from your system.
                </p>
            </div>
        </div>
    </div>
    
    <!--[if mso]>
            </td>
        </tr>
    </table>
    </div>
    <![endif]-->
</body>
</html>`;
}

function getFileIcon(fileType) {
  const icons = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'ppt': '📽️',
    'pptx': '📽️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'txt': '📃',
    'zip': '📦',
    'rar': '📦',
    'mp3': '🎵',
    'mp4': '🎬',
    'webp': '🖼️',
    'svg': '🖼️'
  };
  
  return icons[fileType.toLowerCase()] || '📎';
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
  
  // Prepare email attachments for nodemailer
  const emailAttachments = attachmentsArray.map(attachment => {
    return {
      filename: attachment.originalName || attachment.filename,
      path: attachment.url,
      contentType: getContentType(attachment.fileType)
    };
  });

  // Sequential processing with rate limiting
  for (const recipient of recipients) {
    try {
      // Generate email content
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

      // Rate limiting: pause every 10 emails
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
      
      // Longer pause on timeout errors
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
    processingTime: `${processingTime}ms`,
    attachmentsCount: attachmentsArray.length
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
  const maxSize = 20 * 1024 * 1024; // 20MB
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