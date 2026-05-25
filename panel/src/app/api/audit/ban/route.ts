import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ip, reason, permanent } = body;

  if (!ip) {
    return Response.json({ error: "IP is required" }, { status: 400 });
  }

  // TODO(backend): Call Cloudflare API / iptables to ban IP
  // TODO(backend): Store ban record in database
  console.log(`[MOCK] Banning IP: ${ip}, reason: ${reason}, permanent: ${permanent}`);

  return Response.json({ success: true, ip, banned: true });
}
