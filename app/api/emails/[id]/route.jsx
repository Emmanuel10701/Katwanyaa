import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

// Helper functions from main route
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

const deleteFileFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Error deleting file from Cloudinary:", error);
  }
};

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

async function saveUploadedFile(file) {
  if (!file || file.size === 0) return null;
  
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File ${file.name} is too large. Maximum size is 20MB.`);
  }
  
  const cloudinaryResult = await uploadFileToCloudinary(file);
  
  if (!cloudinaryResult) {
    throw new Error(`Failed to upload file ${file.name} to Cloudinary`);
  }
  
  return cloudinaryResult;
}

function validateAttachmentSize(attachmentsArray) {
  const MAX_ATTACHMENTS_SIZE = 50000;
  
  const jsonString = JSON.stringify(attachmentsArray);
  if (jsonString.length > MAX_ATTACHMENTS_SIZE) {
    throw new Error(`Attachments metadata is too large (${jsonString.length} bytes). Maximum allowed is ${MAX_ATTACHMENTS_SIZE} bytes.`);
  }
  return true;
}

// Import the sendModernEmails function from main route
async function sendModernEmails(campaign) {
  // This would need to be imported or duplicated
  // For now, using a placeholder - you should import the actual function
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const recipients = campaign.recipients.split(",").map(r => r.trim());
  const sentRecipients = [];
  const failedRecipients = [];

  for (const recipient of recipients) {
    try {
      // Simplified email sending
      const mailOptions = {
        from: `"School Administration" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: campaign.subject,
        html: campaign.content,
        text: campaign.content.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      sentRecipients.push({
        email: recipient,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      failedRecipients.push({ 
        recipient, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  const summary = {
    total: recipients.length,
    successful: sentRecipients.length,
    failed: failedRecipients.length,
    successRate: recipients.length > 0 ? Math.round((sentRecipients.length / recipients.length) * 100) : 0,
  };

  return { 
    sentRecipients, 
    failedRecipients,
    summary
  };
}

// ====================================================================
// DYNAMIC ROUTE HANDLERS
// ====================================================================

// 🔹 GET - Get a specific campaign by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign ID is required" 
      }, { status: 400 });
    }
    
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign not found" 
      }, { status: 404 });
    }
    
    // Parse attachments
    let attachments = [];
    try {
      if (campaign.attachments) {
        attachments = JSON.parse(campaign.attachments);
      }
    } catch (error) {
      console.error('Error parsing attachments:', error);
    }
    
    const recipientCount = campaign.recipients.split(',').length;
    const recipientType = campaign.recipientType || 'all';
    
    const responseData = {
      id: campaign.id,
      title: campaign.title,
      subject: campaign.subject,
      content: campaign.content,
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
    
    return NextResponse.json({
      success: true,
      campaign: responseData
    });
    
  } catch (error) {
    console.error(`GET [id] Error:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to retrieve campaign"
    }, { status: 500 });
  }
}

// 🔹 PUT - Update an existing campaign
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign ID is required" 
      }, { status: 400 });
    }
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData update with file uploads
      const formData = await req.formData();
      
      // Extract text fields
      const title = formData.get('title')?.toString();
      const subject = formData.get('subject')?.toString();
      const content = formData.get('content')?.toString();
      const recipients = formData.get('recipients')?.toString();
      const status = formData.get('status')?.toString();
      const recipientType = formData.get('recipientType')?.toString();
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
      
      // Build update data
      const updateData = {};
      
      if (title !== undefined) updateData.title = title;
      if (subject !== undefined) updateData.subject = subject;
      if (content !== undefined) {
        const MAX_CONTENT_LENGTH = 65535;
        if (content.length > MAX_CONTENT_LENGTH) {
          return NextResponse.json({ 
            success: false, 
            error: `Content is too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.`,
            currentLength: content.length
          }, { status: 400 });
        }
        updateData.content = content;
      }
      if (recipients !== undefined) {
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
        
        const uniqueEmails = [...new Set(validEmails)];
        updateData.recipients = uniqueEmails.join(', ');
      }
      if (recipientType !== undefined) updateData.recipientType = recipientType;
      if (status !== undefined) updateData.status = status;
      
      // Optimize and add attachments
      if (allAttachments.length > 0) {
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
        updateData.attachments = JSON.stringify(optimizedAttachments);
      } else {
        updateData.attachments = null;
      }
      
      // Update campaign in database
      const updatedCampaign = await prisma.emailCampaign.update({
        where: { id },
        data: updateData,
      });
      
      // Send emails if status changed to published
      let emailResults = null;
      if (status === 'published' && updateData.recipients) {
        try {
          emailResults = await sendModernEmails(updatedCampaign);
        } catch (emailError) {
          console.error(`Email sending failed:`, emailError);
          emailResults = {
            error: emailError.message,
            summary: {
              successful: 0,
              failed: updatedCampaign.recipients.split(',').length
            }
          };
        }
      }
      
      const response = {
        success: true,
        campaign: updatedCampaign,
        emailResults,
        message: status === 'published' 
          ? `Campaign updated and ${emailResults?.summary?.successful || 0} emails sent successfully`
          : 'Campaign updated successfully'
      };
      
      return NextResponse.json(response);
      
    } else {
      // Handle JSON update
      const data = await req.json();
      const { id: bodyId, ...updateData } = data;
      
      const campaignId = id || bodyId;
      
      if (!campaignId) {
        return NextResponse.json({ 
          success: false, 
          error: "Campaign ID is required" 
        }, { status: 400 });
      }
      
      // Validate content length if provided
      if (updateData.content && updateData.content.length > 65535) {
        return NextResponse.json({ 
          success: false, 
          error: "Content is too long. Maximum 65535 characters allowed." 
        }, { status: 400 });
      }
      
      // Validate recipients if provided
      if (updateData.recipients) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailList = updateData.recipients.split(",").map(r => r.trim()).filter(r => r.length > 0);
        
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
        
        const uniqueEmails = [...new Set(emailList)];
        updateData.recipients = uniqueEmails.join(', ');
      }
      
      // Update campaign
      const updatedCampaign = await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: updateData,
      });
      
      const response = {
        success: true,
        campaign: updatedCampaign,
        message: 'Campaign updated successfully'
      };
      
      return NextResponse.json(response);
    }
    
  } catch (error) {
    console.error(`PUT Error:`, error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to update campaign";
    
    if (error.code === 'P2000') {
      statusCode = 400;
      errorMessage = "Data too long for database column. Please shorten your content.";
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = "Campaign not found";
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: statusCode });
  }
}

// 🔹 DELETE - Delete a campaign
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign ID is required" 
      }, { status: 400 });
    }
    
    // First, get the campaign to check for attachments
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: { attachments: true }
    });
    
    // Delete files from Cloudinary if they exist
    if (campaign?.attachments) {
      try {
        const attachments = JSON.parse(campaign.attachments);
        await deleteCloudinaryFiles(attachments);
      } catch (error) {
        console.error('Error deleting files from Cloudinary:', error);
      }
    }
    
    // Delete campaign from database
    await prisma.emailCampaign.delete({
      where: { id },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Campaign deleted successfully' 
    });
    
  } catch (error) {
    console.error(`DELETE Error:`, error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to delete campaign";
    
    if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = "Campaign not found";
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: statusCode });
  }
}

// 🔹 PATCH - Update campaign status (for sending)
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign ID is required" 
      }, { status: 400 });
    }
    
    const { status } = await req.json();
    
    if (status !== 'published') {
      return NextResponse.json({ 
        success: false, 
        error: "Only 'published' status can be set via PATCH" 
      }, { status: 400 });
    }
    
    // Get campaign
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id }
    });
    
    if (!campaign) {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign not found" 
      }, { status: 404 });
    }
    
    if (campaign.status === 'published') {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign has already been sent" 
      }, { status: 400 });
    }
    
    // Send emails
    const emailResults = await sendModernEmails(campaign);
    
    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        status: 'published',
        sentAt: new Date(),
        sentCount: emailResults.summary.successful,
        failedCount: emailResults.summary.failed
      },
      emailResults,
      message: `Campaign sent to ${emailResults.summary.successful} recipients successfully`
    });
    
  } catch (error) {
    console.error(`PATCH Error:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to send campaign"
    }, { status: 500 });
  }
}