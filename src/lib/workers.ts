import { Worker } from 'bullmq';
import { getRedis } from './redis';
import { QUEUE_NAMES } from './queues';

// Worker instances
let defaultWorker: Worker | null = null;
let communicationsWorker: Worker | null = null;

/**
 * Processors for different queues
 * Import your job processors here
 */
import { processDefaultJob } from '../jobs/processors/default-processor';
import { processCommunicationsJob } from '../jobs/processors/communications-processor';

/**
 * Get or create the default worker instance
 */
export const getDefaultWorker = (): Worker => {
  if (!defaultWorker) {
    defaultWorker = new Worker(
      QUEUE_NAMES.DEFAULT,
      async (job) => {
        return await processDefaultJob(job);
      },
      {
        connection: getRedis(),
        concurrency: 5, // Process 5 jobs concurrently
      }
    );

    // Error handling
    defaultWorker.on('failed', (job, err) => {
      console.error(`Default queue job ${job?.id} failed:`, err);
    });

    defaultWorker.on('completed', (job) => {
      console.log(`Default queue job ${job.id} completed`);
    });
  }
  return defaultWorker;
};

/**
 * Get or create the communications worker instance
 */
export const getCommunicationsWorker = (): Worker => {
  if (!communicationsWorker) {
    communicationsWorker = new Worker(
      QUEUE_NAMES.COMMUNICATIONS,
      async (job) => {
        return await processCommunicationsJob(job);
      },
      {
        connection: getRedis(),
        concurrency: 3, // Process 3 communications jobs concurrently
      }
    );

    // Error handling
    communicationsWorker.on('failed', (job, err) => {
      console.error(`Communications queue job ${job?.id} failed:`, err);
    });

    communicationsWorker.on('completed', (job) => {
      console.log(`Communications queue job ${job.id} completed`);
    });
  }
  return communicationsWorker;
};

/**
 * Initialize all workers
 */
export const initializeWorkers = (): void => {
  getDefaultWorker();
  getCommunicationsWorker();
  console.log('All workers initialized');
};

/**
 * Close all workers
 */
export const closeWorkers = async (): Promise<void> => {
  if (defaultWorker) {
    await defaultWorker.close();
    defaultWorker = null;
  }
  if (communicationsWorker) {
    await communicationsWorker.close();
    communicationsWorker = null;
  }
};

