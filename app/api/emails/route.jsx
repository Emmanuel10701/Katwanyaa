import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import nodemailer from "nodemailer";

// Email sender setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Main Email Template Layout
const emailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f7f9fc; padding: 20px 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px 20px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    .tagline { font-size: 14px; opacity: 0.9; }
    .content { padding: 30px; }
    .message-container { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .message-title { color: #1e3a8a; font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .message-content { color: #4b5563; font-size: 15px; line-height: 1.6; white-space: pre-line; }
    .footer { background: #1f2937; color: #9ca3af; text-align: center; padding: 25px 20px; font-size: 12px; }
    .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 10px 0; }
    @media (max-width: 620px) { .container { width: 95% !important; } .content { padding: 20px; } .header { padding: 25px 15px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎓 Katwanyaa High School</div>
      <div class="tagline">Excellence in Education Since 1985</div>
    </div>
    
    <div class="content">
      <div class="message-container">
        <div class="message-title">${data.subject}</div>
        <div class="message-content">${data.message || data.content}</div>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://katwanyaa.edu" class="btn">Visit Our Website →</a>
      </div>
    </div>
    
    <div class="footer">
      <div style="margin-bottom: 15px;">
        <div style="color: #d1d5db; font-weight: 600; margin-bottom: 8px;">Katwanyaa High School</div>
        <div>📍 Excellence Avenue, Education District</div>
        <div>📞 (254) 700-000000 • ✉️ info@katwanyaa.ac.ke</div>
      </div>
      
      <div style="margin: 15px 0;">
        <a href="#" style="color: #60a5fa; margin: 0 8px; text-decoration: none;">Facebook</a> • 
        <a href="#" style="color: #60a5fa; margin: 0 8px; text-decoration: none;">Twitter</a> • 
        <a href="#" style="color: #60a5fa; margin: 0 8px; text-decoration: none;">Instagram</a>
      </div>
      
      <div style="color: #6b7280;">
        &copy; 2024 Katwanyaa High School. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;

async function sendEmails(campaign) {
  const recipients = campaign.recipients.split(",").map(r => r.trim());
  
  const htmlContent = emailTemplate({
    subject: campaign.subject,
    message: campaign.content,
    content: campaign.content
  });

  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"Katwanyaa High School" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: campaign.subject,
        html: htmlContent,
        text: campaign.content.replace(/<[^>]*>/g, '')
      });
      console.log(`✅ Email sent to: ${recipient}`);
    } catch (error) {
      console.error(`❌ Failed to send to ${recipient}:`, error);
    }
  }

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { sentAt: new Date() },
  });
}

// 🔹 Create a new campaign
export async function POST(req) {
  try {
    // Test database connection first
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    const { title, subject, content, recipients, status } = await req.json();

    if (!title || !subject || !content || !recipients) {
      return NextResponse.json({ 
        success: false, 
        error: "All fields are required: title, subject, content, and recipients" 
      }, { status: 400 });
    }

    console.log("📝 Creating campaign in database...");
    const campaign = await prisma.emailCampaign.create({
      data: { 
        title, 
        subject, 
        content, 
        recipients, 
        status: status || "draft"
      },
    });

    console.log("✅ Campaign created:", campaign.id);

    // Send emails immediately if published
    if (status === "published") {
      console.log("📧 Sending emails...");
      await sendEmails(campaign);
      console.log("✅ Emails sent successfully");
    }

    return NextResponse.json({ 
      success: true, 
      campaign,
      message: status === "published" 
        ? "Campaign created and emails sent successfully" 
        : "Campaign saved as draft"
    });

  } catch (error) {
    console.error("❌ POST EmailCampaign Error:", error);
    
    // More specific error handling
    if (error.code === 'P2021') {
      return NextResponse.json({ 
        success: false, 
        error: "Database table not found. Please run: npx prisma db push" 
      }, { status: 500 });
    }
    
    if (error.code === 'P1001') {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot connect to database. Check your DATABASE_URL" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 🔹 Get all campaigns
export async function GET() {
  try {
    await prisma.$connect();
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ 
      success: true, 
      campaigns,
      count: campaigns.length 
    });
  } catch (error) {
    console.error("❌ GET EmailCampaigns Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch campaigns" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}