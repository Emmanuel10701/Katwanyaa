import { NextResponse } from 'next/server';
import { prisma } from '../../../libs/prisma';
import { verifyPassword, generateToken, sanitizeUser } from '../../../libs/auth';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Constants
const MAX_FAILED_ATTEMPTS = 8;
const MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY = 15; // Auto-expire after 15 logins
const VERIFICATION_CODE_EXPIRY_MINUTES = 15;
const VERIFICATION_CODE_LENGTH = 6;
const DEVICE_TOKEN_EXPIRY_DAYS = 30; // Token expires after 30 days

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ====================
// EMAIL TEMPLATE FOR VERIFICATION CODE
// ====================
function getVerificationEmailTemplate(user, verificationCode) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <title>Verification Code - Katwanyaa High School</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f7fafc; padding: 20px; }
        .container { max-width: 550px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 35px; }
        .code-box { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 1px solid #a5d6a7; }
        .code { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #047857; font-family: monospace; margin: 15px 0; }
        .instructions { color: #4a5568; font-size: 15px; line-height: 1.7; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
        .details-box { background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0; }
        .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; }
        .detail-item:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #4a5568; }
        .detail-value { color: #2d3748; font-weight: 500; }
        .footer { background: #1a202c; color: #cbd5e0; padding: 25px; text-align: center; font-size: 12px; }
        .footer a { color: #63b3ed; text-decoration: none; }
        .expiry-note { color: #718096; font-size: 13px; text-align: center; margin-top: 15px; }
        .resend-info { text-align: center; margin-top: 20px; font-size: 13px; color: #718096; }
        @media (max-width: 600px) {
          .content { padding: 20px; }
          .code { font-size: 32px; letter-spacing: 8px; }
          .header { padding: 25px 20px; }
          .header h1 { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Login Verification</h1>
          <p>Katwanyaa High School Admin System</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2d3748; margin-bottom: 10px;">Hello ${user.name},</h2>
          <p class="instructions">
            We detected a login attempt to your admin account. To complete your login, please use the verification code below:
          </p>
          
          <div class="code-box">
            <p style="color: #047857; font-weight: 600; margin-bottom: 10px;">Your 6-digit verification code:</p>
            <div class="code">${verificationCode}</div>
            <p style="color: #2e7d32; font-size: 14px; margin-top: 10px;">Enter this code on the login verification page</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p style="margin-top: 8px;">
              If you didn't attempt to login to your account, please change your password immediately and contact support.
              This could indicate unauthorized access attempts.
            </p>
          </div>
          
          <div class="details-box">
            <div class="detail-item">
              <span class="detail-label">👤 Account:</span>
              <span class="detail-value">${user.email}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">👑 Role:</span>
              <span class="detail-value">${user.role}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🕒 Time:</span>
              <span class="detail-value">${new Date().toLocaleString()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🌐 IP Address:</span>
              <span class="detail-value">[Detected during login]</span>
            </div>
          </div>
          
          <p class="expiry-note">
            ⏰ This code will expire in <strong>${VERIFICATION_CODE_EXPIRY_MINUTES} minutes</strong>.
            Do not share this code with anyone.
          </p>
          
          <div class="resend-info">
            <p>Didn't receive the code? You can request a new one on the login page.</p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin-bottom: 10px; font-size: 14px; color: #e2e8f0;">
            <strong>Katwanyaa High School</strong><br>
            Matungulu, Machakos County
          </p>
          <p style="margin-bottom: 10px;">
            📞 +254720123456 | 📧 info@katwanyaahighschool.sc.ke
          </p>
          <p style="font-size: 11px; opacity: 0.8;">
            This is an automated security message. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} Katwanyaa High School. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ====================
// HELPER FUNCTIONS
// ====================

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate device hash with more parameters
function generateDeviceHash(req) {
  const userAgent = req.headers.get('user-agent') || '';
  const accept = req.headers.get('accept') || '';
  const language = req.headers.get('accept-language') || '';
  const platform = req.headers.get('sec-ch-ua-platform') || '';
  const screen = req.headers.get('sec-ch-ua-resolution') || 'unknown';
  
  // Include more device info for better fingerprint
  const deviceString = `${userAgent}|${accept}|${language}|${platform}|${screen}`;
  return crypto.createHash('sha256').update(deviceString).digest('hex').substring(0, 32);
}

// Check recent failed attempts
async function checkFailedAttempts(email) {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email: email.toLowerCase(),
      status: 'failed',
      attemptedAt: { gte: fifteenMinutesAgo }
    }
  });
  
  return failedAttempts;
}

// Store verification code
async function storeVerificationCode(email, code, deviceHash) {
  const expires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);
  
  // Delete any existing codes for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });
  
  // Store new code
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires: expires
    }
  });
  
  return verificationToken;
}

// Send verification email
async function sendVerificationEmail(user, verificationCode) {
  try {
    const mailOptions = {
      from: {
        name: 'Katwanyaa High School Security',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: `🔐 Your Verification Code: ${verificationCode} - Katwanyaa High School`,
      html: getVerificationEmailTemplate(user, verificationCode)
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification code sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}

// Generate device token for localStorage (30 days expiry)
function generateDeviceToken(userId, deviceHash) {
  const payload = {
    userId: userId,
    deviceHash: deviceHash,
    loginCount: 1, // Start at 1
    createdAt: new Date().toISOString(),
    exp: Math.floor(Date.now() / 1000) + (DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60), // 30 days expiry
    iat: Math.floor(Date.now() / 1000)
  };
  
  const payloadStr = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(payloadStr)));
}

// Verify device token from localStorage
function verifyDeviceToken(token, deviceHash) {
  try {
    const payloadStr = decodeURIComponent(escape(atob(token)));
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (payload.exp * 1000 <= Date.now()) {
      return { valid: false, reason: 'expired' };
    }
    
    // Check device hash matches
    if (payload.deviceHash !== deviceHash) {
      return { valid: false, reason: 'device_mismatch' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, reason: 'invalid_token' };
  }
}

// Check if device needs verification
async function checkDeviceVerification(userId, deviceHash, clientLoginCount = 0, clientDeviceToken = null) {
  // First verify client token if provided
  if (clientDeviceToken) {
    const tokenValid = verifyDeviceToken(clientDeviceToken, deviceHash);
    if (!tokenValid.valid) {
      return { requiresVerification: true, reason: tokenValid.reason };
    }
    
    // Check login count from client token
    if (tokenValid.payload.loginCount >= MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY) {
      return { requiresVerification: true, reason: 'max_login_attempts_reached' };
    }
  }
  
  // Check database for trusted device
  const device = await prisma.deviceToken.findFirst({
    where: {
      userId: userId,
      deviceHash: deviceHash,
      isTrusted: true,
      expiresAt: { gt: new Date() },
      isBlocked: false
    }
  });
  
  if (!device) {
    return { requiresVerification: true, reason: 'new_device' };
  }
  
  // Check database login count
  if (device.loginCount >= MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY) {
    return { requiresVerification: true, reason: 'max_login_attempts_reached' };
  }
  
  return { requiresVerification: false };
}

// Update device login count
async function updateDeviceLoginCount(userId, deviceHash, userAgent) {
  const expiresAt = new Date(Date.now() + DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  const device = await prisma.deviceToken.upsert({
    where: {
      userId_deviceHash: {
        userId: userId,
        deviceHash: deviceHash
      }
    },
    update: {
      lastUsed: new Date(),
      expiresAt: expiresAt,
      isTrusted: true,
      loginCount: {
        increment: 1
      }
    },
    create: {
      userId: userId,
      deviceHash: deviceHash,
      deviceName: userAgent.substring(0, 100),
      lastUsed: new Date(),
      expiresAt: expiresAt,
      isTrusted: true,
      loginCount: 1
    }
  });
  
  return device;
}

// Check device trust (for existing logic)
async function checkDeviceTrust(userId, deviceHash) {
  const device = await prisma.deviceToken.findFirst({
    where: {
      userId: userId,
      deviceHash: deviceHash,
      isTrusted: true,
      expiresAt: { gt: new Date() },
      isBlocked: false
    }
  });
  
  return device;
}

// Store trusted device (for existing logic)
async function storeTrustedDevice(userId, deviceHash, userAgent) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  const device = await prisma.deviceToken.upsert({
    where: {
      userId_deviceHash: {
        userId: userId,
        deviceHash: deviceHash
      }
    },
    update: {
      lastUsed: new Date(),
      expiresAt: expiresAt,
      isTrusted: true
    },
    create: {
      userId: userId,
      deviceHash: deviceHash,
      deviceName: userAgent.substring(0, 100),
      expiresAt: expiresAt,
      isTrusted: true
    }
  });
  
  return device;
}

// ====================
// VERIFICATION ENDPOINT
// ====================
async function handleVerification(email, code, deviceHash, req, clientLoginCount = 0) {
  try {
    // Find verification code
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: { gt: new Date() }
      }
    });

    if (!verificationToken) {
      return {
        success: false,
        error: 'Invalid or expired verification code'
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Store/update device in database
    const device = await updateDeviceLoginCount(user.id, deviceHash, userAgent);
    
    // Delete used verification code
    await prisma.verificationToken.delete({
      where: { token: code }
    });

    // Generate tokens
    const authToken = generateToken(user);
    const deviceToken = generateDeviceToken(user.id, deviceHash);
    
    // Update login count in device token
    const deviceTokenPayload = JSON.parse(decodeURIComponent(escape(atob(deviceToken))));
    deviceTokenPayload.loginCount = (clientLoginCount || 0) + 1;
    const updatedDeviceToken = btoa(unescape(encodeURIComponent(JSON.stringify(deviceTokenPayload))));
    
    const userData = sanitizeUser(user);

    return {
      success: true,
      message: 'Verification successful',
      user: userData,
      token: authToken,
      deviceToken: updatedDeviceToken,
      storeInLocalStorage: true,
      loginCount: deviceTokenPayload.loginCount
    };

  } catch (error) {
    console.error('❌ Verification error:', error);
    return {
      success: false,
      error: 'Verification failed'
    };
  }
}

// ====================
// MAIN LOGIN HANDLER
// ====================
export async function POST(request) {
  try {
    const { 
      email, 
      password, 
      verificationCode, 
      action,
      clientDeviceToken, // Token from localStorage
      clientLoginCount,  // Login count from localStorage
      clientDeviceHash   // Device hash from frontend
    } = await request.json();
    
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const serverDeviceHash = generateDeviceHash(request);
    const deviceHash = clientDeviceHash || serverDeviceHash;

    // ====================
    // 1. VERIFICATION FLOW
    // ====================
    if (action === 'verify' && verificationCode) {
      const verificationResult = await handleVerification(
        email, 
        verificationCode, 
        deviceHash, 
        request,
        clientLoginCount
      );
      
      if (verificationResult.success) {
        // Log successful verification
        await prisma.loginAttempt.create({
          data: {
            userId: verificationResult.user.id,
            email: email,
            ipAddress: ipAddress,
            userAgent: userAgent,
            deviceHash: deviceHash,
            status: 'verified',
            reason: 'code_correct'
          }
        });
        
        return NextResponse.json(verificationResult, { status: 200 });
      } else {
        // Log failed verification attempt
        await prisma.loginAttempt.create({
          data: {
            email: email,
            ipAddress: ipAddress,
            userAgent: userAgent,
            deviceHash: deviceHash,
            status: 'failed',
            reason: 'wrong_verification_code'
          }
        });
        
        return NextResponse.json(verificationResult, { status: 401 });
      }
    }

    // ====================
    // 2. RESEND CODE FLOW
    // ====================
    if (action === 'resend') {
      const user = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase().trim() } 
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Generate new code
      const newCode = generateVerificationCode();
      await storeVerificationCode(email, newCode, deviceHash);
      await sendVerificationEmail(user, newCode);

      return NextResponse.json({
        success: true,
        message: 'New verification code sent to your email'
      }, { status: 200 });
    }

    // ====================
    // 3. NORMAL LOGIN FLOW
    // ====================
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (!user) {
      // Log failed attempt
      await prisma.loginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress: ipAddress,
          userAgent: userAgent,
          deviceHash: deviceHash,
          status: 'failed',
          reason: 'user_not_found'
        }
      });
      
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check password
    if (!user.password) {
      return NextResponse.json({ error: 'Invalid authentication method' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      // Log failed attempt
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: ipAddress,
          userAgent: userAgent,
          deviceHash: deviceHash,
          status: 'failed',
          reason: 'wrong_password'
        }
      });
      
      // Check failed attempts
      const failedCount = await checkFailedAttempts(user.email);
      
      if (failedCount >= MAX_FAILED_ATTEMPTS - 1) {
        // Generate verification code
        const verificationCode = generateVerificationCode();
        await storeVerificationCode(user.email, verificationCode, deviceHash);
        await sendVerificationEmail(user, verificationCode);
        
        return NextResponse.json({
          success: false,
          requiresVerification: true,
          message: 'Multiple failed attempts detected. Verification code sent to your email.',
          email: user.email,
          reason: 'failed_attempts'
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: 'Invalid email or password',
        attemptsLeft: MAX_FAILED_ATTEMPTS - failedCount - 1
      }, { status: 401 });
    }

    // ✅ PASSWORD IS CORRECT!
    
    // Log successful attempt
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress: ipAddress,
        userAgent: userAgent,
        deviceHash: deviceHash,
        status: 'success',
        reason: 'password_correct'
      }
    });

    // Check if we should require verification (for admins/suspicious patterns)
    const shouldRequireVerification = () => {
      // Always verify admins on new devices
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        return true;
      }
      
      // Check for suspicious patterns
      const failedCount = checkFailedAttempts(user.email);
      if (failedCount >= 3) {
        return true;
      }
      
      return false;
    };

    // Check device verification
    const verificationCheck = await checkDeviceVerification(
      user.id, 
      deviceHash, 
      clientLoginCount,
      clientDeviceToken
    );
    
    if (verificationCheck.requiresVerification || shouldRequireVerification()) {
      // Generate verification code
      const verificationCode = generateVerificationCode();
      await storeVerificationCode(user.email, verificationCode, deviceHash);
      await sendVerificationEmail(user, verificationCode);
      
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: 'Verification code sent to your email. Please enter it to continue.',
        email: user.email,
        reason: verificationCheck.reason || 'security_check'
      }, { status: 200 });
    }

    // Device is trusted - proceed with login
    // Update device login count
    const device = await updateDeviceLoginCount(user.id, deviceHash, userAgent);
    
    // Generate new device token with updated login count
    const newLoginCount = (clientLoginCount || device.loginCount) + 1;
    const deviceToken = generateDeviceToken(user.id, deviceHash);
    const deviceTokenPayload = JSON.parse(decodeURIComponent(escape(atob(deviceToken))));
    deviceTokenPayload.loginCount = newLoginCount;
    const updatedDeviceToken = btoa(unescape(encodeURIComponent(JSON.stringify(deviceTokenPayload))));
    
    // Generate auth token
    const token = generateToken(user);
    
    // Log successful login
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress: ipAddress,
        userAgent: userAgent,
        deviceHash: deviceHash,
        status: 'success',
        reason: 'password_correct'
      }
    });
    
    const userData = sanitizeUser(user);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: token,
      deviceToken: updatedDeviceToken,
      storeInLocalStorage: true,
      loginCount: newLoginCount,
      deviceTrusted: true
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ====================
// GET LOGIN INFO
// ====================
export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Login endpoint with verification',
      security: {
        maxFailedAttempts: MAX_FAILED_ATTEMPTS,
        maxLoginAttemptsBeforeVerify: MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY,
        verificationCodeLength: VERIFICATION_CODE_LENGTH,
        verificationExpiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
        deviceTokenExpiryDays: DEVICE_TOKEN_EXPIRY_DAYS
      }
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching login info:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}