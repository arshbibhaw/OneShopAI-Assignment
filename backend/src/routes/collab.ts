import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

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
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedRequests = requests.map(req => ({
      ...req,
      requiredSkills: req.requiredSkills ? req.requiredSkills.split(',') : []
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching collab requests:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration requests' });
  }
});

// Create a new collab request (Protected)
router.post('/requests', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description, requiredSkills, category, coverImage, projectType, duration } = req.body;
    const creatorId = req.user?.userId;

    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }
    
    const request = await prisma.collabRequest.create({
      data: {
        creatorId,
        title,
        description,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills.join(',') : (requiredSkills || ''),
        category: category || 'Post a Need',
        coverImage,
        projectType: projectType || 'Side Project',
        duration: duration || 'Unspecified',
        status: 'open'
      },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatar: true }
        }
      }
    });
    
    res.status(201).json({
      ...request,
      requiredSkills: request.requiredSkills ? request.requiredSkills.split(',') : []
    });
  } catch (error) {
    console.error('Error creating collab request:', error);
    res.status(500).json({ error: 'Failed to create collaboration request' });
  }
});

// Join a collab request (Protected)
router.post('/requests/:id/join', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const collabRequestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!collabRequestId) {
      res.status(400).json({ error: 'Collab request ID is required' });
      return;
    }

    const collabRequest = await prisma.collabRequest.findUnique({
      where: { id: collabRequestId }
    });

    if (!collabRequest) {
      res.status(404).json({ error: 'Collaboration request not found' });
      return;
    }

    const existing = await prisma.collabMember.findFirst({
      where: { collabRequestId, userId }
    });

    if (existing) {
      res.status(400).json({ error: 'You have already requested to join this collaboration' });
      return;
    }

    const member = await prisma.collabMember.create({
      data: {
        collabRequestId,
        userId,
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
router.get('/requests/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const createdRequests = await prisma.collabRequest.findMany({
      where: { creatorId: userId },
      include: {
        owner: { select: { id: true, name: true, username: true, avatar: true } }
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
      requiredSkills: r.requiredSkills ? r.requiredSkills.split(',') : []
    }));

    res.json({ created: formattedCreated, joined: joinedRequests });
  } catch (error) {
    console.error('Error fetching my collabs:', error);
    res.status(500).json({ error: 'Failed to fetch your collaborations' });
  }
});

// Get all profiles for the directory
router.get('/profiles', async (_req: Request, res: Response) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, email: true } }
      }
    });

    const formattedProfiles = profiles.map(profile => ({
      ...profile,
      skills: profile.skills ? profile.skills.split(',') : []
    }));

    res.json(formattedProfiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
});

// Update own profile (Protected)
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
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

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        bio: bio ?? '',
        skills: Array.isArray(skills) ? skills.join(',') : (skills ?? ''),
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
        skills: Array.isArray(skills) ? skills.join(',') : (skills ?? ''),
        portfolio: portfolio ?? '',
        linkedinUrl: linkedinUrl ?? null,
        githubUrl: githubUrl ?? null,
        location: location ?? null,
        currentRole: currentRole ?? null,
        organization: organization ?? null
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, email: true } }
      }
    });

    res.json({
      ...profile,
      skills: profile.skills ? profile.skills.split(',') : []
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
