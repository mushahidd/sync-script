const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getTestIds() {
  console.log('\n🔍 Fetching Test IDs from Database...\n');
  console.log('═'.repeat(70));

  const vaults = await prisma.vault.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          role: 'asc',
        },
      },
    },
  });

  console.log('\n📦 VAULTS AVAILABLE FOR PDF UPLOAD TESTING:\n');

  vaults.forEach((vault, index) => {
    console.log(`${index + 1}. ${vault.title}`);
    console.log(`   ID: ${vault.id}`);
    console.log(`   URL: http://localhost:3000/vaults/${vault.id}`);
    console.log(`   Description: ${vault.description || 'N/A'}`);
    console.log(`   Members:`);

    vault.members.forEach((member) => {
      const canUpload = member.role === 'OWNER' || member.role === 'CONTRIBUTOR';
      const uploadIcon = canUpload ? '✅' : '❌';
      
      console.log(`      ${uploadIcon} ${member.user.name} (${member.role})`);
      console.log(`         User ID: ${member.user.id}`);
      console.log(`         Email: ${member.user.email}`);
      console.log(`         Can Upload: ${canUpload ? 'YES' : 'NO (Viewer only)'}`);
    });

    console.log('');
  });

  console.log('═'.repeat(70));
  console.log('\n💡 HOW TO TEST PDF UPLOAD:\n');
  console.log('1. Copy a Vault ID from above');
  console.log('2. Copy a User ID with ✅ (OWNER or CONTRIBUTOR role)');
  console.log('3. Open the Vault URL in your browser');
  console.log('4. Click the "PDFs" tab');
  console.log('5. Click "Choose PDF File" and upload a PDF\n');
  console.log('📌 Note: Only OWNER and CONTRIBUTOR roles can upload PDFs!\n');

  // Get specific test data
  const aiVault = vaults.find(v => v.title.includes('AI Research'));
  if (aiVault) {
    const owner = aiVault.members.find(m => m.role === 'OWNER');
    const contributor = aiVault.members.find(m => m.role === 'CONTRIBUTOR');

    console.log('🎯 QUICK TEST SETUP (AI Research Vault):\n');
    console.log('Vault:');
    console.log(`  Title: ${aiVault.title}`);
    console.log(`  ID: ${aiVault.id}`);
    console.log(`  URL: http://localhost:3000/vaults/${aiVault.id}\n`);

    if (owner) {
      console.log('Test User (Owner):');
      console.log(`  Name: ${owner.user.name}`);
      console.log(`  ID: ${owner.user.id}`);
      console.log(`  Role: ${owner.role}`);
    }

    if (contributor) {
      console.log('\nTest User (Contributor):');
      console.log(`  Name: ${contributor.user.name}`);
      console.log(`  ID: ${contributor.user.id}`);
      console.log(`  Role: ${contributor.role}`);
    }

    console.log('\n');
  }

  await prisma.$disconnect();
}

getTestIds().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
