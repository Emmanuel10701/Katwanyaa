export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from "../../../libs/prisma";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json'; // json | array | csv
    const form = url.searchParams.get('form');
    const stream = url.searchParams.get('stream');

    // Build where clause
    const where = {
      email: {
        not: null,
        not: ''
      }
    };

    if (form && form !== 'all') where.form = form;
    if (stream && stream !== 'all') where.stream = stream;

    const students = await prisma.databaseStudent.findMany({
      where,
      select: {
        admissionNumber: true,
        firstName: true,
        lastName: true,
        form: true,
        stream: true,
        email: true
      },
      orderBy: [
        { form: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // ARRAY FORMAT (emails only)
    if (format === 'array') {
      const emails = students
        .map(s => s.email)
        .filter(Boolean);

      return NextResponse.json({
        success: true,
        count: emails.length,
        emails
      });
    }

    // CSV FORMAT
    if (format === 'csv') {
      let csvContent =
        'Admission Number,First Name,Last Name,Form,Stream,Email\n';

      students.forEach(s => {
        csvContent += [
          s.admissionNumber ?? '',
          `"${s.firstName ?? ''}"`,
          `"${s.lastName ?? ''}"`,
          s.form ?? '',
          s.stream ?? '',
          `"${s.email}"`
        ].join(',') + '\n';
      });

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="student-emails-${new Date()
            .toISOString()
            .split('T')[0]}.csv"`
        }
      });
    }

    // DEFAULT JSON
    return NextResponse.json({
      success: true,
      count: students.length,
      data: students,
      filters: { form, stream },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch emails',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
