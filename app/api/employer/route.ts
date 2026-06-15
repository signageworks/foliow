import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleEmployerChange } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId, employerName } = await req.json();

  if (!employerName?.trim())
    return NextResponse.json({ error: "Employer name required" }, { status: 400 });

  await handleEmployerChange({
    userId: session.user.id as string,
    newEmployerId: employerId ?? null,
    newEmployerName: employerName.trim(),
  });

  return NextResponse.json({ success: true });
}
