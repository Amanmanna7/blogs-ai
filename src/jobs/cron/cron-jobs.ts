import { scheduleRecurringJob } from '../schedulers/job-scheduler';

/**
 * Initialize all cron jobs
 * This should be called when the application starts
 */
export async function initializeCronJobs(): Promise<void> {
  console.log('Initializing cron jobs...');

  // Example: Daily cleanup job at midnight
  // await scheduleRecurringJob(
  //   'daily-cleanup',
  //   {},
  //   '0 0 * * *', // Every day at midnight
  //   { queueName: 'DEFAULT' }
  // );

  // Example: Send daily digest emails at 9 AM
  // await scheduleRecurringJob(
  //   'send-daily-digest',
  //   {},
  //   '0 9 * * *', // Every day at 9 AM
  //   { queueName: 'COMMUNICATIONS' }
  // );

  // Example: Weekly report every Monday at 8 AM
  // await scheduleRecurringJob(
  //   'weekly-report',
  //   {},
  //   '0 8 * * 1', // Every Monday at 8 AM
  //   { queueName: 'DEFAULT' }
  // );

  console.log('Cron jobs initialized');
}

/**
 * Register a new cron job
 * Use this function to add cron jobs dynamically
 */
export async function registerCronJob(
  jobType: string,
  data: any,
  cronPattern: string,
  queueName: 'DEFAULT' | 'COMMUNICATIONS' = 'DEFAULT'
): Promise<string> {
  return scheduleRecurringJob(jobType, data, cronPattern, { queueName });
}


