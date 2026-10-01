import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from './auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

// Get all open collab requests
router.get('/requests', async (_req: Request, res: Response) => {
  try {
    const requests = await prisma.collabRequest.findMany({
      where: { status: 'open' },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        requiredSkills: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedRequests = requests.map(req => ({
      ...req,
      requiredSkills: req.requiredSkills ? req.requiredSkills.map(s => s.name) : []
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching collab requests:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration requests' });
  }
});

const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    requiredSkills: z.union([z.string(), z.array(z.string())]).optional(),
    category: z.string().optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    projectType: z.string().optional(),
    duration: z.string().optional(),
    openRoles: z.string().optional()
  })
});

router.post('/requests', authenticateToken, validateRequest(createRequestSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, requiredSkills, category, coverImage, projectType, duration, openRoles } = req.body;
    const creatorId = req.user?.userId;

    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const reqSkillsArray = Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? String(requiredSkills).split(',').map(s => s.trim()).filter(Boolean) : []);
    
    const request = await prisma.collabRequest.create({
      data: {
        creatorId,
        title,
        description,
        requiredSkills: {
          connectOrCreate: reqSkillsArray.map(req => ({
            where: { name: req },
            create: { name: req }
          }))
        },
        category: category || 'Post a Need',
        coverImage,
        projectType: projectType || 'Side Project',
        duration: duration || 'Unspecified',
        status: 'open',
        openRoles: openRoles || null
      },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        requiredSkills: true
      }
    });
    
    res.status(201).json({
      ...request,
      requiredSkills: request.requiredSkills ? request.requiredSkills.map((s: any) => s.name) : []
    });
  } catch (error) {
    console.error('Error creating collab request:', error);
    res.status(500).json({ error: 'Failed to create collaboration request' });
  }
});

const joinRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    role: z.string().optional(),
    message: z.string().optional(),
    portfolioLink: z.string().optional()
  }).optional()
});

router.post('/requests/:id/join', authenticateToken, validateRequest(joinRequestSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const collabRequestId = req.params.id as string;
    const { role, message, portfolioLink } = req.body || {};

    const collabRequest = await prisma.collabRequest.findUnique({
      where: { id: collabRequestId }
    });

    if (!collabRequest) {
      res.status(404).json({ error: 'Collaboration request not found' });
      return;
    }

    if (collabRequest.creatorId === userId) {
      res.status(400).json({ error: 'Cannot request to join your own project' });
      return;
    }

    if (collabRequest.isClosed) {
      res.status(400).json({ error: 'Project is closed for new requests' });
      return;
    }

    const existing = await prisma.collabMember.findFirst({
      where: { collabRequestId, userId, role }
    });

    if (existing) {
      res.status(400).json({ error: 'You have already requested to join this collaboration for this role' });
      return;
    }

    const member = await prisma.collabMember.create({
      data: {
        collabRequestId,
        userId,
        role,
        message,
        portfolioLink,
        status: 'pending'
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error joining collab:', error);
    res.status(500).json({ error: 'Failed to join collaboration' });
  }
});

// Get user's own requests and joined projects (Protected)
router.get('/requests/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const createdRequests = await prisma.collabRequest.findMany({
      where: { creatorId: userId },
      include: {
        owner: { select: { id: true, name: true, username: true, avatar: true } },
        requiredSkills: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const joinedRequests = await prisma.collabMember.findMany({
      where: { userId },
      include: {
        request: {
          include: {
            owner: { select: { id: true, name: true, username: true, avatar: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const formattedCreated = createdRequests.map(r => ({
      ...r,
      requiredSkills: r.requiredSkills ? r.requiredSkills.map(s => s.name) : []
    }));

    res.json({ created: formattedCreated, joined: joinedRequests });
  } catch (error) {
    console.error('Error fetching my collabs:', error);
    res.status(500).json({ error: 'Failed to fetch my collabs' });
  }
});

router.get('/requests/:id', async (req: Request, res: Response) => {
  try {
    const request = await prisma.collabRequest.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, username: true, avatar: true } },
        requiredSkills: true,
        creator: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true, profile: true }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json({
      ...request,
      requiredSkills: request.requiredSkills ? request.requiredSkills.map((s: any) => s.name) : []
    });
  } catch (error) {
    console.error('Error fetching collab details:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration details' });
  }
});

const updateMemberSchema = z.object({
  params: z.object({
    id: z.string(),
    memberId: z.string()
  }),
  body: z.object({
    status: z.enum(['accepted', 'rejected', 'withdrawn', 'removed']),
    rejectionReason: z.string().optional()
  })
});

router.put('/requests/:id/members/:memberId', authenticateToken, validateRequest(updateMemberSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id, memberId } = req.params;
    const { status, rejectionReason } = req.body;

    const request = await prisma.collabRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ error: 'Collaboration request not found' });
      return;
    }

    const member = await prisma.collabMember.findUnique({ where: { id: memberId } });
    if (!member || member.collabRequestId !== id) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Permissions: 
    // - Owner can accept, reject, remove
    // - User can withdraw or remove themselves (leave)
    const isOwner = request.creatorId === userId;
    const isSelf = member.userId === userId;

    if (!isOwner && !isSelf) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (isSelf && !isOwner && status !== 'withdrawn' && status !== 'removed') {
      res.status(403).json({ error: 'You can only withdraw or remove yourself' });
      return;
    }

    if (isOwner && !isSelf && status === 'withdrawn') {
      res.status(403).json({ error: 'Owner cannot withdraw a member, use reject or removed' });
      return;
    }
    
    if (status === 'accepted' && request.isClosed) {
      res.status(400).json({ error: 'Cannot accept members because project is closed' });
      return;
    }

    const updated = await prisma.collabMember.update({
      where: { id: memberId },
      data: { status, rejectionReason }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

const updateProjectSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    isClosed: z.boolean().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    openRoles: z.string().optional()
  })
});

