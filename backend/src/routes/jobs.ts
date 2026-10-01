import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken, AuthRequest } from './auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

// Get all jobs with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    
    const where: Prisma.JobWhereInput = { status: 'open' };
    
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { organization: { contains: String(search) } }
      ];
    }
    
    if (type) {
      where.type = String(type);
    }
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { requirements: true }
      }),
      prisma.job.count({ where })
    ]);
    
    const formattedJobs = jobs.map(job => ({
      ...job,
      requirements: job.requirements ? job.requirements.map((r: any) => r.name) : []
    }));

    res.json({
      jobs: formattedJobs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get a specific job
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { requirements: true }
    });
    
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    res.json({
      ...job,
      requirements: job.requirements ? job.requirements.map((r: any) => r.name) : []
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    organization: z.string().optional(),
    requirements: z.union([z.string(), z.array(z.string())]).optional(),
    location: z.string().optional(),
    compensation: z.string().optional(),
    type: z.string().optional()
  })
});

router.post('/', validateRequest(createJobSchema), async (req: Request, res: Response) => {
  try {
    const { title, organization, description, requirements, location, compensation, type } = req.body;

    const reqArray = Array.isArray(requirements) ? requirements : (requirements ? String(requirements).split(',').map(s => s.trim()).filter(Boolean) : []);

    const job = await prisma.job.create({
      data: {
        title,
        organization,
        description,
        requirements: {
          connectOrCreate: reqArray.map(req => ({
            where: { name: req },
            create: { name: req }
          }))
        },
        location,
        compensation,
        type: type || 'full-time'
      },
      include: { requirements: true }
    });
    res.status(201).json({
      ...job,
      requirements: job.requirements ? job.requirements.map((r: any) => r.name) : []
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

const applyJobSchema = z.object({
  body: z.object({
    resumeLink: z.string().url().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  })
});

router.post('/:id/apply', authenticateToken, validateRequest(applyJobSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { resumeLink } = req.body;
    const userId = req.user?.userId;
    const jobId = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    // Check if user already applied
    const existing = await prisma.application.findFirst({
      where: { jobId, userId }
    });
    
    if (existing) {
      res.status(400).json({ error: 'You have already applied to this job' });
      return;
    }
    
    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        resumeLink,
        status: 'pending'
      }
    });
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Withdraw application
router.delete('/:id/apply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!jobId || !userId) {
      res.status(400).json({ error: 'Job ID and User ID are required' });
      return;
    }

    const application = await prisma.application.findFirst({
      where: { jobId, userId }
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    await prisma.application.delete({
      where: { id: application.id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

// Get user applications
router.get('/applications/user/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const authUserId = req.user?.userId;
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (userId !== authUserId) {
      res.status(403).json({ error: 'Forbidden: Cannot access other users applications' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

export default router;
