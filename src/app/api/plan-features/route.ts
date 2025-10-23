import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plan-features - Get all plan features
export async function GET() {
  try {
    const planFeatures = await prisma.planFeature.findMany({
      include: {
        plan: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ planFeatures });
  } catch (error) {
    console.error('Error fetching plan features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan features' },
      { status: 500 }
    );
  }
}

// POST /api/plan-features - Create a new plan feature
export async function POST(request: NextRequest) {
  try {
    const { planId, feature, description, featureSlug, status } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

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

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if feature with this slug already exists for this plan
    const existingFeature = await prisma.planFeature.findFirst({
      where: { 
        planId: planId,
        featureSlug: featureSlug.trim()
      }
    });

    if (existingFeature) {
      return NextResponse.json(
        { error: 'A feature with this slug already exists for this plan' },
        { status: 409 }
      );
    }

    const planFeature = await prisma.planFeature.create({
      data: {
        planId: planId,
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

    return NextResponse.json({ planFeature }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan feature:', error);
    return NextResponse.json(
      { error: 'Failed to create plan feature' },
      { status: 500 }
    );
  }
}
