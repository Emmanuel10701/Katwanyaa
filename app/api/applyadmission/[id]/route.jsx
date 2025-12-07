// admission/[id]/route.js

import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";

// ====================================================================
// GET HANDLER (Retrieve Single Application by ID)
// ====================================================================

/**
 * GET /api/admission/[id]
 * Retrieves a single application by its unique ID.
 */
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const application = await prisma.admissionApplication.findUnique({
      where: { id: parseInt(id) }, // Assuming 'id' is an integer in your Prisma schema
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // Helper function (you should move this to a shared util file or redefine it here)
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

    // Format the single application response
    const formattedApplication = {
      ...application,
      dateOfBirth: application.dateOfBirth.toISOString().split('T')[0],
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      fullName: `${application.firstName} ${application.middleName ? application.middleName + ' ' : ''}${application.lastName}`,
      age: calculateAge(application.dateOfBirth),
      streamLabel: application.preferredStream === 'SCIENCE' ? 'Science' :
        application.preferredStream === 'ARTS' ? 'Arts' :
        application.preferredStream === 'BUSINESS' ? 'Business' :
        application.preferredStream === 'TECHNICAL' ? 'Technical' : application.preferredStream,
      statusLabel: application.status === 'PENDING' ? 'Pending' :
        application.status === 'REVIEWED' ? 'Reviewed' :
        application.status === 'ACCEPTED' ? 'Accepted' :
        application.status === 'REJECTED' ? 'Rejected' :
        application.status === 'INTERVIEW_SCHEDULED' ? 'Interview Scheduled' : application.status,
    };

    return NextResponse.json({ success: true, application: formattedApplication });

  } catch (error) {
    console.error(`❌ Error fetching application with ID ${id}:`, error);
    // Handle case where id is not a valid number (e.g., if you used findUnique on an int field)
    return NextResponse.json(
      { success: false, error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------------
// PUT HANDLER (Update Single Application by ID)
// --------------------------------------------------------------------

/**
 * PUT /api/admission/[id]
 * Updates an existing application by its unique ID.
 */
export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const data = await req.json();

    const application = await prisma.admissionApplication.update({
      where: { id: parseInt(id) },
      data: {
        // You would only pass the fields that are allowed to be updated
        // For example, if you are updating the status:
        status: data.status,
        kcpeMarks: data.kcpeMarks ? parseInt(data.kcpeMarks) : undefined,
        // You can include other fields here
        ...data, // NOTE: Use with caution, only allow whitelisted fields for security
      },
    });

    return NextResponse.json({
      success: true,
      message: `Application ${application.applicationNumber} updated successfully.`,
      data: application,
    });
  } catch (error) {
    console.error(`❌ Error updating application with ID ${id}:`, error);

    if (error.code === 'P2025') { // Prisma Not Found Error
      return NextResponse.json(
        { success: false, error: "Application not found for update" },
        { status: 404 }
      );
    }
    
    // Handle Prisma validation or constraint errors (like P2002 for unique fields)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const fieldName = field === 'phone' ? 'phone number' : field;
      return NextResponse.json(
        { success: false, error: `Another application with this ${fieldName} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------------
// DELETE HANDLER (Delete Single Application by ID)
// --------------------------------------------------------------------

/**
 * DELETE /api/admission/[id]
 * Deletes a single application by its unique ID.
 */
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const application = await prisma.admissionApplication.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: `Application ${application.applicationNumber} deleted successfully.`,
      deletedId: application.id,
    });
  } catch (error) {
    console.error(`❌ Error deleting application with ID ${id}:`, error);

    if (error.code === 'P2025') { // Prisma Not Found Error
      return NextResponse.json(
        { success: false, error: "Application not found for deletion" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete application" },
      { status: 500 }
    );
  }
}