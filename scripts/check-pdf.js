const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPdf() {
  const pdf = await prisma.fileUpload.findUnique({
    where: { id: '13139e77-6854-4102-8035-7968d2c7d188' }
  });
  
  console.log('PDF Record:');
  console.log('  publicId:', pdf?.publicId);
  console.log('  fileUrl:', pdf?.fileUrl);
  console.log('  fileName:', pdf?.fileName);
  
  await prisma.$disconnect();
}

checkPdf();
