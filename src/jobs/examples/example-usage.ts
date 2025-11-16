/**
 * Example usage of the job scheduling system
 * This file demonstrates how to use the various scheduling functions
 */

import {
  scheduleJob,
  scheduleJobWithDelay,
  scheduleRecurringJob,
  addJob,
} from '../schedulers/job-scheduler';

/**
 * Example 1: Schedule a job to run at a specific time
 */
export async function exampleScheduleJob() {
  const scheduledTime = new Date();
  scheduledTime.setHours(10, 0, 0, 0); // 10 AM today

  const jobId = await scheduleJob(
    'send-email',
    {
      to: 'user@example.com',
      subject: 'Scheduled Email',
      body: 'This email was scheduled in advance',
    },
    scheduledTime,
    {
      queueName: 'COMMUNICATIONS',
      attempts: 3,
    }
  );

  console.log(`Job scheduled with ID: ${jobId}`);
}

/**
 * Example 2: Schedule a job with a delay
 */
export async function exampleScheduleWithDelay() {
  // Schedule a job to run in 30 minutes
  const jobId = await scheduleJobWithDelay(
    'process-data',
    {
      userId: 123,
      action: 'cleanup',
    },
    30 * 60 * 1000, // 30 minutes in milliseconds
    {
      queueName: 'DEFAULT',
    }
  );

  console.log(`Job scheduled with ID: ${jobId}`);
}

/**
 * Example 3: Add a job to be processed immediately
 */
export async function exampleAddJob() {
  const jobId = await addJob(
    'send-notification',
    {
      userId: 456,
      message: 'Your order has been processed',
      type: 'success',
    },
    {
      queueName: 'COMMUNICATIONS',
    }
  );

  console.log(`Job added with ID: ${jobId}`);
}

/**
 * Example 4: Schedule a recurring job (cron)
 */
export async function exampleRecurringJob() {
  // Schedule a job to run every day at 9 AM
  const jobId = await scheduleRecurringJob(
    'daily-digest',
    {
      reportType: 'daily',
    },
    '0 9 * * *', // Cron pattern: Every day at 9 AM
    {
      queueName: 'DEFAULT',
    }
  );

  console.log(`Recurring job scheduled with ID: ${jobId}`);
}

/**
 * Example 5: Schedule a weekly report
 */
export async function exampleWeeklyReport() {
  // Schedule a job to run every Monday at 8 AM
  const jobId = await scheduleRecurringJob(
    'weekly-report',
    {
      reportType: 'weekly',
    },
    '0 8 * * 1', // Cron pattern: Every Monday at 8 AM
    {
      queueName: 'DEFAULT',
    }
  );

  console.log(`Weekly report job scheduled with ID: ${jobId}`);
}

/**
 * Example 6: Schedule a job with custom retry logic
 */
export async function exampleJobWithRetry() {
  const jobId = await scheduleJob(
    'important-task',
    {
      taskId: 789,
    },
    new Date(Date.now() + 3600000), // 1 hour from now
    {
      queueName: 'DEFAULT',
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds, then exponential backoff
      },
    }
  );

  console.log(`Job with retry scheduled with ID: ${jobId}`);
}


