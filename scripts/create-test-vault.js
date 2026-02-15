const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestVault() {
  // Find your user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'mushahidjaffri@gmail.com' },
        { email: 'mushahidhussain451@gmail.com' }
      ]
    }
  });
  
  if (!user) {
    console.log('❌ User not found! Please register first.');
    await prisma.$disconnect();
    return;
  }
  
  console.log(`✅ Found user: ${user.email}`);
  
  // Check if vault already exists
  const existing = await prisma.vault.findFirst({
    where: {
      title: 'My Test Vault',
      members: {
        some: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  });
  
  if (existing) {
    console.log(`✅ Test vault already exists!`);
    console.log(`\nGo to: http://localhost:3000/vaults/${existing.id}`);
    console.log('Upload a PDF there to test!');
    await prisma.$disconnect();
    return;
  }
  
  // Create a test vault for your user
  const vault = await prisma.vault.create({
    data: {
      title: 'My Test Vault',
      description: 'Test vault for PDF uploads',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  });
  
  console.log(`\n✅ Created test vault!`);
  console.log(`\nGo to: http://localhost:3000/vaults/${vault.id}`);
  console.log('Upload a PDF there to test the fix!');
  
  await prisma.$disconnect();
}

createTestVault();
