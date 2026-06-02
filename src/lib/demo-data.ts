export type TicketStatus =
  | "New"
  | "Triaged"
  | "Waiting"
  | "Escalated"
  | "Resolved";

export type Severity = "P0" | "P1" | "P2" | "P3";

export type CustomerTier = "Startup" | "Scale" | "Enterprise" | "Strategic";

export type Sentiment = "Calm" | "Concerned" | "Frustrated" | "Blocked";

export type Channel = "Email" | "Chat" | "Slack" | "Portal" | "Webhook";

export type ErrorCode = {
  code: string;
  title: string;
  productArea: string;
  severity: Severity;
  doc: string;
  signal: string;
  mitigation: string;
};

export type Customer = {
  id: string;
  name: string;
  company: string;
  tier: CustomerTier;
  arr: number;
  region: string;
};

export type Agent = {
  id: string;
  name: string;
  role: string;
  load: number;
  specialty: string;
};

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  severity: Severity;
  channel: Channel;
  customer: Customer;
  owner: Agent;
  productArea: string;
  errorCode: string;
  sentiment: Sentiment;
  slaMinutesRemaining: number;
  responseMinutes: number;
  affectedRevenue: number;
  priorityScore: number;
  createdAt: string;
  lastActivityAt: string;
  tags: string[];
  summary: string;
};

const baseTime = Date.parse("2026-06-02T15:30:00.000Z");

const statuses: TicketStatus[] = [
  "New",
  "Triaged",
  "Waiting",
  "Escalated",
  "Resolved",
];

const severities: Severity[] = ["P0", "P1", "P2", "P3"];

const sentiments: Sentiment[] = ["Calm", "Concerned", "Frustrated", "Blocked"];

const channels: Channel[] = ["Email", "Chat", "Slack", "Portal", "Webhook"];

export const errorCodes: ErrorCode[] = [
  {
    code: "E-4312",
    title: "AUTH_TOKEN_STALE",
    productArea: "Identity",
    severity: "P1",
    doc: "error-codes-auth-sync.md",
    signal: "OAuth refresh token returns 401 after workspace ownership transfer.",
    mitigation: "Rotate workspace tokens and replay queued sync jobs after identity cache invalidation.",
  },
  {
    code: "E-9207",
    title: "SYNC_BACKPRESSURE",
    productArea: "Data Sync",
    severity: "P0",
    doc: "error-codes-auth-sync.md",
    signal: "Connector lag exceeds 15 minutes while worker CPU remains saturated.",
    mitigation: "Move tenant to priority queue, pause nonessential replays, and drain dead-letter jobs.",
  },
  {
    code: "E-1184",
    title: "WEBHOOK_SIGNATURE_MISMATCH",
    productArea: "Integrations",
    severity: "P2",
    doc: "integrations-webhooks.md",
    signal: "Inbound webhook fails HMAC validation after endpoint rotation.",
    mitigation: "Verify endpoint secret version, regenerate signing secret, and replay last valid payload.",
  },
  {
    code: "E-6730",
    title: "BILLING_ENTITLEMENT_DRIFT",
    productArea: "Billing",
    severity: "P1",
    doc: "billing-entitlements.md",
    signal: "Paid account sees plan features downgraded after invoice retry.",
    mitigation: "Refresh entitlement snapshot and reconcile invoice state with plan override.",
  },
  {
    code: "E-2049",
    title: "WORKFLOW_TIMEOUT",
    productArea: "Automation",
    severity: "P2",
    doc: "runbook-sla-triage.md",
    signal: "Workflow execution exceeds the tenant timeout policy after a ruleset publish.",
    mitigation: "Rollback the newest ruleset, restart stuck executions, and pin the tenant to stable policy.",
  },
  {
    code: "E-7811",
    title: "EXPORT_FORMAT_REGRESSION",
    productArea: "Reporting",
    severity: "P3",
    doc: "platform-overview.md",
    signal: "CSV export contains invalid escaped fields for accounts using multiline notes.",
    mitigation: "Switch customer to parquet export or regenerated CSV after sanitizer patch.",
  },
];

