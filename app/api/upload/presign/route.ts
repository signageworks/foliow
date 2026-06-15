import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await req.json();

  if (!contentType?.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  const ext = filename?.split(".").pop() ?? "jpg";
  const key = `portfolio/${session.user.id}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ presignedUrl, publicUrl });
}
