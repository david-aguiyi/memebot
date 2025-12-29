import prisma from '../config/database';
import redis from '../config/redis';
import { ContextLayer } from '@prisma/client';
import logger from '../config/logger';

export class ContextService {
  async addContext(
    projectId: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<ContextLayer> {
    try {
      // Get current max version for this project
      const maxVersion = await prisma.contextLayer.findFirst({
        where: { projectId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = (maxVersion?.version || 0) + 1;

      const contextLayer = await prisma.contextLayer.create({
        data: {
          projectId,
          version: nextVersion,
          content,
          metadata: metadata || {},
          status: 'pending',
        },
      });

      logger.info('Context layer added', { projectId, version: nextVersion });
      return contextLayer;
    } catch (error) {
      logger.error('Failed to add context layer', error);
      throw error;
    }
  }

  async approveContext(
    projectId: string,
    version: number,
    adminId: bigint
  ): Promise<ContextLayer> {
    try {
      const contextLayer = await prisma.contextLayer.update({
        where: {
          projectId_version: {
            projectId,
            version,
          },
        },
        data: {
          status: 'approved',
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      // Invalidate cache
      await this.invalidateContextCache(projectId);

      logger.info('Context layer approved', { projectId, version });
      return contextLayer;
    } catch (error) {
      logger.error('Failed to approve context layer', error);
      throw error;
    }
  }

  async rejectContext(projectId: string, version: number): Promise<ContextLayer> {
    try {
      const contextLayer = await prisma.contextLayer.update({
        where: {
          projectId_version: {
            projectId,
            version,
          },
        },
        data: {
          status: 'rejected',
        },
      });

      logger.info('Context layer rejected', { projectId, version });
      return contextLayer;
    } catch (error) {
      logger.error('Failed to reject context layer', error);
      throw error;
    }
  }

  async getActiveContext(projectId: string): Promise<ContextLayer[]> {
    // Try cache first
    const cacheKey = `context:project:${projectId}:active`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const contextLayers = await prisma.contextLayer.findMany({
      where: {
        projectId,
        status: 'approved',
      },
      orderBy: { version: 'asc' },
    });

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(contextLayers));

    return contextLayers;
  }

  async getContextHistory(projectId: string, limit = 10): Promise<ContextLayer[]> {
    return prisma.contextLayer.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
      take: limit,
    });
  }

  async getPendingContext(projectId: string): Promise<ContextLayer[]> {
    return prisma.contextLayer.findMany({
      where: {
        projectId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revertToVersion(projectId: string, targetVersion: number): Promise<void> {
    try {
      // Mark all versions after target as reverted
      await prisma.contextLayer.updateMany({
        where: {
          projectId,
          version: { gt: targetVersion },
          status: 'approved',
        },
        data: {
          status: 'reverted',
        },
      });

      // Invalidate cache
      await this.invalidateContextCache(projectId);

      logger.info('Reverted to version', { projectId, targetVersion });
    } catch (error) {
      logger.error('Failed to revert context', error);
      throw error;
    }
  }

  private async invalidateContextCache(projectId: string): Promise<void> {
    const cacheKey = `context:project:${projectId}:active`;
    await redis.del(cacheKey);
  }

  // Ephemeral vibe management
  async setEphemeralVibe(projectId: string, vibe: Record<string, any>): Promise<void> {
    const cacheKey = `vibe:project:${projectId}`;
    // TTL: 7 days
    await redis.setex(cacheKey, 7 * 24 * 60 * 60, JSON.stringify(vibe));
    logger.debug('Ephemeral vibe set', { projectId });
  }

  async getEphemeralVibe(projectId: string): Promise<Record<string, any> | null> {
    const cacheKey = `vibe:project:${projectId}`;
    const cached = await redis.get(cacheKey);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached);
  }

  async updateEphemeralVibe(
    projectId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const current = await this.getEphemeralVibe(projectId);
    const updated = { ...(current || {}), ...updates };
    await this.setEphemeralVibe(projectId, updated);
  }
}

export default new ContextService();