export const agents: Agent[] = [
  {
    id: "ag-01",
    name: "Nora Test",
    role: "Escalation Lead",
    load: 7,
    specialty: "SLA recovery",
  },
  {
    id: "ag-02",
    name: "Mateo Test",
    role: "Integration Specialist",
    load: 5,
    specialty: "Webhooks",
  },
  {
    id: "ag-03",
    name: "Iris Test",
    role: "Identity Engineer",
    load: 8,
    specialty: "OAuth",
  },
  {
    id: "ag-04",
    name: "Sam Test",
    role: "Billing Analyst",
    load: 4,
    specialty: "Entitlements",
  },
  {
    id: "ag-05",
    name: "Lina Test",
    role: "Automation Engineer",
    load: 6,
    specialty: "Workflow timeouts",
  },
];

export const customers: Customer[] = [
  {
    id: "cu-101",
    name: "Avery Test",
    company: "Northstar Labs",
    tier: "Strategic",
    arr: 860000,
    region: "NA",
  },
  {
    id: "cu-102",
    name: "Mina Test",
    company: "SignalForge",
    tier: "Enterprise",
    arr: 420000,
    region: "EU",
  },
  {
    id: "cu-103",
    name: "Jon Test",
    company: "BrightLayer",
    tier: "Scale",
    arr: 128000,
    region: "NA",
  },
  {
    id: "cu-104",
    name: "Priya Test",
    company: "CloudHarbor",
    tier: "Enterprise",
    arr: 310000,
    region: "APAC",
  },
  {
    id: "cu-105",
    name: "Diego Test",
    company: "OrbitOps",
    tier: "Startup",
    arr: 36000,
    region: "LATAM",
  },
  {
    id: "cu-106",
    name: "June Test",
    company: "HelioCart",
    tier: "Scale",
    arr: 94000,
    region: "EU",
  },
  {
    id: "cu-107",
    name: "Owen Test",
    company: "NimbusRail",
    tier: "Strategic",
    arr: 710000,
    region: "NA",
  },
];

const subjects = [
  "Workspace sync stuck after admin transfer",
  "Priority connector queue is not draining",
  "Webhook endpoint rejects signed payloads",
  "Enterprise plan features missing after renewal",
  "Automation rule timeout after publish",
  "CSV export malformed for multiline note fields",
  "Customer cannot refresh OAuth connection",
  "Slack escalation workflow stalled",
  "Billing guardrail blocked a paid account",
  "Data sync lag visible on executive dashboard",
  "Support macro sent wrong incident status",
  "Portal timeline missing replayed events",
];

const tagPool = [
  "vip",
  "sla-risk",
  "rag-doc",
  "incident-linked",
  "needs-replay",
  "account-health",
  "product-feedback",
  "urgent",
  "follow-up",
];

