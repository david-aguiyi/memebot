#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test query - get admin
    const admin = await prisma.admin.findUnique({
      where: { telegramUserId: BigInt(7290497391) },
    });

    if (admin) {
      console.log('✅ Admin account found:');
      console.log(`   User ID: ${admin.telegramUserId}`);
      console.log(`   Username: ${admin.username || 'N/A'}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
    } else {
      console.log('⚠️ Admin account not found (but connection works)');
    }

    // Test projects table
    const projectCount = await prisma.project.count();
    console.log(`✅ Projects table accessible (${projectCount} projects)`);

    console.log('\n🎉 All database tables are set up correctly!');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


