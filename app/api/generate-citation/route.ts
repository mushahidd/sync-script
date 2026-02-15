import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import { parsePDF } from '@/lib/pdf-parser';
import { generateCitation, generateFallbackCitation } from '@/lib/citation-generator';
import { triggerPusherEvent } from '@/lib/pusher-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vaultId = formData.get('vaultId') as string;
    const userId = formData.get('userId') as string;
    const sourceTitle = formData.get('title') as string; // Optional custom title

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!vaultId || !userId) {
      return NextResponse.json(
        { error: 'vaultId and userId are required' },
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
        userId,
        role: {
          in: ['OWNER', 'CONTRIBUTOR'],
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to generate citations for this vault' },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    console.log('Parsing PDF:', file.name);
    const parseResult = await parsePDF(buffer, { timeoutMs: 15000 });
    const parseSucceeded = parseResult.success;

    // Use custom title if provided, otherwise use extracted title
    const finalTitle = sourceTitle || parseResult.title || file.name.replace('.pdf', '');
    
    // Generate citation using AI
    console.log('Generating citation for:', finalTitle);
    const citationResult = parseSucceeded
      ? await generateCitation(
          finalTitle,
          parseResult.author,
          parseResult.year,
          parseResult.fullText
        )
      : { success: false, error: parseResult.error || 'PDF parse failed' };

    // Use AI citation or fallback
    const citation = citationResult.success
      ? citationResult.citation!
      : generateFallbackCitation(finalTitle, parseResult.author, parseResult.year);

    // Create source with citation in database
    const source = await prisma.source.create({
      data: {
        title: finalTitle,
        url: `PDF: ${file.name}`, // You might want to store actual URL from Cloudinary
        citation,
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
        'citation-generated',
        {
          source,
          parseResult: {
            title: finalTitle,
            author: parseResult.author,
            year: parseResult.year,
          },
          citation,
          addedBy: userId,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (pusherError) {
      // Log error but don't fail the request
      console.error('Failed to trigger real-time event:', pusherError);
    }

    return NextResponse.json({
      success: true,
      source,
      parseResult: {
        title: finalTitle,
        author: parseResult.author,
        year: parseResult.year,
        parseError: parseSucceeded ? null : parseResult.error || 'PDF parse failed',
      },
      citation,
      aiGenerated: citationResult.success,
      aiError: citationResult.success ? null : citationResult.error || 'AI unavailable',
      message: citationResult.success 
        ? 'Citation generated successfully using AI'
        : 'Citation generated using fallback format',
    });

  } catch (error) {
    console.error('Citation generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate citation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}