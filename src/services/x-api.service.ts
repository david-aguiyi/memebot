import { TwitterApi } from 'twitter-api-v2';
import env from '../config/env';
import logger from '../config/logger';

export class XAPIService {
  private client: TwitterApi | null = null;
  private simulationMode: boolean;

  constructor() {
    this.simulationMode = env.X_SIMULATION_MODE || !env.X_API_KEY;
    
    if (!this.simulationMode && env.X_API_KEY) {
      this.client = new TwitterApi({
        appKey: env.X_API_KEY,
        appSecret: env.X_API_SECRET || '',
        accessToken: env.X_ACCESS_TOKEN || '',
        accessSecret: env.X_ACCESS_TOKEN_SECRET || '',
      });
      logger.info('X API client initialized (production mode)');
    } else {
      logger.warn('X API running in SIMULATION MODE - posts will not be published to Twitter');
    }
  }

  async postTweet(content: string): Promise<{ id: string; text: string }> {
    try {
      // Validate content length
      if (content.length > 280) {
        throw new Error('Tweet content exceeds 280 characters');
      }

      // Simulation mode - don't actually post
      if (this.simulationMode || !this.client) {
        const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.info('📝 [SIMULATION] Tweet would be posted:', {
          simulatedId,
          content,
          contentLength: content.length,
        });
        
        return {
          id: simulatedId,
          text: content,
        };
      }

      // Real posting
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
      if (this.simulationMode || !this.client) {
        logger.info('📝 [SIMULATION] Tweet would be deleted:', { tweetId });
        return;
      }

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
      if (this.simulationMode || !this.client) {
        logger.info('📝 [SIMULATION] Would fetch tweet:', { tweetId });
        return {
          id: tweetId,
          text: '[Simulated tweet]',
          created_at: new Date().toISOString(),
        };
      }

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
      if (this.simulationMode || !this.client) {
        return {
          simulation: true,
          message: 'Running in simulation mode - no rate limits',
        };
      }

      const rateLimit = await this.client.v2.rateLimitStatus();
      return rateLimit;
    } catch (error: any) {
      logger.error('Failed to get rate limit status', error);
      return null;
    }
  }

  isSimulationMode(): boolean {
    return this.simulationMode;
  }
}

export default new XAPIService();

