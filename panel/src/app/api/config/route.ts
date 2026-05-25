import { auth } from "@/lib/auth";
import { getDefaultEngineConfig } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // TODO(backend): Fetch config from real config storage (DB/Redis/file)
  return Response.json(getDefaultEngineConfig());
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await request.json();
  // TODO(backend): Validate and persist config to real storage
  console.log("[MOCK] Saving engine config:", config);

  return Response.json({ success: true });
}
