import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all jobs with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, type } = req.query;
    
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
    
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    // Format requirements for SQLite string arrays
    const formattedJobs = jobs.map(job => ({
      ...job,
      requirements: job.requirements ? job.requirements.split(',') : []
    }));

    res.json(formattedJobs);
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
      where: { id }
    });
    
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    res.json({
      ...job,
      requirements: job.requirements ? job.requirements.split(',') : []
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// Create a job (for seeding/admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, organization, description, requirements, location, compensation, type } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const job = await prisma.job.create({
      data: {
        title,
        organization,
        description,
        requirements: Array.isArray(requirements) ? requirements.join(',') : (requirements || ''),
        location,
        compensation,
        type: type || 'full-time'
      }
    });
    res.status(201).json({
      ...job,
      requirements: job.requirements ? job.requirements.split(',') : []
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Apply to a job
router.post('/:id/apply', async (req: Request, res: Response) => {
  try {
    const { userId, resumeLink } = req.body;
    const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
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
router.delete('/:id/apply', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
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
router.get('/applications/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
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
