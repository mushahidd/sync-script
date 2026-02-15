import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/annotations - Create a new annotation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, sourceId, authorId } = body;

    if (!content || !sourceId || !authorId) {
      return NextResponse.json(
        { error: 'Content, sourceId, and authorId are required' },
        { status: 400 }
      );
    }

    // Verify source exists and user has access to its vault
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        vault: {
          include: {
            members: {
              where: {
                userId: authorId,
              },
            },
          },
        },
      },
    });

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    if (source.vault.members.length === 0) {
      return NextResponse.json(
        { error: 'You do not have access to this vault' },
        { status: 403 }
      );
    }

    // Check if user has OWNER or CONTRIBUTOR role (VIEWER cannot add annotations)
    const userMember = source.vault.members[0];
    if (userMember.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Viewers cannot add annotations. Only owners and contributors can add annotations.' },
        { status: 403 }
      );
    }

    const annotation = await prisma.annotation.create({
      data: {
        content,
        sourceId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        source: true,
      },
    });

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
