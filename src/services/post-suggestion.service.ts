import prisma from '../config/database';
import { PostSuggestion } from '@prisma/client';
import logger from '../config/logger';
import aiService, { PostVariant } from './ai.service';
import safetyService from './safety.service';

export class PostSuggestionService {
  async generateSuggestions(projectId: string): Promise<PostSuggestion> {
    try {
      // Get current context version
      const contextLayers = await prisma.contextLayer.findMany({
        where: {
          projectId,
          status: 'approved',
        },
        orderBy: { version: 'desc' },
        take: 1,
      });

      const contextVersion = contextLayers.length > 0 ? contextLayers[0].version : 0;

      // Generate AI suggestions
      const variants = await aiService.generatePostSuggestions(projectId, 3);

      if (variants.length === 0) {
        throw new Error('No variants generated');
      }

      // Use first variant as primary content
      const primaryContent = variants[0].content;
      const otherVariants = variants.slice(1).map((v) => v.content);

      // Safety check
      const safetyCheck = await safetyService.checkContent(primaryContent);
      const requiresReview = await safetyService.requiresHumanReview(primaryContent);

      // Create suggestion with safety metadata
      const suggestion = await prisma.postSuggestion.create({
        data: {
          projectId,
          contextVersion,
          content: primaryContent,
          variants: otherVariants,
          status: requiresReview ? 'pending_review' : 'pending',
          metadata: {
            safetyCheck: {
              riskScore: safetyCheck.riskScore,
              safe: safetyCheck.safe,
              reasons: safetyCheck.reasons,
            },
          },
        },
      });

      logger.info('Post suggestion created', {
        suggestionId: suggestion.id,
        projectId,
      });

      return suggestion;
    } catch (error) {
      logger.error('Failed to generate post suggestions', error);
      throw error;
    }
  }

  async findById(id: string): Promise<PostSuggestion | null> {
    return prisma.postSuggestion.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  async approve(id: string, adminId: bigint): Promise<PostSuggestion> {
    try {
      const suggestion = await prisma.postSuggestion.update({
        where: { id },
        data: {
          status: 'approved',
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      logger.info('Post suggestion approved', { suggestionId: id });
      return suggestion;
    } catch (error) {
      logger.error('Failed to approve suggestion', error);
      throw error;
    }
  }

  async reject(id: string): Promise<PostSuggestion> {
    try {
      const suggestion = await prisma.postSuggestion.update({
        where: { id },
        data: {
          status: 'rejected',
        },
      });

      logger.info('Post suggestion rejected', { suggestionId: id });
      return suggestion;
    } catch (error) {
      logger.error('Failed to reject suggestion', error);
      throw error;
    }
  }

  async findByProject(projectId: string, limit = 10): Promise<PostSuggestion[]> {
    return prisma.postSuggestion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findPending(projectId?: string): Promise<PostSuggestion[]> {
    return prisma.postSuggestion.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
      },
    });
  }
}

export default new PostSuggestionService();

