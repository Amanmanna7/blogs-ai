import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog-content/check-slug - Check if slug is unique
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check if slug exists
    const existingContent = await prisma.blogContent.findUnique({
      where: { slug },
      select: { id: true }
    });

    // If we're editing and the slug belongs to the current content, it's valid
    if (existingContent && excludeId && existingContent.id === excludeId) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: !!existingContent });
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
