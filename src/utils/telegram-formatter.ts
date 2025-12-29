export class TelegramFormatter {
  static formatSuggestionCard(
    content: string,
    variants: string[] | null,
    riskScore?: number,
    contextVersion?: number
  ): string {
    let message = '📝 *Post Suggestion*\n\n';
    
    if (contextVersion) {
      message += `📌 Context Version: ${contextVersion}\n`;
    }

    if (riskScore !== undefined) {
      const riskEmoji = riskScore < 40 ? '🟢' : riskScore < 70 ? '🟡' : '🔴';
      message += `${riskEmoji} Risk Score: ${riskScore}/100\n\n`;
    }

    message += `*Primary:*\n${content}\n\n`;

    if (variants && variants.length > 0) {
      message += '*Alternatives:*\n';
      variants.forEach((variant, index) => {
        message += `${index + 1}. ${variant}\n`;
      });
    }

    return message;
  }

  static formatContextSummary(contextLayers: Array<{ version: number; content: string }>): string {
    if (contextLayers.length === 0) {
      return '📝 No context layers';
    }

    let message = `📝 *Context Summary* (${contextLayers.length} layers)\n\n`;
    
    contextLayers.forEach((layer, index) => {
      const preview = layer.content.length > 100 
        ? layer.content.substring(0, 100) + '...'
        : layer.content;
      message += `*v${layer.version}:* ${preview}\n\n`;
    });

    return message;
  }

  static formatProjectStatus(project: {
    name: string;
    postingEnabled: boolean;
    contextLayers?: Array<{ version: number }>;
  }): string {
    const status = project.postingEnabled ? '🟢 Enabled' : '🔴 Disabled';
    const contextCount = project.contextLayers?.length || 0;

    return (
      `📊 *Project: ${project.name}*\n\n` +
      `Posting: ${status}\n` +
      `Context Layers: ${contextCount}\n`
    );
  }

  static formatPostNotification(
    post: { content: string; xTweetId?: string; postedAt?: Date },
    isSimulation = false
  ): string {
    const prefix = isSimulation ? '📝 *[SIMULATION] Post Would Be Published*' : '✅ *Post Published*';
    let message = `${prefix}\n\n`;
    message += `${post.content}\n\n`;

    if (post.xTweetId) {
      if (isSimulation) {
        message += `🔗 Simulated Tweet ID: ${post.xTweetId}\n`;
        message += `ℹ️ Running in simulation mode - not posted to X/Twitter`;
      } else {
        message += `🔗 https://twitter.com/i/web/status/${post.xTweetId}`;
      }
    }

    if (post.postedAt) {
      message += `\n⏰ ${post.postedAt.toLocaleString()}`;
    }

    return message;
  }

  static formatError(error: string): string {
    return `❌ *Error*\n\n${error}`;
  }

  static formatSuccess(message: string): string {
    return `✅ ${message}`;
  }
}

