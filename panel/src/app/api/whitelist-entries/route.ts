import { auth } from "@/lib/auth";
import { getDefaultWhitelist } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  // TODO(backend): Read from real whitelist storage
  return Response.json(getDefaultWhitelist());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  // TODO(backend): Persist whitelist entry
  console.log("[MOCK] Whitelist add:", body);
  return Response.json({ success: true });
}
