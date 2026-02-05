import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ==================== AUTHENTICATION UTILITIES ====================

// Device Token Manager
class DeviceTokenManager {
  static validateTokensFromHeaders(headers) {
    try {
      // Extract tokens from headers
      const adminToken = headers.get('x-admin-token') || headers.get('authorization')?.replace('Bearer ', '');
      const deviceToken = headers.get('x-device-token');

      if (!adminToken) {
        return { valid: false, reason: 'no_admin_token', message: 'Admin token is required' };
      }

      if (!deviceToken) {
        return { valid: false, reason: 'no_device_token', message: 'Device token is required' };
      }

      // Validate admin token format (basic check)
      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_admin_token_format', message: 'Invalid admin token format' };
      }

      // Validate device token
      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return { 
          valid: false, 
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ''}`
        };
      }

      // Parse admin token payload
      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        // Check expiration
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        // Check user role - only authorized users can send campaigns
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'TEACHER', 'MARKETING', 'COMMUNICATION'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to send email campaigns' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Email campaign authentication successful for user:', adminPayload.name || 'Unknown');
      
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

  // Validate device token
  static validateDeviceToken(token) {
    try {
      // Handle base64 decoding safely
      const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      // Check expiration
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, reason: 'expired', payload, error: 'Device token has expired' };
      }
      
      // Check age (30 days max)
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

// Authentication middleware for campaign requests
const authenticateCampaignRequest = (req) => {
  const headers = req.headers;
  
  // Validate tokens
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(headers);
  
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Access Denied",
          message: "Authentication required to send email campaigns.",
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

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// School information
const SCHOOL_NAME = 'Katwanyaa High School';
const SCHOOL_LOCATION = 'Matungulu, Machakos County';
const SCHOOL_MOTTO = 'Education is Light';

// Email templates (keep your existing templates, just adding authentication wrapper)

export async function POST(request) {
  try {
    // Step 1: Authenticate the request
    const auth = authenticateCampaignRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log(`📧 Email campaign request from: ${auth.user.name} (${auth.user.role})`);

    // Step 2: Parse request body
    const { subscribers, template, subject, customMessage, templateData } = await request.json();

    // Step 3: Validate required fields
    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No subscribers provided',
        authenticated: true
      }, { status: 400 });
    }

    if (!subject || subject.trim() === '') {
      return NextResponse.json({ 
        success: false,
        error: 'Email subject is required',
        authenticated: true
      }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ 
        success: false,
        error: 'Email configuration missing',
        authenticated: true
      }, { status: 500 });
    }

    // Validate maximum number of recipients to prevent abuse
    const MAX_RECIPIENTS = 1000;
    if (subscribers.length > MAX_RECIPIENTS) {
      return NextResponse.json({ 
        success: false,
        error: `Maximum ${MAX_RECIPIENTS} recipients allowed per campaign`,
        authenticated: true
      }, { status: 400 });
    }

    // Validate email addresses
    const validSubscribers = [];
    const invalidEmails = [];

    subscribers.forEach(subscriber => {
      const email = subscriber.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email && emailRegex.test(email)) {
        validSubscribers.push(subscriber);
      } else {
        invalidEmails.push(email);
      }
    });

    if (validSubscribers.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No valid email addresses found',
        invalidEmails,
        authenticated: true
      }, { status: 400 });
    }

    if (invalidEmails.length > 0) {
      console.warn(`⚠️ Found ${invalidEmails.length} invalid email addresses:`, invalidEmails);
    }

    // Step 4: Get email template
    const emailTemplates = {
      admission: (data) => ({
        subject: `🎓 Admissions Now Open for ${data.schoolYear || '2025'} - ${SCHOOL_NAME}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              body { margin:0; padding:0; font-family: 'Inter', sans-serif; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 40px 30px; text-align: center; }
              .content { padding: 40px 30px; }
              .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color:white; font-size: 28px; font-weight: 700; margin: 0;">🎓 Admissions Open</h1>
                <p style="color:rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0;">${SCHOOL_NAME}</p>
                <p style="color:rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0;">${SCHOOL_LOCATION}</p>
              </div>
              
              <div class="content">
                <h2 style="color:#1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px;">Begin Your Educational Journey</h2>
                <p style="color:#475569; font-size: 16px; line-height: 1.6;">
                  We are thrilled to announce that admissions for the <strong>${data.schoolYear || '2025'}</strong> academic year are now open! 
                  Join our community of excellence and embark on an educational journey that shapes futures at our Public Mixed  Day and Boarding School.
                </p>
                
                <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="color:#1e40af; font-size: 18px; font-weight: 600; margin: 0 0 10px;">Quick Facts:</h3>
                  <ul style="color:#475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>Public Mixed  Day and Boarding School in Matungulu, Machakos</li>
                    <li>1200+ students community</li>
                    <li>8-4-4 Curriculum System</li>
                    <li>Quality education for all</li>
                  </ul>
                </div>
                
                ${data.deadline ? `<p style="color:#059669; font-size: 16px; font-weight: 600;">📅 Application Deadline: ${data.deadline}</p>` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="/pages/admissions" class="cta-button">Apply Now →</a>
                </div>
                
                <p style="color:#64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                  For more information, contact our admissions office at <strong>+254720123456</strong> or email <strong>admissions@katwanyaahighSchool.sc.ke</strong>
                </p>
              </div>

              <div class="footer">
                <p style="color:#1e293b; font-size: 18px; font-weight: 600; margin: 0 0 8px;">${SCHOOL_NAME}</p>
                <p style="color:#64748b; font-size: 14px; margin: 0 0 8px;">${SCHOOL_MOTTO}</p>
                <p style="color:#94a3b8; font-size: 12px; margin: 8px 0 0;">© 2024 ${SCHOOL_NAME}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }),

