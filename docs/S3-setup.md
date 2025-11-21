# S3 Setup & Integration

This project includes a basic integration with AWS S3 for storing uploaded and generated images.

Files added:

- `lib/s3.ts` — a small helper that exports `s3Client` and `uploadBufferToS3(buffer, key, contentType)`.
- `app/api/uploads/route.ts` — API route to accept multipart uploads (`file` field) and a JSON POST with `images: string[]` to fetch and persist remote images to S3.
- Client-side: `VirtualTryOnExperience.tsx` uploads the original user photo before generating, and the "Guardar Look" action posts generated image URLs to `/api/uploads` to persist them.

Environment variables (set these before running):

- `AWS_REGION` — e.g. `us-east-1`
- `AWS_S3_BUCKET` — your S3 bucket name
- `AWS_ACCESS_KEY_ID` — IAM access key
- `AWS_SECRET_ACCESS_KEY` — IAM secret

Notes & Best Practices:

- Use an IAM user or role with a minimal policy that allows `s3:PutObject` on the specific bucket/prefix.
- In production prefer using temporary credentials (e.g., IAM role attached to the host, or short-lived credentials via STS).
- The uploaded objects are created with `ACL: private`. Serve them via signed URLs when needed.
- For larger files or streaming uploads, consider multipart uploads and server-side streaming to S3.

How to test locally:

1. Create `.env.local` with required vars (see `.env.example`).
2. Install deps: `pnpm install` (or `npm install`).
3. Run dev server: `pnpm dev`.
4. Upload a photo in the Virtual Try-On experience and click "Guardar Look"; check S3 for created keys under `uploads/` or `generated/` prefixes.
