import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/libs/prisma';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'nyaribu-student-secret-key-2024';
const STUDENT_TOKEN_EXPIRY = '15m'; // 15 minutes

// Generate student JWT token
const generateStudentToken = (student) => {
  return jwt.sign(
    {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      name: `${student.firstName} ${student.lastName}`,
      form: student.form,
      stream: student.stream,
      role: 'student',
    },
    JWT_SECRET,
    { expiresIn: STUDENT_TOKEN_EXPIRY }
  );
};

// Validate student credentials
const validateStudentCredentials = async (fullName, admissionNumber) => {
  try {
    // Clean inputs
    const cleanAdmissionNumber = admissionNumber.trim().toUpperCase();
    const cleanFullName = fullName.trim().toLowerCase();

    // Parse name parts
    const nameParts = cleanFullName.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length < 2) {
      return { 
        success: false, 
        error: 'Please enter your full name (first and last name)',
        requiresContact: false 
      };
    }

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null;

    // Find student by admission number
    const student = await prisma.databaseStudent.findUnique({
      where: { 
        admissionNumber: cleanAdmissionNumber,
        status: 'active'
      }
    });

    if (!student) {
      return { 
        success: false, 
        error: 'Student not found. Please contact your class teacher or the school administrator/secretary to add or confirm your records.',
        requiresContact: true 
      };
    }

    // Check name match (case insensitive)
    const isFirstNameMatch = student.firstName.toLowerCase() === firstName;
    const isLastNameMatch = student.lastName.toLowerCase() === lastName;
    
    let isMiddleNameMatch = true;
    if (middleName && student.middleName) {
      isMiddleNameMatch = student.middleName.toLowerCase() === middleName.toLowerCase();
    } else if (middleName && !student.middleName) {
      // If user entered middle name but student doesn't have one in database
      isMiddleNameMatch = false;
    }

    if (!isFirstNameMatch || !isLastNameMatch || !isMiddleNameMatch) {
      return { 
        success: false, 
        error: 'Student not found. Please contact your class teacher or the school administrator/secretary to add or confirm your records.',
        requiresContact: true 
      };
    }

    return { 
      success: true, 
      student 
    };

  } catch (error) {
    console.error('Student validation error:', error);
    return { 
      success: false, 
      error: 'Authentication failed. Please try again.',
      requiresContact: false 
    };
  }
};

// POST - Student Login
export async function POST(request) {
  try {
    const { fullName, admissionNumber } = await request.json();

    if (!fullName || !admissionNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Full name and admission number are required' 
        },
        { status: 400 }
      );
    }

    // Validate student credentials
    const validation = await validateStudentCredentials(fullName, admissionNumber);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error,
          requiresContact: validation.requiresContact || false
        },
        { status: validation.requiresContact ? 404 : 401 }
      );
    }

    const student = validation.student;

    // Generate JWT token
    const token = generateStudentToken(student);

    // Create student session record - handle case where studentSession might not exist
    try {
      await prisma.studentSession.create({
        data: {
          studentId: student.id,
          admissionNumber: student.admissionNumber,
          name: `${student.firstName} ${student.lastName}`,
          token,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
    } catch (sessionError) {
      console.warn('Could not create student session (might not be in schema yet):', sessionError);
      // Continue without session tracking for now
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
        fullName: `${student.firstName} ${student.lastName}`,
        form: student.form,
        stream: student.stream,
        email: student.email,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        parentPhone: student.parentPhone,
        address: student.address
      },
      token,
      expiresIn: '15 minutes',
      permissions: {
        canViewResources: true,
        canViewAssignments: true,
        canDownloadMaterials: true
      }
    }, {
      status: 200,
      headers: {
        'Set-Cookie': `student_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900; Secure=${process.env.NODE_ENV === 'production'}`
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// GET - Verify student token
export async function GET(request) {
  try {
    // Try to get token from cookie first
    const cookieHeader = request.headers.get('cookie');
    let token = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.student_token;
    }
    
    // Fallback to Authorization header
    if (!token) {
      token = request.headers.get('authorization')?.replace('Bearer ', '');
    }

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'No token provided' 
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token is for student
    if (decoded.role !== 'student') {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Invalid token type' 
        },
        { status: 401 }
      );
    }

    // Check if student still exists and is active
    const student = await prisma.databaseStudent.findUnique({
      where: { 
        id: decoded.studentId,
        status: 'active'
      }
    });

    if (!student) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Student not found or inactive' 
        },
        { status: 401 }
      );
    }

    // Try to check session if available
    try {
      const session = await prisma.studentSession?.findFirst?.({
        where: {
          token: token,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!session) {
        // If session table doesn't exist or session expired, just warn but don't block
        console.warn('Session not found or expired, but continuing with token validation');
      }
    } catch (sessionError) {
      console.warn('Session check failed, continuing with token validation:', sessionError);
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
        name: `${student.firstName} ${student.lastName}`,
        fullName: `${student.firstName} ${student.lastName}`,
        form: student.form,
        stream: student.stream,
        email: student.email,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        parentPhone: student.parentPhone,
        address: student.address
      },
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Session expired. Please log in again.',
          requiresReauth: true 
        },
        { status: 401 }
      );
    }

    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: 'Invalid token' 
      },
      { status: 401 }
    );
  }
}

// DELETE - Student Logout
export async function DELETE(request) {
  try {
    // Get token from cookie or Authorization header
    const cookieHeader = request.headers.get('cookie');
    let token = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.student_token;
    }
    
    if (!token) {
      token = request.headers.get('authorization')?.replace('Bearer ', '');
    }

    // If we have a token and studentSession exists, try to delete the session
    if (token && prisma.studentSession) {
      try {
        await prisma.studentSession.deleteMany({
          where: {
            token: token
          }
        });
      } catch (error) {
        console.warn('Error deleting session (might not exist in schema):', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully'
      },
      {
        headers: {
          'Set-Cookie': `student_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure=${process.env.NODE_ENV === 'production'}`
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}