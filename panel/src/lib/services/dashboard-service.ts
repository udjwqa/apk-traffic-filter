import type {
  DashboardMetrics,
  TrafficDataPoint,
  RejectionReason,
  RequestLogEntry,
  AuditLogFilters,
  AuditLogResponse,
  BanAction,
  WhitelistAction,
  EngineConfig,
} from "../types/dashboard";
import {
  generateMockMetrics,
  generateMockTrafficData,
  generateMockRejectionReasons,
  generateMockFeed,
  generateMockAuditLog,
  getDefaultEngineConfig,
} from "../mock-data";

// TODO(backend): Replace all mock calls with fetch() to real backend API

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // TODO(backend): return fetch('/api/dashboard/metrics').then(r => r.json())
  return generateMockMetrics();
}

export async function fetchTrafficData(): Promise<TrafficDataPoint[]> {
  // TODO(backend): return fetch('/api/dashboard/traffic?period=24h').then(r => r.json())
  return generateMockTrafficData();
}

export async function fetchRejectionReasons(): Promise<RejectionReason[]> {
  // TODO(backend): return fetch('/api/dashboard/rejections').then(r => r.json())
  return generateMockRejectionReasons();
}

export async function fetchInitialFeed(
  limit = 50
): Promise<RequestLogEntry[]> {
  // TODO(backend): return fetch(`/api/dashboard/feed?limit=${limit}`).then(r => r.json())
  return generateMockFeed(limit);
}

export async function fetchAuditLog(
  filters: AuditLogFilters,
  page = 1,
  pageSize = 25
): Promise<AuditLogResponse> {
  // TODO(backend): return fetch(`/api/audit/logs?${params}`).then(r => r.json())
  return generateMockAuditLog(filters, page, pageSize);
}

export async function banIp(action: BanAction): Promise<{ success: boolean }> {
  // TODO(backend): return fetch('/api/audit/ban', { method: 'POST', body: JSON.stringify(action) })
  console.log("[MOCK] Ban IP:", action);
  return { success: true };
}

export async function whitelistIp(
  action: WhitelistAction
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch('/api/audit/whitelist', { method: 'POST', body: JSON.stringify(action) })
  console.log("[MOCK] Whitelist IP:", action);
  return { success: true };
}

export async function fetchEngineConfig(): Promise<EngineConfig> {
  // TODO(backend): return fetch('/api/config').then(r => r.json())
  return getDefaultEngineConfig();
}

export async function saveEngineConfig(
  config: EngineConfig
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch('/api/config', { method: 'PUT', body: JSON.stringify(config) })
  console.log("[MOCK] Save config:", config);
  return { success: true };
}

export async function fetchBlockLists(): Promise<
  import("../types/dashboard").BlockList[]
> {
  // TODO(backend): return fetch('/api/lists').then(r => r.json())
  const { getDefaultBlockLists } = await import("../mock-data");
  return getDefaultBlockLists();
}

export async function saveBlockList(
  id: string,
  items: string[]
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch(`/api/lists/${id}`, { method: 'PUT', body: JSON.stringify({ items }) })
  console.log(`[MOCK] Save list ${id}:`, items);
  return { success: true };
}

// --- Ban & Whitelist ---

export async function fetchBanList(): Promise<
  import("../types/dashboard").BannedEntry[]
> {
  // TODO(backend): return fetch('/api/bans').then(r => r.json())
  const { getDefaultBanList } = await import("../mock-data");
  return getDefaultBanList();
}

export async function removeBan(
  id: string
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch(`/api/bans/${id}`, { method: 'DELETE' })
  console.log("[MOCK] Unban:", id);
  return { success: true };
}

export async function createBan(
  ip: string,
  reason: string
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch('/api/bans', { method: 'POST', body })
  console.log("[MOCK] Ban IP:", ip, reason);
  return { success: true };
}

export async function fetchWhitelistEntries(): Promise<
  import("../types/dashboard").WhitelistEntry[]
> {
  // TODO(backend): return fetch('/api/whitelist').then(r => r.json())
  const { getDefaultWhitelist } = await import("../mock-data");
  return getDefaultWhitelist();
}

export async function removeWhitelistEntry(
  id: string
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch(`/api/whitelist/${id}`, { method: 'DELETE' })
  console.log("[MOCK] Remove whitelist:", id);
  return { success: true };
}

export async function createWhitelistEntry(
  ip: string,
  label: string,
  deviceId?: string
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch('/api/whitelist', { method: 'POST', body })
  console.log("[MOCK] Whitelist:", ip, label, deviceId);
  return { success: true };
}

// --- Offers ---

export async function fetchOfferConfig(): Promise<
  import("../types/dashboard").OfferConfig
> {
  // TODO(backend): return fetch('/api/offers').then(r => r.json())
  const { getDefaultOfferConfig } = await import("../mock-data");
  return getDefaultOfferConfig();
}

export async function saveOfferConfig(
  config: import("../types/dashboard").OfferConfig
): Promise<{ success: boolean }> {
  // TODO(backend): return fetch('/api/offers', { method: 'PUT', body: JSON.stringify(config) })
  console.log("[MOCK] Save offer config:", config);
  return { success: true };
}
