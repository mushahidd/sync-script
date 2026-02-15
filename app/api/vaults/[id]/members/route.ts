import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/vaults/[id]/members - Add a member to a vault
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["OWNER", "CONTRIBUTOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, CONTRIBUTOR, or VIEWER" },
        { status: 400 }
      );
    }

    const vaultId = params.id;

    // Check if current user is an OWNER of the vault
    const currentUserMembership = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        userId: session.user.id,
        role: "OWNER",
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Only vault owners can add members" },
        { status: 403 }
      );
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "User with this email not found. They must register first." },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        userId: userToAdd.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this vault" },
        { status: 400 }
      );
    }

    // Add the member
    const newMember = await prisma.vaultMember.create({
      data: {
        vaultId,
        userId: userToAdd.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

// DELETE /api/vaults/[id]/members - Remove a member from a vault
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberIdToRemove = searchParams.get("memberId");

    if (!memberIdToRemove) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      );
    }

    const vaultId = params.id;

    // Check if current user is an OWNER of the vault
    const currentUserMembership = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        userId: session.user.id,
        role: "OWNER",
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Only vault owners can remove members" },
        { status: 403 }
      );
    }

    // Cannot remove the last owner
    const ownerCount = await prisma.vaultMember.count({
      where: {
        vaultId,
        role: "OWNER",
      },
    });

    const memberToRemove = await prisma.vaultMember.findUnique({
      where: { id: memberIdToRemove },
    });

    if (memberToRemove?.role === "OWNER" && ownerCount === 1) {
      return NextResponse.json(
        { error: "Cannot remove the last owner of the vault" },
        { status: 400 }
      );
    }

    // Remove the member
    await prisma.vaultMember.delete({
      where: { id: memberIdToRemove },
    });

    return NextResponse.json(
      { message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
