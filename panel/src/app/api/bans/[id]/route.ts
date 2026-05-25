import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  // TODO(backend): Remove ban from storage + update CF/iptables
  console.log("[MOCK] Unban:", id);
  return Response.json({ success: true });
}
