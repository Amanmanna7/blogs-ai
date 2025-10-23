import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plans/[id] - Get a specific plan with features
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        features: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id] - Update a plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, price_per_month, status, features } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Plan description is required' },
        { status: 400 }
      );
    }

    if (price_per_month === undefined || price_per_month < 0) {
      return NextResponse.json(
        { error: 'Valid price per month is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Plan status is required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if another plan with this name already exists
    const duplicatePlan = await prisma.plan.findFirst({
      where: { 
        name: name.trim(),
        id: { not: params.id }
      }
    });

    if (duplicatePlan) {
      return NextResponse.json(
        { error: 'A plan with this name already exists' },
        { status: 409 }
      );
    }

    // Update plan and handle features
    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description.trim(),
        price_per_month: parseInt(price_per_month),
        status: status,
        features: {
          deleteMany: {}, // Delete all existing features
          create: features?.map((feature: any) => ({
            feature: feature.feature.trim(),
            description: feature.description.trim(),
            featureSlug: feature.featureSlug.trim(),
            status: feature.status || 'ACTIVE'
          })) || []
        }
      },
      include: {
        features: true
      }
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] - Delete a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        userPlans: true
      }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if plan has active user subscriptions
    if (existingPlan.userPlans.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions' },
        { status: 400 }
      );
    }

    // Delete the plan (features will be deleted due to cascade)
    await prisma.plan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
