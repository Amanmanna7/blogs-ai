import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { configurePublicAccess, checkBucketPublicAccess } from '@/lib/gcp-storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to configure public access
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Configure public access
    await configurePublicAccess();
    
    // Verify the configuration
    const hasPublicAccess = await checkBucketPublicAccess();
    
    return NextResponse.json({
      success: true,
      message: 'Bucket configured for public access',
      hasPublicAccess
    });
  } catch (error) {
    console.error('Error configuring public access:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to configure public access',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check current public access status
    const hasPublicAccess = await checkBucketPublicAccess();
    
    return NextResponse.json({
      hasPublicAccess,
      message: hasPublicAccess 
        ? 'Bucket has public access configured' 
        : 'Bucket does not have public access configured'
    });
  } catch (error) {
    console.error('Error checking public access:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to check public access',
        hasPublicAccess: false 
      },
      { status: 500 }
    );
  }
}
