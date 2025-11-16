# Job Scheduling Security

## Overview

The job scheduling API is secured to prevent unauthorized access and DDoS attacks. Only authorized users and internal system calls can schedule jobs.

## Security Methods

### 1. **Internal Server-Side Scheduling** (Recommended)
Use the `internalScheduler` for server-side job scheduling. This is the most secure method as it doesn't go through HTTP.

```typescript
import { internalScheduler } from '@/jobs/schedulers/internal-scheduler';

// Schedule a job from your server code
await internalScheduler.add('send-email', { to: 'user@example.com' }, 'COMMUNICATIONS');
```

### 2. **Admin Authentication**
Admins can schedule jobs via the API using their Clerk session.

```bash
# With Clerk session cookie
curl -X POST http://localhost:3000/api/jobs/schedule \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-clerk-session" \
  -d '{
    "type": "immediate",
    "jobType": "example-job",
    "data": { "test": true },
    "queueName": "DEFAULT"
  }'
```

### 3. **API Key Authentication**
Use the job scheduler API key for manual/scripted access.

```bash
# With API key
curl -X POST http://localhost:3000/api/jobs/schedule \
  -H "Content-Type: application/json" \
  -H "x-job-api-key: your-api-key-here" \
  -d '{
    "type": "immediate",
    "jobType": "example-job",
    "data": { "test": true },
    "queueName": "DEFAULT"
  }'
```

## Environment Variables

Add these to your `.env` file:

```env
# Internal API key (for server-side requests)
INTERNAL_API_KEY=your-secure-random-key-here

# Job scheduler API key (for manual API access)
JOB_SCHEDULER_API_KEY=another-secure-random-key-here
```

**Generate secure keys:**
```bash
# Generate a secure random key
openssl rand -hex 32
```

## Security Features

1. **Authentication Required**: All job scheduling endpoints require authentication
2. **Role-Based Access**: Only ADMIN users can schedule jobs via web interface
3. **API Key Protection**: Separate API keys for internal and manual access
4. **Audit Logging**: All job scheduling attempts are logged with user/context info
5. **Rate Limiting Ready**: Structure in place for future rate limiting

## Best Practices

### ✅ DO:
- Use `internalScheduler` for server-side job scheduling
- Store API keys securely in environment variables
- Rotate API keys regularly
- Monitor job scheduling logs
- Use admin authentication for manual testing

### ❌ DON'T:
- Expose API keys in client-side code
- Share API keys publicly
- Use the public API endpoint from client-side code
- Skip authentication checks

## Examples

### Server-Side Scheduling (Recommended)

```typescript
// In your API route or server component
import { internalScheduler } from '@/jobs/schedulers/internal-scheduler';

export async function POST(request: NextRequest) {
  // Your business logic...
  
  // Schedule a job internally (secure, no HTTP call needed)
  await internalScheduler.add(
    'send-email',
    { to: user.email, subject: 'Welcome!' },
    'COMMUNICATIONS'
  );
  
  return NextResponse.json({ success: true });
}
```

### Admin Manual Scheduling

```typescript
// In an admin dashboard component
const scheduleJob = async () => {
  const response = await fetch('/api/jobs/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include Clerk session
    body: JSON.stringify({
      type: 'immediate',
      jobType: 'example-job',
      data: { test: true },
      queueName: 'DEFAULT'
    })
  });
  
  const result = await response.json();
  console.log('Job scheduled:', result);
};
```

### Scripted Access (API Key)

```bash
#!/bin/bash
# Script to schedule jobs via API key

API_KEY="your-job-scheduler-api-key"
API_URL="https://your-domain.com/api/jobs/schedule"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-job-api-key: $API_KEY" \
  -d '{
    "type": "immediate",
    "jobType": "daily-cleanup",
    "data": {},
    "queueName": "DEFAULT"
  }'
```

## Troubleshooting

### "Unauthorized" Error

1. **Check authentication**: Ensure you're logged in as ADMIN or using correct API key
2. **Verify API key**: Check that `JOB_SCHEDULER_API_KEY` matches in `.env` and request header
3. **Check headers**: Ensure `x-job-api-key` header is set correctly

### "Internal API Key" Error

- For server-side calls, use `internalScheduler` instead of API endpoint
- If you must use API, set `INTERNAL_API_KEY` in `.env` and include `x-internal-api-key` header

## Migration Guide

If you have existing code that calls the schedule API:

**Before (Insecure):**
```typescript
// ❌ Don't do this from client-side
await fetch('/api/jobs/schedule', { ... });
```

**After (Secure):**
```typescript
// ✅ Use internal scheduler from server-side
import { internalScheduler } from '@/jobs/schedulers/internal-scheduler';
await internalScheduler.add('job-type', data, 'DEFAULT');
```

