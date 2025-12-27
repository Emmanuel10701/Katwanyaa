import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import { prisma } from "@/libs/prisma";

// ========== HELPER FUNCTIONS ==========

// Helper to parse dates consistently
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const str = String(dateStr).trim();
  
  // Reject extended year formats
  if (str.match(/^[+-]\d{6}/)) return null;
  
  // Clean the string
  let cleaned = str
    .replace(/GMT[+-]\d{4}|UTC|\([^)]+\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Try Excel serial number
  if (!isNaN(cleaned) && Number(cleaned) > 0) {
    const excelDate = Number(cleaned);
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      if (year >= 1900 && year <= new Date().getFullYear()) {
        return date;
      }
    }
  }
  
  // Try ISO string
  let date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    if (year >= 1900 && year <= new Date().getFullYear() + 1) {
      return date;
    }
  }
  
  // Try common formats
  const formats = [
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/,
  ];
  
  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      let year, month, day;
      
      if (match[0].includes('/')) {
        const parts = cleaned.split(/[/-]/);
        if (parts.length === 3) {
          const part1 = parseInt(parts[0]);
          const part2 = parseInt(parts[1]);
          const part3 = parseInt(parts[2]);
          
          if (part3 > 31 && part1 <= 12) {
            // MM/DD/YYYY
            month = part1 - 1;
            day = part2;
            year = part3;
          } else if (part1 > 12 && part2 <= 12) {
            // DD/MM/YYYY
            day = part1;
            month = part2 - 1;
            year = part3;
          } else if (part3 > 1900) {
            // YYYY/MM/DD
            year = part3;
            month = part2 - 1;
            day = part1;
          }
        }
      } else {
        // YYYY-MM-DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      }
      
      if (year && month >= 0 && day) {
        if (year < 100) year = 2000 + year;
        date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          const finalYear = date.getFullYear();
          if (finalYear >= 1900 && finalYear <= new Date().getFullYear() + 1) {
            return date;
          }
        }
      }
    }
  }
  
  return null;
};

// Build WHERE clause from query parameters
const buildWhereClause = (params) => {
  const { form, stream, gender, status, search } = params;
  const where = {};
  
  if (form && form !== 'all') where.form = form;
  if (stream && stream !== 'all') where.stream = stream;
  if (gender && gender !== 'all') where.gender = gender;
  if (status && status !== 'all') where.status = status;
  
  if (search && search.trim()) {
    // Remove 'mode: 'insensitive'' - not supported in Prisma 6.3.0
    // Convert search to lowercase for case-insensitive search
    const searchTerm = search.toLowerCase();
    
    where.OR = [
      { admissionNumber: { contains: searchTerm } },
      { firstName: { contains: searchTerm } },
      { middleName: { contains: searchTerm } },
      { lastName: { contains: searchTerm } },
      { email: { contains: searchTerm } },
      { parentPhone: { contains: searchTerm } }
    ];
  }
  
  return where;
};

// Calculate statistics from WHERE clause
const calculateStatistics = async (whereClause = {}) => {
  try {
    // Get form distribution
    const formStats = await prisma.databaseStudent.groupBy({
      by: ['form'],
      where: whereClause,
      _count: { id: true }
    });

    // Get total count
    const totalStudents = await prisma.databaseStudent.count({
      where: whereClause
    });

    // Convert to structured format
    const formStatsObj = formStats.reduce((acc, stat) => ({
      ...acc,
      [stat.form]: stat._count.id
    }), {});

    const stats = {
      totalStudents,
      form1: formStatsObj['Form 1'] || 0,
      form2: formStatsObj['Form 2'] || 0,
      form3: formStatsObj['Form 3'] || 0,
      form4: formStatsObj['Form 4'] || 0,
      updatedAt: new Date()
    };

    // Validate consistency
    const formSum = stats.form1 + stats.form2 + stats.form3 + stats.form4;
    const isValid = formSum === totalStudents;

    return {
      stats,
      validation: {
        isValid,
        totalStudents,
        sumOfForms: formSum,
        difference: totalStudents - formSum,
        hasDiscrepancy: !isValid
      }
    };
  } catch (error) {
    console.error('Error calculating statistics:', error);
    throw error;
  }
};

