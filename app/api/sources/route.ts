import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerPusherEvent } from '@/lib/pusher-server';

// POST /api/sources - Create a new source
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, vaultId, userId } = body;

    if (!title || !url || !vaultId || !userId) {
      return NextResponse.json(
        { error: 'Title, URL, vaultId, and userId are required' },
        { status: 400 }
      );
    }

    // Check if user has access to the vault (CONTRIBUTOR or OWNER)
    const membership = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        userId,
        role: {
          in: ['OWNER', 'CONTRIBUTOR'],
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to add sources to this vault' },
        { status: 403 }
      );
    }

    // Ensure user is not a VIEWER (read-only)
    if (membership.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Viewers cannot add sources. Only owners and contributors can add sources.' },
        { status: 403 }
      );
    }

    const source = await prisma.source.create({
      data: {
        title,
        url,
        vaultId,
      },
      include: {
        vault: true,
        annotations: true,
      },
    });

    // Trigger real-time event to all vault collaborators
    try {
      await triggerPusherEvent(
        `vault-${vaultId}`,
        'source-added',
        {
          source,
          addedBy: userId,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (pusherError) {
      // Log error but don't fail the request
      console.error('Failed to trigger real-time event:', pusherError);
    }

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
