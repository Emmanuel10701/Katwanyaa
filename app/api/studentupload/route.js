// app/api/studentupload/route.js
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';

// Import Prisma client
import { prisma } from "../../../libs/prisma";

// Helper function to clean and parse dates
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Convert to string and trim
  const str = String(dateStr).trim();
  
  // Reject extended year formats
  if (str.match(/^[+-]\d{6}/)) {
    console.warn(`Extended year format rejected: ${str}`);
    return null;
  }
  
  // Remove any timezone, GMT, UTC, etc.
  let cleaned = str
    .replace(/GMT[+-]\d{4}|UTC|\([^)]+\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Try to parse Excel serial number
  if (!isNaN(cleaned) && Number(cleaned) > 0) {
    // Excel date serial number (days since 1899-12-30, with 1900 incorrectly treated as leap year)
    const excelDate = Number(cleaned);
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      // Validate reasonable date range
      const year = date.getFullYear();
      if (year >= 1900 && year <= new Date().getFullYear()) {
        return date;
      }
    }
  }
  
  // Try to parse as ISO string
  let date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    // Validate reasonable date range
    if (year >= 1900 && year <= new Date().getFullYear() + 1) {
      return date;
    }
  }
  
  // Try common date formats
  const formats = [
    // YYYY-MM-DD
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
    // DD/MM/YYYY
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/,
    // MM/DD/YYYY
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/, // Same regex, we'll handle differently
  ];
  
  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      let year, month, day;
      
      if (match[0].includes('/')) {
        // For DD/MM/YYYY or MM/DD/YYYY
        const parts = cleaned.split(/[/-]/);
        if (parts.length === 3) {
          // Try to determine format
          const part1 = parseInt(parts[0]);
          const part2 = parseInt(parts[1]);
          const part3 = parseInt(parts[2]);
          
          if (part3 > 31 && part1 <= 12) {
            // Looks like MM/DD/YYYY
            month = part1 - 1;
            day = part2;
            year = part3;
          } else if (part1 > 12 && part2 <= 12) {
            // Looks like DD/MM/YYYY
            day = part1;
            month = part2 - 1;
            year = part3;
          } else if (part3 > 1900) {
            // Assume YYYY/MM/DD
            year = part3;
            month = part2 - 1;
            day = part1;
          }
        }
      } else {
        // Handle YYYY-MM-DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      }
      
      if (year && month >= 0 && day) {
        // If year is 2 digits, assume 2000+
        if (year < 100) {
          year = 2000 + year;
        }
        
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

// CSV PARSING
const parseCSV = async (file) => {
  try {
    const text = await file.text();
    
    // Try different delimiters
    const delimiters = ['\t', ',', ';'];
    
    for (const delimiter of delimiters) {
      try {
        return await new Promise((resolve, reject) => {
          parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: delimiter,
            transformHeader: (header) => {
              const normalized = header.trim().toLowerCase();
              
              // Map all fields
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
                  // Extract all fields
                  const admissionNumber = String(row.admissionNumber || '').trim();
                  const firstName = String(row.firstName || '').trim();
                  const middleName = row.middleName ? String(row.middleName).trim() : undefined;
                  const lastName = String(row.lastName || '').trim();
                  const form = String(row.form || '').trim();
                  const stream = row.stream ? String(row.stream).trim() : undefined;
                  
                  // Parse date of birth using helper
                  const dateOfBirth = parseDate(row.dateOfBirth);
                  
                  const gender = row.gender ? String(row.gender).trim() : undefined;
                  const parentPhone = row.parentPhone ? String(row.parentPhone).trim() : undefined;
                  const email = row.email ? String(row.email).trim() : undefined;
                  const address = row.address ? String(row.address).trim() : undefined;
                  
                  // Return if we have the required fields
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
                console.log(`Parsed ${data.length} students with ${delimiter === '\t' ? 'TAB' : delimiter} delimiter`);
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

// EXCEL PARSING
const parseExcel = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Excel raw data count: ${jsonData.length}`);
    
    const data = jsonData
      .map((row, index) => {
        try {
          // Helper to find field ignoring case
          const findValue = (possibleKeys) => {
            for (const key of possibleKeys) {
              if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return String(row[key]).trim();
              }
              // Try case-insensitive
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
          
          // Extract all fields
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
          
          // Parse date of birth using helper
          const dateOfBirth = parseDate(dateOfBirthRaw);
          
          // Return if we have the required fields
          if (admissionNumber && firstName && lastName && form) {
            return {
              admissionNumber,
              firstName,
              middleName: middleName || undefined,
              lastName,
              form,
              stream: stream || undefined,
              dateOfBirth,
              gender: gender || undefined,
              parentPhone: parentPhone || undefined,
              email: email || undefined,
              address: address || undefined
            };
          }
          return null;
        } catch (error) {
          console.error(`Error parsing Excel row ${index}:`, error);
          return null;
        }
      })
      .filter(item => item !== null);
    
    console.log(`Excel parsed ${data.length} valid students`);
    return data;
    
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

// VALIDATION
const validateStudent = (student, index) => {
  const errors = [];
  
  // Validate admission number (4-10 digits)
  if (!student.admissionNumber) {
    errors.push(`Row ${index + 2}: Admission number is required`);
  } else if (!/^\d{4,10}$/.test(student.admissionNumber)) {
    errors.push(`Row ${index + 2}: Admission number must be 4-10 digits (got: ${student.admissionNumber})`);
  }
  
  // Validate first name
  if (!student.firstName) {
    errors.push(`Row ${index + 2}: First name is required`);
  } else if (student.firstName.length > 100) {
    errors.push(`Row ${index + 2}: First name too long (max 100 chars)`);
  }
  
  // Validate last name
  if (!student.lastName) {
    errors.push(`Row ${index + 2}: Last name is required`);
  } else if (student.lastName.length > 100) {
    errors.push(`Row ${index + 2}: Last name too long (max 100 chars)`);
  }
  
  // Validate and normalize form
  const formValue = student.form.trim();
  const formMap = {
    'form1': 'Form 1',
    'form 1': 'Form 1',
    'form2': 'Form 2',
    'form 2': 'Form 2',
    'form3': 'Form 3',
    'form 3': 'Form 3',
    'form4': 'Form 4',
    'form 4': 'Form 4'
  };
  
  const normalizedForm = formMap[formValue.toLowerCase()] || formValue;
  
  const validForms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  if (!validForms.includes(normalizedForm)) {
    errors.push(`Row ${index + 2}: Form must be one of: ${validForms.join(', ')} (got: ${formValue})`);
  }
  
  // Update student with normalized form
  student.form = normalizedForm;
  
  // Validate date of birth
  if (student.dateOfBirth) {
    const dob = new Date(student.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push(`Row ${index + 2}: Invalid date of birth format`);
    } else {
      const year = dob.getFullYear();
      const currentYear = new Date().getFullYear();
      
      // Check if date is in the future
      if (dob > new Date()) {
        errors.push(`Row ${index + 2}: Date of birth cannot be in the future`);
      }
      
      // Check if year is reasonable
      if (year < 1900) {
        errors.push(`Row ${index + 2}: Date of birth year must be after 1900`);
      }
      
      // Check if student is too young (under 4 years old) for school
      const age = currentYear - year;
      if (age < 4) {
        errors.push(`Row ${index + 2}: Student appears to be too young (${age} years old)`);
      }
      
      // Check if student is unreasonably old
      if (age > 30) {
        errors.push(`Row ${index + 2}: Student appears to be too old (${age} years old)`);
      }
    }
  }
  
  // Validate optional fields
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

// POST - Bulk upload
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

    // Create upload batch
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
      // Parse file based on type
      let rawData = [];
      
      console.log(`Parsing ${fileExtension.toUpperCase()} file: ${file.name}`);
      
      if (fileExtension === 'csv') {
        rawData = await parseCSV(file);
      } else {
        rawData = await parseExcel(file);
      }

      console.log(`Total rows parsed: ${rawData.length}`);
      
      if (rawData.length === 0) {
        throw new Error(`No valid student data found. Please ensure your file contains:
        1. Required columns: AdmissionNumber, FirstName, LastName, Form
        2. Optional columns: MiddleName, Stream, DateOfBirth, Gender, ParentPhone, Email, Address
        3. Form must be: Form 1, Form 2, Form 3, or Form 4
        4. Admission numbers must be 4-10 digits and unique`);
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
        // Validate student
        const validation = validateStudent(student, index);
        
        if (!validation.isValid) {
          stats.errorRows++;
          stats.errors.push(...validation.errors);
          continue;
        }

        const admissionNumber = student.admissionNumber;
        
        // Check duplicates in current file
        if (seenAdmissionNumbers.has(admissionNumber)) {
          stats.skippedRows++;
          stats.errors.push(`Row ${index + 2}: Duplicate admission number in file: ${admissionNumber}`);
          continue;
        }
        seenAdmissionNumbers.add(admissionNumber);

        // Check duplicates in database
        if (existingAdmissionNumbers.has(admissionNumber)) {
          stats.skippedRows++;
          stats.errors.push(`Row ${index + 2}: Admission number already exists: ${admissionNumber}`);
          continue;
        }

        // Add to create list - ensure dateOfBirth is properly formatted
        studentsToCreate.push({
          admissionNumber,
          firstName: student.firstName,
          middleName: student.middleName || null,
          lastName: student.lastName,
          form: student.form,
          stream: student.stream || null,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null, // Ensure it's a Date object
          gender: student.gender || null,
          parentPhone: student.parentPhone || null,
          email: student.email || null,
          address: student.address || null,
          uploadBatchId: batchId,
          status: 'active'
        });

        stats.validRows++;
      }

      // Bulk insert if we have valid students
      if (studentsToCreate.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Insert students
          await tx.databaseStudent.createMany({
            data: studentsToCreate,
            skipDuplicates: true
          });

          // Update stats
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

      // Update batch status
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

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${stats.validRows} students`,
        batch: {
          id: batchId,
          fileName: uploadBatch.fileName,
          status: 'completed'
        },
        stats,
        errors: stats.errors.slice(0, 20)
      });

    } catch (error) {
      console.error('Processing error:', error);
      
      // Log problematic data for debugging
      if (error.message.includes('Invalid date') || error.message.includes('DateTime')) {
        console.error('Date parsing issue. Sample data:', rawData?.slice(0, 3));
      }
      
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

// GET - Fetch upload history or students
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const form = url.searchParams.get('form');
    const stream = url.searchParams.get('stream');
    const gender = url.searchParams.get('gender');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

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
      const [totalStudents, formStats, uploadStats] = await Promise.all([
        prisma.databaseStudent.count(),
        prisma.databaseStudent.groupBy({
          by: ['form'],
          _count: { id: true }
        }),
        prisma.studentStats.findUnique({
          where: { id: 'global_stats' }
        })
      ]);

      const stats = uploadStats || {
        id: 'global_stats',
        totalStudents: 0,
        form1: 0,
        form2: 0,
        form3: 0,
        form4: 0
      };

      const formStatsObj = formStats.reduce((acc, stat) => ({
        ...acc,
        [stat.form]: stat._count.id
      }), {});

      return NextResponse.json({
        success: true,
        stats: {
          ...stats,
          totalStudents: stats.totalStudents,
          form1: stats.form1 || 0,
          form2: stats.form2 || 0,
          form3: stats.form3 || 0,
          form4: stats.form4 || 0
        },
        totalStudents,
        formStats: formStatsObj
      });
    }

    // Get students with filters
    const where = {};
    
    if (form) {
      where.form = form;
    }
    
    if (stream) {
      where.stream = stream;
    }
    
    if (gender) {
      where.gender = gender;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
  where.OR = [
    { admissionNumber: { contains: search } },
    { firstName: { contains: search } },
    { middleName: { contains: search } },
    { lastName: { contains: search } },
    { email: { contains: search } },
    { parentPhone: { contains: search } }
  ];
}

    // Build orderBy
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

    return NextResponse.json({
      success: true,
      students,
      pagination: { 
        page, 
        limit, 
        total, 
        pages: Math.ceil(total / limit) 
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch data'
      },
      { status: 500 }
    );
  }
}

// PUT - Update student
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

    // Parse dateOfBirth if provided
    if (updateData.dateOfBirth) {
      try {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        if (isNaN(updateData.dateOfBirth.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid date format' },
            { status: 400 }
          );
        }
      } catch (dateError) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
    }

    // Check if admission number is being updated and if it's unique
    if (updateData.admissionNumber) {
      const existingStudent = await prisma.databaseStudent.findFirst({
        where: {
          admissionNumber: updateData.admissionNumber,
          NOT: { id: id }
        }
      });

      if (existingStudent) {
        return NextResponse.json(
          { success: false, error: 'Admission number already exists' },
          { status: 400 }
        );
      }
    }

    const updatedStudent = await prisma.databaseStudent.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Update stats if form changed
    if (updateData.form) {
      const student = await prisma.databaseStudent.findUnique({
        where: { id },
        select: { form: true }
      });

      if (student && student.form !== updateData.form) {
        await prisma.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            ...(student.form === 'Form 1' && { form1: { decrement: 1 } }),
            ...(student.form === 'Form 2' && { form2: { decrement: 1 } }),
            ...(student.form === 'Form 3' && { form3: { decrement: 1 } }),
            ...(student.form === 'Form 4' && { form4: { decrement: 1 } }),
            ...(updateData.form === 'Form 1' && { form1: { increment: 1 } }),
            ...(updateData.form === 'Form 2' && { form2: { increment: 1 } }),
            ...(updateData.form === 'Form 3' && { form3: { increment: 1 } }),
            ...(updateData.form === 'Form 4' && { form4: { increment: 1 } })
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
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

// DELETE - Batch or student
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const batchId = url.searchParams.get('batchId');
    const studentId = url.searchParams.get('studentId');

    if (batchId) {
      const batch = await prisma.studentBulkUpload.findUnique({
        where: { id: batchId }
      });

      if (!batch) {
        return NextResponse.json(
          { success: false, error: 'Batch not found' },
          { status: 404 }
        );
      }

      const batchStudentsCount = await prisma.databaseStudent.count({
        where: { uploadBatchId: batchId }
      });

      await prisma.studentBulkUpload.delete({
        where: { id: batchId }
      });

      await prisma.studentStats.update({
        where: { id: 'global_stats' },
        data: {
          totalStudents: { decrement: batchStudentsCount }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Deleted batch ${batch.fileName} and ${batchStudentsCount} students`
      });
    }

    if (studentId) {
      const student = await prisma.databaseStudent.findUnique({
        where: { id: studentId }
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }

      await prisma.databaseStudent.delete({
        where: { id: studentId }
      });

      await prisma.studentStats.update({
        where: { id: 'global_stats' },
        data: {
          totalStudents: { decrement: 1 },
          ...(student.form === 'Form 1' && { form1: { decrement: 1 } }),
          ...(student.form === 'Form 2' && { form2: { decrement: 1 } }),
          ...(student.form === 'Form 3' && { form3: { decrement: 1 } }),
          ...(student.form === 'Form 4' && { form4: { decrement: 1 } })
        }
      });

      return NextResponse.json({
        success: true,
        message: `Deleted student ${student.firstName} ${student.lastName}`
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