router.put('/requests/:id', authenticateToken, validateRequest(updateProjectSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { isClosed, title, description, openRoles } = req.body;

    const request = await prisma.collabRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (request.creatorId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updated = await prisma.collabRequest.update({
      where: { id },
      data: { isClosed, title, description, openRoles }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});



// Get all profiles for the directory
router.get('/profiles', async (_req: Request, res: Response) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, email: true } },
        skills: true
      }
    });

    const formattedProfiles = profiles.map(profile => ({
      ...profile,
      skills: profile.skills ? profile.skills.map(s => s.name) : []
    }));

    res.json(formattedProfiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
});

const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    portfolio: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
    currentRole: z.string().optional(),
    organization: z.string().optional(),
    username: z.string().optional()
  })
});

router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(401).json({ error: 'User does not exist or session expired. Please re-login.' });
      return;
    }

    const { bio, skills, portfolio, linkedinUrl, githubUrl, location, currentRole, organization, username } = req.body;

    // Handle username update if provided
    if (username !== undefined && username !== null) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername && cleanUsername !== existingUser.username) {
        const usernameTaken = await prisma.user.findFirst({
          where: {
            username: cleanUsername,
            NOT: { id: userId }
          }
        });
        if (usernameTaken) {
          res.status(400).json({ error: `Username @${cleanUsername} is already taken. Please choose another.` });
          return;
        }
        await prisma.user.update({
          where: { id: userId },
          data: { username: cleanUsername }
        });
      }
    }

    const reqSkillsArray = Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()).filter(Boolean) : []);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        bio: bio ?? '',
        skills: {
          set: [],
          connectOrCreate: reqSkillsArray.map(skill => ({
            where: { name: skill },
            create: { name: skill }
          }))
        },
        portfolio: portfolio ?? '',
        linkedinUrl: linkedinUrl ?? null,
        githubUrl: githubUrl ?? null,
        location: location ?? null,
        currentRole: currentRole ?? null,
        organization: organization ?? null
      },
      create: {
        userId,
        bio: bio ?? '',
        skills: {
          connectOrCreate: reqSkillsArray.map(skill => ({
            where: { name: skill },
            create: { name: skill }
          }))
        },
        portfolio: portfolio ?? '',
        linkedinUrl: linkedinUrl ?? null,
        githubUrl: githubUrl ?? null,
        location: location ?? null,
        currentRole: currentRole ?? null,
        organization: organization ?? null
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, email: true } },
        skills: true
      }
    });

    res.json({
      ...profile,
      skills: profile.skills ? profile.skills.map((s: any) => s.name) : []
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