      // Add your other templates here (newsletter, event, custom)
      // ... (keep your existing template definitions)
    };

    const emailTemplate = emailTemplates[template] || emailTemplates.admission;
    const emailContent = emailTemplate({
      ...templateData,
      subject: subject || `Important Update - ${SCHOOL_NAME}`,
      customMessage: customMessage || ''
    });

    // Step 5: Send emails with rate limiting
    const BATCH_SIZE = 50;
    const results = [];
    const sentBy = auth.user.name;

    console.log(`📧 Sending campaign to ${validSubscribers.length} subscribers...`);

    for (let i = 0; i < validSubscribers.length; i += BATCH_SIZE) {
      const batch = validSubscribers.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (subscriber) => {
        try {
          await transporter.sendMail({
            from: `"${SCHOOL_NAME}" <${process.env.EMAIL_USER}>`,
            to: subscriber.email,
            subject: emailContent.subject,
            html: emailContent.html,
            headers: {
              'X-Campaign-Type': template,
              'X-Sent-By': sentBy,
              'X-School-Name': SCHOOL_NAME
            }
          });
          return { email: subscriber.email, status: 'sent', sentAt: new Date().toISOString() };
        } catch (error) {
          console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
          return { 
            email: subscriber.email, 
            status: 'failed', 
            error: error.message,
            sentAt: new Date().toISOString() 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Log progress
      const sentCount = results.filter(r => r.status === 'sent').length;
      const failedCount = results.filter(r => r.status === 'failed').length;
      console.log(`📊 Progress: ${sentCount} sent, ${failedCount} failed`);

      // Add delay between batches to prevent rate limiting
      if (i + BATCH_SIZE < validSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Step 6: Return results
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`✅ Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Campaign sent successfully`,
      details: {
        totalRecipients: validSubscribers.length,
        sent: sentCount,
        failed: failedCount,
        sentBy: auth.user.name,
        timestamp: new Date().toISOString(),
        template: template,
        subject: emailContent.subject
      },
      results,
      authenticated: true
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error sending campaign:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send campaign',
      authenticated: true
    }, { status: 500 });
  }
}

// Optionally add GET method to get campaign statistics (also protected)
export async function GET(request) {
  try {
    // Authenticate the GET request as well
    const auth = authenticateCampaignRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // You could implement campaign statistics here
    return NextResponse.json({
      success: true,
      message: 'Campaign API is active',
      authenticated: true,
      user: {
        name: auth.user.name,
        role: auth.user.role,
        permissions: ['send_campaigns']
      }
    });

  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      authenticated: true
    }, { status: 500 });
  }
}