import { NextRequest } from 'next/server';
import { getCurrentUser } from './auth';

/**
 * Check if request is from internal/system (server-side only)
 * This prevents external users from accessing internal APIs
 * 
 * SECURITY: Only allows requests with valid INTERNAL_API_KEY
 * In production, this should be the primary method for internal requests
 */
export function isInternalRequest(request: NextRequest): boolean {
  // Check for internal API key in header (REQUIRED for security)
  const internalApiKey = request.headers.get('x-internal-api-key');
  const expectedKey = process.env.INTERNAL_API_KEY;
  
  if (!expectedKey) {
    // If no key is set, deny internal requests (fail secure)
    console.warn('INTERNAL_API_KEY not set - internal requests will be denied');
    return false;
  }
  
  // Only allow if API key matches exactly
  if (internalApiKey === expectedKey) {
    return true;
  }

  // In development, allow localhost without referer (server-side requests)
  // This is a convenience for development only
  if (process.env.NODE_ENV === 'development') {
    const host = request.headers.get('host');
    const referer = request.headers.get('referer');
    
    // Only allow if:
    // 1. Host is localhost
    // 2. No referer (indicates server-side request) or referer is also localhost
    if (host?.includes('localhost') || host?.includes('127.0.0.1')) {
      if (!referer || referer.includes('localhost') || referer.includes('127.0.0.1')) {
        console.warn('Development mode: Allowing localhost request without API key');
        return true;
      }
    }
  }
  
  // In production, require API key
  return false;
}

/**
 * Verify API key for manual job scheduling
 */
export function verifyJobApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-job-api-key');
  const expectedKey = process.env.JOB_SCHEDULER_API_KEY;
  
  if (!expectedKey) {
    console.warn('JOB_SCHEDULER_API_KEY not set in environment variables');
    return false;
  }
  
  return apiKey === expectedKey;
}

/**
 * Check if user is authorized to schedule jobs
 * Returns true if:
 * 1. Request is internal (server-side)
 * 2. User is authenticated as ADMIN
 * 3. Valid API key is provided
 */
export async function canScheduleJobs(request: NextRequest): Promise<{
  authorized: boolean;
  reason: 'internal' | 'admin' | 'api_key' | 'unauthorized';
}> {
  // Check internal request first
  if (isInternalRequest(request)) {
    return { authorized: true, reason: 'internal' };
  }

  // Check API key
  if (verifyJobApiKey(request)) {
    return { authorized: true, reason: 'api_key' };
  }

  // Check admin authentication
  const user = await getCurrentUser();
  if (user && user.role === 'ADMIN') {
    return { authorized: true, reason: 'admin' };
  }

  return { authorized: false, reason: 'unauthorized' };
}

