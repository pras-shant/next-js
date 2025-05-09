import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Type definition for the function arguments
type UploadToS3Params = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
};
// Function to upload to S3
export async function uploadToS3({
  buffer,
  filename,
  mimetype,
}: any): Promise<string | void> {
  try {

    const Key = `${uuidv4()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key,
      Body: buffer,
      ContentType: mimetype,
    });

    await s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
  } catch (error) {
    console.error("Error in uploading file on S3 bucket:", error);
  }
}
