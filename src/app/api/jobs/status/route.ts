import { NextRequest, NextResponse } from 'next/server';
import { getDefaultQueue, getCommunicationsQueue } from '@/lib/queues';
import { canScheduleJobs } from '@/lib/job-security';

/**
 * API endpoint to check queue status
 * GET /api/jobs/status
 * 
 * SECURITY: Requires admin access, internal API key, or job scheduler API key
 */
export async function GET(request: NextRequest) {
  // Security check
  const { authorized } = await canScheduleJobs(request);
  
  if (!authorized) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 403 }
    );
  }
  try {
    const defaultQueue = getDefaultQueue();
    const commQueue = getCommunicationsQueue();

    const [defaultWaiting, defaultActive, defaultCompleted, defaultFailed] = await Promise.all([
      defaultQueue.getWaitingCount(),
      defaultQueue.getActiveCount(),
      defaultQueue.getCompletedCount(),
      defaultQueue.getFailedCount(),
    ]);

    const [commWaiting, commActive, commCompleted, commFailed] = await Promise.all([
      commQueue.getWaitingCount(),
      commQueue.getActiveCount(),
      commQueue.getCompletedCount(),
      commQueue.getFailedCount(),
    ]);

    return NextResponse.json({
      success: true,
      queues: {
        default: {
          waiting: defaultWaiting,
          active: defaultActive,
          completed: defaultCompleted,
          failed: defaultFailed,
        },
        communications: {
          waiting: commWaiting,
          active: commActive,
          completed: commCompleted,
          failed: commFailed,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get queue status',
        success: false 
      },
      { status: 500 }
    );
  }
}

