import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { items } = await request.json();

  // TODO(backend): Write items to server/lists/${id}.txt or CF KV
  console.log(`[MOCK] Saving list ${id}:`, items);

  return Response.json({ success: true, id, count: items.length });
}
