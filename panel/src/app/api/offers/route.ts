import { auth } from "@/lib/auth";
import { getDefaultOfferConfig } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  // TODO(backend): Read from real offer config storage
  return Response.json(getDefaultOfferConfig());
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const config = await request.json();
  // TODO(backend): Validate and persist offer config
  console.log("[MOCK] Save offer config:", config);
  return Response.json({ success: true });
}
