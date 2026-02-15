// Simple connection test
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_qtp93FuNHhJa@ep-crimson-flower-aifyyl9l-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing database connection...');
  console.log('URL:', process.env.DATABASE_URL.split('@')[1]);
  
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connected successfully!', result);
    
    const userCount = await prisma.user.count();
    console.log('Current user count:', userCount);
  } catch (e) {
    console.error('❌ Connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
