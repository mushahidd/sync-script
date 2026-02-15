import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE /api/sources/[id] - Delete a source
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sourceId = params.id;

    // Get source with vault membership check - OWNER only can delete sources
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        vault: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!source) {
      return NextResponse.json(
        { error: "Source not found" },
        { status: 404 }
      );
    }

    // Check if user is OWNER of the vault
    const userMember = source.vault.members.find(m => m.userId === session.user.id);
    
    if (!userMember) {
      return NextResponse.json(
        { error: "You do not have access to this vault" },
        { status: 403 }
      );
    }

    if (userMember.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only vault owners can delete sources" },
        { status: 403 }
      );
    }

    // Delete the source (cascade will delete related annotations)
    await prisma.source.delete({
      where: { id: sourceId },
    });

    return NextResponse.json(
      { message: "Source deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting source:", error);
    return NextResponse.json(
      { error: "Failed to delete source" },
      { status: 500 }
    );
  }
}
