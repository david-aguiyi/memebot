import prisma from '../config/database';
import { Admin } from '@prisma/client';
import logger from '../config/logger';

export class AdminService {
  async findOrCreate(telegramUserId: bigint, username?: string): Promise<Admin> {
    try {
      let admin = await prisma.admin.findUnique({
        where: { telegramUserId },
      });

      if (!admin) {
        admin = await prisma.admin.create({
          data: {
            telegramUserId,
            username,
            role: 'admin',
            isActive: true,
          },
        });
        logger.info('New admin created', { telegramUserId, username });
      } else if (!admin.isActive) {
        // Reactivate if previously deactivated
        admin = await prisma.admin.update({
          where: { telegramUserId },
          data: { isActive: true },
        });
        logger.info('Admin reactivated', { telegramUserId });
      }

      return admin;
    } catch (error) {
      logger.error('Failed to find or create admin', error);
      throw error;
    }
  }

  async findById(telegramUserId: bigint): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { telegramUserId },
    });
  }

  async isAdmin(telegramUserId: bigint): Promise<boolean> {
    const admin = await this.findById(telegramUserId);
    return admin !== null && admin.isActive;
  }

  async isSuperAdmin(telegramUserId: bigint): Promise<boolean> {
    const admin = await this.findById(telegramUserId);
    return admin !== null && admin.isActive && admin.role === 'super_admin';
  }

  async findAll(): Promise<Admin[]> {
    return prisma.admin.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivate(telegramUserId: bigint): Promise<void> {
    await prisma.admin.update({
      where: { telegramUserId },
      data: { isActive: false },
    });
    logger.info('Admin deactivated', { telegramUserId });
  }
}

export default new AdminService();

