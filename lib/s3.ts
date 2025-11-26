import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

if (!REGION || !BUCKET) {
  // Do not throw at import time in serverless environments; only warn.
  console.warn(
    "S3: AWS_REGION or AWS_S3_BUCKET not configured. S3 uploads will fail until env vars are set."
  );
}

export const s3Client = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    : undefined,
});

export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType = "application/octet-stream"
) {
  if (!BUCKET)
    throw new Error("S3 bucket not configured (AWS_S3_BUCKET missing)");

  const input: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "private",
  };

  const command = new PutObjectCommand(input);
  const result = await s3Client.send(command);
  return result;
}

export async function deleteObjectFromS3(key: string) {
  if (!BUCKET)
    throw new Error("S3 bucket not configured (AWS_S3_BUCKET missing)");

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}
