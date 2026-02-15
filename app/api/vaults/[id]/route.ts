import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/vaults/[id] - Get a specific vault with all details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('API: Fetching vault with ID:', id);

    const vault = await prisma.vault.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            role: 'asc', // OWNER first
          },
        },
        sources: {
          include: {
            annotations: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        fileUploads: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!vault) {
      console.log('API: Vault not found for ID:', id);
      return NextResponse.json(
        { error: 'Vault not found' },
        { status: 404 }
      );
    }

    // Also fetch all annotations for this vault (via sources)
    const allAnnotations = await prisma.annotation.findMany({
      where: {
        source: {
          vaultId: id,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        source: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return vault with top-level annotations array
    const response = {
      ...vault,
      annotations: allAnnotations,
    };

    console.log('API: Vault found successfully:', vault.title, 'with', allAnnotations.length, 'annotations');
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error fetching vault:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vault' },
      { status: 500 }
    );
  }
}

// PATCH /api/vaults/[id] - Update vault details
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, userId } = body;

    // Check if user has OWNER role (in real app)
    const membership = await prisma.vaultMember.findFirst({
      where: {
        vaultId: id,
        userId: userId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only vault owners can update vault details' },
        { status: 403 }
      );
    }

    const vault = await prisma.vault.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(vault);
  } catch (error) {
    console.error('Error updating vault:', error);
    return NextResponse.json(
      { error: 'Failed to update vault' },
      { status: 500 }
    );
  }
}

// DELETE /api/vaults/[id] - Delete a vault
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Check if user has OWNER role
    const membership = await prisma.vaultMember.findFirst({
      where: {
        vaultId: id,
        userId: userId!,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only vault owners can delete vaults' },
        { status: 403 }
      );
    }

    // Cascade delete will handle all related records
    await prisma.vault.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Vault deleted successfully' });
  } catch (error) {
    console.error('Error deleting vault:', error);
    return NextResponse.json(
      { error: 'Failed to delete vault' },
      { status: 500 }
    );
  }
}