function createRng(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function roundTo(value: number, precision: number) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function minutesAgo(minutes: number) {
  return new Date(baseTime - minutes * 60_000).toISOString();
}

function getStatusBySla(slaMinutesRemaining: number, random: () => number) {
  if (slaMinutesRemaining < -30) {
    return "Escalated";
  }
  if (slaMinutesRemaining < 20) {
    return pick(["New", "Triaged", "Escalated"], random);
  }
  return pick(statuses, random);
}

function getSeverity(error: ErrorCode, random: () => number) {
  if (random() > 0.68) {
    return pick(severities, random);
  }
  return error.severity;
}

export const tickets: Ticket[] = Array.from({ length: 42 }, (_, index) => {
  const random = createRng(11_000 + index * 251);
  const error = pick(errorCodes, random);
  const customer = pick(customers, random);
  const owner = pick(agents, random);
  const severity = getSeverity(error, random);
  const slaMinutesRemaining = Math.floor(random() * 360) - 90;
  const status = getStatusBySla(slaMinutesRemaining, random);
  const createdAge = Math.floor(random() * 2_400) + 45;
  const lastActivityAge = Math.floor(random() * Math.min(createdAge, 420)) + 4;
  const responseMinutes = Math.floor(random() * 180) + 3;
  const affectedRevenue = Math.round(customer.arr * (0.02 + random() * 0.16));
  const priorityScore = Math.min(
    100,
    Math.round(
      affectedRevenue / 12_000 +
        (severity === "P0" ? 38 : severity === "P1" ? 26 : severity === "P2" ? 14 : 5) +
        (slaMinutesRemaining < 0 ? 24 : slaMinutesRemaining < 30 ? 14 : 0) +
        (customer.tier === "Strategic" ? 18 : customer.tier === "Enterprise" ? 11 : 4),
    ),
  );
  const subject = pick(subjects, random);
  const tags = Array.from(new Set([pick(tagPool, random), pick(tagPool, random)]));

  return {
    id: `ATD-${String(2471 + index).padStart(4, "0")}`,
    subject,
    status,
    severity,
    channel: pick(channels, random),
    customer,
    owner,
    productArea: error.productArea,
    errorCode: `${error.code} ${error.title}`,
    sentiment: pick(sentiments, random),
    slaMinutesRemaining,
    responseMinutes,
    affectedRevenue,
    priorityScore,
    createdAt: minutesAgo(createdAge),
    lastActivityAt: minutesAgo(lastActivityAge),
    tags,
    summary: `${customer.company} reports ${error.signal.toLowerCase()} Recommended mitigation: ${error.mitigation}`,
  };
});

export const kpiSummary = {
  openTickets: tickets.filter((ticket) => ticket.status !== "Resolved").length,
  p0P1: tickets.filter((ticket) => ticket.severity === "P0" || ticket.severity === "P1")
    .length,
  breachedSla: tickets.filter((ticket) => ticket.slaMinutesRemaining < 0).length,
  avgResponseMinutes: Math.round(
    tickets.reduce((sum, ticket) => sum + ticket.responseMinutes, 0) / tickets.length,
  ),
  exposedArr: tickets
    .filter((ticket) => ticket.slaMinutesRemaining < 60)
    .reduce((sum, ticket) => sum + ticket.affectedRevenue, 0),
};

export const volumeTrend = [
  { day: "Thu", new: 28, resolved: 24, breached: 4 },
  { day: "Fri", new: 34, resolved: 31, breached: 5 },
  { day: "Sat", new: 19, resolved: 21, breached: 2 },
  { day: "Sun", new: 16, resolved: 18, breached: 1 },
  { day: "Mon", new: 43, resolved: 36, breached: 7 },
  { day: "Tue", new: 39, resolved: 33, breached: 8 },
];

export const slaRiskByArea = errorCodes.map((error) => {
  const related = tickets.filter((ticket) => ticket.productArea === error.productArea);
  const risk = related.filter((ticket) => ticket.slaMinutesRemaining < 45).length;
  return {
    area: error.productArea,
    risk,
    total: related.length,
    score: roundTo((risk / Math.max(related.length, 1)) * 100, 1),
  };
});

export const sentimentMix = sentiments.map((sentiment) => ({
  sentiment,
  count: tickets.filter((ticket) => ticket.sentiment === sentiment).length,
}));

export const activityFeed = [
  {
    time: "15:22",
    title: "Incident linked",
    detail: "E-9207 added to Data Sync incident INC-2026-0602-1.",
  },
  {
    time: "15:06",
    title: "Macro approved",
    detail: "Enterprise update macro published for SLA recovery cases.",
  },
  {
    time: "14:41",
    title: "Runbook retrieved",
    detail: "Copilot cited Auth + Sync runbook for ATD-2479.",
  },
  {
    time: "14:18",
    title: "Queue rebalance",
    detail: "Strategic accounts moved to priority connector replay.",
  },
];

export function getTicketById(id: string) {
  return tickets.find((ticket) => ticket.id === id) ?? null;
}

export function getHighRiskTickets(limit = 8) {
  return [...tickets]
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, limit);
}

export function getTicketsByStatus(status?: TicketStatus | "All") {
  if (!status || status === "All") {
    return tickets;
  }
  return tickets.filter((ticket) => ticket.status === status);
}
