import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET assessment results
export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const blogSlug = searchParams.get('blogSlug');
      const chapterTopicId = searchParams.get('chapterTopicId');
      const courseId = searchParams.get('courseId');

      if (!blogSlug && !chapterTopicId && !courseId) {
        return Response.json(
          { success: false, error: 'Missing required parameters' },
          { status: 400 }
        );
      }

      let where: any = { userId: user.id, status: 'COMPLETED' };

      if (blogSlug) {
        where.blog = { slug: blogSlug };
      } else if (chapterTopicId) {
        where.chapterTopicId = chapterTopicId;
      } else if (courseId) {
        where.courseId = courseId;
      }

      const assessment = await prisma.assessment.findFirst({
        where,
        include: {
          assessmentQuestions: {
            include: {
              question: true
            },
            orderBy: { sequence: 'asc' }
          },
          blog: {
            select: { id: true, title: true, slug: true }
          },
          chapterTopic: {
            select: { id: true }
          },
          feedback: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (!assessment) {
        return Response.json(
          { success: false, error: 'Assessment not found' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch assessment results' },
        { status: 500 }
      );
    }
  })(req);
}
