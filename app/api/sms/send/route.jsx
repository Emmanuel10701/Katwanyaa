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

      console.log('✅ SMS send authentication successful');
      
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
          message: "Authentication required to send SMS.",
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

if (!AT_API_KEY || !AT_USERNAME) {
  console.error("Missing Africa's Talking credentials");
}

const at = africastalking({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});

const sms = at.SMS;

// ====================================================================
// API HANDLER
// ====================================================================

export async function POST(req) {
  try {
    // ==================== ADD AUTHENTICATION HERE ====================
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }
    // ==================== END AUTHENTICATION ====================

    const { campaignId } = await req.json();
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "campaignId is required" },
        { status: 400 }
      );
    }

    // Get campaign
    const campaign = await prisma.smsCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.status === "sent") {
      return NextResponse.json(
        { success: false, error: "Campaign has already been sent" },
        { status: 400 }
      );
    }

    // Send SMS
    const recipients = campaign.recipients.split(",").map(r => r.trim());
    const message = campaign.message;
    
    const sent = [];
    const failed = [];

    // Send in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      try {
        const result = await sms.send({
          to: batch,
          message,
          from: process.env.AT_SHORT_CODE || "A.I.C Katwanyaa high school",
        });
        
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
      } catch (error) {
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
    }

    // Save logs
    if (sent.length > 0) {
      await prisma.smsLog.createMany({ data: sent });
    }
    if (failed.length > 0) {
      await prisma.smsLog.createMany({ data: failed });
    }

    // Update campaign
    const updatedCampaign = await prisma.smsCampaign.update({
      where: { id: campaignId },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentCount: sent.length,
        failedCount: failed.length,
      },
    });

    const summary = {
      total: recipients.length,
      successful: sent.length,
      failed: failed.length,
      successRate: recipients.length > 0 ? Math.round((sent.length / recipients.length) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      smsResults: { sent, failed, summary },
      message: `Campaign sent to ${sent.length} recipients successfully`
    });

  } catch (error) {
    console.error("POST /api/sms/send error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}