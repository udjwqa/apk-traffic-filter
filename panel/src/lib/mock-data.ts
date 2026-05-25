import type {
  DashboardMetrics,
  TrafficDataPoint,
  RejectionReason,
  RequestLogEntry,
  AuditLogFilters,
  AuditLogResponse,
} from "./types/dashboard";

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const COUNTRIES = [
  { name: "Россия", code: "RU", weight: 45 },
  { name: "Украина", code: "UA", weight: 15 },
  { name: "Казахстан", code: "KZ", weight: 10 },
  { name: "Беларусь", code: "BY", weight: 8 },
  { name: "Узбекистан", code: "UZ", weight: 5 },
  { name: "Германия", code: "DE", weight: 4 },
  { name: "Турция", code: "TR", weight: 4 },
  { name: "Польша", code: "PL", weight: 3 },
  { name: "США", code: "US", weight: 3 },
  { name: "Индия", code: "IN", weight: 3 },
];

const DEVICES = [
  "Samsung Galaxy S23",
  "Samsung Galaxy A54",
  "Samsung Galaxy S22",
  "Xiaomi Redmi Note 12",
  "Xiaomi 13 Pro",
  "Xiaomi POCO X5",
  "Huawei P60 Pro",
  "Huawei Nova 11",
  "OPPO Reno 10",
  "OnePlus 11",
  "Realme 11 Pro",
  "Google Pixel 7a",
  "Motorola Edge 40",
  "Vivo V27",
];

const OS_VERSIONS = [
  "Android 11",
  "Android 12",
  "Android 12L",
  "Android 13",
  "Android 14",
];

export const REJECTION_CODES: { code: string; label: string }[] = [
  { code: "google_asn", label: "Google ASN" },
  { code: "device_blocked", label: "Устройство заблокировано" },
  { code: "emulator_detected", label: "Эмулятор обнаружен" },
  { code: "root_detected", label: "Root обнаружен" },
  { code: "vpn_detected", label: "VPN обнаружен" },
  { code: "proxy_detected", label: "Proxy обнаружен" },
  { code: "score_too_low", label: "Низкий скоринг" },
  { code: "integrity_fail", label: "Play Integrity fail" },
];

function weightedPick(
  items: { name: string; code: string; weight: number }[]
): (typeof items)[0] {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[0];
}

function randomIp(): string {
  return `${rand(1, 223)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}

// TODO(backend): Replace with GET /api/dashboard/metrics
export function generateMockMetrics(): DashboardMetrics {
  const total = rand(18000, 45000);
  const greyPct = rand(70, 88);
  const greyCount = Math.round((total * greyPct) / 100);
  const whiteCount = total - greyCount;
  const whitePct = 100 - greyPct;

  return {
    requests24h: total,
    greyTraffic: { count: greyCount, percentage: greyPct },
    whiteTraffic: { count: whiteCount, percentage: whitePct },
    activeBans24h: rand(120, 890),
    currentRps: rand(15, 180),
  };
}

// TODO(backend): Replace with GET /api/dashboard/traffic?period=24h
export function generateMockTrafficData(): TrafficDataPoint[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, "0")}:00`;
    const baseGrey = i >= 8 && i <= 22 ? rand(400, 1200) : rand(80, 300);
    const baseWhite = Math.round(baseGrey * (rand(12, 30) / 100));
    return { hour, grey: baseGrey, white: baseWhite };
  });
}

// TODO(backend): Replace with GET /api/dashboard/rejections
export function generateMockRejectionReasons(): RejectionReason[] {
  return REJECTION_CODES.map((r) => ({
    ...r,
    count: rand(50, 2000),
  })).sort((a, b) => b.count - a.count);
}

