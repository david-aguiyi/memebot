#!/usr/bin/env ts-node

/**
 * Script to add an admin user to the database
 * Usage: npm run setup-admin <telegram_user_id> [username] [role]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: npm run setup-admin <telegram_user_id> [username] [role]');
    console.error('Example: npm run setup-admin 123456789 myusername admin');
    process.exit(1);
  }

  const telegramUserId = BigInt(args[0]);
  const username = args[1] || null;
  const role = args[2] || 'admin';

  try {
    const admin = await prisma.admin.upsert({
      where: { telegramUserId },
      update: {
        username,
        role,
        isActive: true,
      },
      create: {
        telegramUserId,
        username,
        role,
        isActive: true,
      },
    });

    console.log('✅ Admin created/updated successfully!');
    console.log(`   User ID: ${admin.telegramUserId}`);
    console.log(`   Username: ${admin.username || 'N/A'}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();



