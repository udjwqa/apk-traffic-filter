import { auth } from "@/lib/auth";
import { getDefaultBlockLists } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // TODO(backend): Read from server/lists/*.txt or CF KV
  return Response.json(getDefaultBlockLists());
}
