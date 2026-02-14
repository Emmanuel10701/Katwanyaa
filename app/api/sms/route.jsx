import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import africastalking from "africastalking";

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
            message: 'User does not have permission to send SMS campaigns' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ SMS campaign authentication successful for user:', adminPayload.name || 'Unknown');
      
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
          message: "Authentication required to send SMS campaigns.",
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
// CONFIGURATION
// ====================================================================
const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;
const AT_SENDER_ID = process.env.AT_SENDER_ID || "AIC KATWANA";
const AT_SENDER_TYPE = process.env.AT_SENDER_TYPE || "alphanumeric";

if (!AT_API_KEY || !AT_USERNAME) {
  console.error("Missing Africa's Talking credentials");
}

// Initialize Africa's Talking
const at = africastalking({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});

const sms = at.SMS;

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

// Add this helper function to detect sandbox
const isSandbox = AT_USERNAME === 'sandbox';




// Validate phone numbers function - FIXED for production
function validatePhoneNumbers(phoneNumbers) {
  const valid = [];
  const invalid = [];
  
  // For sandbox, accept any number format (for testing)
  if (isSandbox) {
    console.log('🧪 Sandbox mode: Accepting any phone numbers for testing');
    phoneNumbers.forEach(num => {
      const cleaned = num.trim().replace(/\s+/g, '').replace(/-/g, '');
      if (cleaned.length > 0) {
        const formatted = cleaned.replace(/^\+/, '');
        valid.push(formatted);
      } else {
        invalid.push(num);
      }
    });
    return { valid, invalid };
  }
  
  // Production validation - Kenyan phone numbers
  // Accepts: 0712345678, 254712345678, +254712345678
  const regex = /^(?:(?:\+?254)|0)?(7[0-9]{8})$/;
  
  phoneNumbers.forEach(num => {
    const cleaned = num.trim().replace(/\s+/g, '').replace(/-/g, '');
    const match = cleaned.match(regex);
    
    if (match) {
      const subscriberNumber = match[1];
      // Always format as 254XXXXXXXXX (12 digits)
      const formatted = '254' + subscriberNumber;
      
      // Verify final length (should be 12 digits)
      if (formatted.length === 12 && /^[0-9]+$/.test(formatted)) {
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

// Send SMS Campaign function - FIXED VERSION with proper number formatting for production
async function sendSmsCampaign(campaign) {
  const recipients = campaign.recipients.split(",").map(r => r.trim());
  const message = campaign.message;

  const sent = [];
  const failed = [];

  const senderId = AT_SENDER_ID;
  const finalSender = AT_SENDER_TYPE === "alphanumeric" 
    ? senderId.substring(0, 11).trim() 
    : senderId;

  console.log(`📱 Sending SMS with sender: "${finalSender}" (type: ${AT_SENDER_TYPE})`);
  console.log(`📱 Environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    try {
      // CRITICAL FIX: Format numbers exactly as Africa's Talking expects
      // They want the number in international format WITHOUT the plus sign
      // For Kenya: 254XXXXXXXXX (12 digits total)
      const formattedBatch = batch.map(num => {
        // Remove any whitespace, dashes, and plus signs
        let cleaned = num.replace(/\s+/g, '').replace(/-/g, '').replace(/^\+/, '');
        
        // If it starts with 0 (e.g., 0712345678), convert to 254712345678
        if (cleaned.startsWith('0')) {
          cleaned = '254' + cleaned.substring(1);
        }
        
        // If it doesn't start with 254, add it
        if (!cleaned.startsWith('254')) {
          cleaned = '254' + cleaned;
        }
        
        // Ensure it's exactly 12 digits
        cleaned = cleaned.substring(0, 12);
        
        return cleaned;
      });

      console.log(`📱 Formatted numbers:`, formattedBatch);

      const smsOptions = {
        to: formattedBatch,
        message: message,
      };
      
      // Only add 'from' in production if we have a valid sender
      if (!isSandbox && finalSender && finalSender.trim() !== "") {
        smsOptions.from = finalSender;
      }

      console.log(`📱 Sending batch ${i/BATCH_SIZE + 1} to ${formattedBatch.length} numbers`);
      console.log(`📱 SMS Options:`, JSON.stringify(smsOptions, null, 2));
      
      const result = await sms.send(smsOptions);
      console.log('📱 SMS API Response:', JSON.stringify(result, null, 2));

      if (result?.data?.SMSMessageData?.Recipients) {
        const recipientStatuses = result.data.SMSMessageData.Recipients;
        recipientStatuses.forEach(rs => {
          const logEntry = {
            campaignId: campaign.id,
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
        console.log('⚠️ No Recipients in response, full response:', result);
        // Check if message was sent successfully
        if (result?.data?.SMSMessageData?.Message === "Sent to 1 recipients") {
          batch.forEach(phone => {
            sent.push({
              campaignId: campaign.id,
              phoneNumber: phone,
              message,
              providerMessageId: null,
              status: "success",
            });
          });
        } else {
          batch.forEach(phone => {
            failed.push({
              campaignId: campaign.id,
              phoneNumber: phone,
              message,
              providerMessageId: null,
              status: "failed",
              errorMessage: "Unknown response format",
            });
          });
        }
      }
      
      console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Processed ${batch.length} numbers`);
      
    } catch (error) {
      console.error(`❌ Batch failed:`, error.message);
      console.error('Full error:', error);
      
      batch.forEach(phone => {
        failed.push({
          campaignId: campaign.id,
          phoneNumber: phone,
          message,
          providerMessageId: null,
          status: "failed",
          errorMessage: error.message,
        });
      });
    }
    
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (sent.length > 0) {
    await prisma.smsLog.createMany({ data: sent });
  }
  if (failed.length > 0) {
    await prisma.smsLog.createMany({ data: failed });
  }

  const summary = {
    total: recipients.length,
    successful: sent.length,
    failed: failed.length,
    successRate: recipients.length > 0 ? Math.round((sent.length / recipients.length) * 100) : 0,
  };

  return { sent, failed, summary };
}

// ====================================================================
// POST HANDLER - Create a new SMS campaign with idempotency support
// ====================================================================
export async function POST(req) {
  try {
    // ==================== IDEMPOTENCY CHECK ====================
    const idempotencyKey = req.headers.get('x-idempotency-key');
    
    if (idempotencyKey) {
      const existingCampaign = await prisma.smsCampaign.findFirst({
        where: { idempotencyKey }
      });
      
      if (existingCampaign) {
        console.log('🔄 Idempotent request detected, returning existing campaign:', existingCampaign.id);
        
        const recipientCount = existingCampaign.recipients ? existingCampaign.recipients.split(',').length : 0;
        
        const responseData = {
          id: existingCampaign.id,
          title: existingCampaign.title,
          message: existingCampaign.message,
          recipients: existingCampaign.recipients,
          recipientCount,
          recipientType: existingCampaign.recipientType || 'all',
          recipientTypeLabel: getRecipientTypeLabel(existingCampaign.recipientType || 'all'),
          status: existingCampaign.status,
          sentAt: existingCampaign.sentAt,
          sentCount: existingCampaign.sentCount,
          failedCount: existingCampaign.failedCount,
          senderId: AT_SENDER_ID,
          senderType: AT_SENDER_TYPE,
          createdAt: existingCampaign.createdAt,
          updatedAt: existingCampaign.updatedAt,
        };

        return NextResponse.json({
          success: true,
          campaign: responseData,
          message: "Campaign already processed (idempotent request)"
        });
      }
    }
    // ==================== END IDEMPOTENCY CHECK ====================

    // ==================== AUTHENTICATION ====================
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📱 POST /api/sms - Creating SMS campaign");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    console.log(`Using sender ID: "${AT_SENDER_ID}" (type: ${AT_SENDER_TYPE})`);
    // ==================== END AUTHENTICATION ====================

    // ==================== REQUEST PARSING ====================
    const { title, message, recipientType, recipients, status = "draft" } = await req.json();

    if (!title || !message || !recipients) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Title, message, and recipients are required" 
        },
        { status: 400 }
      );
    }

    if (message.length > 1600) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Message is too long. Maximum 1600 characters allowed." 
        },
        { status: 400 }
      );
    }

    const phoneList = recipients.split(",").map(p => p.trim()).filter(Boolean);
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
    // ==================== END REQUEST PARSING ====================

    // ==================== DATABASE OPERATION ====================
    const campaignData = {
      title,
      message,
      recipients: uniquePhones.join(", "),
      recipientType: recipientType || "all",
      status,
      ...(status === "sent" && { sentAt: new Date() }),
    };

    if (idempotencyKey) {
      campaignData.idempotencyKey = idempotencyKey;
    }

    const campaign = await prisma.smsCampaign.create({
      data: campaignData,
    });
    // ==================== END DATABASE OPERATION ====================

    // ==================== SMS SENDING ====================
    let smsResults = null;

    if (status === "sent") {
      try {
        smsResults = await sendSmsCampaign(campaign);
        
        await prisma.smsCampaign.update({
          where: { id: campaign.id },
          data: {
            sentCount: smsResults.summary.successful,
            failedCount: smsResults.summary.failed,
          },
        });
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        
        await prisma.smsCampaign.update({
          where: { id: campaign.id },
          data: {
            failedCount: uniquePhones.length,
            status: 'draft',
          },
        });
        
        smsResults = {
          error: smsError.message,
          summary: {
            total: uniquePhones.length,
            successful: 0,
            failed: uniquePhones.length,
            successRate: 0
          }
        };
      }
    }
    // ==================== END SMS SENDING ====================

    // ==================== RESPONSE FORMATTING ====================
    const responseData = {
      id: campaign.id,
      title: campaign.title,
      message: campaign.message,
      recipients: campaign.recipients,
      recipientCount: uniquePhones.length,
      recipientType: campaign.recipientType || 'all',
      recipientTypeLabel: getRecipientTypeLabel(campaign.recipientType || 'all'),
      status: campaign.status,
      sentAt: campaign.sentAt,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      senderId: AT_SENDER_ID,
      senderType: AT_SENDER_TYPE,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        campaign: responseData,
        smsResults,
        message: status === "sent"
          ? `Campaign created and ${smsResults?.summary?.successful || 0} messages sent successfully`
          : "Campaign saved as draft successfully"
      },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    // ==================== END RESPONSE FORMATTING ====================

  } catch (error) {
    console.error("POST /api/sms Error:", error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Failed to create campaign";
    
    if (error.code === 'P2000') {
      statusCode = 400;
      errorMessage = "Data too long for database column";
    } else if (error.code === 'P2002') {
      statusCode = 409;
      errorMessage = "A campaign with similar data already exists";
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message
      },
      { status: statusCode }
    );
  }
}

