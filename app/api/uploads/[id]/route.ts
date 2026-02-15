import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// DELETE /api/uploads/[id] - Delete a file upload
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.id;

    // Get file with vault membership check - OWNER only can delete PDFs
    const fileUpload = await prisma.fileUpload.findUnique({
      where: { id: fileId },
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

    if (!fileUpload) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Check if user is OWNER of the vault
    const userMember = fileUpload.vault.members.find(m => m.userId === session.user.id);
    
    if (!userMember) {
      return NextResponse.json(
        { error: "You do not have access to this vault" },
        { status: 403 }
      );
    }

    if (userMember.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only vault owners can delete PDFs" },
        { status: 403 }
      );
    }

    // Extract public ID from Cloudinary URL
    const urlParts = fileUpload.fileUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${fileNameWithExtension.split('.')[0]}`;

    // Delete from Cloudinary (optional - may fail if already deleted)
    try {
      await deleteFromCloudinary(publicId, 'raw');
    } catch (cloudinaryError) {
      console.warn('Failed to delete from Cloudinary, continuing with DB deletion:', cloudinaryError);
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id: fileId },
    });

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
