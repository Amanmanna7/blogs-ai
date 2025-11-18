import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plan-features/[id] - Get a specific plan feature
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planFeature = await prisma.planFeature.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!planFeature) {
      return NextResponse.json(
        { error: 'Plan feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ planFeature });
  } catch (error) {
    console.error('Error fetching plan feature:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan feature' },
      { status: 500 }
    );
  }
}

// PUT /api/plan-features/[id] - Update a plan feature
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { feature, description, featureSlug, status } = await request.json();

    if (!feature || !feature.trim()) {
      return NextResponse.json(
        { error: 'Feature name is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Feature description is required' },
        { status: 400 }
      );
    }

    if (!featureSlug || !featureSlug.trim()) {
      return NextResponse.json(
        { error: 'Feature slug is required' },
        { status: 400 }
      );
    }

    // Check if plan feature exists
    const existingFeature = await prisma.planFeature.findUnique({
      where: { id }
    });

    if (!existingFeature) {
      return NextResponse.json(
        { error: 'Plan feature not found' },
        { status: 404 }
      );
    }

    // Check if another feature with this slug already exists for the same plan
    const duplicateFeature = await prisma.planFeature.findFirst({
      where: { 
        planId: existingFeature.planId,
        featureSlug: featureSlug.trim(),
        id: { not: id }
      }
    });

    if (duplicateFeature) {
      return NextResponse.json(
        { error: 'A feature with this slug already exists for this plan' },
        { status: 409 }
      );
    }

    const planFeature = await prisma.planFeature.update({
      where: { id },
      data: {
        feature: feature.trim(),
        description: description.trim(),
        featureSlug: featureSlug.trim(),
        status: status || 'ACTIVE'
      } as any,
      include: {
        plan: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ planFeature });
  } catch (error) {
    console.error('Error updating plan feature:', error);
    return NextResponse.json(
      { error: 'Failed to update plan feature' },
      { status: 500 }
    );
  }
}

// DELETE /api/plan-features/[id] - Delete a plan feature
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if plan feature exists
    const existingFeature = await prisma.planFeature.findUnique({
      where: { id }
    });

    if (!existingFeature) {
      return NextResponse.json(
        { error: 'Plan feature not found' },
        { status: 404 }
      );
    }

    // Delete the plan feature
    await prisma.planFeature.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Plan feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan feature' },
      { status: 500 }
    );
  }
}
