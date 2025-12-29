import prisma from '../config/database';
import { Post } from '@prisma/client';
import logger from '../config/logger';
import xApiService from './x-api.service';
import postSuggestionService from './post-suggestion.service';
import safetyService from './safety.service';

export class PostService {
  async createFromSuggestion(suggestionId: string): Promise<Post> {
    try {
      const suggestion = await postSuggestionService.findById(suggestionId);
      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      if (suggestion.status !== 'approved') {
        throw new Error('Suggestion must be approved before posting');
      }

      // Final safety check before posting
      const safetyCheck = await safetyService.checkContent(suggestion.content);
      if (!safetyCheck.safe && safetyCheck.riskScore >= 70) {
        throw new Error(
          `Content failed safety check. Risk score: ${safetyCheck.riskScore}. Reasons: ${safetyCheck.reasons.join(', ')}`
        );
      }

      // Post to X
      const tweet = await xApiService.postTweet(suggestion.content);

      // Create post record
      const post = await prisma.post.create({
        data: {
          projectId: suggestion.projectId,
          contextVersion: suggestion.contextVersion,
          suggestionId: suggestion.id,
          xTweetId: tweet.id,
          content: tweet.text,
          status: 'posted',
          postedAt: new Date(),
        },
      });

      // Update suggestion status
      await prisma.postSuggestion.update({
        where: { id: suggestionId },
        data: { status: 'posted' },
      });

      logger.info('Post created and published', {
        postId: post.id,
        tweetId: tweet.id,
      });

      return post;
    } catch (error) {
      logger.error('Failed to create post from suggestion', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id },
      include: {
        project: true,
        suggestion: true,
      },
    });
  }

  async findByProject(projectId: string, limit = 20): Promise<Post[]> {
    return prisma.post.findMany({
      where: { projectId },
      orderBy: { postedAt: 'desc' },
      take: limit,
      include: {
        suggestion: true,
      },
    });
  }

  async deletePost(id: string): Promise<void> {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      // Delete from X if tweet ID exists
      if (post.xTweetId) {
        try {
          await xApiService.deleteTweet(post.xTweetId);
        } catch (error) {
          logger.warn('Failed to delete tweet from X, continuing with DB deletion', error);
        }
      }

      // Update status
      await prisma.post.update({
        where: { id },
        data: { status: 'deleted' },
      });

      logger.info('Post deleted', { postId: id });
    } catch (error) {
      logger.error('Failed to delete post', error);
      throw error;
    }
  }

  async getPostingQueue(projectId: string): Promise<Post[]> {
    // Get approved suggestions that haven't been posted yet
    const suggestions = await postSuggestionService.findPending(projectId);
    const approvedSuggestions = suggestions.filter((s) => s.status === 'approved');

    // Return posts that would be created from these suggestions
    // (This is a simplified version - in production, you'd use a proper queue)
    return [];
  }
}

export default new PostService();

