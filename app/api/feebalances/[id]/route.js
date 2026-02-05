import { NextResponse } from 'next/server';
import { prisma } from '../../../../libs/prisma'; // ✅ named import

// ==================== AUTHENTICATION UTILITIES ====================

// Device Token Manager
class DeviceTokenManager {
  static validateTokensFromHeaders(headers, options = {}) {
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
        
        // Check user role - only admins/staff can manage fees
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'STAFF', 'HR_MANAGER', 'TEACHER', 'ACCOUNTANT'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage fee balances' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Fee management authentication successful for user:', adminPayload.name || 'Unknown');
      
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

// Authentication middleware for protected requests
const authenticateRequest = (req) => {
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
          message: "Authentication required to manage fee balances.",
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

// Helper function to calculate balance and payment status
const calculateFeeStats = (amount, amountPaid) => {
  const balance = amount - (amountPaid || 0);
  const paymentStatus = balance <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending';
  return { balance, paymentStatus };
};

// Helper function to sort fee balances
const sortFeeBalances = (feeBalances) => {
  return feeBalances.sort((a, b) => {
    // First sort by academic year
    if (a.academicYear > b.academicYear) return -1;
    if (a.academicYear < b.academicYear) return 1;
    
    // Then sort by term (Term 1, Term 2, Term 3)
    const termOrder = { 'Term 1': 1, 'Term 2': 2, 'Term 3': 3 };
    const termA = termOrder[a.term] || 99;
    const termB = termOrder[b.term] || 99;
    
    return termA - termB;
  });
};

// GET fee balances by admission number (PUBLIC - no authentication required)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Assuming 'id' in params is actually the admissionNumber
    const admissionNumber = id;

    // Get all fee balances for this admission number
    const feeBalances = await prisma.feeBalance.findMany({
      where: { admissionNumber },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            form: true,
            stream: true,
            admissionNumber: true,
            parentPhone: true,
            email: true
          }
        },
        uploadBatch: {
          select: {
            fileName: true,
            uploadDate: true,
            status: true
          }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { term: 'asc' } // Simple string ordering - will sort alphabetically
      ]
    });

    // Apply custom ordering for terms (Term 1, Term 2, Term 3)
    const orderedFeeBalances = sortFeeBalances(feeBalances);

    if (!orderedFeeBalances || orderedFeeBalances.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fee balance records found for this admission number' },
        { status: 404 }
      );
    }

    // Calculate summary
    const summary = orderedFeeBalances.reduce((acc, fee) => {
      acc.totalAmount += fee.amount;
      acc.totalPaid += fee.amountPaid;
      acc.totalBalance += fee.balance;
      return acc;
    }, { totalAmount: 0, totalPaid: 0, totalBalance: 0 });

    return NextResponse.json({
      success: true,
      data: {
        feeBalances: orderedFeeBalances,
        summary
      }
    });
  } catch (error) {
    console.error('GET fee balances by admission number error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch fee balance records' },
      { status: 500 }
    );
  }
}

// POST create new fee balance for admission number (PROTECTED - authentication required)
export async function POST(request, { params }) {
  try {
    // Step 1: Authenticate the POST request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`📝 Create fee balance request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    const admissionNumber = id;
    const data = await request.json();

    // Validate required fields
    if (!data.term || !data.academicYear || !data.amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Term, academic year, and amount are required',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    if (data.amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount must be greater than 0',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    // Check if the student exists
    const studentExists = await prisma.databaseStudent.findUnique({
      where: { admissionNumber }
    });

    if (!studentExists) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student with this admission number does not exist',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    // Validate amountPaid doesn't exceed amount
    const amountPaid = data.amountPaid || 0;
    if (amountPaid > data.amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount paid cannot exceed total amount',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    // Calculate balance and payment status
    const { balance, paymentStatus } = calculateFeeStats(data.amount, amountPaid);

    // Check for duplicate fee entry (same student, term, academic year)
    const existingFee = await prisma.feeBalance.findFirst({
      where: {
        admissionNumber,
        term: data.term,
        academicYear: data.academicYear
      }
    });

    if (existingFee) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee entry already exists for this student, term, and academic year',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    const newFeeBalance = await prisma.feeBalance.create({
      data: {
        admissionNumber,
        term: data.term,
        academicYear: data.academicYear,
        amount: data.amount,
        amountPaid: amountPaid,
        balance: balance,
        paymentStatus: paymentStatus,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        student: {
          connect: { admissionNumber }
        },
        uploadBatchId: data.uploadBatchId || null
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            form: true
          }
        }
      }
    });

    console.log(`✅ Fee balance created by ${auth.user.name}: Student ${admissionNumber} - ${data.term} ${data.academicYear}`);

    return NextResponse.json({
      success: true,
      message: 'Fee balance created successfully',
      feeBalance: newFeeBalance,
      authenticated: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Create fee balance error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee entry already exists for this student, term, and academic year',
          authenticated: true 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create fee balance',
        authenticated: true 
      },
      { status: 500 }
    );
  }
}