// Update cached statistics (for performance)
const updateCachedStats = async (stats) => {
  try {
    await prisma.studentStats.upsert({
      where: { id: 'global_stats' },
      update: {
        totalStudents: stats.totalStudents,
        form1: stats.form1,
        form2: stats.form2,
        form3: stats.form3,
        form4: stats.form4,
        updatedAt: new Date()
      },
      create: {
        id: 'global_stats',
        ...stats
      }
    });
  } catch (error) {
    console.error('Error updating cached stats:', error);
  }
};

// ========== CSV PARSING ==========

const parseCSV = async (file) => {
  try {
    const text = await file.text();
    const delimiters = ['\t', ',', ';'];
    
    for (const delimiter of delimiters) {
      try {
        return await new Promise((resolve, reject) => {
          parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter,
            transformHeader: (header) => {
              const normalized = header.trim().toLowerCase();
              
              if (normalized.includes('admission')) return 'admissionNumber';
              if (normalized.includes('first')) return 'firstName';
              if (normalized.includes('middle')) return 'middleName';
              if (normalized.includes('last')) return 'lastName';
              if (normalized.includes('form') || normalized.includes('class') || normalized.includes('grade')) {
                return 'form';
              }
              if (normalized.includes('stream')) return 'stream';
              if (normalized.includes('date') && normalized.includes('birth')) return 'dateOfBirth';
              if (normalized.includes('gender')) return 'gender';
              if (normalized.includes('parent') && normalized.includes('phone')) return 'parentPhone';
              if (normalized.includes('email')) return 'email';
              if (normalized.includes('address')) return 'address';
              
              return normalized;
            },
            complete: (results) => {
              const data = results.data
                .map((row, index) => {
                  const admissionNumber = String(row.admissionNumber || '').trim();
                  const firstName = String(row.firstName || '').trim();
                  const middleName = row.middleName ? String(row.middleName).trim() : null;
                  const lastName = String(row.lastName || '').trim();
                  const form = String(row.form || '').trim();
                  const stream = row.stream ? String(row.stream).trim() : null;
                  const dateOfBirth = parseDate(row.dateOfBirth);
                  const gender = row.gender ? String(row.gender).trim() : null;
                  const parentPhone = row.parentPhone ? String(row.parentPhone).trim() : null;
                  const email = row.email ? String(row.email).trim() : null;
                  const address = row.address ? String(row.address).trim() : null;
                  
                  if (admissionNumber && firstName && lastName && form) {
                    return { 
                      admissionNumber, 
                      firstName, 
                      middleName, 
                      lastName, 
                      form,
                      stream,
                      dateOfBirth,
                      gender,
                      parentPhone,
                      email,
                      address
                    };
                  }
                  return null;
                })
                .filter(item => item !== null);
              
              if (data.length > 0) {
                resolve(data);
              } else {
                reject(new Error(`No valid data found with delimiter ${delimiter}`));
              }
            },
            error: reject
          });
        });
      } catch (delimiterError) {
        continue;
      }
    }
    
    throw new Error('Could not parse CSV. Please check that your file contains required columns.');
    
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
};

// ========== EXCEL PARSING ==========

