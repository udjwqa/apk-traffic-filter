import { auth } from "@/lib/auth";
import { generateMockMetrics } from "@/lib/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // TODO(backend): Fetch from real metrics backend/database
  return Response.json(generateMockMetrics());
}
