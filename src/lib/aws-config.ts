// AWS Configuration
export const awsConfig = {
  accessKeyId: process.env.BLOGS_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.BLOGS_AWS_SECRET_ACCESS_KEY!,
  region: process.env.BLOGS_AWS_REGION!,
  bucketName: process.env.BLOGS_AWS_S3_BUCKET_NAME!,
  cloudFrontDomain: process.env.BLOGS_AWS_CLOUDFRONT_DOMAIN,
  cloudFrontDistributionId: process.env.BLOGS_AWS_CLOUDFRONT_DISTRIBUTION_ID,
};

// Validate required environment variables
export function validateAWSConfig() {
  const requiredVars = [
    'BLOGS_AWS_ACCESS_KEY_ID',
    'BLOGS_AWS_SECRET_ACCESS_KEY',
    'BLOGS_AWS_REGION',
    'BLOGS_AWS_S3_BUCKET_NAME',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missing.join(', ')}`);
  }
}