// ====================================================================
// GET HANDLER - Get all SMS campaigns with filtering
// ====================================================================
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
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
        { message: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    
    const [totalCount, campaigns] = await Promise.all([
      prisma.smsCampaign.count({ where }),
      prisma.smsCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    ]);
    
    const formattedCampaigns = campaigns.map(campaign => {
      const recipientCount = campaign.recipients ? campaign.recipients.split(',').length : 0;
      
      return {
        id: campaign.id,
        title: campaign.title,
        message: campaign.message.length > 100 
          ? campaign.message.substring(0, 100) + '...' 
          : campaign.message,
        recipients: campaign.recipients,
        recipientCount,
        recipientType: campaign.recipientType || 'all',
        recipientTypeLabel: getRecipientTypeLabel(campaign.recipientType || 'all'),
        status: campaign.status,
        sentAt: campaign.sentAt,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        successRate: campaign.sentCount && recipientCount > 0 
          ? Math.round((campaign.sentCount / recipientCount) * 100)
          : 0
      };
    });
    
    const summary = {
      totalCampaigns: totalCount,
      sentMessages: formattedCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
      failedMessages: formattedCampaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0),
      totalRecipients: formattedCampaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
      draftCampaigns: formattedCampaigns.filter(c => c.status === 'draft').length,
      sentCampaigns: formattedCampaigns.filter(c => c.status === 'sent').length,
      averageSuccessRate: formattedCampaigns.length > 0
        ? Math.round(formattedCampaigns.reduce((sum, c) => sum + c.successRate, 0) / formattedCampaigns.length)
        : 0
    };
    
    return NextResponse.json({
      success: true,
      campaigns: formattedCampaigns,
      summary,
      senderInfo: {
        id: AT_SENDER_ID,
        type: AT_SENDER_TYPE
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      }
    });
    
  } catch (error) {
    console.error("GET /api/sms Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to retrieve campaigns"
      },
      { status: 500 }
    );
  }
}