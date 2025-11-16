import { Queue } from 'bullmq';
import { getRedis } from './redis';

// Queue names
export const QUEUE_NAMES = {
  DEFAULT: 'default',
  COMMUNICATIONS: 'communications',
} as const;

// Queue instances - using singleton pattern
let defaultQueue: Queue | null = null;
let communicationsQueue: Queue | null = null;

/**
 * Get or create the default queue instance
 */
export const getDefaultQueue = (): Queue => {
  if (!defaultQueue) {
    defaultQueue = new Queue(QUEUE_NAMES.DEFAULT, {
      connection: getRedis(),
    });
  }
  return defaultQueue;
};

/**
 * Get or create the communications queue instance
 */
export const getCommunicationsQueue = (): Queue => {
  if (!communicationsQueue) {
    communicationsQueue = new Queue(QUEUE_NAMES.COMMUNICATIONS, {
      connection: getRedis(),
    });
  }
  return communicationsQueue;
};

/**
 * Get a queue by name
 */
export const getQueue = (queueName: string): Queue => {
  switch (queueName) {
    case QUEUE_NAMES.DEFAULT:
      return getDefaultQueue();
    case QUEUE_NAMES.COMMUNICATIONS:
      return getCommunicationsQueue();
    default:
      throw new Error(`Unknown queue name: ${queueName}`);
  }
};

/**
 * Close all queue connections
 */
export const closeQueues = async (): Promise<void> => {
  if (defaultQueue) {
    await defaultQueue.close();
    defaultQueue = null;
  }
  if (communicationsQueue) {
    await communicationsQueue.close();
    communicationsQueue = null;
  }
};


