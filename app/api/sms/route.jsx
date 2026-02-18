import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";

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
// CELCOM AFRICA CONFIGURATION
// ====================================================================
const CELCOM_API_KEY = process.env.CELCOM_API_KEY;
const CELCOM_PARTNER_ID = process.env.CELCOM_PARTNER_ID;
const CELCOM_SHORTCODE = process.env.CELCOM_SHORTCODE;

if (!CELCOM_API_KEY || !CELCOM_PARTNER_ID || !CELCOM_SHORTCODE) {
  console.error("❌ Missing Celcom Africa credentials. Please set CELCOM_API_KEY, CELCOM_PARTNER_ID, and CELCOM_SHORTCODE in .env");
}

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

// Validate phone numbers function (unchanged, already returns 254XXXXXXXXX)
function validatePhoneNumbers(phoneNumbers) {
  const valid = [];
  const invalid = [];
  
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

/**
 * Send SMS campaign using Celcom Africa API (sendsms endpoint)
 */
async function sendSmsCampaign(campaign) {
  const recipients = campaign.recipients.split(",").map(r => r.trim());
  const message = campaign.message;

  const sent = [];
  const failed = [];

  console.log(`📱 Sending SMS with shortcode: "${CELCOM_SHORTCODE}" via Celcom Africa`);

  const BATCH_SIZE = 100; // Adjust if Celcom has a different limit
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    try {
      // Format numbers: they are already in 254XXXXXXXXX format from validatePhoneNumbers
      // Join with commas for the 'mobile' field
      const mobileList = batch.join(",");

      const requestBody = {
        apikey: CELCOM_API_KEY,
        partnerID: CELCOM_PARTNER_ID,
        message: message,
        shortcode: CELCOM_SHORTCODE,
        mobile: mobileList,
        pass_type: "plain",      // optional, but recommended
      };

      console.log(`📱 Sending batch ${Math.floor(i/BATCH_SIZE) + 1} to ${batch.length} numbers`);
      console.log(`📱 Request body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch("https://isms.celcomafrica.com/api/services/sendsms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(`📱 Response:`, JSON.stringify(data, null, 2));

      // Celcom returns an object with a "responses" array
      if (data.responses && Array.isArray(data.responses)) {
        data.responses.forEach((item) => {
          const logEntry = {
            campaignId: campaign.id,
            phoneNumber: item.mobile,
            message,
            providerMessageId: item.messageid?.toString() || null,
            status: item["response-code"] === 200 ? "success" : "failed",
            errorMessage: item["response-description"] !== "Success" ? item["response-description"] : null,
          };
          if (item["response-code"] === 200) {
            sent.push(logEntry);
          } else {
            failed.push(logEntry);
          }
        });
      } else {
        // Unexpected response format – treat the whole batch as failed
        console.warn("⚠️ Unexpected API response format", data);
        batch.forEach((phone) => {
          failed.push({
            campaignId: campaign.id,
            phoneNumber: phone,
            message,
            providerMessageId: null,
            status: "failed",
            errorMessage: "Invalid API response",
          });
        });
      }
    } catch (error) {
      console.error(`❌ Batch failed:`, error.message);
      batch.forEach((phone) => {
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

    // Delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
          senderId: CELCOM_SHORTCODE,
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
    console.log(`Using shortcode: "${CELCOM_SHORTCODE}"`);
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
      senderId: CELCOM_SHORTCODE,
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
        id: CELCOM_SHORTCODE,
        type: "shortcode"   // or "alphanumeric" depending on your shortcode
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