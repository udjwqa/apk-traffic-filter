import { auth } from "@/lib/auth";
import { generateMockAuditLog } from "@/lib/mock-data";
import type { AuditLogFilters } from "@/lib/types/dashboard";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const filters: AuditLogFilters = {
    search: searchParams.get("search") || "",
    verdict: (searchParams.get("verdict") as AuditLogFilters["verdict"]) || "all",
    rejectionCode: searchParams.get("rejectionCode") || null,
    country: searchParams.get("country") || null,
    dateFrom: searchParams.get("dateFrom") || null,
    dateTo: searchParams.get("dateTo") || null,
  };

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 25));

  // TODO(backend): Query real log storage with filters and pagination
  return Response.json(generateMockAuditLog(filters, page, pageSize));
}
