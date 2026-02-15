/**
 * PDF Migration Script
 * 
 * This script re-uploads all existing PDFs from Cloudinary with the correct 'raw' resource type.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-pdfs.ts
 * 
 * What it does:
 * 1. Fetches all PDFs from database with /image/upload/ URLs
 * 2. Downloads each PDF from Cloudinary
 * 3. Re-uploads with resource_type: 'raw'
 * 4. Updates database with new /raw/upload/ URLs
 * 5. Deletes old Cloudinary files
 */

import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const prisma = new PrismaClient();

async function migratePDFs() {
  console.log('🚀 Starting PDF migration...\n');

  try {
    // Fetch all PDFs with broken URLs (containing /image/upload/)
    const brokenPDFs = await prisma.fileUpload.findMany({
      where: {
        fileUrl: {
          contains: '/image/upload/',
        },
      },
    });

    console.log(`📊 Found ${brokenPDFs.length} PDFs to migrate\n`);

    if (brokenPDFs.length === 0) {
      console.log('✅ No PDFs need migration!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const pdf of brokenPDFs) {
      try {
        console.log(`\n📄 Processing: ${pdf.fileName}`);
        console.log(`   Old URL: ${pdf.fileUrl.substring(0, 80)}...`);

        // Download the PDF from Cloudinary
        const response = await fetch(pdf.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempFilePath = join(process.cwd(), 'tmp', `migrate_${pdf.id}.pdf`);
        
        // Save temporarily
        await writeFile(tempFilePath, buffer);

        // Re-upload with correct resource_type: 'raw'
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
          folder: 'syncscript_pdfs',
          resource_type: 'raw', // CRITICAL FIX
          type: 'upload',
          access_mode: 'public',
          public_id: `migrated_${Date.now()}_${pdf.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        });

        // Update database with new URL
        await prisma.fileUpload.update({
          where: { id: pdf.id },
          data: {
            fileUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          },
        });

        // Delete temp file
        await unlink(tempFilePath);

        // Delete old Cloudinary file (optional - might fail if already gone)
        if (pdf.publicId) {
          try {
            await cloudinary.uploader.destroy(pdf.publicId, {
              resource_type: 'image', // Old files were uploaded as 'image'
            });
          } catch (deleteError) {
            console.log(`   ⚠️  Could not delete old file (may not exist)`);
          }
        }

        console.log(`   ✅ Migrated successfully!`);
        console.log(`   New URL: ${uploadResult.secure_url.substring(0, 80)}...`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Failed to migrate ${pdf.fileName}:`, error);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Migration Complete:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📦 Total: ${brokenPDFs.length}\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePDFs()
  .then(() => {
    console.log('✨ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
