import prisma from '../config/database';
import { Project, Prisma } from '@prisma/client';
import logger from '../config/logger';
import env from '../config/env';

export class ProjectService {
  async create(data: {
    name: string;
    baseDescription: string;
    personaConfig?: Record<string, any>;
  }): Promise<Project> {
    try {
      const personaData = data.personaConfig ?? {};
        data: {
          name: data.name,
          baseDescription: data.baseDescription,
<<<<<<< HEAD
<<<<<<< Updated upstream
          personaConfig: data.personaConfig || {},
=======
          personaConfig:
            env.NODE_ENV === 'test' ? JSON.stringify(personaData) : (personaData as any),
>>>>>>> Stashed changes
=======
          personaConfig: env.NODE_ENV === 'test' ? JSON.stringify(personaData) : (personaData as any),
>>>>>>> test/sqlite-test-schema
        },
      });

      logger.info('Project created', { projectId: project.id, name: project.name });
      return project;
    } catch (error) {
      logger.error('Failed to create project', error);
      throw error;
    }
  }
      const project = await prisma.project.create({
        data: {
          name: data.name,
          baseDescription: data.baseDescription,
          personaConfig: env.NODE_ENV === 'test' ? JSON.stringify(personaData) : (personaData as any),
        },
      });

      logger.info('Project created', { projectId: project.id, name: project.name });
      return project;
    } catch (error) {
      logger.error('Failed to create project', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        contextLayers: {
          where: { status: 'approved' },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findAll(): Promise<Project[]> {
    return prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      baseDescription: string;
      personaConfig: Record<string, any>;
      postingEnabled: boolean;
    }>
  ): Promise<Project> {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('Project updated', { projectId: project.id });
      return project;
    } catch (error) {
      logger.error('Failed to update project', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.project.delete({
        where: { id },
      });

      logger.info('Project deleted', { projectId: id });
    } catch (error) {
      logger.error('Failed to delete project', error);
      throw error;
    }
  }

  async togglePosting(id: string, enabled: boolean): Promise<Project> {
    return this.update(id, { postingEnabled: enabled });
  }
}

export default new ProjectService();
<<<<<<< Updated upstream


<<<<<<< HEAD
=======
>>>>>>> Stashed changes
=======

>>>>>>> test/sqlite-test-schema
