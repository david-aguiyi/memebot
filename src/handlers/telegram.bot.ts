import { Telegraf, Context, Markup } from 'telegraf';
import env from '../config/env';
import logger from '../config/logger';
import adminService from '../services/admin.service';
import auditService from '../services/audit.service';
import projectService from '../services/project.service';
import contextService from '../services/context.service';
import postSuggestionService from '../services/post-suggestion.service';
import postService from '../services/post.service';
import { postingQueue } from '../jobs/posting.job';
import { TelegramFormatter } from '../utils/telegram-formatter';
import { AppError } from '../middleware/errorHandler';

export class TelegramBot {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupCommands();
    this.setupCallbacks();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId) {
        return;
      }

      const isAdmin = await adminService.isAdmin(BigInt(userId));
      if (!isAdmin && ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text;
        // Allow /start for onboarding
        if (!text.startsWith('/start')) {
          await ctx.reply('❌ You are not authorized to use this bot.');
          return;
        }
      }

      // Create or update admin record
      if (userId) {
        await adminService.findOrCreate(
          BigInt(userId),
          ctx.from?.username || undefined
        );
      }

      return next();
    });
  }

  private setupCommands() {
    // Start command
    this.bot.command('start', async (ctx) => {
      const userId = BigInt(ctx.from.id);
      await adminService.findOrCreate(userId, ctx.from.username);
      await ctx.reply(
        '👋 Welcome to MemeBot!\n\n' +
        'Use /help to see all available commands.'
      );
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      const helpText = `
📚 *MemeBot Commands*

*Posting Control:*
/posting_on - Enable autonomous posting
/posting_off - Disable autonomous posting
/posting_status - Check posting status

*Context Management:*
/context_view - View current context
/context_add <text> - Add new context layer
/context_approve <version> - Approve context layer
/context_revert <version> - Revert to previous version

*Post Suggestions:*
/suggest_post - Generate post suggestions

*Project Management:*
/projects - List all projects
/project <id> - View project details

Use inline buttons to interact with suggestions.
      `;
      await ctx.reply(helpText, { parse_mode: 'Markdown' });
    });

    // Posting control commands
    this.bot.command('posting_on', async (ctx) => {
      await this.handlePostingToggle(ctx, true);
    });

    this.bot.command('posting_off', async (ctx) => {
      await this.handlePostingToggle(ctx, false);
    });

    this.bot.command('posting_status', async (ctx) => {
      await this.handlePostingStatus(ctx);
    });

    // Context management commands
    this.bot.command('context_view', async (ctx) => {
      await this.handleContextView(ctx);
    });

    this.bot.command('context_add', async (ctx) => {
      await this.handleContextAdd(ctx);
    });

    this.bot.command('context_approve', async (ctx) => {
      await this.handleContextApprove(ctx);
    });

    this.bot.command('context_revert', async (ctx) => {
      await this.handleContextRevert(ctx);
    });

    // Post suggestions
    this.bot.command('suggest_post', async (ctx) => {
      await this.handleSuggestPost(ctx);
    });

    // Projects
    this.bot.command('projects', async (ctx) => {
      await this.handleProjectsList(ctx);
    });
  }

  private setupCallbacks() {
    // Handle inline button callbacks
    this.bot.action(/^approve:(.+)$/, async (ctx) => {
      await ctx.answerCbQuery();
      const suggestionId = ctx.match[1];
      await this.handleSuggestionApprove(ctx, suggestionId);
    });

    this.bot.action(/^reject:(.+)$/, async (ctx) => {
      await ctx.answerCbQuery();
      const suggestionId = ctx.match[1];
      await this.handleSuggestionReject(ctx, suggestionId);
    });

    this.bot.action(/^edit:(.+)$/, async (ctx) => {
      await ctx.answerCbQuery('Edit functionality coming soon');
    });

    this.bot.action(/^regenerate:(.+)$/, async (ctx) => {
      await ctx.answerCbQuery('Regenerate functionality coming soon');
    });

    // Context approval callbacks
    this.bot.action(/^context_approve:(.+):(.+)$/, async (ctx) => {
      await ctx.answerCbQuery();
      const projectId = ctx.match[1];
      const version = parseInt(ctx.match[2]);
      await this.handleContextApproveAction(ctx, projectId, version);
    });

    this.bot.action(/^context_reject:(.+):(.+)$/, async (ctx) => {
      await ctx.answerCbQuery();
      const projectId = ctx.match[1];
      const version = parseInt(ctx.match[2]);
      await this.handleContextRejectAction(ctx, projectId, version);
    });
  }

  private setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      logger.error('Telegram bot error', {
        error: err.message,
        stack: err.stack,
        update: ctx.update,
      });

      ctx.reply('❌ An error occurred. Please try again later.');
    });
  }

  // Command handlers
  private async handlePostingToggle(ctx: Context, enabled: boolean) {
    try {
      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found. Create a project first.');
        return;
      }

      const project = projects[0];
      await projectService.togglePosting(project.id, enabled);
      await auditService.log(
        BigInt(ctx.from!.id),
        enabled ? 'posting_enabled' : 'posting_disabled',
        { projectId: project.id }
      );

      await ctx.reply(
        `✅ Autonomous posting ${enabled ? 'enabled' : 'disabled'} for project: ${project.name}`
      );
    } catch (error) {
      logger.error('Failed to toggle posting', error);
      await ctx.reply('❌ Failed to toggle posting status.');
    }
  }

  private async handlePostingStatus(ctx: Context) {
    try {
      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found.');
        return;
      }

      const project = projects[0];
      const status = project.postingEnabled ? '🟢 Enabled' : '🔴 Disabled';
      await ctx.reply(`📊 Posting Status: ${status}\n\nProject: ${project.name}`);
    } catch (error) {
      logger.error('Failed to get posting status', error);
      await ctx.reply('❌ Failed to get posting status.');
    }
  }

  private async handleContextView(ctx: Context) {
    try {
      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found.');
        return;
      }

      const project = projects[0];
      const contextLayers = await contextService.getActiveContext(project.id);

      if (contextLayers.length === 0) {
        await ctx.reply('📝 No approved context layers found.');
        return;
      }

      const message = TelegramFormatter.formatContextSummary(
        contextLayers.map((l) => ({ version: l.version, content: l.content }))
      );

      await ctx.reply(
        `📝 *Active Context for ${project.name}:*\n\n${message}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('Failed to view context', error);
      await ctx.reply('❌ Failed to view context.');
    }
  }

  private async handleContextAdd(ctx: Context) {
    try {
      const text = ctx.message && 'text' in ctx.message
        ? ctx.message.text.replace('/context_add', '').trim()
        : '';

      if (!text) {
        await ctx.reply('❌ Please provide context text.\nUsage: /context_add <text>');
        return;
      }

      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found. Create a project first.');
        return;
      }

      const project = projects[0];
      const contextLayer = await contextService.addContext(project.id, text);

      await auditService.log(
        BigInt(ctx.from!.id),
        'context_added',
        { projectId: project.id, version: contextLayer.version },
        'context_layer',
        contextLayer.id
      );

      await ctx.reply(
        `✅ Context layer added (Version ${contextLayer.version})\n\n` +
        `Status: ⏳ Pending approval\n\n` +
        `Use /context_approve ${contextLayer.version} to approve.`
      );
    } catch (error) {
      logger.error('Failed to add context', error);
      await ctx.reply('❌ Failed to add context.');
    }
  }

  private async handleContextApprove(ctx: Context) {
    try {
      const text = ctx.message && 'text' in ctx.message
        ? ctx.message.text.replace('/context_approve', '').trim()
        : '';

      const version = parseInt(text);
      if (isNaN(version)) {
        await ctx.reply('❌ Please provide a version number.\nUsage: /context_approve <version>');
        return;
      }

      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found.');
        return;
      }

      const project = projects[0];
      const contextLayer = await contextService.approveContext(
        project.id,
        version,
        BigInt(ctx.from!.id)
      );

      await auditService.log(
        BigInt(ctx.from!.id),
        'context_approved',
        { projectId: project.id, version },
        'context_layer',
        contextLayer.id
      );

      await ctx.reply(`✅ Context layer version ${version} approved!`);
    } catch (error) {
      logger.error('Failed to approve context', error);
      await ctx.reply('❌ Failed to approve context. Check if version exists.');
    }
  }

  private async handleContextRevert(ctx: Context) {
    try {
      const text = ctx.message && 'text' in ctx.message
        ? ctx.message.text.replace('/context_revert', '').trim()
        : '';

      const version = parseInt(text);
      if (isNaN(version)) {
        await ctx.reply('❌ Please provide a version number.\nUsage: /context_revert <version>');
        return;
      }

      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found.');
        return;
      }

      const project = projects[0];
      await contextService.revertToVersion(project.id, version);

      await auditService.log(
        BigInt(ctx.from!.id),
        'context_reverted',
        { projectId: project.id, targetVersion: version }
      );

      await ctx.reply(`✅ Reverted to context version ${version}`);
    } catch (error) {
      logger.error('Failed to revert context', error);
      await ctx.reply('❌ Failed to revert context.');
    }
  }

  private async handleSuggestPost(ctx: Context) {
    try {
      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('❌ No projects found. Create a project first.');
        return;
      }

      const project = projects[0];

      // Show generating message
      const generatingMsg = await ctx.reply('🤖 Generating post suggestions...');

      // Generate suggestions
      const suggestion = await postSuggestionService.generateSuggestions(project.id);

      await auditService.log(
        BigInt(ctx.from!.id),
        'post_suggestion_generated',
        { projectId: project.id, suggestionId: suggestion.id },
        'post_suggestion',
        suggestion.id
      );

      // Format message with enhanced UX
      const variants = suggestion.variants as string[] | null;
      const metadata = suggestion.metadata as { safetyCheck?: { riskScore?: number } } | null;
      const riskScore = metadata?.safetyCheck?.riskScore;

      const message = TelegramFormatter.formatSuggestionCard(
        suggestion.content,
        variants,
        riskScore,
        suggestion.contextVersion
      );

      // Delete generating message and send result
      await ctx.telegram.deleteMessage(ctx.chat!.id, generatingMsg.message_id);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...this.createSuggestionKeyboard(suggestion.id),
      });
    } catch (error) {
      logger.error('Failed to suggest post', error);
      await ctx.reply('❌ Failed to generate post suggestions. Please try again.');
    }
  }

  private async handleProjectsList(ctx: Context) {
    try {
      const projects = await projectService.findAll();
      if (projects.length === 0) {
        await ctx.reply('📋 No projects found.');
        return;
      }

      const projectList = projects
        .map((p, i) => `${i + 1}. ${p.name} (${p.postingEnabled ? '🟢' : '🔴'})`)
        .join('\n');

      await ctx.reply(`📋 *Projects:*\n\n${projectList}`, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Failed to list projects', error);
      await ctx.reply('❌ Failed to list projects.');
    }
  }

  private async handleSuggestionApprove(ctx: Context, suggestionId: string) {
    try {
      const suggestion = await postSuggestionService.findById(suggestionId);
      if (!suggestion) {
        await ctx.answerCbQuery('❌ Suggestion not found');
        return;
      }

      await postSuggestionService.approve(suggestionId, BigInt(ctx.from!.id));

      await auditService.log(
        BigInt(ctx.from!.id),
        'post_suggestion_approved',
        { suggestionId },
        'post_suggestion',
        suggestionId
      );

      // Check if autonomous posting is enabled
      const project = await projectService.findById(suggestion.projectId);
      const willAutoPost = project?.postingEnabled || false;

      const xApiService = (await import('../services/x-api.service')).default;
      const isSimulation = xApiService.isSimulationMode();
      
      let message = `✅ Post suggestion approved!\n\n${suggestion.content}\n\n`;
      if (willAutoPost) {
        if (isSimulation) {
          message += `📝 Will be posted (SIMULATION MODE - not actually posted to X/Twitter)`;
        } else {
          message += `🔄 Will be posted automatically to X/Twitter.`;
        }
        // Add to posting queue
        await postingQueue.add({
          suggestionId: suggestion.id,
          projectId: suggestion.projectId,
        });
      } else {
        message += `⚠️ Autonomous posting is disabled. Enable with /posting_on to auto-post.`;
      }

      await ctx.editMessageText(message);
    } catch (error) {
      logger.error('Failed to approve suggestion', error);
      await ctx.answerCbQuery('❌ Failed to approve');
    }
  }

  private async handleSuggestionReject(ctx: Context, suggestionId: string) {
    try {
      await postSuggestionService.reject(suggestionId);

      await auditService.log(
        BigInt(ctx.from!.id),
        'post_suggestion_rejected',
        { suggestionId },
        'post_suggestion',
        suggestionId
      );

      await ctx.editMessageText('❌ Post suggestion rejected.');
    } catch (error) {
      logger.error('Failed to reject suggestion', error);
      await ctx.answerCbQuery('❌ Failed to reject');
    }
  }

  private async handleContextApproveAction(ctx: Context, projectId: string, version: number) {
    try {
      const contextLayer = await contextService.approveContext(
        projectId,
        version,
        BigInt(ctx.from!.id)
      );

      await auditService.log(
        BigInt(ctx.from!.id),
        'context_approved',
        { projectId, version },
        'context_layer',
        contextLayer.id
      );

      await ctx.editMessageText(`✅ Context layer version ${version} approved!`);
    } catch (error) {
      logger.error('Failed to approve context via action', error);
      await ctx.answerCbQuery('❌ Failed to approve');
    }
  }

  private async handleContextRejectAction(ctx: Context, projectId: string, version: number) {
    try {
      await contextService.rejectContext(projectId, version);
      await ctx.editMessageText(`❌ Context layer version ${version} rejected.`);
    } catch (error) {
      logger.error('Failed to reject context via action', error);
      await ctx.answerCbQuery('❌ Failed to reject');
    }
  }

  // Utility method to create inline keyboard for suggestions
  createSuggestionKeyboard(suggestionId: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Approve', `approve:${suggestionId}`),
        Markup.button.callback('✏️ Edit', `edit:${suggestionId}`),
      ],
      [
        Markup.button.callback('🔁 Regenerate', `regenerate:${suggestionId}`),
        Markup.button.callback('❌ Reject', `reject:${suggestionId}`),
      ],
    ]);
  }

  async start() {
    if (env.NODE_ENV === 'production') {
      // Webhook mode for production
      const webhookUrl = process.env.WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('WEBHOOK_URL is required in production');
      }
      await this.bot.telegram.setWebhook(webhookUrl);
      logger.info('Telegram bot webhook set', { url: webhookUrl });
    } else {
      // Long polling for development
      this.bot.launch();
      logger.info('Telegram bot started (long polling)');
    }
  }

  async stop() {
    this.bot.stop();
    logger.info('Telegram bot stopped');
  }

  getBot() {
    return this.bot;
  }
}

export default new TelegramBot();
