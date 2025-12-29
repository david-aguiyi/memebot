import { TwitterApi } from 'twitter-api-v2';
import env from '../config/env';
import logger from '../config/logger';

export class XAPIService {
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      appKey: env.X_API_KEY,
      appSecret: env.X_API_SECRET,
      accessToken: env.X_ACCESS_TOKEN,
      accessSecret: env.X_ACCESS_TOKEN_SECRET,
    });
  }

  async postTweet(content: string): Promise<{ id: string; text: string }> {
    try {
      // Validate content length
      if (content.length > 280) {
        throw new Error('Tweet content exceeds 280 characters');
      }

      const tweet = await this.client.v2.tweet({
        text: content,
      });

      logger.info('Tweet posted successfully', {
        tweetId: tweet.data.id,
        contentLength: content.length,
      });

      return {
        id: tweet.data.id,
        text: tweet.data.text || content,
      };
    } catch (error: any) {
      logger.error('Failed to post tweet', {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }

  async deleteTweet(tweetId: string): Promise<void> {
    try {
      await this.client.v2.deleteTweet(tweetId);
      logger.info('Tweet deleted', { tweetId });
    } catch (error: any) {
      logger.error('Failed to delete tweet', {
        error: error.message,
        tweetId,
      });
      throw error;
    }
  }

  async getTweet(tweetId: string): Promise<any> {
    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['created_at', 'text', 'public_metrics'],
      });
      return tweet.data;
    } catch (error: any) {
      logger.error('Failed to get tweet', {
        error: error.message,
        tweetId,
      });
      throw error;
    }
  }

  async getRateLimitStatus(): Promise<any> {
    try {
      const rateLimit = await this.client.v2.rateLimitStatus();
      return rateLimit;
    } catch (error: any) {
      logger.error('Failed to get rate limit status', error);
      return null;
    }
  }
}

export default new XAPIService();

