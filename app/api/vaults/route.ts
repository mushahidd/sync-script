import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/vaults - Get all vaults for the current user
export async function GET(request: Request) {
  try {
    // In a real app, get userId from session/auth
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    const vaults = await prisma.vault.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
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
        },
        sources: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Latest 5 sources
        },
        fileUploads: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            sources: true,
            fileUploads: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(vaults);
  } catch (error) {
    console.error('Error fetching vaults:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vaults' },
      { status: 500 }
    );
  }
}

// POST /api/vaults - Create a new vault
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, userId } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      );
    }

    // Create vault and set creator as OWNER in a transaction
    const vault = await prisma.vault.create({
      data: {
        title,
        description,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
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
        },
        _count: {
          select: {
            sources: true,
            fileUploads: true,
            members: true,
          },
        },
      },
    });

    return NextResponse.json(vault, { status: 201 });
  } catch (error) {
    console.error('Error creating vault:', error);
    return NextResponse.json(
      { error: 'Failed to create vault' },
      { status: 500 }
    );
  }
}
