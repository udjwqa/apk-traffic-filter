import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  // TODO(backend): Remove from whitelist storage
  console.log("[MOCK] Whitelist remove:", id);
  return Response.json({ success: true });
}
