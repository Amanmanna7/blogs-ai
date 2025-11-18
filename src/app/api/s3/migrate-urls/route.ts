import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { awsConfig } from '@/lib/aws-config';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!awsConfig.cloudFrontDomain) {
      return NextResponse.json(
        { error: 'CloudFront domain not configured. Please set BLOGS_AWS_CLOUDFRONT_DOMAIN in environment variables.' },
        { status: 400 }
      );
    }

    const cloudFrontDomain = awsConfig.cloudFrontDomain.replace(/\/$/, '');
    const s3DomainPattern = new RegExp(
      `https://${awsConfig.bucketName}\\.s3\\.${awsConfig.region}\\.amazonaws\\.com/(.+)`,
      'i'
    );

    // Get all blog media with S3 URLs
    const allMedia = await prisma.blogMedia.findMany({
      where: {
        mediaUrl: {
          contains: `.s3.${awsConfig.region}.amazonaws.com`,
        },
      },
    });

    let updated = 0;
    let errors = 0;

    for (const media of allMedia) {
      try {
        const match = media.mediaUrl.match(s3DomainPattern);
        if (match && match[1]) {
          const filePath = match[1];
          const newUrl = `https://${cloudFrontDomain}/${filePath}`;

          await prisma.blogMedia.update({
            where: { id: media.id },
            data: { mediaUrl: newUrl },
          });

          updated++;
        }
      } catch (error) {
        console.error(`Error updating media ${media.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated ${updated} URLs, ${errors} errors.`,
      stats: {
        total: allMedia.length,
        updated,
        errors,
      },
    });
  } catch (error) {
    console.error('Error migrating URLs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to migrate URLs',
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

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!awsConfig.cloudFrontDomain) {
      return NextResponse.json(
        { error: 'CloudFront domain not configured' },
        { status: 400 }
      );
    }

    // Count media with S3 URLs that need migration
    const count = await prisma.blogMedia.count({
      where: {
        mediaUrl: {
          contains: `.s3.${awsConfig.region}.amazonaws.com`,
        },
      },
    });

    return NextResponse.json({
      cloudFrontDomain: awsConfig.cloudFrontDomain,
      s3Domain: `${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com`,
      mediaNeedingMigration: count,
      message: count > 0
        ? `Found ${count} media items that need URL migration to CloudFront`
        : 'All media URLs are already using CloudFront or no media found',
    });
  } catch (error) {
    console.error('Error checking migration status:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check migration status',
      },
      { status: 500 }
    );
  }
}

