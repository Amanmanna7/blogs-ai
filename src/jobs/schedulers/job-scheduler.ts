import { Queue } from 'bullmq';
import { getDefaultQueue, getCommunicationsQueue, QUEUE_NAMES } from '@/lib/queues';

/**
 * Schedule a job to run at a specific time
 */
export interface ScheduleJobOptions {
  queueName?: keyof typeof QUEUE_NAMES;
  delay?: number; // Delay in milliseconds
  jobId?: string; // Optional custom job ID
  attempts?: number; // Number of retry attempts
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

/**
 * Schedule a job to run at a specific date/time
 */
export async function scheduleJob<T = any>(
  jobType: string,
  data: T,
  scheduledTime: Date,
  options: ScheduleJobOptions = {}
): Promise<string> {
  const { queueName = 'DEFAULT', jobId, attempts = 3, backoff } = options;
  
  const queue = queueName === 'COMMUNICATIONS' 
    ? getCommunicationsQueue() 
    : getDefaultQueue();

  // Calculate delay in milliseconds
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay < 0) {
    throw new Error('Scheduled time must be in the future');
  }

  const job = await queue.add(
    jobType,
    { type: jobType, ...data },
    {
      jobId,
      delay,
      attempts,
      backoff: backoff || {
        type: 'exponential',
        delay: 2000, // 2 seconds
      },
    }
  );

  return job.id!;
}

/**
 * Schedule a job with a delay (in milliseconds)
 */
export async function scheduleJobWithDelay<T = any>(
  jobType: string,
  data: T,
  delayMs: number,
  options: ScheduleJobOptions = {}
): Promise<string> {
  const scheduledTime = new Date(Date.now() + delayMs);
  return scheduleJob(jobType, data, scheduledTime, options);
}

/**
 * Add a job to queue immediately
 */
export async function addJob<T = any>(
  jobType: string,
  data: T,
  options: ScheduleJobOptions = {}
): Promise<string> {
  const { queueName = 'DEFAULT', jobId, attempts = 3, backoff } = options;
  
  const queue = queueName === 'COMMUNICATIONS' 
    ? getCommunicationsQueue() 
    : getDefaultQueue();

  const job = await queue.add(
    jobType,
    { type: jobType, ...data },
    {
      jobId,
      attempts,
      backoff: backoff || {
        type: 'exponential',
        delay: 2000,
      },
    }
  );

  return job.id!;
}

/**
 * Schedule a recurring job (cron-like)
 */
export async function scheduleRecurringJob<T = any>(
  jobType: string,
  data: T,
  cronPattern: string, // e.g., "0 0 * * *" for daily at midnight
  options: ScheduleJobOptions = {}
): Promise<string> {
  const { queueName = 'DEFAULT', jobId } = options;
  
  const queue = queueName === 'COMMUNICATIONS' 
    ? getCommunicationsQueue() 
    : getDefaultQueue();

  const job = await queue.add(
    jobType,
    { type: jobType, ...data },
    {
      jobId,
      repeat: {
        pattern: cronPattern,
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep last 1000 completed jobs
      },
    }
  );

  return job.id!;
}


