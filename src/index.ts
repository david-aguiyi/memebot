import express from 'express';
import logger from './config/logger';
import env from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import projectRoutes from './routes/projects.routes';
import telegramBot from './handlers/telegram.bot';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/projects', projectRoutes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, async () => {
  logger.info(`🚀 MemeBot server started on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);

  // Start Telegram bot
  try {
    await telegramBot.start();
  } catch (error) {
    logger.error('Failed to start Telegram bot', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await telegramBot.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await telegramBot.stop();
  process.exit(0);
});
