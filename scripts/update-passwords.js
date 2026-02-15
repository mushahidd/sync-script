const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePasswords() {
  console.log('\n🔐 Updating user passwords...\n');

  try {
    // Default password for all demo users
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Update Alice
    await prisma.user.update({
      where: { email: 'alice@syncscript.com' },
      data: { password: hashedPassword },
    });
    console.log('✅ Updated password for Alice Johnson');

    // Update Bob
    await prisma.user.update({
      where: { email: 'bob@syncscript.com' },
      data: { password: hashedPassword },
    });
    console.log('✅ Updated password for Bob Smith');

    // Update Charlie
    await prisma.user.update({
      where: { email: 'charlie@syncscript.com' },
      data: { password: hashedPassword },
    });
    console.log('✅ Updated password for Charlie Davis');

    console.log('\n✨ All passwords updated successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━'.repeat(50));
    console.log('Email: alice@syncscript.com | Password: password123');
    console.log('Email: bob@syncscript.com   | Password: password123');
    console.log('Email: charlie@syncscript.com | Password: password123');
    console.log('━'.repeat(50));
    console.log('\n🔗 Login at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();