// PUT update fee balance (PROTECTED - authentication required)
export async function PUT(request, { params }) {
  try {
    // Step 1: Authenticate the PUT request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`📝 Update fee balance request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    const data = await request.json();
    
    // Get feeBalanceId from request body or query params
    const feeBalanceId = data.feeBalanceId;
    
    if (!feeBalanceId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee balance ID is required',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (data.amount !== undefined && data.amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount must be greater than 0',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    // Get current fee balance
    const currentFee = await prisma.feeBalance.findUnique({
      where: { id: feeBalanceId }
    });

    if (!currentFee) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee balance record not found',
          authenticated: true 
        },
        { status: 404 }
      );
    }

    // Validate amountPaid doesn't exceed amount
    const amount = data.amount !== undefined ? data.amount : currentFee.amount;
    const amountPaid = data.amountPaid !== undefined ? data.amountPaid : currentFee.amountPaid;
    
    if (amountPaid > amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount paid cannot exceed total amount',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    // Calculate balance and payment status
    const { balance, paymentStatus } = calculateFeeStats(amount, amountPaid);

    // Check for duplicate if updating admissionNumber, term, or academicYear
    if (data.admissionNumber || data.term || data.academicYear) {
      const admissionNumber = data.admissionNumber || currentFee.admissionNumber;
      const term = data.term || currentFee.term;
      const academicYear = data.academicYear || currentFee.academicYear;

      const existingFee = await prisma.feeBalance.findFirst({
        where: {
          admissionNumber,
          term,
          academicYear,
          NOT: { id: feeBalanceId }
        }
      });

      if (existingFee) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Fee entry already exists for this student, term, and academic year',
            authenticated: true 
          },
          { status: 400 }
        );
      }
    }

    const updatedFeeBalance = await prisma.feeBalance.update({
      where: { id: feeBalanceId },
      data: {
        ...data,
        amount,
        amountPaid,
        balance,
        paymentStatus,
        updatedAt: new Date(),
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            form: true
          }
        }
      }
    });

    console.log(`✅ Fee balance updated by ${auth.user.name}: Student ${updatedFeeBalance.admissionNumber} - ${updatedFeeBalance.term} ${updatedFeeBalance.academicYear}`);

    return NextResponse.json({
      success: true,
      message: 'Fee balance updated successfully',
      feeBalance: updatedFeeBalance,
      authenticated: true,
    });
  } catch (error) {
    console.error('Update fee balance error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee balance record not found',
          authenticated: true 
        },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee entry already exists for this student, term, and academic year',
          authenticated: true 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update fee balance',
        authenticated: true 
      },
      { status: 500 }
    );
  }
}

// DELETE fee balance (PROTECTED - authentication required)
export async function DELETE(request, { params }) {
  try {
    // Step 1: Authenticate the DELETE request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`🗑️ Delete fee balance request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    
    const url = new URL(request.url);
    const feeBalanceId = url.searchParams.get('feeBalanceId');

    if (feeBalanceId) {
      // Delete specific fee balance by its ID
      const feeBalance = await prisma.feeBalance.findUnique({
        where: { id: feeBalanceId }
      });

      if (!feeBalance) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Fee balance record not found',
            authenticated: true 
          },
          { status: 404 }
        );
      }

      const deletedFeeBalance = await prisma.feeBalance.delete({
        where: { id: feeBalanceId }
      });

      console.log(`✅ Fee balance deleted by ${auth.user.name}: Student ${deletedFeeBalance.admissionNumber} - ${deletedFeeBalance.term} ${deletedFeeBalance.academicYear}`);

      return NextResponse.json({
        success: true,
        message: 'Fee balance deleted successfully',
        feeBalance: deletedFeeBalance,
        authenticated: true,
      });
    } else {
      // Delete all fee balances for this admission number
      const feeBalances = await prisma.feeBalance.findMany({
        where: { admissionNumber: id },
        select: {
          id: true,
          admissionNumber: true,
          term: true,
          academicYear: true
        }
      });

      const deletedCount = await prisma.feeBalance.deleteMany({
        where: { admissionNumber: id }
      });

      console.log(`✅ Mass fee deletion by ${auth.user.name}: ${deletedCount.count} fee balances for admission number ${id}`);

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount.count} fee balance records for admission number ${id}`,
        count: deletedCount.count,
        authenticated: true,
      });
    }
  } catch (error) {
    console.error('Delete fee balance(s) error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fee balance record not found',
          authenticated: true 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete fee balance(s)',
        authenticated: true 
      },
      { status: 500 }
    );
  }
}