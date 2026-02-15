import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vaultId = formData.get('vaultId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!vaultId || !uploadedBy) {
      return NextResponse.json(
        { error: 'vaultId and uploadedBy are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Verify user has access to the vault
    const membership = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        userId: uploadedBy,
        role: {
          in: ['OWNER', 'CONTRIBUTOR'],
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to upload files to this vault' },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload directly to Cloudinary (no temp file needed - works on serverless)
    const uploadResult = await uploadBufferToCloudinary(
      buffer,
      'syncscript_pdfs',
      file.name
    );

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(uploadResult.error || 'Upload to Cloudinary failed');
    }

    // Save to database with publicId
    const fileUpload = await prisma.fileUpload.create({
      data: {
        fileName: file.name,
        fileUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        vaultId,
        uploadedBy,
      },
      include: {
        vault: true,
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      file: fileUpload,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
