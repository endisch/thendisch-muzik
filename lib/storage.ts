import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2, S3 API'siyle uyumlu çalışır — sadece endpoint farklı.
// R2'de egress (dışa veri çıkışı) ücretsizdir, bu yüzden 7/24 stream eden
// bir radyo platformu için S3'ten çok daha ucuzdur.
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

// Kullanıcının doğrudan R2'ye yükleme yapabilmesi için imzalı URL üretir
// (dosya sunucudan geçmez, doğrudan tarayıcıdan R2'ye gider — daha hızlı ve ucuz)
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 300 });
}

export async function getPlaybackUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

export function publicKeyFor(userId: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `songs/${userId}/${Date.now()}-${safe}`;
}
