import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE /api/annotations/[id] - Delete an annotation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const annotationId = params.id;

    // Get annotation with permission check
    const annotation = await prisma.annotation.findUnique({
      where: { id: annotationId },
      include: {
        author: true,
        source: {
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
        },
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      );
    }

    // Find user's membership
    const userMember = annotation.source.vault.members.find(m => m.userId === session.user.id);
    
    if (!userMember) {
      return NextResponse.json(
        { error: "You do not have access to this vault" },
        { status: 403 }
      );
    }

    // Permission check: OWNER can delete any annotation, CONTRIBUTOR can delete only their own
    const isOwner = userMember.role === "OWNER";
    const isAuthor = annotation.authorId === session.user.id;
    const isContributor = userMember.role === "CONTRIBUTOR";

    if (!isOwner && !(isContributor && isAuthor)) {
      return NextResponse.json(
        { error: "You can only delete your own annotations. Vault owners can delete any annotation." },
        { status: 403 }
      );
    }

    // Delete the annotation
    await prisma.annotation.delete({
      where: { id: annotationId },
    });

    return NextResponse.json(
      { message: "Annotation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return NextResponse.json(
      { error: "Failed to delete annotation" },
      { status: 500 }
    );
  }
}
