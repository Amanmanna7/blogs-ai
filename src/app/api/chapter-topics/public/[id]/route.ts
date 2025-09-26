import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chapterTopic = await prisma.chapterTopic.findUnique({
      where: { id },
      include: {
        course: true,
        blogRelations: {
          include: {
            blog: true
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    });

    if (!chapterTopic) {
      return NextResponse.json({ error: 'Chapter topic not found' }, { status: 404 });
    }

    // Only expose published blogs in public endpoint
    const filtered = {
      id: chapterTopic.id,
      name: chapterTopic.name,
      description: chapterTopic.description,
      sequenceNumber: chapterTopic.sequenceNumber,
      course: { id: chapterTopic.course.id, name: chapterTopic.course.name },
      blogs: chapterTopic.blogRelations
        .filter((rel) => rel.blog.status === 'PUBLISHED')
        .sort((a, b) => a.sequence - b.sequence)
        .map((rel) => ({
          id: rel.blog.id,
          slug: rel.blog.slug,
          title: rel.blog.title,
          sequence: rel.sequence,
          publishedAt: rel.blog.publishedAt
        }))
    };

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching public chapter topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter topic' },
      { status: 500 }
    );
  }
}


