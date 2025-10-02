import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { QuestionLevel, QuestionType } from '@prisma/client';

// GET user preferences
export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const userPreference = await prisma.userPreference.findUnique({
        where: { userId: user.id }
      });

      return Response.json({
        success: true,
        data: userPreference
      });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch user preferences' },
        { status: 500 }
      );
    }
  })(req);
}

// POST/CREATE user preferences
export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { level, allowedTypes, totalQuestions } = body;

      // Validate input
      if (!level || !allowedTypes || !totalQuestions) {
        return Response.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!Object.values(QuestionLevel).includes(level)) {
        return Response.json(
          { success: false, error: 'Invalid question level' },
          { status: 400 }
        );
      }

      if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
        return Response.json(
          { success: false, error: 'Allowed types must be a non-empty array' },
          { status: 400 }
        );
      }

      if (!allowedTypes.every(type => Object.values(QuestionType).includes(type))) {
        return Response.json(
          { success: false, error: 'Invalid question types' },
          { status: 400 }
        );
      }

      if (totalQuestions < 3 || totalQuestions > 10) {
        return Response.json(
          { success: false, error: 'Total questions must be between 3 and 10' },
          { status: 400 }
        );
      }

      // Upsert user preference
      const userPreference = await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: {
          level,
          allowedTypes,
          totalQuestions
        },
        create: {
          userId: user.id,
          level,
          allowedTypes,
          totalQuestions
        }
      });

      return Response.json({
        success: true,
        data: userPreference
      });
    } catch (error) {
      console.error('Error creating/updating user preferences:', error);
      return Response.json(
        { success: false, error: 'Failed to save user preferences' },
        { status: 500 }
      );
    }
  })(req);
}

// PUT/UPDATE user preferences
export async function PUT(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { level, allowedTypes, totalQuestions } = body;

      // Validate input
      if (!level || !allowedTypes || !totalQuestions) {
        return Response.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!Object.values(QuestionLevel).includes(level)) {
        return Response.json(
          { success: false, error: 'Invalid question level' },
          { status: 400 }
        );
      }

      if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
        return Response.json(
          { success: false, error: 'Allowed types must be a non-empty array' },
          { status: 400 }
        );
      }

      if (!allowedTypes.every(type => Object.values(QuestionType).includes(type))) {
        return Response.json(
          { success: false, error: 'Invalid question types' },
          { status: 400 }
        );
      }

      if (totalQuestions < 3 || totalQuestions > 10) {
        return Response.json(
          { success: false, error: 'Total questions must be between 3 and 10' },
          { status: 400 }
        );
      }

      const userPreference = await prisma.userPreference.update({
        where: { userId: user.id },
        data: {
          level,
          allowedTypes,
          totalQuestions
        }
      });

      return Response.json({
        success: true,
        data: userPreference
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return Response.json(
        { success: false, error: 'Failed to update user preferences' },
        { status: 500 }
      );
    }
  })(req);
}
