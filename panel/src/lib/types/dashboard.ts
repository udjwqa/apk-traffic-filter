export interface DashboardMetrics {
  requests24h: number;
  greyTraffic: { count: number; percentage: number };
  whiteTraffic: { count: number; percentage: number };
  activeBans24h: number;
  currentRps: number;
}

export interface TrafficDataPoint {
  hour: string;
  grey: number;
  white: number;
}

export interface RejectionReason {
  code: string;
  label: string;
  count: number;
}

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  countryCode: string;
  deviceModel: string;
  os: string;
  score: number;
  verdict: "grey" | "white";
  rejectionCode: string | null;
  rawPayload: {
    headers: Record<string, string>;
    jsMetrics: Record<string, unknown>;
    playIntegrity: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface AuditLogFilters {
  search: string;
  verdict: "all" | "grey" | "white";
  rejectionCode: string | null;
  country: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface AuditLogResponse {
  entries: RequestLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BanAction {
  ip: string;
  reason: string;
  permanent: boolean;
}

export interface WhitelistAction {
  ip: string;
  deviceId?: string;
}

export interface EngineConfig {
  scoreThreshold: number;
  ipqsFailOpen: boolean;
  minPlayIntegrity:
    | "MEETS_BASIC_INTEGRITY"
    | "MEETS_DEVICE_INTEGRITY"
    | "MEETS_STRONG_INTEGRITY";

  batteryChargeTimeout: number;
  accelerometerIdleTime: number;
  clickSpeedLimit: number;
  timezoneDriftHours: number;

  weights: {
    vpnProxyTor: number;
    suspiciousCity: number;
    englishWebView: number;
    suspiciousHosting: number;
    mouseWithoutTouch: number;
    timezoneMismatch: number;
  };
}

export interface BlockList {
  id: string;
  name: string;
  filename: string;
  description: string;
  items: string[];
}

export interface BannedEntry {
  id: string;
  ip: string;
  reason: string;
  source: string;
  bannedAt: string;
  bannedBy: string;
}

export interface WhitelistEntry {
  id: string;
  ip: string;
  deviceId?: string;
  label: string;
  addedAt: string;
  addedBy: string;
}

export interface OfferConfig {
  safeUrl: string;
  targetUrl: string;
  whiteFlowType: "show_403" | "show_404" | "redirect_safe" | "fake_html";
}
