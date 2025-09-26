// Google Cloud Platform Configuration
export const gcpConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID!,
  bucketName: process.env.GOOGLE_CLOUD_BUCKET_NAME!,
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
};

// Validate required environment variables
export function validateGCPConfig() {
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_BUCKET_NAME',
    'GOOGLE_APPLICATION_CREDENTIALS',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
