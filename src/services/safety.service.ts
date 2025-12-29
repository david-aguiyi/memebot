import logger from '../config/logger';
import aiService from './ai.service';
import redis from '../config/redis';

export interface SafetyCheckResult {
  safe: boolean;
  riskScore: number;
  reasons: string[];
  categories?: Record<string, boolean>;
}

export class SafetyService {
  private blocklist: Set<string> = new Set();

  constructor() {
    // Initialize blocklist (in production, load from database or config)
    this.blocklist = new Set([
      // Add common problematic terms
      // This should be loaded from a database or config file
    ]);
  }

  async checkContent(content: string): Promise<SafetyCheckResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check 1: Blocklist
    const blocklistViolations = this.checkBlocklist(content);
    if (blocklistViolations.length > 0) {
      riskScore += 50;
      reasons.push(`Blocklist violations: ${blocklistViolations.join(', ')}`);
    }

    // Check 2: OpenAI Moderation
    const moderationResult = await aiService.moderateContent(content);
    if (moderationResult.flagged) {
      riskScore += 70;
      reasons.push('Content flagged by moderation API');
      const flaggedCategories = Object.keys(moderationResult.categories).filter(
        (key) => moderationResult.categories[key]
      );
      if (flaggedCategories.length > 0) {
        reasons.push(`Flagged categories: ${flaggedCategories.join(', ')}`);
      }
    }

    // Check 3: PII Detection (basic)
    const piiDetected = this.detectPII(content);
    if (piiDetected.length > 0) {
      riskScore += 60;
      reasons.push(`Potential PII detected: ${piiDetected.join(', ')}`);
    }

    // Check 4: Length validation
    if (content.length > 280) {
      riskScore += 10;
      reasons.push('Content exceeds character limit');
    }

    const safe = riskScore < 40;

    return {
      safe,
      riskScore: Math.min(riskScore, 100),
      reasons,
      categories: moderationResult.categories,
    };
  }

  private checkBlocklist(content: string): string[] {
    const violations: string[] = [];
    const lowerContent = content.toLowerCase();

    this.blocklist.forEach((term) => {
      if (lowerContent.includes(term.toLowerCase())) {
        violations.push(term);
      }
    });

    return violations;
  }

  private detectPII(content: string): string[] {
    const piiPatterns: Array<{ pattern: RegExp; type: string }> = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN' },
      { pattern: /\b\d{3}\.\d{3}\.\d{4}\b/, type: 'SSN' },
      { pattern: /\b\d{10}\b/, type: 'Phone Number' },
      { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, type: 'Credit Card' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: 'Email' },
    ];

    const detected: string[] = [];
    piiPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(content)) {
        detected.push(type);
      }
    });

    return detected;
  }

  async scoreRisk(content: string): Promise<number> {
    const result = await this.checkContent(content);
    return result.riskScore;
  }

  async requiresHumanReview(content: string): Promise<boolean> {
    const result = await this.checkContent(content);
    return result.riskScore >= 40;
  }

  // Rate limiting for safety checks
  async checkRateLimit(identifier: string, maxChecks: number, windowMs: number): Promise<boolean> {
    const key = `safety:ratelimit:${identifier}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return count <= maxChecks;
  }
}

export default new SafetyService();

