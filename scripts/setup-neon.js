#!/usr/bin/env node
/**
 * Neon PostgreSQL Setup Script
 * Fully automated: Prisma init, generate, db push, and connection verification.
 *
 * Usage: node scripts/setup-neon.js
 * Or:    DATABASE_URL="your-url" node scripts/setup-neon.js
 *
 * SECURITY: Prefer setting DATABASE_URL in .env (gitignored) rather than
 * hardcoding below. Do not commit real credentials to version control.
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Default connection string (override via DATABASE_URL env var)
const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_qtp93FuNHhJa@ep-crimson-flower-aifyyl9l-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Ensure schema=public is in the connection string
function ensureSchemaParam(url) {
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    if (!params.has('schema')) {
      params.set('schema', 'public');
    }
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

function log(msg, type = 'info') {
  const prefix = { info: '✓', error: '✗', warn: '⚠' }[type] || '•';
  console.log(`${prefix} ${msg}`);
}

function run(cmd, opts = {}) {
  const result = spawnSync(cmd, {
    shell: true,
    stdio: opts.silent ? 'pipe' : 'inherit',
    env: { ...process.env, ...opts.env },
    cwd: opts.cwd || process.cwd(),
  });
  if (result.status !== 0 && !opts.allowFail) {
    throw new Error(`Command failed: ${cmd}`);
  }
  return result;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  process.chdir(root);

  const rawUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  const databaseUrl = ensureSchemaParam(rawUrl);
  process.env.DATABASE_URL = databaseUrl;

  log('Neon PostgreSQL setup starting...', 'info');
  console.log('');

  try {
    // 1. Ensure Prisma CLI is available (npx auto-installs)
    log('Checking Prisma CLI...');
    run('npx prisma --version', { allowFail: true });
    log('Prisma CLI available');

    // 2. Initialize Prisma if needed
    const schemaPath = path.join(root, 'prisma', 'schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      log('Prisma not initialized. Running prisma init...');
      run('npx prisma init');
      log('Prisma initialized');
    } else {
      log('Prisma schema found at prisma/schema.prisma');
    }

    // 3. DATABASE_URL is already set above for child processes
    log('DATABASE_URL configured (with schema=public)');

    // 4. Generate Prisma client
    log('Generating Prisma client...');
    run('npx prisma generate');
    log('Prisma client generated');

    // 5. Push schema to Neon
    log('Pushing schema to Neon database...');
    run('npx prisma db push');
    log('Schema pushed successfully');

    // 6. Verify connection with test query
    log('Verifying database connection...');
    const verifyPath = path.join(root, '.verify-db.js');
    fs.writeFileSync(
      verifyPath,
      `const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const result = await prisma.$queryRaw\`SELECT NOW() as now\`;
    console.log('  Server time:', result[0].now);
  } catch (e) {
    console.error('  Error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
`
    );
    let verifyResult;
    try {
      verifyResult = run(`node "${verifyPath}"`, {
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    } finally {
      if (fs.existsSync(verifyPath)) fs.unlinkSync(verifyPath);
    }

    if (verifyResult.status !== 0) {
      throw new Error('Connection verification failed');
    }
    log('Connection verified');

    // 7. Success
    console.log('');
    log('Neon PostgreSQL setup completed successfully.', 'info');
  } catch (err) {
    console.log('');
    log(err.message || String(err), 'error');
    process.exit(1);
  }
}

main();
