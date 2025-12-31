import prisma from '../config/database';
import { AuditLog } from '@prisma/client';
import logger from '../config/logger';

export class AuditService {
  async log(
    adminId: bigint,
    actionType: string,
    actionData?: Record<string, any>,
    resourceType?: string,
    resourceId?: string
  ): Promise<AuditLog> {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          adminId,
          actionType,
          actionData: actionData || {},
          resourceType,
          resourceId,
        },
      });

      logger.debug('Audit log created', { actionType, adminId, resourceType, resourceId });
      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async findByAdmin(adminId: bigint, limit = 50): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { resourceType, resourceId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new AuditService();



