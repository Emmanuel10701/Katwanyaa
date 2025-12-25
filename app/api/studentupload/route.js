// app/api/studentupload/route.js
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';

// Import Prisma client - adjust path as needed
import { prisma } from '@/libs/prisma';

// CSV PARSING - Only accept the 5 required fields
const parseCSV = async (file) => {
  try {
    const text = await file.text();
    
    // Try different delimiters (tab, comma, semicolon)
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
              
              // ONLY map the 5 required fields
              if (normalized.includes('admission')) return 'admissionNumber';
              if (normalized.includes('first')) return 'firstName';
              if (normalized.includes('middle')) return 'middleName';
              if (normalized.includes('last')) return 'lastName';
              if (normalized.includes('form') || normalized.includes('class') || normalized.includes('grade')) {
                return 'form';
              }
              return normalized;
            },
            complete: (results) => {
              // Filter and map ONLY the 5 required fields
              const data = results.data
                .map((row, index) => {
                  // Extract ONLY the 5 required fields
                  const admissionNumber = String(row.admissionNumber || '').trim();
                  const firstName = String(row.firstName || '').trim();
                  const middleName = row.middleName ? String(row.middleName).trim() : undefined;
                  const lastName = String(row.lastName || '').trim();
                  const form = String(row.form || '').trim();
                  
                  // Return ONLY if we have the required fields
                  if (admissionNumber && firstName && lastName && form) {
                    return { admissionNumber, firstName, middleName, lastName, form };
                  }
                  return null;
                })
                .filter(item => item !== null); // Remove null items
              
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
        // Try next delimiter
        continue;
      }
    }
    
    throw new Error('Could not parse CSV. Please check that your file contains: AdmissionNumber, FirstName, LastName, and Form columns.');
    
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
};

// EXCEL PARSING - Only accept the 5 required fields
const parseExcel = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Excel raw data count: ${jsonData.length}`);
    
    // Process ONLY the 5 required fields
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
          
          // Extract ONLY the 5 required fields
          const admissionNumber = findValue(['admissionNumber', 'AdmissionNumber', 'Admission Number', 'ADMISSION_NUMBER', 'admno', 'AdmNo']);
          const firstName = findValue(['firstName', 'FirstName', 'First Name', 'FIRST_NAME', 'fname']);
          const middleName = findValue(['middleName', 'MiddleName', 'Middle Name', 'MIDDLE_NAME', 'mname']);
          const lastName = findValue(['lastName', 'LastName', 'Last Name', 'LAST_NAME', 'lname']);
          const form = findValue(['form', 'Form', 'FORM', 'class', 'Class', 'grade', 'Grade']);
          
          // Return ONLY if we have the required fields
          if (admissionNumber && firstName && lastName && form) {
            return {
              admissionNumber,
              firstName,
              middleName: middleName || undefined,
              lastName,
              form
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

// VALIDATION - Only validate the 5 required fields
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
  
  // Validate middle name if present
  if (student.middleName && student.middleName.length > 100) {
    errors.push(`Row ${index + 2}: Middle name too long (max 100 chars)`);
  }
  
  return { isValid: errors.length === 0, errors };
};

// POST - Bulk upload (ONLY 5 fields)
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
    
    // Only allow CSV and Excel
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
        2. MiddleName is optional
        3. Form must be: Form 1, Form 2, Form 3, or Form 4
        4. Admission numbers must be 4-10 digits`);
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

        // Add to create list - ONLY the 5 required fields
        studentsToCreate.push({
          admissionNumber,
          firstName: student.firstName,
          middleName: student.middleName || null, // Optional
          lastName: student.lastName,
          form: student.form, // Already normalized
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
        stats,
        totalStudents,
        formStats: formStatsObj
      });
    }

    // Get students with optional form filter
    const where = {};
    if (form) {
      where.form = form;
    }
    
    const [students, total] = await Promise.all([
      prisma.databaseStudent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          form: true,
          status: true,
          createdAt: true,
          uploadBatchId: true
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