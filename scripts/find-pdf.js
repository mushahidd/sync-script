const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listRecentPdfs() {
  const pdfs = await prisma.fileUpload.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  
  if (pdfs.length > 0) {
    console.log('Recent PDFs:\n');
    pdfs.forEach((pdf, i) => {
      console.log(`${i + 1}. ${pdf.fileName}`);
      console.log(`   ID: ${pdf.id}`);
      console.log(`   Access via: http://localhost:3000/api/pdf/${pdf.id}`);
      console.log('');
    });
  } else {
    console.log('No PDFs found in database');
    console.log('Upload a new PDF to test!');
  }
  
  await prisma.$disconnect();
}

listRecentPdfs();
