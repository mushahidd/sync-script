const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabasePdfs() {
  console.log('\n📊 Checking PDF records in database...\n');
  
  try {
    const fileUploads = await prisma.fileUpload.findMany({
      include: {
        vault: {
          select: {
            title: true,
          },
        },
        uploader: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (fileUploads.length === 0) {
      console.log('ℹ️  No PDF records found in database');
      return;
    }

    console.log(`✅ Found ${fileUploads.length} PDF record(s) in database:\n`);
    
    fileUploads.forEach((file, index) => {
      console.log(`${index + 1}. ${file.fileName}`);
      console.log(`   Vault: ${file.vault.title}`);
      console.log(`   Uploaded by: ${file.uploader.name}`);
      console.log(`   Public ID: ${file.publicId || 'N/A'}`);
      console.log(`   Current URL: ${file.fileUrl}`);
      console.log(`   Record ID: ${file.id}`);
      console.log('');
    });

    console.log('\n💡 These records exist but files are missing from Cloudinary.');
    console.log('   You need to re-upload these PDFs.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabasePdfs();
