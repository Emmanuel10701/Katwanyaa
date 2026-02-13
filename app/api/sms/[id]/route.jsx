import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";

// ==================== TOKEN VERIFICATION ====================
class DeviceTokenManager {
  static validateTokensFromHeaders(headers, options = {}) {
    try {
      const adminToken = headers.get('x-admin-token') || headers.get('authorization')?.replace('Bearer ', '');
      const deviceToken = headers.get('x-device-token');

      if (!adminToken) {
        return { valid: false, reason: 'no_admin_token', message: 'Admin token is required' };
      }

      if (!deviceToken) {
        return { valid: false, reason: 'no_device_token', message: 'Device token is required' };
      }

      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_admin_token_format', message: 'Invalid admin token format' };
      }

      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return { 
          valid: false, 
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ''}`
        };
      }

      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'TEACHER', 'HR_MANAGER'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage SMS campaigns' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ SMS campaign management authentication successful');
      
      return { 
        valid: true, 
        user: {
          id: adminPayload.userId || adminPayload.id,
          name: adminPayload.name,
          email: adminPayload.email,
          role: adminPayload.role || adminPayload.userRole
        },
        deviceInfo: deviceValid.payload
      };

    } catch (error) {
      console.error('❌ Token validation error:', error);
      return { 
        valid: false, 
        reason: 'validation_error', 
        message: 'Authentication validation failed',
        error: error.message 
      };
    }
  }

  static validateDeviceToken(token) {
    try {
      const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, reason: 'expired', payload, error: 'Device token has expired' };
      }
      
      const createdAt = new Date(payload.createdAt || payload.iat * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (createdAt < thirtyDaysAgo) {
        return { valid: false, reason: 'age_expired', payload, error: 'Device token is too old' };
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, reason: 'invalid_format', error: error.message };
    }
  }
}

const authenticateRequest = (req) => {
  const headers = req.headers;
  
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(headers);
  
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Access Denied",
          message: "Authentication required to manage SMS campaigns.",
          details: validationResult.message
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validationResult.user,
    deviceInfo: validationResult.deviceInfo
  };
};
// ==================== END TOKEN VERIFICATION ====================

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

function validatePhoneNumbers(phoneNumbers) {
  const valid = [];
  const invalid = [];
  
  // Kenyan phone numbers: 07XX XXX XXX, 2547XX XXX XXX, +2547XX XXX XXX
  const regex = /^(?:(?:\+?254)|0)?(7[0-9]{8})$/;
  
  phoneNumbers.forEach(num => {
    const cleaned = num.trim().replace(/\s+/g, '').replace(/-/g, '');
    
    const match = cleaned.match(regex);
    
    if (match) {
      // Extract the subscriber number (7XXXXXXXX)
      const subscriberNumber = match[1];
      
      // Format to international format: 254 + subscriber number
      const formatted = '254' + subscriberNumber;
      
      // Verify final length (should be 12 digits: 254 + 9 digits)
      if (formatted.length === 12) {
        valid.push(formatted);
      } else {
        invalid.push(num);
      }
    } else {
      invalid.push(num);
    }
  });
  
  return { valid, invalid };
}

// ====================================================================
// API HANDLERS
// ====================================================================

// 🔹 GET - Retrieve a specific campaign by ID (PUBLIC)
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }
    
    const campaign = await prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 100 // Limit logs for performance
        }
      }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    const recipientCount = campaign.recipients ? campaign.recipients.split(',').length : 0;
    
    const responseData = {
      id: campaign.id,
      title: campaign.title,
      message: campaign.message,
      recipients: campaign.recipients,
      recipientCount,
      recipientType: campaign.recipientType || 'all',
      recipientTypeLabel: getRecipientTypeLabel(campaign.recipientType || 'all'),
      status: campaign.status,
      sentAt: campaign.sentAt,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      logs: campaign.logs,
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
    console.error("GET [id] Error:", error);
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve campaign" },
      { status: 500 }
    );
  }
}

// 🔹 PUT - Update an existing campaign (PROTECTED)
export async function PUT(req, { params }) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("✏️ PUT /api/sms/[id] - Updating SMS campaign");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    // ==================== END AUTHENTICATION ====================

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    const { title, message, recipients, recipientType, status } = data;
    
    // Check if campaign exists
    const existingCampaign = await prisma.smsCampaign.findUnique({
      where: { id }
    });
    
    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    // Build update data
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    
    if (message !== undefined) {
      if (message.length > 1600) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Message is too long. Maximum 1600 characters allowed.",
            currentLength: message.length
          },
          { status: 400 }
        );
      }
      updateData.message = message;
    }
    
    if (recipients !== undefined) {
      const phoneList = recipients.split(",").map(r => r.trim()).filter(Boolean);
      if (phoneList.length === 0) {
        return NextResponse.json(
          { success: false, error: "At least one valid phone number is required" },
          { status: 400 }
        );
      }
      
      const { valid, invalid } = validatePhoneNumbers(phoneList);
      if (invalid.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid phone numbers detected",
            invalidNumbers: invalid 
          },
          { status: 400 }
        );
      }
      
      const uniquePhones = [...new Set(valid)];
      updateData.recipients = uniquePhones.join(', ');
    }
    
    if (recipientType !== undefined) updateData.recipientType = recipientType;
    if (status !== undefined) updateData.status = status;
    
    // Update campaign in database
    const updatedCampaign = await prisma.smsCampaign.update({
      where: { id },
      data: updateData,
    });
    
    const recipientCount = updatedCampaign.recipients ? updatedCampaign.recipients.split(',').length : 0;
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        message: updatedCampaign.message,
        recipients: updatedCampaign.recipients,
        recipientCount,
        recipientType: updatedCampaign.recipientType || 'all',
        recipientTypeLabel: getRecipientTypeLabel(updatedCampaign.recipientType || 'all'),
        status: updatedCampaign.status,
        sentAt: updatedCampaign.sentAt,
        sentCount: updatedCampaign.sentCount,
        failedCount: updatedCampaign.failedCount,
        createdAt: updatedCampaign.createdAt,
        updatedAt: updatedCampaign.updatedAt
      },
      message: 'Campaign updated successfully'
    });
    
  } catch (error) {
    console.error("PUT Error:", error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to update campaign";
    
    if (error.code === 'P2000') {
      statusCode = 400;
      errorMessage = "Data too long for database column";
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = "Campaign not found";
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// 🔹 DELETE - Delete a campaign (PROTECTED)
export async function DELETE(req, { params }) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("🗑️ DELETE /api/sms/[id] - Deleting SMS campaign");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    // ==================== END AUTHENTICATION ====================

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }
    
    // Check if campaign exists
    const campaign = await prisma.smsCampaign.findUnique({
      where: { id }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    // Delete campaign (logs will cascade delete due to schema relation)
    await prisma.smsCampaign.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
    
  } catch (error) {
    console.error("DELETE Error:", error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to delete campaign";
    
    if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = "Campaign not found";
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}


// 🔹 PATCH - Partial update (e.g., send campaign) (PROTECTED)
export async function PATCH(req, { params }) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📝 PATCH /api/sms/[id] - Sending SMS campaign");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    // ==================== END AUTHENTICATION ====================

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    const { status } = data;
    
    // Check if campaign exists
    const existingCampaign = await prisma.smsCampaign.findUnique({
      where: { id }
    });
    
    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    // If just updating status to sent
    if (status === 'sent' && existingCampaign.status !== 'sent') {
      // ==================== ADD MISSING IMPORTS HERE ====================
      const africastalking = require('africastalking');
      
      // Initialize Africa's Talking with proper credentials
      const at = africastalking({
        apiKey: process.env.AT_API_KEY,
        username: process.env.AT_USERNAME,
      });
      
      const sms = at.SMS;
      
      const recipients = existingCampaign.recipients.split(",").map(r => r.trim());
      const message = existingCampaign.message;
      
      // Validate and format phone numbers
      const { valid: validPhones, invalid } = validatePhoneNumbers(recipients);
      
      if (invalid.length > 0) {
        console.warn(`⚠️ Found ${invalid.length} invalid phone numbers:`, invalid);
      }
      
      if (validPhones.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "No valid phone numbers found for this campaign",
            invalidNumbers: invalid 
          },
          { status: 400 }
        );
      }
      
      console.log(`📱 Sending SMS to ${validPhones.length} valid recipients (${invalid.length} invalid skipped)`);
      
      // Prepare sender ID
      const senderId = process.env.AT_SENDER_ID || "AIC KATWANA";
      const senderType = process.env.AT_SENDER_TYPE || "alphanumeric";
      
      // For alphanumeric sender IDs, ensure it's not too long (max 11 characters)
      const finalSender = senderType === "alphanumeric" 
        ? senderId.substring(0, 11).trim() 
        : senderId;
      
      const sent = [];
      const failed = [];
      
      // Send in batches
      const BATCH_SIZE = 100;
      for (let i = 0; i < validPhones.length; i += BATCH_SIZE) {
        const batch = validPhones.slice(i, i + BATCH_SIZE);
        try {
          const smsOptions = {
            to: batch,
            message,
          };
          
          // Only add 'from' if we have a sender ID configured
          if (finalSender && finalSender.trim() !== "") {
            smsOptions.from = finalSender;
          }
          
          console.log(`📱 Sending batch ${i/BATCH_SIZE + 1} to ${batch.length} numbers`);
          
          const result = await sms.send(smsOptions);
          
          if (result?.data?.SMSMessageData?.Recipients) {
            const recipientStatuses = result.data.SMSMessageData.Recipients;
            recipientStatuses.forEach(rs => {
              const logEntry = {
                campaignId: existingCampaign.id,
                phoneNumber: rs.number,
                message,
                providerMessageId: rs.messageId || null,
                status: rs.status === "Success" ? "success" : "failed",
                errorMessage: rs.status !== "Success" ? rs.status : null,
              };
              if (rs.status === "Success") {
                sent.push(logEntry);
              } else {
                failed.push(logEntry);
              }
            });
          } else {
            // fallback: treat entire batch as success
            batch.forEach(phone => {
              sent.push({
                campaignId: existingCampaign.id,
                phoneNumber: phone,
                message,
                providerMessageId: null,
                status: "success",
              });
            });
          }
          
          console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Sent to ${batch.length} numbers`);
          
        } catch (error) {
          console.error(`❌ Batch failed:`, error.message);
          batch.forEach(phone => {
            failed.push({
              campaignId: existingCampaign.id,
              phoneNumber: phone,
              message,
              providerMessageId: null,
              status: "failed",
              errorMessage: error.message,
            });
          });
        }
        
        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < validPhones.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Also add invalid numbers to failed list (optional)
      invalid.forEach(phone => {
        failed.push({
          campaignId: existingCampaign.id,
          phoneNumber: phone,
          message,
          providerMessageId: null,
          status: "failed",
          errorMessage: "Invalid phone number format",
        });
      });
      
      // Save logs
      if (sent.length > 0) {
        await prisma.smsLog.createMany({ data: sent });
      }
      if (failed.length > 0) {
        await prisma.smsLog.createMany({ data: failed });
      }
      
      // Update campaign
      const updatedCampaign = await prisma.smsCampaign.update({
        where: { id },
        data: {
          status: "sent",
          sentAt: new Date(),
          sentCount: sent.length,
          failedCount: failed.length,
        },
      });
      
      const summary = {
        total: validPhones.length,
        successful: sent.length,
        failed: failed.length,
        invalidSkipped: invalid.length,
        successRate: validPhones.length > 0 ? Math.round((sent.length / validPhones.length) * 100) : 0,
      };
      
      console.log(`📊 SMS Campaign Summary:`, summary);
      
      return NextResponse.json({
        success: true,
        campaign: updatedCampaign,
        smsResults: { 
          sent: sent.slice(0, 10), // Return only first 10 logs to avoid huge response
          failed: failed.slice(0, 10),
          summary,
          invalidNumbers: invalid.length > 0 ? invalid : undefined
        },
        message: `Campaign sent to ${sent.length} recipients successfully${invalid.length > 0 ? ` (${invalid.length} invalid numbers skipped)` : ''}`
      });
    } else {
      // Other partial updates
      const updateData = {};
      if (status !== undefined) updateData.status = status;
      
      const updatedCampaign = await prisma.smsCampaign.update({
        where: { id },
        data: updateData,
      });
      
      return NextResponse.json({
        success: true,
        campaign: updatedCampaign,
        message: 'Campaign updated successfully'
      });
    }
    
  } catch (error) {
    console.error("PATCH Error:", error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to update campaign";
    
    if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = "Campaign not found";
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}