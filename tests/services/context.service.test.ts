import contextService from '../../src/services/context.service';
import projectService from '../../src/services/project.service';
import prisma from '../../src/config/database';

describe('ContextService', () => {
  let projectId: string;

  beforeEach(async () => {
    await prisma.contextLayer.deleteMany();
    await prisma.project.deleteMany();

    const project = await projectService.create({
      name: 'Test Project',
      baseDescription: 'Test description',
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('addContext', () => {
    it('should add a new context layer', async () => {
      const layer = await contextService.addContext(projectId, 'Test context');

      expect(layer).toBeDefined();
      expect(layer.projectId).toBe(projectId);
      expect(layer.version).toBe(1);
      expect(layer.content).toBe('Test context');
      expect(layer.status).toBe('pending');
    });

    it('should increment version for subsequent layers', async () => {
      await contextService.addContext(projectId, 'First context');
      const second = await contextService.addContext(projectId, 'Second context');

      expect(second.version).toBe(2);
    });
  });

  describe('approveContext', () => {
    it('should approve a context layer', async () => {
      const layer = await contextService.addContext(projectId, 'Test context');
      const adminId = BigInt(123456789);

      const approved = await contextService.approveContext(projectId, layer.version, adminId);

      expect(approved.status).toBe('approved');
      expect(approved.approvedBy).toBe(adminId);
      expect(approved.approvedAt).toBeDefined();
    });
  });
});


