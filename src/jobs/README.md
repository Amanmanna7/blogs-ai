# BullMQ Job System

This directory contains the BullMQ job processing system with support for scheduled jobs, delayed jobs, and recurring cron jobs.

## Structure

```
jobs/
├── processors/          # Job processors for each queue
│   ├── default-processor.ts
│   └── communications-processor.ts
├── schedulers/         # Job scheduling utilities
│   └── job-scheduler.ts
└── cron/              # Cron job definitions
    └── cron-jobs.ts
```

## Queues

- **default**: General background jobs
- **communications**: Email, notifications, and other communication jobs

## Usage

### Scheduling a Job at a Specific Time

```typescript
import { scheduleJob } from '@/jobs/schedulers/job-scheduler';

// Schedule a job to run at a specific date/time
const jobId = await scheduleJob(
  'send-email',
  { to: 'user@example.com', subject: 'Hello' },
  new Date('2024-12-25T10:00:00Z'),
  { queueName: 'COMMUNICATIONS' }
);
```

### Scheduling a Job with Delay

```typescript
import { scheduleJobWithDelay } from '@/jobs/schedulers/job-scheduler';

// Schedule a job to run after 1 hour
const jobId = await scheduleJobWithDelay(
  'process-data',
  { userId: 123 },
  3600000, // 1 hour in milliseconds
  { queueName: 'DEFAULT' }
);
```

### Adding a Job Immediately

```typescript
import { addJob } from '@/jobs/schedulers/job-scheduler';

// Add a job to be processed immediately
const jobId = await addJob(
  'send-notification',
  { userId: 123, message: 'Hello' },
  { queueName: 'COMMUNICATIONS' }
);
```

### Scheduling a Recurring Job (Cron)

```typescript
import { scheduleRecurringJob } from '@/jobs/schedulers/job-scheduler';

// Schedule a job to run daily at 9 AM
const jobId = await scheduleRecurringJob(
  'daily-digest',
  {},
  '0 9 * * *', // Cron pattern: Every day at 9 AM
  { queueName: 'COMMUNICATIONS' }
);
```

### Using the API Endpoint

You can also schedule jobs via the API:

```bash
# Schedule a job at a specific time
curl -X POST http://localhost:3000/api/jobs/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "type": "schedule",
    "jobType": "send-email",
    "data": { "to": "user@example.com" },
    "scheduledTime": "2024-12-25T10:00:00Z",
    "queueName": "COMMUNICATIONS"
  }'

# Schedule a job with delay
curl -X POST http://localhost:3000/api/jobs/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "type": "delay",
    "jobType": "process-data",
    "data": { "userId": 123 },
    "delayMs": 3600000,
    "queueName": "DEFAULT"
  }'

# Schedule a recurring job
curl -X POST http://localhost:3000/api/jobs/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "type": "recurring",
    "jobType": "daily-digest",
    "data": {},
    "cronPattern": "0 9 * * *",
    "queueName": "COMMUNICATIONS"
  }'
```

## Adding New Job Types

1. **Add handler in processor**: Edit the appropriate processor file in `processors/` to add your job handler
2. **Add case in switch**: Add a case for your job type in the processor's switch statement

Example:

```typescript
// In processors/default-processor.ts
switch (type) {
  case 'my-new-job':
    return await handleMyNewJob(data);
  // ...
}
```

## Environment Variables

Make sure to set `REDIS_URL` in your `.env` file:

```
REDIS_URL=redis://localhost:6379
```

The system uses Redis database 3 by default.

## Initialization

Workers are initialized when you call the init endpoint or import the initialization function:

```typescript
import { initializeQueueSystem } from '@/lib/queue-init';
await initializeQueueSystem();
```

Or via API:

```bash
curl http://localhost:3000/api/jobs/init
```