const parseExcel = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const data = jsonData
      .map((row, index) => {
        try {
          const findValue = (possibleKeys) => {
            for (const key of possibleKeys) {
              if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return String(row[key]).trim();
              }
              const lowerKey = key.toLowerCase();
              for (const rowKey in row) {
                if (rowKey.toLowerCase() === lowerKey) {
                  const value = row[rowKey];
                  if (value !== undefined && value !== null && value !== '') {
                    return String(value).trim();
                  }
                }
              }
            }
            return '';
          };
          
          const admissionNumber = findValue(['admissionNumber', 'AdmissionNumber', 'Admission Number', 'ADMISSION_NUMBER', 'admno', 'AdmNo']);
          const firstName = findValue(['firstName', 'FirstName', 'First Name', 'FIRST_NAME', 'fname']);
          const middleName = findValue(['middleName', 'MiddleName', 'Middle Name', 'MIDDLE_NAME', 'mname']);
          const lastName = findValue(['lastName', 'LastName', 'Last Name', 'LAST_NAME', 'lname']);
          const form = findValue(['form', 'Form', 'FORM', 'class', 'Class', 'grade', 'Grade']);
          const stream = findValue(['stream', 'Stream', 'STREAM']);
          const dateOfBirthRaw = findValue(['dateOfBirth', 'DateOfBirth', 'Date of Birth', 'DOB', 'dob', 'birthdate']);
          const gender = findValue(['gender', 'Gender', 'GENDER', 'sex', 'Sex']);
          const parentPhone = findValue(['parentPhone', 'ParentPhone', 'Parent Phone', 'parentTel', 'ParentTel']);
          const email = findValue(['email', 'Email', 'EMAIL']);
          const address = findValue(['address', 'Address', 'ADDRESS']);
          
          const dateOfBirth = parseDate(dateOfBirthRaw);
          
          if (admissionNumber && firstName && lastName && form) {
            return {
              admissionNumber,
              firstName,
              middleName: middleName || null,
              lastName,
              form,
              stream: stream || null,
              dateOfBirth,
              gender: gender || null,
              parentPhone: parentPhone || null,
              email: email || null,
              address: address || null
            };
          }
          return null;
        } catch (error) {
          console.error(`Error parsing Excel row ${index}:`, error);
          return null;
        }
      })
      .filter(item => item !== null);
    
    return data;
    
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

// ========== VALIDATION ==========

const validateStudent = (student, index) => {
  const errors = [];
  
  // Admission number
  if (!student.admissionNumber) {
    errors.push(`Row ${index + 2}: Admission number is required`);
  } else if (!/^\d{4,10}$/.test(student.admissionNumber)) {
    errors.push(`Row ${index + 2}: Admission number must be 4-10 digits (got: ${student.admissionNumber})`);
  }
  
  // Names
  if (!student.firstName) {
    errors.push(`Row ${index + 2}: First name is required`);
  } else if (student.firstName.length > 100) {
    errors.push(`Row ${index + 2}: First name too long (max 100 chars)`);
  }
  
  if (!student.lastName) {
    errors.push(`Row ${index + 2}: Last name is required`);
  } else if (student.lastName.length > 100) {
    errors.push(`Row ${index + 2}: Last name too long (max 100 chars)`);
  }
  
  // Form validation and normalization
  const formValue = student.form.trim();
  const formMap = {
    'form1': 'Form 1',
    'form 1': 'Form 1',
    '1': 'Form 1',
    'form2': 'Form 2',
    'form 2': 'Form 2',
    '2': 'Form 2',
    'form3': 'Form 3',
    'form 3': 'Form 3',
    '3': 'Form 3',
    'form4': 'Form 4',
    'form 4': 'Form 4',
    '4': 'Form 4'
  };
  
  const normalizedForm = formMap[formValue.toLowerCase()] || formValue;
  const validForms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  
  if (!validForms.includes(normalizedForm)) {
    errors.push(`Row ${index + 2}: Form must be one of: ${validForms.join(', ')} (got: ${formValue})`);
  }
  
  // Update student with normalized form
  student.form = normalizedForm;
  
  // Date of birth
  if (student.dateOfBirth) {
    const dob = new Date(student.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push(`Row ${index + 2}: Invalid date of birth format`);
    } else {
      const year = dob.getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (dob > new Date()) {
        errors.push(`Row ${index + 2}: Date of birth cannot be in the future`);
      }
      
      if (year < 1900) {
        errors.push(`Row ${index + 2}: Date of birth year must be after 1900`);
      }
      
      const age = currentYear - year;
      if (age < 4) {
        errors.push(`Row ${index + 2}: Student appears to be too young (${age} years old)`);
      }
      
      if (age > 30) {
        errors.push(`Row ${index + 2}: Student appears to be too old (${age} years old)`);
      }
    }
  }
  
  // Optional fields
  if (student.middleName && student.middleName.length > 100) {
    errors.push(`Row ${index + 2}: Middle name too long (max 100 chars)`);
  }
  
  if (student.stream && student.stream.length > 50) {
    errors.push(`Row ${index + 2}: Stream too long (max 50 chars)`);
  }
  
  if (student.gender && student.gender.length > 20) {
    errors.push(`Row ${index + 2}: Gender too long (max 20 chars)`);
  }
  
  if (student.parentPhone) {
    const phoneRegex = /^[+]?[0-9\s\-()]{10,20}$/;
    if (!phoneRegex.test(student.parentPhone)) {
      errors.push(`Row ${index + 2}: Parent phone number is invalid`);
    } else if (student.parentPhone.length > 20) {
      errors.push(`Row ${index + 2}: Parent phone too long (max 20 chars)`);
    }
  }
  
  if (student.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
      errors.push(`Row ${index + 2}: Email is invalid`);
    } else if (student.email.length > 100) {
      errors.push(`Row ${index + 2}: Email too long (max 100 chars)`);
    }
  }
  
  if (student.address && student.address.length > 255) {
    errors.push(`Row ${index + 2}: Address too long (max 255 chars)`);
  }
  
  return { isValid: errors.length === 0, errors };
};

