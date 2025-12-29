import Queue from 'bull';
import redis from '../config/redis';
import logger from '../config/logger';
import postService from '../services/post.service';
import projectService from '../services/project.service';
import postSuggestionService from '../services/post-suggestion.service';

export const postingQueue = new Queue('posting', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

postingQueue.process(async (job) => {
  const { suggestionId } = job.data;

  try {
    logger.info('Processing posting job', { suggestionId, jobId: job.id });

    const post = await postService.createFromSuggestion(suggestionId);

    logger.info('Posting job completed', {
      suggestionId,
      postId: post.id,
      tweetId: post.xTweetId,
    });

    return { success: true, postId: post.id, tweetId: post.xTweetId };
  } catch (error: any) {
    logger.error('Posting job failed', {
      suggestionId,
      error: error.message,
      jobId: job.id,
    });
    throw error;
  }
});

// Schedule autonomous posting check
export async function scheduleAutonomousPosting() {
  try {
    const projects = await projectService.findAll();
    const enabledProjects = projects.filter((p) => p.postingEnabled);

    for (const project of enabledProjects) {
      // Get approved suggestions that haven't been posted
      const suggestions = await postSuggestionService.findPending(project.id);
      const approvedSuggestions = suggestions.filter((s) => s.status === 'approved');

      for (const suggestion of approvedSuggestions) {
        // Add to queue
        await postingQueue.add(
          {
            suggestionId: suggestion.id,
            projectId: project.id,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          }
        );

        logger.info('Added suggestion to posting queue', {
          suggestionId: suggestion.id,
          projectId: project.id,
        });
      }
    }
  } catch (error) {
    logger.error('Failed to schedule autonomous posting', error);
  }
}

// Run autonomous posting check every 5 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(scheduleAutonomousPosting, 5 * 60 * 1000);
  logger.info('Autonomous posting scheduler started');
}


