/**
 * Internal job scheduler
 * Use this for server-side job scheduling (no API calls needed)
 * This is the secure way to schedule jobs from within your application
 */
import { scheduleJob, scheduleJobWithDelay, scheduleRecurringJob, addJob } from './job-scheduler';
import { QUEUE_NAMES } from '@/lib/queues';

/**
 * Schedule a job internally (server-side only)
 * This function can be called directly from your server code
 * No authentication needed as it's already server-side
 */
export const internalScheduler = {
  /**
   * Schedule a job at a specific time
   */
  async schedule<T = any>(
    jobType: string,
    data: T,
    scheduledTime: Date,
    queueName: keyof typeof QUEUE_NAMES = 'DEFAULT'
  ): Promise<string> {
    return scheduleJob(jobType, data, scheduledTime, { queueName });
  },

  /**
   * Schedule a job with delay
   */
  async scheduleWithDelay<T = any>(
    jobType: string,
    data: T,
    delayMs: number,
    queueName: keyof typeof QUEUE_NAMES = 'DEFAULT'
  ): Promise<string> {
    return scheduleJobWithDelay(jobType, data, delayMs, { queueName });
  },

  /**
   * Add a job immediately
   */
  async add<T = any>(
    jobType: string,
    data: T,
    queueName: keyof typeof QUEUE_NAMES = 'DEFAULT'
  ): Promise<string> {
    return addJob(jobType, data, { queueName });
  },

  /**
   * Schedule a recurring job (cron)
   */
  async scheduleRecurring<T = any>(
    jobType: string,
    data: T,
    cronPattern: string,
    queueName: keyof typeof QUEUE_NAMES = 'DEFAULT'
  ): Promise<string> {
    return scheduleRecurringJob(jobType, data, cronPattern, { queueName });
  },
};

