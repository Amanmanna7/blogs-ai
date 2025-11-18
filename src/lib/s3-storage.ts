import { S3Client, PutObjectCommand, DeleteObjectCommand, GetBucketPolicyCommand, PutBucketPolicyCommand, GetPublicAccessBlockCommand } from '@aws-sdk/client-s3';
import { awsConfig, validateAWSConfig } from './aws-config';

// Initialize AWS S3 client
let s3Client: S3Client;

export function getS3Client() {
  if (!s3Client) {
    validateAWSConfig();
    
    s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }
  return s3Client;
}

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  contentType: string;
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'blog-media'
): Promise<UploadResult> {
  const client = getS3Client();
  
  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalFileName = `${folder}/${timestamp}_${sanitizedFileName}`;
  
  try {
    // Validate configuration before attempting upload
    if (!awsConfig.bucketName) {
      throw new Error('BLOGS_AWS_S3_BUCKET_NAME is not configured');
    }
    if (!awsConfig.region) {
      throw new Error('BLOGS_AWS_REGION is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: finalFileName,
      Body: file,
      ContentType: contentType,
      // Set ACL to public-read for blog-media folder to make files publicly accessible
      ACL: folder === 'blog-media' ? 'public-read' : undefined,
    });

    await client.send(command);
    
    // Generate URL - prefer CloudFront if configured, otherwise use S3 direct URL
    let publicUrl: string;
    if (awsConfig.cloudFrontDomain) {
      // Remove leading slash if present in domain
      const domain = awsConfig.cloudFrontDomain.replace(/\/$/, '');
      publicUrl = `https://${domain}/${finalFileName}`;
    } else {
      // Use S3 direct URL
      publicUrl = `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${finalFileName}`;
    }
    
    return {
      url: publicUrl,
      name: finalFileName,
      size: file.length,
      contentType,
    };
  } catch (error: any) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  const client = getS3Client();
  
  try {
    const command = new DeleteObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: fileName,
    });

    await client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

// Check if bucket has public access configured
export async function checkBucketPublicAccess(): Promise<boolean> {
  try {
    const client = getS3Client();
    
    // Check public access block settings
    const publicAccessBlockCommand = new GetPublicAccessBlockCommand({
      Bucket: awsConfig.bucketName,
    });
    
    try {
      const publicAccessBlock = await client.send(publicAccessBlockCommand);
      // If public access is blocked, return false
      if (publicAccessBlock.PublicAccessBlockConfiguration?.BlockPublicAcls ||
          publicAccessBlock.PublicAccessBlockConfiguration?.BlockPublicPolicy ||
          publicAccessBlock.PublicAccessBlockConfiguration?.IgnorePublicAcls ||
          publicAccessBlock.PublicAccessBlockConfiguration?.RestrictPublicBuckets) {
        return false;
      }
    } catch (error: any) {
      // If PublicAccessBlock doesn't exist, it means public access is not blocked
      if (error.name !== 'NoSuchPublicAccessBlockConfiguration') {
        throw error;
      }
    }
    
    // Check bucket policy for public read access
    const policyCommand = new GetBucketPolicyCommand({
      Bucket: awsConfig.bucketName,
    });
    
    try {
      const policyResponse = await client.send(policyCommand);
      if (policyResponse.Policy) {
        const policy = JSON.parse(policyResponse.Policy);
        // Check if policy allows public read access
        const hasPublicRead = policy.Statement?.some((stmt: any) => 
          stmt.Effect === 'Allow' &&
          (stmt.Principal === '*' || stmt.Principal?.AWS === '*') &&
          stmt.Action?.includes('s3:GetObject')
        );
        return hasPublicRead || false;
      }
    } catch (error: any) {
      // If no policy exists, return false
      if (error.name !== 'NoSuchBucketPolicy') {
        throw error;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking bucket public access:', error);
    return false;
  }
}

// Ensure bucket maintains public access
export async function ensurePublicAccess(): Promise<void> {
  try {
    const hasPublicAccess = await checkBucketPublicAccess();
    
    if (!hasPublicAccess) {
      console.warn('Bucket does not have public access configured. Files may not be accessible.');
      throw new Error('Bucket is not configured for public access. Please configure bucket permissions in AWS Console.');
    }
  } catch (error) {
    console.error('Error ensuring public access:', error);
    throw error;
  }
}

export async function getFileUrl(fileName: string): Promise<string> {
  // Generate URL - prefer CloudFront if configured, otherwise use S3 direct URL
  if (awsConfig.cloudFrontDomain) {
    const domain = awsConfig.cloudFrontDomain.replace(/\/$/, '');
    return `https://${domain}/${fileName}`;
  }
  
  // Return direct S3 URL
  return `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${fileName}`;
}

// Configure bucket for public access (use with caution)
export async function configurePublicAccess(): Promise<void> {
  try {
    const client = getS3Client();
    
    // First, check if public access block is enabled
    try {
      const publicAccessBlockCommand = new GetPublicAccessBlockCommand({
        Bucket: awsConfig.bucketName,
      });
      const publicAccessBlock = await client.send(publicAccessBlockCommand);
      
      if (publicAccessBlock.PublicAccessBlockConfiguration) {
        // If any public access is blocked, we need to remove the block
        if (publicAccessBlock.PublicAccessBlockConfiguration.BlockPublicAcls ||
            publicAccessBlock.PublicAccessBlockConfiguration.BlockPublicPolicy ||
            publicAccessBlock.PublicAccessBlockConfiguration.IgnorePublicAcls ||
            publicAccessBlock.PublicAccessBlockConfiguration.RestrictPublicBuckets) {
          throw new Error('Public access block is enabled. Please disable it in AWS Console first.');
        }
      }
    } catch (error: any) {
      // If PublicAccessBlock doesn't exist, that's fine - public access is not blocked
      if (error.name !== 'NoSuchPublicAccessBlockConfiguration') {
        throw error;
      }
    }
    
    // Get current bucket policy
    let currentPolicy: any = {};
    try {
      const getPolicyCommand = new GetBucketPolicyCommand({
        Bucket: awsConfig.bucketName,
      });
      const policyResponse = await client.send(getPolicyCommand);
      if (policyResponse.Policy) {
        currentPolicy = JSON.parse(policyResponse.Policy);
      }
    } catch (error: any) {
      // If no policy exists, create a new one
      if (error.name !== 'NoSuchBucketPolicy') {
        throw error;
      }
      currentPolicy = {
        Version: '2012-10-17',
        Statement: [],
      };
    }
    
    // Check if public read access already exists
    const hasPublicRead = currentPolicy.Statement?.some((stmt: any) => 
      stmt.Effect === 'Allow' &&
      (stmt.Principal === '*' || stmt.Principal?.AWS === '*') &&
      stmt.Action?.includes('s3:GetObject')
    );
    
    if (!hasPublicRead) {
      // Add public read access statement
      if (!currentPolicy.Statement) {
        currentPolicy.Statement = [];
      }
      
      currentPolicy.Statement.push({
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${awsConfig.bucketName}/*`,
      });
      
      // Update bucket policy
      const putPolicyCommand = new PutBucketPolicyCommand({
        Bucket: awsConfig.bucketName,
        Policy: JSON.stringify(currentPolicy),
      });
      
      await client.send(putPolicyCommand);
      console.log('✅ Bucket configured for public access');
    } else {
      console.log('✅ Bucket already has public access configured');
    }
  } catch (error) {
    console.error('Error configuring public access:', error);
    throw new Error('Failed to configure public access. Please check your permissions and try again.');
  }
}

