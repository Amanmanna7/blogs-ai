This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

### AWS S3 Configuration (Required)

The following environment variables are required for AWS S3 file storage:

- `BLOGS_AWS_ACCESS_KEY_ID` - AWS IAM user access key ID
- `BLOGS_AWS_SECRET_ACCESS_KEY` - AWS IAM user secret access key
- `BLOGS_AWS_REGION` - AWS region where S3 bucket is located (e.g., `us-east-1`, `ap-south-1`)
- `BLOGS_AWS_S3_BUCKET_NAME` - Name of the S3 bucket for storing files

### AWS CloudFront Configuration (Optional but Recommended)

For better performance and global CDN distribution:

- `BLOGS_AWS_CLOUDFRONT_DOMAIN` - CloudFront distribution domain (e.g., `d1234abcd.cloudfront.net`)
- `BLOGS_AWS_CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID (for cache invalidation)

### AWS Setup Steps

1. Create an S3 bucket in AWS Console
2. Create an IAM user with S3 permissions (or use existing)
3. Generate Access Key ID and Secret Access Key
4. Configure bucket CORS policy (if needed for browser uploads)
5. Create CloudFront distribution pointing to S3 bucket (optional)
6. Configure CloudFront Origin Access Control (OAC) for secure S3 access (optional)
7. Set up CloudFront cache behaviors and settings (optional)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
