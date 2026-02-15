const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getVaultUrls() {
  const vaults = await prisma.vault.findMany({
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });
  
  console.log('📦 Available Vaults:\n');
  vaults.forEach(vault => {
    console.log(`${vault.title}`);
    console.log(`   URL: http://localhost:3000/vaults/${vault.id}`);
    console.log(`   Members: ${vault.members.map(m => `${m.user.email} (${m.role})`).join(', ')}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

getVaultUrls();
