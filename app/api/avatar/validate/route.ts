import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { validateAvatarPhoto } from "@/lib/avatarPhotoValidator";

async function requireUserId() {
  const session = await auth();
  const rawId = session?.user?.id;
  const parsed = rawId ? Number(rawId) : NaN;
  if (!Number.isFinite(parsed)) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();

    if (
      !(req.headers.get("content-type") || "").includes("multipart/form-data")
    ) {
      return NextResponse.json(
        { error: "Content-Type multipart/form-data required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("avatarImage");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "avatarImage file is required" },
        { status: 400 }
      );
    }

    const result = await validateAvatarPhoto({
      imageFile: file,
      metadata: { userId },
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("avatar validate error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo validar la foto" },
      { status: 500 }
    );
  }
}
