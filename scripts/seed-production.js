// Set production DATABASE_URL before requiring Prisma
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_qtp93FuNHhJa@ep-crimson-flower-aifyyl9l-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with comprehensive demo data...');
  console.log('📡 Connected to:', process.env.DATABASE_URL.split('@')[1].split('/')[0]);

  // Warm up connection first (Neon databases sleep after inactivity)
  console.log('⏳ Warming up database connection...');
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log('✅ Database connection ready');

  // Clean up existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.annotation.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.source.deleteMany();
  await prisma.vaultMember.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleared existing data');

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users with realistic profiles
  const alice = await prisma.user.create({
    data: {
      name: 'Dr. Alice Johnson',
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

  const diana = await prisma.user.create({
    data: {
      name: 'Diana Martinez',
      email: 'diana@syncscript.com',
      password: hashedPassword,
    },
  });

  console.log('👥 Created 4 users');

  // ==========================================
  // VAULT 1: AI Research Papers (Main Demo Vault)
  // ==========================================
  const aiResearchVault = await prisma.vault.create({
    data: {
      title: 'AI Research Papers 2026',
      description: 'Collaborative research vault tracking breakthrough papers in Artificial Intelligence, Machine Learning, and Natural Language Processing. Our team reviews and annotates key findings.',
    },
  });

  // Vault Members - AI Research
  await prisma.vaultMember.createMany({
    data: [
      { userId: alice.id, vaultId: aiResearchVault.id, role: 'OWNER' },
      { userId: bob.id, vaultId: aiResearchVault.id, role: 'CONTRIBUTOR' },
      { userId: charlie.id, vaultId: aiResearchVault.id, role: 'CONTRIBUTOR' },
      { userId: diana.id, vaultId: aiResearchVault.id, role: 'VIEWER' },
    ],
  });

  // Sources for AI Research with proper APA citations
  const transformerSource = await prisma.source.create({
    data: {
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      citation: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30, 5998-6008.',
      vaultId: aiResearchVault.id,
    },
  });

  const gpt4Source = await prisma.source.create({
    data: {
      title: 'GPT-4 Technical Report',
      url: 'https://arxiv.org/abs/2303.08774',
      citation: 'OpenAI. (2023). GPT-4 technical report. arXiv preprint arXiv:2303.08774.',
      vaultId: aiResearchVault.id,
    },
  });

  const llamaSource = await prisma.source.create({
    data: {
      title: 'LLaMA: Open Foundation Language Models',
      url: 'https://arxiv.org/abs/2302.13971',
      citation: 'Touvron, H., Lavril, T., Izacard, G., Martinet, X., Lachaux, M. A., Lacroix, T., ... & Lample, G. (2023). LLaMA: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971.',
      vaultId: aiResearchVault.id,
    },
  });

  const bertSource = await prisma.source.create({
    data: {
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      url: 'https://arxiv.org/abs/1810.04805',
      citation: 'Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. In Proceedings of NAACL-HLT (pp. 4171-4186).',
      vaultId: aiResearchVault.id,
    },
  });

  const ragSource = await prisma.source.create({
    data: {
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      citation: 'Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., ... & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. NeurIPS, 33, 9459-9474.',
      vaultId: aiResearchVault.id,
    },
  });

  // Annotations for AI Research Sources
  await prisma.annotation.createMany({
    data: [
      // Transformer paper annotations
      {
        content: '🔑 KEY INSIGHT: The self-attention mechanism allows the model to process all positions in parallel, unlike RNNs which are sequential. This is the foundation for modern LLMs.',
        sourceId: transformerSource.id,
        authorId: alice.id,
      },
      {
        content: 'Multi-head attention splits the attention into multiple "heads" allowing the model to attend to information from different representation subspaces. See Figure 2 in the paper.',
        sourceId: transformerSource.id,
        authorId: bob.id,
      },
      {
        content: 'Positional encoding is crucial! Since self-attention has no notion of order, they add sinusoidal position embeddings. Q: Could learned positions work better?',
        sourceId: transformerSource.id,
        authorId: charlie.id,
      },
      // GPT-4 annotations
      {
        content: '⚠️ IMPORTANT: Section 3 discusses safety mitigations. GPT-4 underwent RLHF training with red-teaming to reduce harmful outputs. Must cite this for our ethics section.',
        sourceId: gpt4Source.id,
        authorId: alice.id,
      },
      {
        content: 'Multimodal capability allows image+text inputs. Potential application: analyzing research paper figures automatically. Need to explore this for literature review automation.',
        sourceId: gpt4Source.id,
        authorId: bob.id,
      },
      // LLaMA annotations
      {
        content: 'Open-source alternative to GPT! Trained on 1.4T tokens. Performance comparable to GPT-3 at 65B params. This changes the research landscape significantly.',
        sourceId: llamaSource.id,
        authorId: alice.id,
      },
      {
        content: 'Training data composition (Page 4): 67% CommonCrawl, 15% C4, 4.5% GitHub, 4.5% Wikipedia, etc. No books which avoids copyright issues.',
        sourceId: llamaSource.id,
        authorId: charlie.id,
      },
      // BERT annotations
      {
        content: 'Bidirectional training is the key innovation. Previous models (GPT-1, ELMo) were unidirectional. Masked Language Modeling (MLM) enables true bidirectional context.',
        sourceId: bertSource.id,
        authorId: bob.id,
      },
      {
        content: 'Fine-tuning approach: add task-specific layer, train whole model. Only need 2-3 epochs! This made transfer learning practical for NLP.',
        sourceId: bertSource.id,
        authorId: alice.id,
      },
      // RAG annotations
      {
        content: '💡 BREAKTHROUGH: Combines retrieval (finding relevant docs) with generation. This reduces hallucinations and allows updating knowledge without retraining!',
        sourceId: ragSource.id,
        authorId: alice.id,
      },
      {
        content: 'Architecture: DPR retriever + BART generator. The retriever finds relevant passages from a corpus, then generator conditions on them. Perfect for QA systems.',
        sourceId: ragSource.id,
        authorId: bob.id,
      },
    ],
  });

  // File uploads for AI Research
  await prisma.fileUpload.createMany({
    data: [
      {
        fileName: 'Transformer_Architecture_Deep_Dive.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/transformer-guide.pdf',
        vaultId: aiResearchVault.id,
        uploadedBy: alice.id,
      },
      {
        fileName: 'GPT4_Capabilities_Analysis.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/gpt4-analysis.pdf',
        vaultId: aiResearchVault.id,
        uploadedBy: bob.id,
      },
      {
        fileName: 'LLM_Comparison_Benchmark_2026.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/llm-benchmark.pdf',
        vaultId: aiResearchVault.id,
        uploadedBy: charlie.id,
      },
    ],
  });

  // ==========================================
  // VAULT 2: Web Development Best Practices
  // ==========================================
  const webDevVault = await prisma.vault.create({
    data: {
      title: 'Modern Web Development',
      description: 'Team knowledge base for full-stack development practices, focusing on Next.js, React, and modern deployment strategies.',
    },
  });

  // Vault Members - Web Dev
  await prisma.vaultMember.createMany({
    data: [
      { userId: bob.id, vaultId: webDevVault.id, role: 'OWNER' },
      { userId: alice.id, vaultId: webDevVault.id, role: 'CONTRIBUTOR' },
      { userId: diana.id, vaultId: webDevVault.id, role: 'CONTRIBUTOR' },
    ],
  });

  // Sources for Web Dev
  const nextjsSource = await prisma.source.create({
    data: {
      title: 'Next.js 14 Documentation - App Router',
      url: 'https://nextjs.org/docs/app',
      citation: 'Vercel. (2024). Next.js documentation: App router. https://nextjs.org/docs/app',
      vaultId: webDevVault.id,
    },
  });

  const reactSource = await prisma.source.create({
    data: {
      title: 'React Server Components',
      url: 'https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023',
      citation: 'React Team. (2023). React Labs: What we have been working on. React Blog.',
      vaultId: webDevVault.id,
    },
  });

  const tailwindSource = await prisma.source.create({
    data: {
      title: 'Tailwind CSS v3.4 Release Notes',
      url: 'https://tailwindcss.com/blog/tailwindcss-v3-4',
      citation: 'Tailwind Labs. (2024). Tailwind CSS v3.4. https://tailwindcss.com/blog/tailwindcss-v3-4',
      vaultId: webDevVault.id,
    },
  });

  const prismaSourceData = await prisma.source.create({
    data: {
      title: 'Prisma Best Practices Guide',
      url: 'https://www.prisma.io/docs/guides',
      citation: 'Prisma. (2024). Prisma documentation: Guides. https://www.prisma.io/docs/guides',
      vaultId: webDevVault.id,
    },
  });

  // Annotations for Web Dev
  await prisma.annotation.createMany({
    data: [
      {
        content: '🚀 Server Actions in Next.js 14 eliminate the need for separate API routes for mutations. Use "use server" directive. Much cleaner code!',
        sourceId: nextjsSource.id,
        authorId: bob.id,
      },
      {
        content: 'File-based routing in /app directory: page.tsx for routes, layout.tsx for shared UI, loading.tsx for suspense boundaries. Remember these conventions!',
        sourceId: nextjsSource.id,
        authorId: alice.id,
      },
      {
        content: 'React Server Components render on server = smaller JS bundle. Use for data fetching. Client components ("use client") only for interactivity.',
        sourceId: reactSource.id,
        authorId: bob.id,
      },
      {
        content: 'Tailwind container queries are game-changing for component-based responsive design. @container and container-type:inline-size.',
        sourceId: tailwindSource.id,
        authorId: diana.id,
      },
      {
        content: '⚡ Prisma tip: Always use select/include to limit returned fields. Prevents fetching entire objects when you only need id and name.',
        sourceId: prismaSourceData.id,
        authorId: bob.id,
      },
    ],
  });

  // File uploads for Web Dev
  await prisma.fileUpload.createMany({
    data: [
      {
        fileName: 'NextJS_Performance_Optimization.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/nextjs-perf.pdf',
        vaultId: webDevVault.id,
        uploadedBy: bob.id,
      },
      {
        fileName: 'React_State_Management_Guide.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/react-state.pdf',
        vaultId: webDevVault.id,
        uploadedBy: alice.id,
      },
    ],
  });

  // ==========================================
  // VAULT 3: Climate Change Research
  // ==========================================
  const climateVault = await prisma.vault.create({
    data: {
      title: 'Climate Change Research',
      description: 'Tracking IPCC reports, renewable energy studies, and environmental policy papers for our sustainability initiative.',
    },
  });

  // Vault Members - Climate
  await prisma.vaultMember.createMany({
    data: [
      { userId: charlie.id, vaultId: climateVault.id, role: 'OWNER' },
      { userId: diana.id, vaultId: climateVault.id, role: 'CONTRIBUTOR' },
      { userId: alice.id, vaultId: climateVault.id, role: 'VIEWER' },
    ],
  });

  // Sources for Climate
  const ipccSource = await prisma.source.create({
    data: {
      title: 'IPCC AR6 Synthesis Report',
      url: 'https://www.ipcc.ch/report/ar6/syr/',
      citation: 'IPCC. (2023). AR6 synthesis report: Climate change 2023. Intergovernmental Panel on Climate Change.',
      vaultId: climateVault.id,
    },
  });

  const renewableSource = await prisma.source.create({
    data: {
      title: 'Global Renewable Energy Outlook 2025',
      url: 'https://www.irena.org/publications',
      citation: 'IRENA. (2025). World energy transitions outlook 2025. International Renewable Energy Agency.',
      vaultId: climateVault.id,
    },
  });

  const carbonSource = await prisma.source.create({
    data: {
      title: 'Carbon Capture Technologies Review',
      url: 'https://www.nature.com/articles/s41558-024-01923-1',
      citation: 'Smith, J., et al. (2024). Direct air capture: Scaling challenges and solutions. Nature Climate Change, 14(2), 145-156.',
      vaultId: climateVault.id,
    },
  });

  // Annotations for Climate
  await prisma.annotation.createMany({
    data: [
      {
        content: '🌡️ CRITICAL: 1.5°C warming threshold likely to be exceeded by 2030s. Every fraction of a degree matters - each 0.5°C increases extreme weather frequency.',
        sourceId: ipccSource.id,
        authorId: charlie.id,
      },
      {
        content: 'Figure SPM.1 shows observed warming of 1.1°C since pre-industrial. Human activities unequivocally the cause. Use this for presentation.',
        sourceId: ipccSource.id,
        authorId: diana.id,
      },
      {
        content: 'Solar PV cost dropped 90% since 2010! Now cheapest electricity source in history for most locations. Wind also cost-competitive.',
        sourceId: renewableSource.id,
        authorId: charlie.id,
      },
      {
        content: 'DAC (Direct Air Capture) costs: $100-300/ton CO2 currently. Need <$100 for viability. Climeworks and Carbon Engineering leading.',
        sourceId: carbonSource.id,
        authorId: diana.id,
      },
    ],
  });

  // File uploads for Climate
  await prisma.fileUpload.createMany({
    data: [
      {
        fileName: 'IPCC_Summary_for_Policymakers.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/ipcc-spm.pdf',
        vaultId: climateVault.id,
        uploadedBy: charlie.id,
      },
      {
        fileName: 'Renewable_Energy_Infographics.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/renewable-infographic.pdf',
        vaultId: climateVault.id,
        uploadedBy: diana.id,
      },
    ],
  });

  // ==========================================
  // VAULT 4: Product Management Resources
  // ==========================================
  const pmVault = await prisma.vault.create({
    data: {
      title: 'Product Management Toolkit',
      description: 'Frameworks, methodologies, and case studies for effective product management. From user research to launch strategies.',
    },
  });

  // Vault Members - PM
  await prisma.vaultMember.createMany({
    data: [
      { userId: diana.id, vaultId: pmVault.id, role: 'OWNER' },
      { userId: bob.id, vaultId: pmVault.id, role: 'VIEWER' },
    ],
  });

  // Sources for PM
  const jobsSource = await prisma.source.create({
    data: {
      title: 'Jobs To Be Done Framework',
      url: 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done',
      citation: "Christensen, C. M., et al. (2016). Know your customers' jobs to be done. Harvard Business Review, 94(9), 54-62.",
      vaultId: pmVault.id,
    },
  });

  const leanSource = await prisma.source.create({
    data: {
      title: 'The Lean Startup Methodology',
      url: 'https://theleanstartup.com/principles',
      citation: "Ries, E. (2011). The lean startup: How today's entrepreneurs use continuous innovation. Crown Business.",
      vaultId: pmVault.id,
    },
  });

  // Annotations for PM
  await prisma.annotation.createMany({
    data: [
      {
        content: "JTBD framework: Focus on WHY customers \"hire\" your product. Not demographics, but the progress they're trying to make. Game-changer for user research.",
        sourceId: jobsSource.id,
        authorId: diana.id,
      },
      {
        content: 'Build-Measure-Learn loop: Ship MVP fast, measure real user behavior, learn and iterate. Validated learning > vanity metrics.',
        sourceId: leanSource.id,
        authorId: diana.id,
      },
    ],
  });

  console.log('\n✅ Database seeding completed successfully!\n');

  // Display comprehensive summary
  const userCount = await prisma.user.count();
  const vaultCount = await prisma.vault.count();
  const memberCount = await prisma.vaultMember.count();
  const sourceCount = await prisma.source.count();
  const annotationCount = await prisma.annotation.count();
  const fileCount = await prisma.fileUpload.count();

  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👥 Users: ${userCount}`);
  console.log(`📦 Vaults: ${vaultCount}`);
  console.log(`🔐 Vault Members: ${memberCount}`);
  console.log(`📚 Sources: ${sourceCount}`);
  console.log(`💬 Annotations: ${annotationCount}`);
  console.log(`📎 File Uploads: ${fileCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎯 Demo Accounts (password: password123):');
  console.log('───────────────────────────────────────────');
  console.log(`1. Dr. Alice Johnson - alice@syncscript.com`);
  console.log(`   → OWNER of "AI Research Papers 2026"`);
  console.log(`   → CONTRIBUTOR to "Modern Web Development"`);
  console.log(`   → VIEWER on "Climate Change Research"`);
  console.log('');
  console.log(`2. Bob Smith - bob@syncscript.com`);
  console.log(`   → OWNER of "Modern Web Development"`);
  console.log(`   → CONTRIBUTOR to "AI Research Papers 2026"`);
  console.log('');
  console.log(`3. Charlie Davis - charlie@syncscript.com`);
  console.log(`   → OWNER of "Climate Change Research"`);
  console.log(`   → CONTRIBUTOR to "AI Research Papers 2026"`);
  console.log('');
  console.log(`4. Diana Martinez - diana@syncscript.com`);
  console.log(`   → OWNER of "Product Management Toolkit"`);
  console.log(`   → CONTRIBUTOR to "Climate Change Research"`);
  console.log('───────────────────────────────────────────\n');
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
