const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupBrokenPdfs() {
  console.log('\n🧹 Cleaning up broken PDF records...\n');
  
  try {
    // Delete all PDF records with broken Cloudinary URLs
    const result = await prisma.fileUpload.deleteMany({
      where: {
        OR: [
          { fileUrl: { contains: '/syncscript_pdfs/' } }, //Old broken ones
          { publicId: { contains: 'syncscript_pdfs/' } },
        ],
      },
    });

    console.log(`✅ Deleted ${result.count} broken PDF record(s)`);
    console.log('\n💡 Now you can upload fresh PDFs with the fixed code!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBrokenPdfs();
