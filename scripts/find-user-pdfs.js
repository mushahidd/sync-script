const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserPdfs() {
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });
  
  console.log('Users in system:');
  users.forEach(u => console.log(`  ${u.email} (ID: ${u.id})`));
  console.log('\n');
  
  // Get PDFs with vault access info
  const pdfs = await prisma.fileUpload.findMany({
    include: {
      vault: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      uploader: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (pdfs.length === 0) {
    console.log('❌ No PDFs found! Upload a new PDF to test.');
    await prisma.$disconnect();
    return;
  }
  
  console.log('PDFs and their vault members:\n');
  pdfs.forEach((pdf, i) => {
    console.log(`${i + 1}. ${pdf.fileName}`);
    console.log(`   Vault: ${pdf.vault.title}`);
    console.log(`   Members:`);
    pdf.vault.members.forEach(m => {
      console.log(`     - ${m.user.email} (${m.role})`);
    });
    console.log(`   PDF ID: ${pdf.id}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

findUserPdfs();
