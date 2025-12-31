import projectService from '../../src/services/project.service';
import prisma from '../../src/config/database';

describe('ProjectService', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.project.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const project = await projectService.create({
        name: 'Test Project',
        baseDescription: 'Test description',
      });

      expect(project).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.baseDescription).toBe('Test description');
      expect(project.postingEnabled).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find project by id', async () => {
      const created = await projectService.create({
        name: 'Test Project',
        baseDescription: 'Test description',
      });

      const found = await projectService.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return null if project not found', async () => {
      const found = await projectService.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('togglePosting', () => {
    it('should toggle posting status', async () => {
      const project = await projectService.create({
        name: 'Test Project',
        baseDescription: 'Test description',
      });

      const updated = await projectService.togglePosting(project.id, true);
      expect(updated.postingEnabled).toBe(true);

      const updated2 = await projectService.togglePosting(project.id, false);
      expect(updated2.postingEnabled).toBe(false);
    });
  });
});



