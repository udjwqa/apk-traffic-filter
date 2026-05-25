import { auth } from "@/lib/auth";
import { generateMockFeed } from "@/lib/mock-data";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  // TODO(backend): Fetch recent entries from real log storage
  return Response.json(generateMockFeed(limit));
}