// ========== API ENDPOINTS ==========

// POST - Bulk upload with transaction
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    const validExtensions = ['csv', 'xlsx', 'xls'];
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Please upload CSV or Excel (xlsx/xls) files.' 
        },
        { status: 400 }
      );
    }

    // Create batch record
    const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const uploadBatch = await prisma.studentBulkUpload.create({
      data: {
        id: batchId,
        fileName: file.name,
        fileType: fileExtension,
        uploadedBy: 'System Upload',
        status: 'processing'
      }
    });

    try {
      // Parse file
      let rawData = [];
      
      if (fileExtension === 'csv') {
        rawData = await parseCSV(file);
      } else {
        rawData = await parseExcel(file);
      }

      if (rawData.length === 0) {
        throw new Error(`No valid student data found.`);
      }

      // Process data
      const stats = {
        totalRows: rawData.length,
        validRows: 0,
        skippedRows: 0,
        errorRows: 0,
        errors: []
      };

      const studentsToCreate = [];
      const seenAdmissionNumbers = new Set();
      
      // Get existing admission numbers
      const existingStudents = await prisma.databaseStudent.findMany({
        select: { admissionNumber: true }
      });
      const existingAdmissionNumbers = new Set(
        existingStudents.map(s => s.admissionNumber)
      );

      for (const [index, student] of rawData.entries()) {
        const validation = validateStudent(student, index);
        
        if (!validation.isValid) {
          stats.errorRows++;
          stats.errors.push(...validation.errors);
          continue;
        }

        const admissionNumber = student.admissionNumber;
        
        // Check duplicates
        if (seenAdmissionNumbers.has(admissionNumber)) {
          stats.skippedRows++;
          stats.errors.push(`Row ${index + 2}: Duplicate admission number in file: ${admissionNumber}`);
          continue;
        }
        seenAdmissionNumbers.add(admissionNumber);

        if (existingAdmissionNumbers.has(admissionNumber)) {
          stats.skippedRows++;
          stats.errors.push(`Row ${index + 2}: Admission number already exists: ${admissionNumber}`);
          continue;
        }

        // Add to create list
        studentsToCreate.push({
          admissionNumber,
          firstName: student.firstName,
          middleName: student.middleName || null,
          lastName: student.lastName,
          form: student.form,
          stream: student.stream || null,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
          gender: student.gender || null,
          parentPhone: student.parentPhone || null,
          email: student.email || null,
          address: student.address || null,
          uploadBatchId: batchId,
          status: 'active'
        });

        stats.validRows++;
      }

      // Insert with transaction
      if (studentsToCreate.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Insert students
          await tx.databaseStudent.createMany({
            data: studentsToCreate,
            skipDuplicates: true
          });

          // Calculate form counts
          const formCounts = studentsToCreate.reduce((acc, student) => {
            acc[student.form] = (acc[student.form] || 0) + 1;
            return acc;
          }, {});

          // Update global stats
          await tx.studentStats.upsert({
            where: { id: 'global_stats' },
            update: {
              totalStudents: { increment: studentsToCreate.length },
              form1: { increment: formCounts['Form 1'] || 0 },
              form2: { increment: formCounts['Form 2'] || 0 },
              form3: { increment: formCounts['Form 3'] || 0 },
              form4: { increment: formCounts['Form 4'] || 0 },
              updatedAt: new Date()
            },
            create: {
              id: 'global_stats',
              totalStudents: studentsToCreate.length,
              form1: formCounts['Form 1'] || 0,
              form2: formCounts['Form 2'] || 0,
              form3: formCounts['Form 3'] || 0,
              form4: formCounts['Form 4'] || 0
            }
          });
        });
      }

      // Update batch
      await prisma.studentBulkUpload.update({
        where: { id: batchId },
        data: {
          status: 'completed',
          processedDate: new Date(),
          totalRows: stats.totalRows,
          validRows: stats.validRows,
          skippedRows: stats.skippedRows,
          errorRows: stats.errorRows,
          errorLog: stats.errors.length > 0 ? stats.errors.slice(0, 50) : null
        }
      });

      // Recalculate to ensure consistency
      const finalStats = await calculateStatistics({});
      
      return NextResponse.json({
        success: true,
        message: `Successfully processed ${stats.validRows} students`,
        batch: {
          id: batchId,
          fileName: uploadBatch.fileName,
          status: 'completed'
        },
        stats: finalStats.stats,
        validation: finalStats.validation,
        processingStats: stats,
        errors: stats.errors.slice(0, 20)
      });

    } catch (error) {
      console.error('Processing error:', error);
      
      // Update batch as failed
      await prisma.studentBulkUpload.update({
        where: { id: batchId },
        data: {
          status: 'failed',
          processedDate: new Date(),
          errorRows: 1,
          errorLog: [error.message]
        }
      });

      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Upload failed'
      },
      { status: 500 }
    );
  }
}

