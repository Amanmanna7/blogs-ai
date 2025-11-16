import { NextRequest, NextResponse } from 'next/server';
import { scheduleJob, scheduleJobWithDelay, scheduleRecurringJob, addJob } from '@/jobs/schedulers/job-scheduler';
import { canScheduleJobs } from '@/lib/job-security';

/**
 * API endpoint to schedule jobs
 * POST /api/jobs/schedule
 * 
 * SECURITY: This endpoint requires one of:
 * 1. Internal request (server-side only) - via INTERNAL_API_KEY header
 * 2. Admin authentication - via Clerk session
 * 3. API key authentication - via JOB_SCHEDULER_API_KEY header
 * 
 * Headers:
 * - x-internal-api-key: For internal/server-side requests (INTERNAL_API_KEY env var)
 * - x-job-api-key: For manual API access (JOB_SCHEDULER_API_KEY env var)
 * - Authorization: Clerk session token (for admin access)
 * 
 * Body:
 * {
 *   "type": "schedule" | "delay" | "recurring" | "immediate",
 *   "jobType": "string",
 *   "data": {},
 *   "scheduledTime": "ISO date string" (for schedule),
 *   "delayMs": number (for delay),
 *   "cronPattern": "string" (for recurring),
 *   "queueName": "DEFAULT" | "COMMUNICATIONS"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Security check: Only allow internal requests, admins, or API key holders
    const { authorized, reason } = await canScheduleJobs(request);
    
    if (!authorized) {
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 403 }
      );
    }

    // Log who scheduled the job (for audit purposes)
    if (reason === 'admin') {
      const { getCurrentUser } = await import('@/lib/auth');
      const user = await getCurrentUser();
      console.log(`Job scheduled by admin: ${user?.email} (${user?.role})`);
    } else if (reason === 'api_key') {
      console.log('Job scheduled via API key');
    } else {
      console.log('Job scheduled via internal request');
    }

    const body = await request.json();
    const {
      type,
      jobType,
      data = {},
      scheduledTime,
      delayMs,
      cronPattern,
      queueName = 'DEFAULT',
    } = body;

    if (!jobType) {
      return NextResponse.json(
        { error: 'jobType is required' },
        { status: 400 }
      );
    }

    let jobId: string;

    switch (type) {
      case 'schedule':
        if (!scheduledTime) {
          return NextResponse.json(
            { error: 'scheduledTime is required for schedule type' },
            { status: 400 }
          );
        }
        jobId = await scheduleJob(
          jobType,
          data,
          new Date(scheduledTime),
          { queueName }
        );
        break;

      case 'delay':
        if (!delayMs || delayMs < 0) {
          return NextResponse.json(
            { error: 'delayMs must be a positive number' },
            { status: 400 }
          );
        }
        jobId = await scheduleJobWithDelay(
          jobType,
          data,
          delayMs,
          { queueName }
        );
        break;

      case 'recurring':
        if (!cronPattern) {
          return NextResponse.json(
            { error: 'cronPattern is required for recurring type' },
            { status: 400 }
          );
        }
        jobId = await scheduleRecurringJob(
          jobType,
          data,
          cronPattern,
          { queueName }
        );
        break;

      case 'immediate':
        jobId = await addJob(jobType, data, { queueName });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be: schedule, delay, recurring, or immediate' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: `Job scheduled successfully`,
    });
  } catch (error: any) {
    console.error('Error scheduling job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule job' },
      { status: 500 }
    );
  }
}


