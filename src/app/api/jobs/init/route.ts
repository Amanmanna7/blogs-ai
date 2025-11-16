import { NextRequest, NextResponse } from 'next/server';
import { initializeQueueSystem } from '@/lib/queue-init';
import { canScheduleJobs } from '@/lib/job-security';

/**
 * API endpoint to initialize the queue system
 * This should be called when the application starts or when workers need to be restarted
 * GET /api/jobs/init
 * 
 * SECURITY: Requires admin access or internal API key
 */
export async function GET(request: NextRequest) {
  try {
    // Security check
    const { authorized } = await canScheduleJobs(request);
    
    if (!authorized) {
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 403 }
      );
    }

    await initializeQueueSystem();
    return NextResponse.json({
      success: true,
      message: 'Queue system initialized successfully',
    });
  } catch (error: any) {
    console.error('Error initializing queue system:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize queue system' },
      { status: 500 }
    );
  }
}