// GET - Main endpoint with consistent statistics
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const form = url.searchParams.get('form') || '';
    const stream = url.searchParams.get('stream') || '';
    const gender = url.searchParams.get('gender') || '';
    const status = url.searchParams.get('status') || 'active';
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const includeStats = url.searchParams.get('includeStats') !== 'false';

    // Build filters
    const filters = { form, stream, gender, status, search };
    const where = buildWhereClause(filters);

    if (action === 'uploads') {
      const uploads = await prisma.studentBulkUpload.findMany({
        orderBy: { uploadDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fileName: true,
          fileType: true,
          status: true,
          uploadedBy: true,
          uploadDate: true,
          processedDate: true,
          totalRows: true,
          validRows: true,
          skippedRows: true,
          errorRows: true
        }
      });

      const total = await prisma.studentBulkUpload.count();
      
      return NextResponse.json({
        success: true,
        uploads,
        pagination: { 
          page, 
          limit, 
          total, 
          pages: Math.ceil(total / limit) 
        }
      });
    }

    if (action === 'stats') {
      // Calculate fresh statistics with filters
      const statsResult = await calculateStatistics(where);
      
      // Update cache for consistency
      if (Object.keys(where).length === 0) {
        await updateCachedStats(statsResult.stats);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          stats: statsResult.stats,
          filters,
          validation: statsResult.validation,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get students with pagination
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [students, total] = await Promise.all([
      prisma.databaseStudent.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          form: true,
          stream: true,
          dateOfBirth: true,
          gender: true,
          parentPhone: true,
          email: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          uploadBatchId: true,
          uploadBatch: {
            select: {
              fileName: true,
              uploadDate: true
            }
          }
        }
      }),
      prisma.databaseStudent.count({ where })
    ]);

    // Calculate statistics for this filtered set
    let statsResult = null;
    if (includeStats) {
      statsResult = await calculateStatistics(where);
      
      // If no filters, update cache
      if (Object.keys(where).length === 0) {
        await updateCachedStats(statsResult.stats);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        students,
        stats: statsResult?.stats || null,
        filters,
        validation: statsResult?.validation || null,
        pagination: { 
          page, 
          limit, 
          total, 
          pages: Math.ceil(total / limit) 
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT - Update student with transaction
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get current student
      const currentStudent = await tx.databaseStudent.findUnique({
        where: { id }
      });

      if (!currentStudent) {
        throw new Error('Student not found');
      }

      // Check admission number uniqueness
      if (updateData.admissionNumber && updateData.admissionNumber !== currentStudent.admissionNumber) {
        const existing = await tx.databaseStudent.findFirst({
          where: {
            admissionNumber: updateData.admissionNumber,
            NOT: { id: id }
          }
        });

        if (existing) {
          throw new Error('Admission number already exists');
        }
      }

      // Parse date if provided
      if (updateData.dateOfBirth) {
        try {
          updateData.dateOfBirth = new Date(updateData.dateOfBirth);
          if (isNaN(updateData.dateOfBirth.getTime())) {
            throw new Error('Invalid date format');
          }
        } catch (dateError) {
          throw new Error('Invalid date format');
        }
      }

      // Update student
      const updatedStudent = await tx.databaseStudent.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      // Update stats if form changed
      if (updateData.form && updateData.form !== currentStudent.form) {
        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            ...(currentStudent.form === 'Form 1' && { form1: { decrement: 1 } }),
            ...(currentStudent.form === 'Form 2' && { form2: { decrement: 1 } }),
            ...(currentStudent.form === 'Form 3' && { form3: { decrement: 1 } }),
            ...(currentStudent.form === 'Form 4' && { form4: { decrement: 1 } }),
            ...(updateData.form === 'Form 1' && { form1: { increment: 1 } }),
            ...(updateData.form === 'Form 2' && { form2: { increment: 1 } }),
            ...(updateData.form === 'Form 3' && { form3: { increment: 1 } }),
            ...(updateData.form === 'Form 4' && { form4: { increment: 1 } })
          }
        });
      }

      return updatedStudent;
    });

    // Recalculate to ensure consistency
    const finalStats = await calculateStatistics({});

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        student: result,
        stats: finalStats.stats,
        validation: finalStats.validation
      }
    });

  } catch (error) {
    console.error('PUT error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Update failed'
      },
      { status: 500 }
    );
  }
}