// TODO(websocket): Replace with WebSocket message from real feed
export function generateMockRequestEntry(): RequestLogEntry {
  const country = weightedPick(COUNTRIES);
  const score = rand(0, 100);
  const isGrey = score >= 40 && Math.random() > 0.2;
  const verdict: "grey" | "white" = isGrey ? "grey" : "white";
  const rejectionCode = verdict === "white" ? pick(REJECTION_CODES).code : null;
  const device = pick(DEVICES);
  const os = pick(OS_VERSIONS);
  const ip = randomIp();

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    ip,
    country: country.name,
    countryCode: country.code,
    deviceModel: device,
    os,
    score,
    verdict,
    rejectionCode,
    rawPayload: {
      headers: {
        "User-Agent": `Mozilla/5.0 (Linux; ${os}; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${rand(100, 125)}.0.${rand(1000, 9999)}.${rand(10, 99)} Mobile Safari/537.36`,
        "Accept-Language": `${country.code.toLowerCase()}-${country.code},en-US;q=0.9`,
        "X-Forwarded-For": ip,
        "X-Real-IP": ip,
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        Host: "api.example.com",
      },
      jsMetrics: {
        screenWidth: pick([360, 393, 412, 428]),
        screenHeight: pick([640, 780, 846, 915, 926]),
        pixelRatio: pick([2, 2.5, 3, 3.5]),
        timezone: pick([
          "Europe/Moscow",
          "Europe/Kiev",
          "Asia/Almaty",
          "Europe/Minsk",
        ]),
        language: `${country.code.toLowerCase()}-${country.code}`,
        touchSupport: true,
        webglVendor: pick([
          "Qualcomm",
          "ARM",
          "Mali",
          "Adreno (TM) 730",
          "PowerVR",
        ]),
        batteryLevel: rand(15, 100) / 100,
        hardwareConcurrency: pick([4, 6, 8]),
        deviceMemory: pick([4, 6, 8, 12]),
      },
      playIntegrity: {
        requestDetails: {
          requestPackageName: "com.example.app",
          timestampMillis: Date.now().toString(),
          nonce: uuid(),
        },
        appIntegrity: {
          appRecognitionVerdict: isGrey ? "PLAY_RECOGNIZED" : pick(["UNRECOGNIZED_VERSION", "UNEVALUATED"]),
          packageName: "com.example.app",
          certificateSha256Digest: ["a1b2c3d4e5f6"],
          versionCode: "42",
        },
        deviceIntegrity: {
          deviceRecognitionVerdict: isGrey
            ? ["MEETS_DEVICE_INTEGRITY"]
            : [pick(["MEETS_VIRTUAL_INTEGRITY", ""])],
        },
        accountDetails: {
          appLicensingVerdict: isGrey ? "LICENSED" : "UNEVALUATED",
        },
      },
    },
  };
}

export function generateMockFeed(count: number): RequestLogEntry[] {
  return Array.from({ length: count }, () => generateMockRequestEntry());
}

// TODO(backend): Replace with GET /api/audit/logs with server-side filtering
export function generateMockAuditLog(
  filters: AuditLogFilters,
  page: number,
  pageSize: number
): AuditLogResponse {
  const pool = Array.from({ length: 500 }, (_, i) => {
    const entry = generateMockRequestEntry();
    const hoursAgo = Math.floor(i * 0.5 + Math.random() * 2);
    entry.timestamp = new Date(
      Date.now() - hoursAgo * 60 * 60 * 1000
    ).toISOString();
    return entry;
  });

  let filtered = pool;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.ip.includes(q) ||
        e.rawPayload.headers["User-Agent"]?.toLowerCase().includes(q) ||
        e.deviceModel.toLowerCase().includes(q)
    );
  }
  if (filters.verdict !== "all") {
    filtered = filtered.filter((e) => e.verdict === filters.verdict);
  }
  if (filters.rejectionCode) {
    filtered = filtered.filter(
      (e) => e.rejectionCode === filters.rejectionCode
    );
  }
  if (filters.country) {
    filtered = filtered.filter((e) => e.countryCode === filters.country);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const entries = filtered.slice(start, start + pageSize);

  return { entries, total, page: safePage, pageSize, totalPages };
}

// TODO(backend): Replace with GET /api/config from real config storage
export function getDefaultEngineConfig(): import("./types/dashboard").EngineConfig {
  return {
    scoreThreshold: 70,
    ipqsFailOpen: false,
    minPlayIntegrity: "MEETS_DEVICE_INTEGRITY",
    batteryChargeTimeout: 1800,
    accelerometerIdleTime: 300,
    clickSpeedLimit: 10,
    timezoneDriftHours: 2,
    weights: {
      vpnProxyTor: 25,
      suspiciousCity: 15,
      englishWebView: 10,
      suspiciousHosting: 20,
      mouseWithoutTouch: 30,
      timezoneMismatch: 15,
    },
  };
}

