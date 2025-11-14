import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import { hashPassword, sanitizeUser } from "../../../../libs/auth";

// Helpers
const validateInput = (name, email, password, role) => {
  const errors = [];

  if (name && name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Valid email is required");
  }

  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  const validRoles = ["TEACHER", "PRINCIPAL", "ADMIN"];
  if (role && !validRoles.includes(role)) {
    errors.push("Invalid user role");
  }

  return errors;
};

// GET user by ID
export async function GET(req, { params }) {
  try {
    const { id } = params; // id is string
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// UPDATE user by ID
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { name, email, phone, password, role } = await req.json();

    const validationErrors = validateInput(name, email, password, role);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
    }

    let dataToUpdate = {
      name,
      email,
      phone,
      role: role || "ADMIN", // default role if not provided
    };

    if (password) {
      dataToUpdate.password = await hashPassword(password);
    }

    // Remove undefined fields
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, message: "User updated successfully", user: sanitizeUser(updatedUser) }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully", user: deletedUser }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