// DELETE - Student or batch with transaction
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const batchId = url.searchParams.get('batchId');
    const studentId = url.searchParams.get('studentId');

    if (batchId) {
      const result = await prisma.$transaction(async (tx) => {
        const batch = await tx.studentBulkUpload.findUnique({
          where: { id: batchId }
        });

        if (!batch) {
          throw new Error('Batch not found');
        }

        const batchStudents = await tx.databaseStudent.findMany({
          where: { uploadBatchId: batchId },
          select: { form: true }
        });

        const formCounts = batchStudents.reduce((acc, student) => {
          acc[student.form] = (acc[student.form] || 0) + 1;
          return acc;
        }, {});

        // Delete students
        await tx.databaseStudent.deleteMany({
          where: { uploadBatchId: batchId }
        });

        // Update stats
        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            totalStudents: { decrement: batchStudents.length },
            form1: { decrement: formCounts['Form 1'] || 0 },
            form2: { decrement: formCounts['Form 2'] || 0 },
            form3: { decrement: formCounts['Form 3'] || 0 },
            form4: { decrement: formCounts['Form 4'] || 0 }
          }
        });

        // Delete batch
        await tx.studentBulkUpload.delete({
          where: { id: batchId }
        });

        return { batch, deletedCount: batchStudents.length };
      });

      // Recalculate to ensure consistency
      const finalStats = await calculateStatistics({});

      return NextResponse.json({
        success: true,
        message: `Deleted batch ${result.batch.fileName} and ${result.deletedCount} students`,
        data: {
          stats: finalStats.stats,
          validation: finalStats.validation
        }
      });
    }

    if (studentId) {
      const result = await prisma.$transaction(async (tx) => {
        const student = await tx.databaseStudent.findUnique({
          where: { id: studentId }
        });

        if (!student) {
          throw new Error('Student not found');
        }

        await tx.databaseStudent.delete({
          where: { id: studentId }
        });

        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            totalStudents: { decrement: 1 },
            ...(student.form === 'Form 1' && { form1: { decrement: 1 } }),
            ...(student.form === 'Form 2' && { form2: { decrement: 1 } }),
            ...(student.form === 'Form 3' && { form3: { decrement: 1 } }),
            ...(student.form === 'Form 4' && { form4: { decrement: 1 } })
          }
        });

        return student;
      });

      // Recalculate to ensure consistency
      const finalStats = await calculateStatistics({});

      return NextResponse.json({
        success: true,
        message: `Deleted student ${result.firstName} ${result.lastName}`,
        data: {
          stats: finalStats.stats,
          validation: finalStats.validation
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide batchId or studentId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}