import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    [key: string]: unknown;
  };
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    avatar: z.string().url().optional(),
    username: z.string().optional()
  })
});

router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, avatar, username } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Determine and sanitize username
    let finalUsername = username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
    if (finalUsername) {
      const existingUsername = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (existingUsername) {
        res.status(400).json({ error: 'Username is already taken' });
        return;
      }
    } else {
      // Auto-generate from name or email prefix
      const base = (name || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
      let candidate = base;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: candidate } })) {
        candidate = `${base}${counter}`;
        counter++;
      }
      finalUsername = candidate;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: finalUsername,
        password: hashedPassword,
        name,
        avatar,
        profile: {
          create: {
            bio: ''
          }
        }
      },
      include: {
        profile: true
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
    };
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1),
    password: z.string().min(1)
  })
});

router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Allow login via email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: email.toLowerCase() }
        ]
      },
      include: { profile: true }
    });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
    };
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware for authentication
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied, token missing' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    req.user = decoded as { userId: string; [key: string]: unknown };
    next();
  });
};

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
    };
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
