#!/usr/bin/env node

/**
 * SyncScript Database Setup Script
 * Runs all necessary steps to initialize the database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.blue}▶ ${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✓ ${description} completed${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`, colors.red);
    return false;
  }
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log(`\n${colors.yellow}⚠ Warning: .env file not found${colors.reset}`);
    log('Please create a .env file with your DATABASE_URL');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (!envContent.includes('DATABASE_URL')) {
    log(`\n${colors.yellow}⚠ Warning: DATABASE_URL not found in .env${colors.reset}`);
    return false;
  }

  log(`${colors.green}✓ .env file configured${colors.reset}`);
  return true;
}

async function main() {
  log(`\n${'='.repeat(50)}`, colors.bright);
  log(`  🚀 SyncScript Database Setup`, colors.bright);
  log(`${'='.repeat(50)}\n`, colors.bright);

  // Step 1: Check .env
  log(`${colors.bright}Step 1: Checking configuration...${colors.reset}`);
  if (!checkEnvFile()) {
    log(`\n${colors.red}Please configure your .env file first.${colors.reset}`);
    log('Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/syncscript"\n');
    process.exit(1);
  }

  // Step 2: Install dependencies
  log(`\n${colors.bright}Step 2: Installing dependencies...${colors.reset}`);
  if (!runCommand('npm install', 'Install dependencies')) {
    process.exit(1);
  }

  // Step 3: Generate Prisma Client
  log(`\n${colors.bright}Step 3: Generating Prisma Client...${colors.reset}`);
  if (!runCommand('npx prisma generate', 'Generate Prisma Client')) {
    process.exit(1);
  }

  // Step 4: Push schema to database
  log(`\n${colors.bright}Step 4: Creating database tables...${colors.reset}`);
  if (!runCommand('npx prisma db push', 'Push schema to database')) {
    process.exit(1);
  }

  // Step 5: Seed database
  log(`\n${colors.bright}Step 5: Seeding database with demo data...${colors.reset}`);
  runCommand('npx tsx prisma/seed.ts', 'Seed database');

  // Success!
  log(`\n${'='.repeat(50)}`, colors.green);
  log(`  ✅ Database setup completed successfully!`, colors.green);
  log(`${'='.repeat(50)}\n`, colors.green);

  log(`${colors.bright}Next steps:${colors.reset}`);
  log('  1. Run: npm run dev');
  log('  2. Open: http://localhost:3000');
  log('  3. View DB: npm run db:studio\n');

  log(`${colors.bright}Useful commands:${colors.reset}`);
  log('  npm run db:studio  - Open database GUI');
  log('  npm run db:seed    - Re-seed database');
  log('  npm run dev        - Start dev server\n');
}

main().catch((error) => {
  log(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
