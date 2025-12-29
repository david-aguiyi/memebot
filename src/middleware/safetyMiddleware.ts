import { Request, Response, NextFunction } from 'express';
import safetyService from '../services/safety.service';
import { AppError } from './errorHandler';

export const safetyCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check rate limit for safety checks
  const identifier = req.ip || 'unknown';
  const canProceed = await safetyService.checkRateLimit(identifier, 100, 15 * 60 * 1000);

  if (!canProceed) {
    throw new AppError(429, 'Too many safety check requests');
  }

  // If request body contains content, check it
  if (req.body?.content) {
    const safetyResult = await safetyService.checkContent(req.body.content);
    
    if (!safetyResult.safe && safetyResult.riskScore >= 70) {
      throw new AppError(400, `Content failed safety check: ${safetyResult.reasons.join(', ')}`);
    }

    // Attach safety result to request for downstream use
    req.body._safetyCheck = safetyResult;
  }

  next();
};


