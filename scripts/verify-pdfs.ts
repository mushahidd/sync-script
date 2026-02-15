/**
 * Quick Verification Script
 * 
 * Checks if PDFs in database have correct /raw/upload/ URLs
 * 
 * Usage: npx ts-node scripts/verify-pdfs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPDFs() {
  console.log('🔍 Verifying PDF URLs...\n');

  try {
    const allPDFs = await prisma.fileUpload.findMany({
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        vault: {
          select: {
            title: true,
          },
        },
      },
    });

    const brokenPDFs = allPDFs.filter(pdf => pdf.fileUrl.includes('/image/upload/'));
    const fixedPDFs = allPDFs.filter(pdf => pdf.fileUrl.includes('/raw/upload/'));
    const unknownPDFs = allPDFs.filter(pdf => 
      !pdf.fileUrl.includes('/image/upload/') && 
      !pdf.fileUrl.includes('/raw/upload/')
    );

    console.log('📊 PDF Status Report:');
    console.log('='.repeat(60));
    console.log(`Total PDFs: ${allPDFs.length}`);
    console.log(`✅ Working (/raw/upload/): ${fixedPDFs.length}`);
    console.log(`❌ Broken (/image/upload/): ${brokenPDFs.length}`);
    console.log(`❓ Unknown format: ${unknownPDFs.length}`);
    console.log('='.repeat(60));

    if (brokenPDFs.length > 0) {
      console.log('\n❌ BROKEN PDFs (need migration):');
      brokenPDFs.forEach((pdf, idx) => {
        console.log(`\n${idx + 1}. ${pdf.fileName}`);
        console.log(`   Vault: ${pdf.vault.title}`);
        console.log(`   URL: ${pdf.fileUrl.substring(0, 80)}...`);
      });
      console.log('\n⚠️  Run migration: npx ts-node scripts/migrate-pdfs.ts');
    }

    if (fixedPDFs.length > 0 && brokenPDFs.length === 0) {
      console.log('\n✅ ALL PDFs ARE WORKING! No migration needed.');
    }

    if (allPDFs.length === 0) {
      console.log('\nℹ️  No PDFs found in database. Upload a test PDF to verify the fix.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPDFs();
