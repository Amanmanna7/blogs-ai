/**
 * Initialize queues and workers
 * This should be called when the application starts
 */
import { initializeWorkers } from './workers';
import { initializeCronJobs } from '@/jobs/cron/cron-jobs';

let initialized = false;

export async function initializeQueueSystem(): Promise<void> {
  if (initialized) {
    console.log('Queue system already initialized');
    return;
  }

  try {
    // Initialize workers to process jobs
    initializeWorkers();

    // Initialize cron jobs
    await initializeCronJobs();

    initialized = true;
    console.log('Queue system initialized successfully');
  } catch (error) {
    console.error('Error initializing queue system:', error);
    throw error;
  }
}

/**
 * Cleanup function to close all connections
 */
export async function cleanupQueueSystem(): Promise<void> {
  const { closeWorkers } = await import('./workers');
  const { closeQueues } = await import('./queues');
  const { closeRedis } = await import('./redis');

  await closeWorkers();
  await closeQueues();
  await closeRedis();

  initialized = false;
  console.log('Queue system cleaned up');
}


