import telegramBot from '../handlers/telegram.bot';
import adminService from './admin.service';
import logger from '../config/logger';
import { TelegramFormatter } from '../utils/telegram-formatter';

export class NotificationService {
  async notifyAdmins(message: string, parseMode: 'Markdown' | 'HTML' = 'Markdown') {
    try {
      const admins = await adminService.findAll();
      const bot = telegramBot.getBot();

      for (const admin of admins) {
        try {
          await bot.telegram.sendMessage(
            Number(admin.telegramUserId),
            message,
            { parse_mode: parseMode }
          );
        } catch (error: any) {
          // Skip if user blocked bot or other errors
          if (error.code !== 403) {
            logger.warn('Failed to send notification to admin', {
              adminId: admin.telegramUserId,
              error: error.message,
            });
          }
        }
      }
    } catch (error) {
      logger.error('Failed to notify admins', error);
    }
  }

  async notifyPostPublished(post: {
    content: string;
    xTweetId?: string;
    postedAt?: Date;
  }) {
    const message = TelegramFormatter.formatPostNotification(post);
    await this.notifyAdmins(message);
  }

  async notifySafetyAlert(content: string, riskScore: number, reasons: string[]) {
    const message = `🚨 *Safety Alert*\n\n` +
      `Risk Score: ${riskScore}/100\n` +
      `Reasons: ${reasons.join(', ')}\n\n` +
      `Content: ${content.substring(0, 200)}...`;
    
    await this.notifyAdmins(message);
  }

  async notifyError(error: string) {
    const message = TelegramFormatter.formatError(error);
    await this.notifyAdmins(message);
  }
}

export default new NotificationService();

