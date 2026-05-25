import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ip, deviceId } = body;

  if (!ip) {
    return Response.json({ error: "IP is required" }, { status: 400 });
  }

  // TODO(backend): Add IP/Device ID to whitelist in database
  // TODO(backend): Update firewall rules to allow this IP
  console.log(`[MOCK] Whitelisting IP: ${ip}, deviceId: ${deviceId || "N/A"}`);

  return Response.json({ success: true, ip, whitelisted: true });
}
