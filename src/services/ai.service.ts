import OpenAI from 'openai';
import env from '../config/env';
import logger from '../config/logger';
import projectService from './project.service';
import contextService from './context.service';
import { Project } from '@prisma/client';

export interface PostVariant {
  content: string;
  riskScore?: number;
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      organization: env.OPENAI_ORG_ID,
    });
  }

  async generatePostSuggestions(
    projectId: string,
    count: number = 3
  ): Promise<PostVariant[]> {
    try {
      const project = await projectService.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Get active context
      const contextLayers = await contextService.getActiveContext(projectId);
      const contextText = contextLayers
        .map((layer) => layer.content)
        .join('\n\n');

      // Get ephemeral vibe
      const vibe = await contextService.getEphemeralVibe(projectId);
      const vibeText = vibe ? `\n\nCurrent vibe: ${JSON.stringify(vibe)}` : '';

      // Compose prompt
      const prompt = this.composePrompt(project, contextText, vibeText);

      // Generate posts
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        n: count,
        temperature: 0.8,
        max_tokens: 280, // Twitter character limit
      });

      const variants: PostVariant[] = response.choices
        .map((choice) => ({
          content: choice.message.content?.trim() || '',
        }))
        .filter((variant) => variant.content.length > 0);

      logger.info('Post suggestions generated', {
        projectId,
        count: variants.length,
      });

      return variants;
    } catch (error) {
      logger.error('Failed to generate post suggestions', error);
      throw error;
    }
  }

  private composePrompt(
    project: Project,
    contextText: string,
    vibeText: string
  ): string {
    const personaConfig = project.personaConfig as Record<string, any> | null;
    const emojiUsage = personaConfig?.emojiUsage || 'moderate';
    const tone = personaConfig?.tone || 'friendly';

    return `
Generate ${3} social media post suggestions for the following project:

Project Name: ${project.name}
Base Description: ${project.baseDescription}

${contextText ? `Context Layers:\n${contextText}` : ''}
${vibeText}

Requirements:
- Tone: ${tone}
- Emoji usage: ${emojiUsage}
- Maximum 280 characters per post
- Engaging and authentic
- Aligned with the project's persona

Generate ${3} distinct variants, each with a slightly different angle or approach.
    `.trim();
  }

  private getSystemPrompt(): string {
    return `
You are an expert social media content creator. Your task is to generate engaging, authentic social media posts that align with a project's persona and context.

Safety Rules:
- Never generate harmful, offensive, or discriminatory content
- Avoid personal information or sensitive data
- Maintain a professional yet authentic tone
- Follow platform guidelines (X/Twitter)

Quality Standards:
- Posts should be engaging and shareable
- Use appropriate emojis based on persona configuration
- Keep within character limits
- Ensure posts are contextually relevant

Return only the post content, one per variant.
    `.trim();
  }

  async moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
  }> {
    try {
      const response = await this.openai.moderations.create({
        input: content,
      });

      const result = response.results[0];
      const categories: Record<string, boolean> = {};

      // Extract category flags
      Object.entries(result.categories).forEach(([key, value]) => {
        if (value) {
          categories[key] = true;
        }
      });

      return {
        flagged: result.flagged,
        categories,
      };
    } catch (error) {
      logger.error('Content moderation failed', error);
      // Fail open - don't block content if moderation fails
      return { flagged: false, categories: {} };
    }
  }
}

export default new AIService();


