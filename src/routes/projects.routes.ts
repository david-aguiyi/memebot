import { Router } from 'express';
import projectService from '../services/project.service';
import { AppError } from '../middleware/errorHandler';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }));

// Get all projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await projectService.findAll();
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.findById(req.params.id);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', async (req, res, next) => {
  try {
    const { name, baseDescription, personaConfig } = req.body;

    if (!name || !baseDescription) {
      throw new AppError(400, 'Name and baseDescription are required');
    }

    const project = await projectService.create({
      name,
      baseDescription,
      personaConfig,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// Update project
router.patch('/:id', async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    await projectService.delete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

// Toggle posting
router.patch('/:id/posting', async (req, res, next) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      throw new AppError(400, 'enabled must be a boolean');
    }

    const project = await projectService.togglePosting(req.params.id, enabled);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

export default router;