// TODO(backend): Replace with GET /api/lists reading from server/lists/*.txt or CF KV
export function getDefaultBlockLists(): import("./types/dashboard").BlockList[] {
  return [
    {
      id: "countries_block",
      name: "Блокировка стран",
      filename: "countries_block.txt",
      description: "Коды стран, трафик из которых блокируется",
      items: ["US", "GB", "DE", "FR", "NL", "SE", "CA", "AU", "JP", "SG"],
    },
    {
      id: "cities_block",
      name: "Блокировка городов модерации",
      filename: "cities_block.txt",
      description: "Города, связанные с модерацией Google/Apple",
      items: [
        "Mountain View",
        "Dublin",
        "Singapore",
        "Zurich",
        "Hyderabad",
        "Austin",
        "New York",
        "London",
      ],
    },
    {
      id: "user_agents_block",
      name: "Стоп-лист ботов",
      filename: "user_agents_block.txt",
      description: "Подстроки User-Agent для блокировки",
      items: [
        "Googlebot",
        "AdsBot-Google",
        "Mediapartners-Google",
        "bingbot",
        "YandexBot",
        "facebookexternalhit",
        "Twitterbot",
        "Bytespider",
        "GPTBot",
        "ClaudeBot",
      ],
    },
    {
      id: "device_models_block",
      name: "Модели устройств (Pixel/Google)",
      filename: "device_models_block.txt",
      description: "Модели устройств, используемых для модерации",
      items: [
        "Pixel 4",
        "Pixel 4a",
        "Pixel 5",
        "Pixel 6",
        "Pixel 6 Pro",
        "Pixel 7",
        "Pixel 7a",
        "Pixel 8",
        "Pixel 8 Pro",
      ],
    },
    {
      id: "codenames_block",
      name: "Кодовые имена эмуляторов",
      filename: "codenames_block.txt",
      description: "Кодовые имена устройств-эмуляторов и виртуальных машин",
      items: [
        "goldfish",
        "ranchu",
        "generic",
        "vbox86p",
        "sdk_gphone",
        "sdk_gphone64",
        "emulator64",
        "emu64a",
        "vsoc_x86",
      ],
    },
    {
      id: "isp_block",
      name: "Запрещённые провайдеры",
      filename: "isp_block.txt",
      description: "ISP/хостинг-провайдеры, связанные с ботами и краулерами",
      items: [
        "Google LLC",
        "Amazon.com",
        "Microsoft Azure",
        "DigitalOcean",
        "OVH SAS",
        "Hetzner",
        "Linode",
        "Vultr",
        "Cloudflare",
      ],
    },
    {
      id: "gpu_block",
      name: "Драйверы GPU эмуляторов",
      filename: "gpu_block.txt",
      description: "GPU-рендереры, характерные для эмуляторов и виртуальных машин",
      items: [
        "Android Emulator",
        "SwiftShader",
        "VirtualBox",
        "VMware SVGA",
        "ANGLE",
        "llvmpipe",
        "softpipe",
        "Mesa DRI",
      ],
    },
  ];
}

// TODO(backend): Replace with GET /api/bans from real ban storage
export function getDefaultBanList(): import("./types/dashboard").BannedEntry[] {
  const reasons = [
    { reason: "manual", source: "Ручной" },
    { reason: "honeypot", source: "Honeypot" },
    { reason: "auto_score", source: "Автоматический" },
    { reason: "cloudflare", source: "Cloudflare" },
  ];
  return Array.from({ length: 18 }, (_, i) => {
    const r = reasons[i % reasons.length];
    const hoursAgo = rand(1, 720);
    return {
      id: uuid(),
      ip: randomIp(),
      reason: r.reason,
      source: r.source,
      bannedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      bannedBy: r.reason === "manual" ? "admin@panel.local" : "system",
    };
  });
}

// TODO(backend): Replace with GET /api/whitelist from real whitelist storage
export function getDefaultWhitelist(): import("./types/dashboard").WhitelistEntry[] {
  const entries = [
    { label: "Разработчик (Lead)", deviceId: "DEV-001-ABCD" },
    { label: "Тестер QA", deviceId: "QA-002-EFGH" },
    { label: "Тестер QA #2", deviceId: "QA-003-IJKL" },
    { label: "PM (мониторинг)", deviceId: undefined },
    { label: "Сервер мониторинга", deviceId: undefined },
    { label: "CI/CD Pipeline", deviceId: "CI-RUNNER-01" },
  ];
  return entries.map((e, i) => ({
    id: uuid(),
    ip: `10.0.${i + 1}.${rand(1, 254)}`,
    deviceId: e.deviceId,
    label: e.label,
    addedAt: new Date(Date.now() - rand(1, 90) * 86400000).toISOString(),
    addedBy: "admin@panel.local",
  }));
}

// TODO(backend): Replace with GET /api/offers from real config storage
export function getDefaultOfferConfig(): import("./types/dashboard").OfferConfig {
  return {
    safeUrl: "https://play.google.com/store/apps/details?id=com.example.safe",
    targetUrl: "https://api.example.com/offer/target",
    whiteFlowType: "redirect_safe",
  };
}
