const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  console.log('\n🔍 Verifying Database Contents...\n');
  console.log('═'.repeat(60));

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          vaultMemberships: true,
          annotations: true,
          fileUploads: true,
        },
      },
    },
  });

  console.log('\n👥 USERS:');
  users.forEach((user, i) => {
    console.log(`   ${i + 1}. ${user.name} (${user.email})`);
    console.log(`      └─ Vaults: ${user._count.vaultMemberships} | Annotations: ${user._count.annotations} | Uploads: ${user._count.fileUploads}`);
  });

  // Get all vaults with details
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
      sources: {
        include: {
          annotations: true,
        },
      },
      fileUploads: true,
      _count: {
        select: {
          members: true,
          sources: true,
          fileUploads: true,
        },
      },
    },
  });

  console.log('\n\n📦 VAULTS:');
  vaults.forEach((vault, i) => {
    console.log(`\n   ${i + 1}. ${vault.title}`);
    console.log(`      ID: ${vault.id}`);
    console.log(`      Description: ${vault.description || 'N/A'}`);
    console.log(`      Members (${vault._count.members}):`);
    vault.members.forEach((member) => {
      console.log(`         • ${member.user.name} - ${member.role}`);
    });
    console.log(`      Sources: ${vault._count.sources} | File Uploads: ${vault._count.fileUploads}`);
  });

  // Get all sources
  const sources = await prisma.source.findMany({
    include: {
      vault: true,
      annotations: {
        include: {
          author: true,
        },
      },
    },
  });

  console.log('\n\n📚 SOURCES:');
  sources.forEach((source, i) => {
    console.log(`   ${i + 1}. ${source.title}`);
    console.log(`      URL: ${source.url}`);
    console.log(`      Vault: ${source.vault.title}`);
    console.log(`      Annotations: ${source.annotations.length}`);
  });

  // Get all annotations
  const annotations = await prisma.annotation.findMany({
    include: {
      author: true,
      source: true,
    },
  });

  console.log('\n\n💬 ANNOTATIONS:');
  annotations.forEach((annotation, i) => {
    console.log(`   ${i + 1}. Author: ${annotation.author.name}`);
    console.log(`      Source: ${annotation.source.title}`);
    console.log(`      Content: ${annotation.content.substring(0, 80)}...`);
  });

  // Get all file uploads
  const fileUploads = await prisma.fileUpload.findMany({
    include: {
      vault: true,
      uploader: true,
    },
  });

  console.log('\n\n📎 FILE UPLOADS:');
  fileUploads.forEach((file, i) => {
    console.log(`   ${i + 1}. ${file.fileName}`);
    console.log(`      Vault: ${file.vault.title}`);
    console.log(`      Uploaded by: ${file.uploader.name}`);
    console.log(`      URL: ${file.fileUrl}`);
  });

  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Database verification complete!\n');
  console.log('📊 FINAL SUMMARY:');
  console.log('━'.repeat(60));
  console.log(`   Users:          ${users.length}`);
  console.log(`   Vaults:         ${vaults.length}`);
  console.log(`   Vault Members:  ${await prisma.vaultMember.count()}`);
  console.log(`   Sources:        ${sources.length}`);
  console.log(`   Annotations:    ${annotations.length}`);
  console.log(`   File Uploads:   ${fileUploads.length}`);
  console.log('━'.repeat(60));
  console.log('\n🎯 Main Demo Vault for Testing:');
  const mainVault = vaults.find(v => v.title.includes('AI Research'));
  if (mainVault) {
    console.log(`   Title: ${mainVault.title}`);
    console.log(`   ID: ${mainVault.id}`);
    console.log(`   URL: http://localhost:3000/vaults/${mainVault.id}`);
  }
  console.log('\n🌐 Test the app:');
  console.log(`   Dashboard: http://localhost:3000/dashboard`);
  console.log(`   Vault Detail: http://localhost:3000/vaults/${mainVault?.id}`);
  console.log(`   Prisma Studio: http://localhost:5555\n`);
}

verify()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
