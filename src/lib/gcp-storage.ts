import { Storage } from '@google-cloud/storage';
import { gcpConfig, validateGCPConfig } from './gcp-config';

// Initialize Google Cloud Storage
let storage: Storage;

export function getStorage() {
  if (!storage) {
    validateGCPConfig();
    
    // Initialize storage with credentials file
    storage = new Storage({
      projectId: gcpConfig.projectId,
      keyFilename: gcpConfig.credentials,
    });
  }
  return storage;
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
  const storage = getStorage();
  const bucket = storage.bucket(gcpConfig.bucketName);
  
  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalFileName = `${folder}/${timestamp}_${sanitizedFileName}`;
  
  const fileUpload = bucket.file(finalFileName);
  
  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType,
    },
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', async () => {
      try {
        const [metadata] = await fileUpload.getMetadata();
        
        // Generate direct public URL (since bucket is public)
        const publicUrl = `https://storage.googleapis.com/${gcpConfig.bucketName}/${finalFileName}`;
        
        resolve({
          url: publicUrl,
          name: finalFileName,
          size: parseInt(String(metadata.size || '0')),
          contentType: metadata.contentType || contentType,
        });
      } catch (error) {
        reject(error);
      }
    });

    stream.end(file);
  });
}

export async function deleteFile(fileName: string): Promise<void> {
  const storage = getStorage();
  const bucket = storage.bucket(gcpConfig.bucketName);
  const file = bucket.file(fileName);
  
  try {
    await file.delete();
    console.log(`Successfully deleted file: ${fileName}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Check if bucket has public access configured
export async function checkBucketPublicAccess(): Promise<boolean> {
  try {
    const storage = getStorage();
    const bucket = storage.bucket(gcpConfig.bucketName);
    
    // Get bucket IAM policy
    const [policy] = await bucket.iam.getPolicy();
    
    // Check if allUsers has objectViewer role
    const hasPublicAccess = policy.bindings.some(binding => 
      binding.role === 'roles/storage.objectViewer' && 
      binding.members.includes('allUsers')
    );
    
    return hasPublicAccess;
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
      throw new Error('Bucket is not configured for public access. Please configure bucket permissions in Google Cloud Console.');
    }
  } catch (error) {
    console.error('Error ensuring public access:', error);
    throw error;
  }
}

export async function getFileUrl(fileName: string): Promise<string> {
  // Return direct public URL (bucket must be configured for public access)
  return `https://storage.googleapis.com/${gcpConfig.bucketName}/${fileName}`;
}

// Configure bucket for public access (use with caution)
export async function configurePublicAccess(): Promise<void> {
  try {
    const storage = getStorage();
    const bucket = storage.bucket(gcpConfig.bucketName);
    
    // Get current IAM policy
    const [policy] = await bucket.iam.getPolicy();
    
    // Add public access binding if it doesn't exist
    const hasPublicBinding = policy.bindings.some(binding => 
      binding.role === 'roles/storage.objectViewer' && 
      binding.members.includes('allUsers')
    );
    
    if (!hasPublicBinding) {
      // Add the public access binding
      policy.bindings.push({
        role: 'roles/storage.objectViewer',
        members: ['allUsers']
      });
      
      // Update the policy
      await bucket.iam.setPolicy(policy);
      console.log('✅ Bucket configured for public access');
    } else {
      console.log('✅ Bucket already has public access configured');
    }
  } catch (error) {
    console.error('Error configuring public access:', error);
    throw new Error('Failed to configure public access. Please check your permissions and try again.');
  }
}
