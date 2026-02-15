const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data (optional - comment out if you want to preserve data)
  await prisma.annotation.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.source.deleteMany();
  await prisma.vaultMember.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleared existing data');

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@syncscript.com',
      password: hashedPassword,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@syncscript.com',
      password: hashedPassword,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie@syncscript.com',
      password: hashedPassword,
    },
  });

  console.log('👥 Created 3 users');

  // Create Vaults
  const aiResearchVault = await prisma.vault.create({
    data: {
      title: 'AI Research Papers 2026',
      description: 'A collaborative vault for the latest AI and ML research findings',
    },
  });

  const webDevVault = await prisma.vault.create({
    data: {
      title: 'Modern Web Development',
      description: 'Best practices, frameworks, and tools for web development',
    },
  });

  const climateVault = await prisma.vault.create({
    data: {
      title: 'Climate Change Research',
      description: null, // Optional description
    },
  });

  console.log('📦 Created 3 vaults');

  // Create Vault Members with different roles
  // Alice is OWNER of AI Research vault
  await prisma.vaultMember.create({
    data: {
      userId: alice.id,
      vaultId: aiResearchVault.id,
      role: 'OWNER',
    },
  });

  // Bob is CONTRIBUTOR to AI Research vault
  await prisma.vaultMember.create({
    data: {
      userId: bob.id,
      vaultId: aiResearchVault.id,
      role: 'CONTRIBUTOR',
    },
  });

  // Charlie is VIEWER of AI Research vault
  await prisma.vaultMember.create({
    data: {
      userId: charlie.id,
      vaultId: aiResearchVault.id,
      role: 'VIEWER',
    },
  });

  // Bob is OWNER of Web Dev vault
  await prisma.vaultMember.create({
    data: {
      userId: bob.id,
      vaultId: webDevVault.id,
      role: 'OWNER',
    },
  });

  // Alice is CONTRIBUTOR to Web Dev vault
  await prisma.vaultMember.create({
    data: {
      userId: alice.id,
      vaultId: webDevVault.id,
      role: 'CONTRIBUTOR',
    },
  });

  // Charlie is OWNER of Climate vault
  await prisma.vaultMember.create({
    data: {
      userId: charlie.id,
      vaultId: climateVault.id,
      role: 'OWNER',
    },
  });

  console.log('🔐 Created vault memberships with role-based access');

  // Create Sources for AI Research Vault
  const source1 = await prisma.source.create({
    data: {
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      vaultId: aiResearchVault.id,
    },
  });

  const source2 = await prisma.source.create({
    data: {
      title: 'GPT-4 Technical Report',
      url: 'https://arxiv.org/abs/2303.08774',
      vaultId: aiResearchVault.id,
    },
  });

  const source3 = await prisma.source.create({
    data: {
      title: 'LLaMA: Open and Efficient Foundation Language Models',
      url: 'https://arxiv.org/abs/2302.13971',
      vaultId: aiResearchVault.id,
    },
  });

  // Create Sources for Web Dev Vault
  const source4 = await prisma.source.create({
    data: {
      title: 'Next.js Documentation',
      url: 'https://nextjs.org/docs',
      vaultId: webDevVault.id,
    },
  });

  console.log('📚 Created 4 sources');

  // Create Annotations
  await prisma.annotation.create({
    data: {
      content: 'This paper introduced the Transformer architecture, which revolutionized NLP. The multi-head attention mechanism is particularly interesting for parallel processing.',
      sourceId: source1.id,
      authorId: alice.id,
    },
  });

  await prisma.annotation.create({
    data: {
      content: 'Key insight: Self-attention allows the model to weigh the importance of different words in a sequence.',
      sourceId: source1.id,
      authorId: bob.id,
    },
  });

  await prisma.annotation.create({
    data: {
      content: 'GPT-4 shows significant improvements in reasoning and multimodal capabilities. The safety measures discussed in Section 3 are worth reviewing.',
      sourceId: source2.id,
      authorId: alice.id,
    },
  });

  await prisma.annotation.create({
    data: {
      content: 'Next.js 14 introduces Server Actions which simplify data mutations. This could replace our current API route pattern.',
      sourceId: source4.id,
      authorId: bob.id,
    },
  });

  console.log('💬 Created 4 annotations');

  // Create File Uploads
  await prisma.fileUpload.create({
    data: {
      fileName: 'transformer-architecture.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/transformer-architecture.pdf',
      vaultId: aiResearchVault.id,
      uploadedBy: alice.id,
    },
  });

  await prisma.fileUpload.create({
    data: {
      fileName: 'gpt4-supplementary-materials.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/gpt4-supplementary.pdf',
      vaultId: aiResearchVault.id,
      uploadedBy: bob.id,
    },
  });

  await prisma.fileUpload.create({
    data: {
      fileName: 'nextjs-performance-guide.pdf',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nextjs-perf.pdf',
      vaultId: webDevVault.id,
      uploadedBy: bob.id,
    },
  });

  console.log('📎 Created 3 file uploads');

  console.log('\n✅ Database seeding completed successfully!\n');

  // Display summary
  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Users: ${await prisma.user.count()}`);
  console.log(`Vaults: ${await prisma.vault.count()}`);
  console.log(`Vault Members: ${await prisma.vaultMember.count()}`);
  console.log(`Sources: ${await prisma.source.count()}`);
  console.log(`Annotations: ${await prisma.annotation.count()}`);
  console.log(`File Uploads: ${await prisma.fileUpload.count()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Display demo vault info
  console.log('🎯 Demo Vault:');
  console.log(`   Title: ${aiResearchVault.title}`);
  console.log(`   ID: ${aiResearchVault.id}`);
  console.log(`   Owner: ${alice.name} (${alice.email})`);
  console.log(`   Members: 3 (1 OWNER, 1 CONTRIBUTOR, 1 VIEWER)`);
  console.log(`   Sources: 3`);
  console.log(`   Annotations: 3`);
  console.log(`   File Uploads: 2\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
