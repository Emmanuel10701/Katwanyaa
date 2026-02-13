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
const AT_SENDER_ID = process.env.AT_SENDER_ID || "AIC KATWANA"; // Your custom sender ID
const AT_SENDER_TYPE = process.env.AT_SENDER_TYPE || "alphanumeric"; // "alphanumeric" or "shortcode" or "number"

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

function validatePhoneNumbers(phoneNumbers) {
  const valid = [];
  const invalid = [];
  // Kenyan phone numbers: 07XX XXX XXX or 2547XX XXX XXX or +2547XX XXX XXX
  const regex = /^(\+?254|0)[7][0-9]{8}$/;
  
  phoneNumbers.forEach(num => {
    const cleaned = num.trim().replace(/\s+/g, '');
    if (regex.test(cleaned)) {
      // Convert to international format (254XXXXXXXXX) - Africa's Talking prefers this
      let formatted = cleaned;
      if (formatted.startsWith('0')) {
        formatted = '254' + formatted.substring(1);
      } else if (formatted.startsWith('+')) {
        formatted = formatted.substring(1);
      }
      valid.push(formatted);
    } else {
      invalid.push(num);
    }
  });
  
  return { valid, invalid };
}

/**
 * Send SMS with custom sender ID
 * The sender can be:
 * - Alphanumeric: "AIC KATWANA" (needs registration)
 * - Short code: "12345" (dedicated short code)
 * - Phone number: "+254700123456" (virtual number)
 */
async function sendSmsCampaign(campaign) {
  const recipients = campaign.recipients.split(",").map(r => r.trim());
  const message = campaign.message;

  const sent = [];
  const failed = [];

  // Prepare sender ID
  const senderId = AT_SENDER_ID;
  
  // For alphanumeric sender IDs, ensure it's not too long (max 11 characters)
  const finalSender = AT_SENDER_TYPE === "alphanumeric" 
    ? senderId.substring(0, 11) 
    : senderId;

  console.log(`📱 Sending SMS with sender: "${finalSender}" (type: ${AT_SENDER_TYPE})`);

  // Africa's Talking supports up to 100 numbers per request
  const BATCH_SIZE = 100;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    try {
      // Prepare the SMS options
      const smsOptions = {
        to: batch,
        message: message,
      };
      
      // Only add 'from' if we have a sender ID configured
      if (finalSender && finalSender.trim() !== "") {
        smsOptions.from = finalSender;
      }

      const result = await sms.send(smsOptions);

      // AT returns per-recipient statuses in result.data.SMSMessageData.Recipients
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
        // fallback: treat entire batch as success
        batch.forEach(phone => {
          sent.push({
            campaignId: campaign.id,
            phoneNumber: phone,
            message,
            providerMessageId: null,
            status: "success",
          });
        });
      }
      
      // Log success for debugging
      console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Sent to ${batch.length} numbers`);
      
    } catch (error) {
      // whole batch failed
      console.error(`❌ Batch failed:`, error.message);
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
    
    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save logs to database
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
// API HANDLERS
// ====================================================================

// 🔹 POST - Create a new SMS campaign (PROTECTED)
export async function POST(req) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📱 POST /api/sms - Creating SMS campaign");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    console.log(`Using sender ID: "${AT_SENDER_ID}" (type: ${AT_SENDER_TYPE})`);
    // ==================== END AUTHENTICATION ====================

    const { title, message, recipientType, recipients, status = "draft" } = await req.json();

    // Validate required fields
    if (!title || !message || !recipients) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Title, message, and recipients are required" 
        },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 1600) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Message is too long. Maximum 1600 characters allowed." 
        },
        { status: 400 }
      );
    }

    // Validate and format phone numbers
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

    // Remove duplicates
    const uniquePhones = [...new Set(valid)];

    // Create campaign in database
    const campaign = await prisma.smsCampaign.create({
      data: {
        title,
        message,
        recipients: uniquePhones.join(", "),
        recipientType: recipientType || "all",
        status,
        ...(status === "sent" && { sentAt: new Date() }),
      },
    });

    let smsResults = null;

    // Send SMS immediately if status is "sent"
    if (status === "sent") {
      try {
        smsResults = await sendSmsCampaign(campaign);
        
        // Update campaign with results
        await prisma.smsCampaign.update({
          where: { id: campaign.id },
          data: {
            sentCount: smsResults.summary.successful,
            failedCount: smsResults.summary.failed,
          },
        });
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        
        // Update campaign to reflect failure
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

    // Format response
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

// 🔹 GET - Get all SMS campaigns with filtering (PUBLIC)
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
        { message: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    
    // Get total count and campaigns
    const [totalCount, campaigns] = await Promise.all([
      prisma.smsCampaign.count({ where }),
      prisma.smsCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    ]);
    
    // Format response
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
    
    // Calculate summary statistics
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