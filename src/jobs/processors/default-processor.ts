import { Job } from 'bullmq';

export interface DefaultJobData {
  type: string;
  [key: string]: any;
}

/**
 * Process default queue jobs
 */
export async function processDefaultJob(job: Job<DefaultJobData>): Promise<any> {
  const { type, ...data } = job.data;

  console.log(`Processing default job: ${type}`, { jobId: job.id, data });

  // Route to specific job handler based on type
  switch (type) {
    case 'example-job':
      return await handleExampleJob(data);
    // Add more job types here
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

/**
 * Example job handler
 */
async function handleExampleJob(data: any): Promise<any> {
  // Implement your job logic here
  console.log('Processing example job with data:', data);
  return { success: true };
}


