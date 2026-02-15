import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// GET /api/pdf/[fileId] - Download from Cloudinary using credentials and serve to user
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch file upload details
    const fileUpload = await prisma.fileUpload.findUnique({
      where: { id: params.fileId },
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

    // Check if user has access to the vault
    if (fileUpload.vault.members.length === 0) {
      return NextResponse.json(
        { error: "You do not have access to this file" },
        { status: 403 }
      );
    }

    // Download PDF - now publicly accessible with new uploads
    try {
      const publicId = fileUpload.publicId;
      
      if (!publicId) {
        throw new Error('No public_id found for this file');
      }

      console.log('Downloading PDF from Cloudinary:', publicId);

      // Try direct URL first (new PUBLIC uploads)
      let pdfUrl = cloudinary.url(publicId, {
        resource_type: 'image',  // Auto-uploaded PDFs appear as 'image' type
        format: 'pdf',
        type: 'upload',
        secure: true
      });

      console.log('Trying PUBLIC PDF URL:', pdfUrl);
      let response = await fetch(pdfUrl);

      // Fallback: Try with signed URL for older restricted files
      if (!response.ok) {
        console.log('Public URL failed, trying signed URL...');
        pdfUrl = cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          secure: true,
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        });
        
        console.log('Trying SIGNED RAW PDF URL:', pdfUrl);
        response = await fetch(pdfUrl);
      }

      // Second fallback: Try IMAGE type with signed URL
      if (!response.ok) {
        console.log('RAW failed, trying IMAGE resource type with signed URL...');
        const publicIdWithoutExt = publicId.replace(/\.pdf$/, '');
        const imagePdfUrl = cloudinary.url(publicIdWithoutExt, {
          resource_type: 'image',
          format: 'pdf',
          type: 'upload',
          secure: true,
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        });
        
        console.log('Trying SIGNED IMAGE PDF URL:', imagePdfUrl);
        response = await fetch(imagePdfUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('All fetch attempts failed');
          throw new Error(`Cloudinary returned ${response.status}`);
        }
      }

      const pdfBuffer = await response.arrayBuffer();

      // Serve PDF to user
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileUpload.fileName}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });

    } catch (cloudinaryError) {
      console.error('Cloudinary download error:', cloudinaryError);
      
      // Fallback: Try direct URL (might work for some files)
      try {
        const directResponse = await fetch(fileUpload.fileUrl);
        if (directResponse.ok) {
          const buffer = await directResponse.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${fileUpload.fileName}"`,
            },
          });
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }

      return NextResponse.json(
        { 
          error: "Failed to fetch PDF from Cloudinary", 
          details: String(cloudinaryError),
          publicId: fileUpload.publicId,
          url: fileUpload.fileUrl
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json(
      { error: "Failed to serve PDF", details: String(error) },
      { status: 500 }
    );
  }
}
