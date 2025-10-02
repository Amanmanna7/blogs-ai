import { prisma } from './prisma';

export interface ProgressData {
  courseProgress?: {
    status: string;
    completedAt?: Date | null;
  } | null;
  chapters: Array<{
    id: string;
    name: string;
    sequenceNumber: number;
    progress?: {
      status: string;
      completedAt?: Date | null;
    } | null;
    completedBlogs: number;
    totalBlogs: number;
    blogProgress: Array<{
      blogId: string;
      status: string;
      completedAt?: Date | null;
    }>;
  }>;
  totalBlogs: number;
  completedBlogs: number;
  progressPercentage: number;
}

export async function getUserProgress(userId: string, courseId: string): Promise<ProgressData> {
  // Get course progress
  const courseProgress = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId
      }
    }
  });

  // Get all chapters in the course with their progress
  const chapters = await prisma.chapterTopic.findMany({
    where: { courseId: courseId },
    select: {
      id: true,
      name: true,
      sequenceNumber: true,
      blogRelations: {
        select: {
          blog: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: { sequenceNumber: 'asc' }
  });

  // Get progress for each chapter
  const chaptersWithProgress = await Promise.all(
    chapters.map(async (chapter) => {
      const chapterProgress = await prisma.chapterProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: userId,
            chapterId: chapter.id
          }
        }
      });

      // Get blog progress for this chapter
      const blogProgress = await prisma.blogProgress.findMany({
        where: {
          chapterId: chapter.id,
          userId: userId
        }
      });

      const completedBlogs = blogProgress.filter(bp => bp.status === 'COMPLETED').length;
      const totalBlogs = chapter.blogRelations.length;

      return {
        ...chapter,
        progress: chapterProgress,
        completedBlogs,
        totalBlogs,
        blogProgress: blogProgress.map(bp => ({
          blogId: bp.blogId,
          status: bp.status,
          completedAt: bp.completedAt
        }))
      };
    })
  );

  // Calculate overall course progress
  const totalBlogsInCourse = chaptersWithProgress.reduce((sum, chapter) => sum + chapter.totalBlogs, 0);
  const completedBlogsInCourse = chaptersWithProgress.reduce((sum, chapter) => sum + chapter.completedBlogs, 0);

  return {
    courseProgress,
    chapters: chaptersWithProgress,
    totalBlogs: totalBlogsInCourse,
    completedBlogs: completedBlogsInCourse,
    progressPercentage: totalBlogsInCourse > 0 ? Math.round((completedBlogsInCourse / totalBlogsInCourse) * 100) : 0
  };
}

export function getProgressStatus(progress?: { status: string; completedAt?: Date } | null): 'not-started' | 'in-progress' | 'completed' {
  if (!progress) return 'not-started';
  if (progress.status === 'COMPLETED') return 'completed';
  return 'in-progress';
}

export function formatProgressText(completed: number, total: number): string {
  return `${completed}/${total} Lesson${total !== 1 ? 's' : ''}`;
}
