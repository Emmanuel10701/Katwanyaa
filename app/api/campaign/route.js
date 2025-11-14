import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const emailTemplates = {
  admission: (data) => ({
    subject: `🎓 Admissions Now Open for ${data.schoolYear || '2025'} - Tokatwanyaa Highschool`,
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
            <p style="color:rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0;">Tokatwanyaa Highschool</p>
          </div>
          
          <div class="content">
            <h2 style="color:#1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px;">Begin Your Educational Journey</h2>
            <p style="color:#475569; font-size: 16px; line-height: 1.6;">
              We are thrilled to announce that admissions for the <strong>${data.schoolYear || '2025'}</strong> academic year are now open! 
              Join our community of excellence and embark on an educational journey that shapes futures.
            </p>
            ${data.deadline ? `<p style="color:#059669; font-size: 16px; font-weight: 600;">Application Deadline: ${data.deadline}</p>` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="cta-button">Apply Now →</a>
            </div>
          </div>

          <div class="footer">
            <p style="color:#1e293b; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Tokatwanyaa Highschool</p>
            <p style="color:#64748b; font-size: 14px; margin: 0 0 8px;">Excellence in Education</p>
            <p style="color:#94a3b8; font-size: 12px; margin: 8px 0 0;">© 2024 Tokatwanyaa Highschool. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  newsletter: (data) => ({
    subject: `📰 ${data.month || 'November'} Newsletter - Tokatwanyaa Highschool`,
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
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color:white; font-size: 28px; font-weight: 700; margin: 0;">📰 Monthly Newsletter</h1>
            <p style="color:rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0;">${data.month || 'November'} Updates</p>
          </div>
          
          <div class="content">
            <h2 style="color:#1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px;">What's Happening at Our School</h2>
            <p style="color:#475569; font-size: 16px; line-height: 1.6;">
              ${data.customMessage || 'Stay updated with the latest news, events, and achievements from our school community.'}
            </p>
          </div>

          <div class="footer">
            <p style="color:#1e293b; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Tokatwanyaa Highschool</p>
            <p style="color:#64748b; font-size: 14px; margin: 0 0 8px;">Building Future Leaders</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  event: (data) => ({
    subject: `🎉 You're Invited: ${data.eventName || 'School Event'} - Tokatwanyaa Highschool`,
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
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color:white; font-size: 28px; font-weight: 700; margin: 0;">🎉 You're Invited!</h1>
            <p style="color:rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0;">${data.eventName || 'School Event'}</p>
          </div>
          
          <div class="content">
            <h2 style="color:#1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px;">Join Us for a Special Event</h2>
            <p style="color:#475569; font-size: 16px; line-height: 1.6;">
              ${data.customMessage || 'We cordially invite you to join us for this special occasion. Your presence would mean a lot to us.'}
            </p>
            ${data.date ? `<p style="color:#7c3aed; font-size: 16px; font-weight: 600;">📅 Date: ${data.date}</p>` : ''}
            ${data.time ? `<p style="color:#7c3aed; font-size: 16px; font-weight: 600;">⏰ Time: ${data.time}</p>` : ''}
          </div>

          <div class="footer">
            <p style="color:#1e293b; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Tokatwanyaa Highschool</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  custom: (data) => ({
    subject: data.subject,
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color:white; font-size: 28px; font-weight: 700; margin: 0;">${data.subject}</h1>
            <p style="color:rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0;">Tokatwanyaa Highschool</p>
          </div>
          
          <div class="content">
            <div style="color:#475569; font-size: 16px; line-height: 1.6; white-space: pre-line;">
              ${data.customMessage}
            </div>
          </div>

          <div class="footer">
            <p style="color:#1e293b; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Tokatwanyaa Highschool</p>
            <p style="color:#64748b; font-size: 14px; margin: 0 0 8px;">Excellence in Education</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

export async function POST(request) {
  try {
    const { subscribers, template, subject, customMessage, templateData } = await request.json();

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers provided' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ error: 'Email configuration missing' }, { status: 500 });
    }

    const emailTemplate = emailTemplates[template] || emailTemplates.custom;
    const emailContent = emailTemplate({
      ...templateData,
      subject: subject || 'Important Update - Tokatwanyaa Highschool',
      customMessage
    });

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        return { email: subscriber.email, status: 'sent' };
      } catch (error) {
        return { email: subscriber.email, status: 'failed', error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${sentCount} subscribers${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      results
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}