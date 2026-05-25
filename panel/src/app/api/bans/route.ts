import { auth } from "@/lib/auth";
import { getDefaultBanList } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  // TODO(backend): Read from real ban storage
  return Response.json(getDefaultBanList());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { ip, reason } = await request.json();
  // TODO(backend): Persist ban + call CF API / iptables
  console.log("[MOCK] Ban:", ip, reason);
  return Response.json({ success: true });
}
