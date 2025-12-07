import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import nodemailer from 'nodemailer'; 
import { randomBytes } from "crypto";

// ====================================================================
// NODEMAILER CONFIGURATION
// ====================================================================

// Configure Nodemailer Transporter using the school's account
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your desired service or SMTP settings
  auth: {
    user: process.env.EMAIL_USER, // School's main email address
    pass: process.env.EMAIL_PASS, // School's main email password/App password
  },
});

// ====================================================================
// EMAIL SENDER UTILITIES
// ====================================================================

/**
 * Sends a confirmation email to the applicant's contact (Parent/Guardian).
 */
async function sendApplicantConfirmationEmail(toEmail, applicantName, applicationNumber) {
  const mailOptions = {
    from: {
      name: 'Katwanyaa Highschool Admissions',
      address: process.env.EMAIL_USER
    },
    to: toEmail,
    subject: `✅ Application Received: Katwanyaa Highschool - ${applicantName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmation</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          .container { max-width: 600px; width: 100% !important; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
          @media screen and (max-width: 600px) { .padding-content { padding: 20px !important; } }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: Arial, sans-serif;">
        <center style="width: 100%; background-color: #f4f7f6;">
          <div style="max-width: 600px; margin: 0 auto;" class="container">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
              <tr>
                <td align="center" style="background-color: #1b5e20; color: white; padding: 40px 30px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: bold; line-height: 1.2;">
                    🏫 Katwanyaa Highschool Admissions
                  </h1>
                </td>
              </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 30px 20px 30px;" class="padding-content">
                  <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                    Dear **Applicant Contact**,
                  </p>
                  <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px;">
                    Thank you for submitting an application for **${applicantName}**. We have successfully received the details.
                  </p>

                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                    <tr>
                      <td style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; color: #1b5e20; font-size: 14px; font-weight: bold;">
                          Applicant Name:
                        </p>
                        <h2 style="margin: 0; color: #047857; font-size: 20px; font-weight: bold; line-height: 1.2;">
                          ${applicantName}
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f0f9ff; border: 1px solid #e0f2fe; padding: 20px; border-radius: 8px; margin-top: 15px;">
                        <p style="margin: 0 0 10px 0; color: #075985; font-size: 14px; font-weight: bold;">
                          Application Number:
                        </p>
                        <h2 style="margin: 0; color: #0369a1; font-size: 20px; font-weight: bold; line-height: 1.2;">
                          ${applicationNumber}
                        </h2>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 25px 0 25px 0; color: #333333; font-size: 16px;">
                    <strong>Important:</strong> Please keep your application number (${applicationNumber}) for future reference.
                    We will use this email address (**${toEmail}**) for all future communications regarding the status of the admission.
                  </p>
                  
                  <p style="margin: 0; color: #333333; font-size: 16px;">
                    Best regards,<br>
                    <strong>The Katwanyaa Highschool Admissions Team</strong>
                  </p>
                </td>
              </tr>
            </table>
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
              <tr>
                <td align="center" style="background-color: #f4f7f6; padding: 20px 30px; color: #777777; font-size: 12px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                  <p style="margin: 0 0 5px 0;">
                    © ${new Date().getFullYear()} Katwanyaa Highschool. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </center>
      </body>
      </html>
    `,
    text: `Dear Applicant Contact,\n\nThank you for submitting an application for ${applicantName}. We have received your application via the email: ${toEmail}.\n\nApplication Number: ${applicationNumber}\n\nPlease keep your application number for future reference.\n\nBest regards,\nThe Katwanyaa Highschool Admissions Team`,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Sends a notification email to the School Administrator.
 */
async function sendAdminNotificationEmail(applicantData, applicationNumber) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL is not set in environment variables. Admin notification skipped.");
    return;
  }

  const mailOptions = {
    from: {
      name: 'Admissions System Bot',
      address: process.env.EMAIL_USER
    },
    to: adminEmail,
    subject: `🚨 NEW APPLICATION SUBMITTED: ${applicantData.firstName} ${applicantData.lastName} (${applicationNumber})`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Application</title>
        <style type="text/css">
          body { font-family: Arial, sans-serif; background-color: #f7f7f7; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          .header { background-color: #38761d; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
          .content { padding: 30px; }
          .detail-row { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
          .detail-row strong { color: #1b5e20; display: inline-block; width: 180px; }
          .alert { background-color: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; border-radius: 4px; margin-top: 20px; color: #856404;}
          .highlight { background-color: #e8f5e9; padding: 10px; border-radius: 4px; border-left: 4px solid #388e3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Admission Application Received!</h2>
          </div>
          <div class="content">
            <div class="highlight">
              <h3 style="margin-top: 0;">Application Number: ${applicationNumber}</h3>
            </div>
            
            <p>A new student application has been submitted to Katwanyaa Highschool's system.</p>
            
            <div class="detail-row">
              <strong>Applicant Name:</strong> <span>${applicantData.firstName} ${applicantData.lastName}</span>
            </div>
            <div class="detail-row">
              <strong>Date of Birth:</strong> <span>${new Date(applicantData.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <strong>Gender:</strong> <span>${applicantData.gender}</span>
            </div>
            <div class="detail-row">
              <strong>County:</strong> <span>${applicantData.county}</span>
            </div>
            <div class="detail-row">
              <strong>Preferred Stream:</strong> <span>${applicantData.preferredStream}</span>
            </div>
            <div class="detail-row">
              <strong>Previous School:</strong> <span>${applicantData.previousSchool}</span>
            </div>
            <div class="detail-row">
              <strong>KCPE Marks:</strong> <span>${applicantData.kcpeMarks || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <strong>Contact Email:</strong> <span>${applicantData.email}</span>
            </div>
            <div class="detail-row">
              <strong>Contact Phone:</strong> <span>${applicantData.phone}</span>
            </div>
            <div class="detail-row">
              <strong>Submitted At:</strong> <span>${new Date().toLocaleString('en-US')}</span>
            </div>

            <div class="alert">
              <p><strong>Action required:</strong> Please log into the admissions portal to view and process this application.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `NEW APPLICATION SUBMITTED:\n\nApplication Number: ${applicationNumber}\nApplicant: ${applicantData.firstName} ${applicantData.lastName}\nDate of Birth: ${new Date(applicantData.dateOfBirth).toLocaleDateString()}\nGender: ${applicantData.gender}\nCounty: ${applicantData.county}\nPreferred Stream: ${applicantData.preferredStream}\nPrevious School: ${applicantData.previousSchool}\nKCPE Marks: ${applicantData.kcpeMarks || 'Not provided'}\nEmail: ${applicantData.email}\nPhone: ${applicantData.phone}\n\nAction required: Please review in the admin portal.`,
  };

  await transporter.sendMail(mailOptions);
}

// ====================================================================
// POST HANDLER (Application Submission)
// ====================================================================

/**
 * POST /api/admission
 * Handles new admission application submissions.
 */
export async function POST(req) {
  try {
    const data = await req.json();

    // 1. Generate application number
    const year = new Date().getFullYear();
    const randomNum = randomBytes(4).toString('hex').toUpperCase();
    const applicationNumber = `KHS/${year}/${randomNum}`;

    // 2. Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'gender', 'dateOfBirth',
      'nationality', 'county', 'constituency', 'ward',
      'email', 'phone', 'postalAddress',
      'previousSchool', 'previousClass', 'preferredStream'
    ];

    const missingFields = [];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Validate formats and check for existing email (used as unique contact)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }
    
    const phoneRegex = /^(07|01)\d{8}$/;
    const cleanedPhone = data.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX" 
      }, { status: 400 });
    }
    
    // 4. Check for existing application by email
    const existingApplication = await prisma.admissionApplication.findUnique({
      where: { email: data.email }
    });
    
    if (existingApplication) {
      return NextResponse.json({ 
        success: false, 
        error: "An application with this email already exists" 
      }, { status: 400 });
    }

    // 5. Prepare application data
    const applicationData = {
      applicationNumber,
      firstName: data.firstName.trim(),
      middleName: data.middleName ? data.middleName.trim() : null,
      lastName: data.lastName.trim(),
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
      nationality: data.nationality.trim(),
      county: data.county.trim(),
      constituency: data.constituency.trim(),
      ward: data.ward.trim(),
      village: data.village ? data.village.trim() : null,
      email: data.email.trim().toLowerCase(),
      phone: cleanedPhone,
      alternativePhone: data.alternativePhone ? data.alternativePhone.replace(/\s/g, '') : null,
      postalAddress: data.postalAddress.trim(),
      postalCode: data.postalCode ? data.postalCode.trim() : null,
      fatherName: data.fatherName ? data.fatherName.trim() : null,
      fatherPhone: data.fatherPhone ? data.fatherPhone.replace(/\s/g, '') : null,
      fatherEmail: data.fatherEmail ? data.fatherEmail.trim().toLowerCase() : null,
      fatherOccupation: data.fatherOccupation ? data.fatherOccupation.trim() : null,
      motherName: data.motherName ? data.motherName.trim() : null,
      motherPhone: data.motherPhone ? data.motherPhone.replace(/\s/g, '') : null,
      motherEmail: data.motherEmail ? data.motherEmail.trim().toLowerCase() : null,
      motherOccupation: data.motherOccupation ? data.motherOccupation.trim() : null,
      guardianName: data.guardianName ? data.guardianName.trim() : null,
      guardianPhone: data.guardianPhone ? data.guardianPhone.replace(/\s/g, '') : null,
      guardianEmail: data.guardianEmail ? data.guardianEmail.trim().toLowerCase() : null,
      guardianOccupation: data.guardianOccupation ? data.guardianOccupation.trim() : null,
      previousSchool: data.previousSchool.trim(),
      previousClass: data.previousClass.trim(),
      kcpeYear: data.kcpeYear ? parseInt(data.kcpeYear) : null,
      kcpeIndex: data.kcpeIndex ? data.kcpeIndex.trim() : null,
      kcpeMarks: data.kcpeMarks ? parseInt(data.kcpeMarks) : null,
      meanGrade: data.meanGrade ? data.meanGrade.trim() : null,
      preferredStream: data.preferredStream,
      medicalCondition: data.medicalCondition ? data.medicalCondition.trim() : null,
      allergies: data.allergies ? data.allergies.trim() : null,
      bloodGroup: data.bloodGroup ? data.bloodGroup.trim() : null,
      sportsInterests: data.sportsInterests ? data.sportsInterests.trim() : null,
      clubsInterests: data.clubsInterests ? data.clubsInterests.trim() : null,
      talents: data.talents ? data.talents.trim() : null,
    };

    // 6. Create application in the database
    const application = await prisma.admissionApplication.create({
      data: applicationData
    });
    
    console.log(`✅ Application created: ${application.applicationNumber}`);

    // 7. Send Confirmation and Notification Emails
    const fullName = `${application.firstName} ${application.lastName}`;
    
    try {
      // Send confirmation to the applicant's contact (Parent/Guardian)
      await sendApplicantConfirmationEmail(application.email, fullName, application.applicationNumber);
      console.log(`✅ Confirmation email sent to: ${application.email}`);
      
      // Send notification to the school administrator
      await sendAdminNotificationEmail(application, application.applicationNumber);
      console.log(`✅ Admin notification sent`);
    } catch (emailError) {
      console.error("⚠️ Email sending failed, but application was saved:", emailError);
      // Don't fail the request if emails fail
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      applicationNumber: application.applicationNumber,
      message: "Application submitted successfully. Confirmation email sent.",
      data: {
        id: application.id,
        name: fullName,
        email: application.email,
        phone: application.phone,
        preferredStream: application.preferredStream,
        submittedAt: application.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Admission application error:", error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const fieldName = field === 'phone' ? 'phone number' : field;
      return NextResponse.json(
        { success: false, error: `An application with this ${fieldName} already exists` },
        { status: 400 }
      );
    }
    
    // Handle Prisma validation errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: "Invalid data provided. Please check your input." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to submit application. Please try again.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// GET HANDLER (Retrieve All Applications OR Single Application)
// ====================================================================

/**
 * GET /api/applyadmission
 * Can fetch: 
 * - All applications (no query params)
 * - Single application by applicationNumber, email, or phone (with query params)
 */
// ====================================================================

export async function GET() {
  try {
    const applications = await prisma.admissionApplication.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Format the applications
    const formattedApplications = applications.map(app => ({
      ...app,
      // Format dates to strings
      dateOfBirth: app.dateOfBirth.toISOString().split('T')[0],
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      // Add computed fields
      fullName: `${app.firstName} ${app.middleName ? app.middleName + ' ' : ''}${app.lastName}`,
      age: calculateAge(app.dateOfBirth),
      streamLabel: app.preferredStream === 'SCIENCE' ? 'Science' :
                   app.preferredStream === 'ARTS' ? 'Arts' :
                   app.preferredStream === 'BUSINESS' ? 'Business' :
                   app.preferredStream === 'TECHNICAL' ? 'Technical' : app.preferredStream,
      statusLabel: app.status === 'PENDING' ? 'Pending' :
                   app.status === 'REVIEWED' ? 'Reviewed' :
                   app.status === 'ACCEPTED' ? 'Accepted' :
                   app.status === 'REJECTED' ? 'Rejected' :
                   app.status === 'INTERVIEW_SCHEDULED' ? 'Interview Scheduled' : app.status
    }));

    return NextResponse.json({ 
      success: true, 
      count: applications.length,
      applications: formattedApplications 
    });

  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
