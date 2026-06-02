"use client";

import { useMemo, useState } from "react";
import { CopilotSidebar, useAgentContext } from "@copilotkit/react-core/v2";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Command,
  FileText,
  Gauge,
  Inbox,
  LifeBuoy,
  ListFilter,
  MessageSquareText,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TicketCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import {
  activityFeed,
  errorCodes,
  getHighRiskTickets,
  kpiSummary,
  sentimentMix,
  slaRiskByArea,
  tickets,
  volumeTrend,
  type Severity,
  type Ticket,
  type TicketStatus,
} from "@/lib/demo-data";

type StatusFilter = TicketStatus | "All";
type SeverityFilter = Severity | "All";

const statusFilters: StatusFilter[] = [
  "All",
  "New",
  "Triaged",
  "Waiting",
  "Escalated",
  "Resolved",
];

const severityFilters: SeverityFilter[] = ["All", "P0", "P1", "P2", "P3"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat("en-US");

const sentimentColors: Record<string, string> = {
  Calm: "#0d9488",
  Concerned: "#f59e0b",
  Frustrated: "#f97316",
  Blocked: "#dc2626",
};

function minutesLabel(minutes: number) {
  if (minutes < 0) {
    return `${Math.abs(minutes)}m breached`;
  }
  if (minutes < 60) {
    return `${minutes}m left`;
  }
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
}

function dateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function severityClass(severity: Severity) {
  return clsx(
    "inline-flex min-w-10 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold",
    severity === "P0" && "bg-red-50 text-red-700 ring-1 ring-red-200",
    severity === "P1" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    severity === "P2" && "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    severity === "P3" && "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  );
}

function statusClass(status: TicketStatus) {
  return clsx(
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
    status === "Escalated" && "bg-red-50 text-red-700",
    status === "Waiting" && "bg-amber-50 text-amber-700",
    status === "Resolved" && "bg-emerald-50 text-emerald-700",
    status === "Triaged" && "bg-teal-50 text-teal-700",
    status === "New" && "bg-slate-100 text-slate-700",
  );
}

function riskLabel(ticket: Ticket) {
  if (ticket.slaMinutesRemaining < 0) {
    return "Breached";
  }
  if (ticket.slaMinutesRemaining < 30) {
    return "Critical";
  }
  if (ticket.slaMinutesRemaining < 90) {
    return "Watch";
  }
  return "Healthy";
}

function queueCount(status: TicketStatus) {
  return tickets.filter((ticket) => ticket.status === status).length;
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: "teal" | "amber" | "red" | "slate";
}) {
  return (
    <section className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div
          className={clsx(
            "flex size-10 items-center justify-center rounded-lg",
            tone === "teal" && "bg-teal-50 text-teal-700",
            tone === "amber" && "bg-amber-50 text-amber-700",
            tone === "red" && "bg-red-50 text-red-700",
            tone === "slate" && "bg-slate-100 text-slate-700",
          )}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{sub}</p>
    </section>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={clsx(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition",
        active
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
      type="button"
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={clsx(
        "min-h-9 rounded-md px-3 text-sm font-medium transition",
        active
          ? "bg-slate-950 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-950",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TicketRow({
  ticket,
  active,
  onSelect,
}: {
  ticket: Ticket;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <tr
      className={clsx(
        "cursor-pointer border-b border-slate-100 transition hover:bg-slate-50",
        active && "bg-teal-50/70",
      )}
      onClick={onSelect}
    >
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
        {ticket.id}
      </td>
      <td className="min-w-72 px-4 py-3">
        <div className="font-medium text-slate-950">{ticket.subject}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{ticket.customer.company}</span>
          <span>{ticket.errorCode}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={severityClass(ticket.severity)}>{ticket.severity}</span>
      </td>
      <td className="px-4 py-3">
        <span className={statusClass(ticket.status)}>{ticket.status}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
        {minutesLabel(ticket.slaMinutesRemaining)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
        {ticket.owner.name}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-950">
        {ticket.priorityScore}
      </td>
    </tr>
  );
}

function SelectedTicketPanel({ ticket }: { ticket: Ticket }) {
  const relatedError = errorCodes.find((error) => ticket.errorCode.startsWith(error.code));

  return (
    <aside className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-500">{ticket.id}</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{ticket.subject}</h2>
        </div>
        <span className={severityClass(ticket.severity)}>{ticket.severity}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">Customer</p>
          <p className="mt-1 font-medium text-slate-950">{ticket.customer.company}</p>
          <p className="text-slate-500">{ticket.customer.tier}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">SLA</p>
          <p className="mt-1 font-medium text-slate-950">{riskLabel(ticket)}</p>
          <p className="text-slate-500">{minutesLabel(ticket.slaMinutesRemaining)}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">ARR at Risk</p>
          <p className="mt-1 font-medium text-slate-950">
            {currency.format(ticket.affectedRevenue)}
          </p>
          <p className="text-slate-500">{ticket.customer.region}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">Sentiment</p>
          <p className="mt-1 font-medium text-slate-950">{ticket.sentiment}</p>
          <p className="text-slate-500">{ticket.channel}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <ShieldAlert size={16} className="text-amber-600" />
          <span>{ticket.errorCode}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.summary}</p>
        {relatedError ? (
          <div className="mt-3 rounded-md bg-teal-50 p-3 text-sm text-teal-900">
            <p className="font-medium">Runbook: {relatedError.doc}</p>
            <p className="mt-1">{relatedError.mitigation}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ticket.tags.map((tag) => (
          <span
            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </aside>
  );
}

function KnowledgePanel() {
  return (
    <section className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">RAG corpus</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Generated support docs</h2>
        </div>
        <FileText size={20} className="text-teal-700" />
      </div>
      <div className="mt-4 space-y-3">
        {errorCodes.slice(0, 4).map((error) => (
          <div className="rounded-lg border border-slate-200 p-3" key={error.code}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs font-semibold text-slate-950">
                {error.code} {error.title}
              </p>
              <span className={severityClass(error.severity)}>{error.severity}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{error.signal}</p>
            <p className="mt-2 text-xs font-medium text-teal-700">{error.doc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Dashboard() {
  const [status, setStatus] = useState<StatusFilter>("All");
  const [severity, setSeverity] = useState<SeverityFilter>("All");
  const [query, setQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(getHighRiskTickets(1)[0]!.id);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter((ticket) => status === "All" || ticket.status === status)
      .filter((ticket) => severity === "All" || ticket.severity === severity)
      .filter((ticket) => {
        const haystack = [
          ticket.id,
          ticket.subject,
          ticket.customer.company,
          ticket.customer.name,
          ticket.errorCode,
          ticket.owner.name,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query.toLowerCase());
      })
      .sort((left, right) => right.priorityScore - left.priorityScore);
  }, [query, severity, status]);

  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedTicketId) ??
    tickets.find((ticket) => ticket.id === selectedTicketId) ??
    getHighRiskTickets(1)[0]!;

  useAgentContext({
    description: "Current AtlasDesk help-desk dashboard state",
    value: {
      filters: { status, severity, query },
      selectedTicket,
      kpiSummary,
      visibleTicketIds: filteredTickets.slice(0, 10).map((ticket) => ticket.id),
      highRiskTickets: getHighRiskTickets(5).map((ticket) => ({
        id: ticket.id,
        severity: ticket.severity,
        errorCode: ticket.errorCode,
        customer: ticket.customer.company,
        slaMinutesRemaining: ticket.slaMinutesRemaining,
      })),
    },
  });

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950 lg:pr-[420px]">
      <div className="flex min-h-dvh">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-4 lg:block">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Command size={19} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-950">AtlasDesk</p>
              <p className="text-xs text-slate-500">Support OS demo</p>
            </div>
          </div>
          <nav className="mt-8 space-y-1">
            <SidebarItem active icon={Inbox} label="Command Center" />
            <SidebarItem icon={TicketCheck} label="Ticket Queue" />
            <SidebarItem icon={Workflow} label="Incidents" />
            <SidebarItem icon={FileText} label="Knowledge Base" />
            <SidebarItem icon={Bot} label="Copilot Tools" />
          </nav>
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Sparkles size={16} className="text-teal-700" />
              <span>Demo mode</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Seeded queue, generated runbooks, and live CopilotKit runtime route.
            </p>
          </div>
          <div className="mt-auto pt-8">
            <SidebarItem icon={Settings} label="Settings" />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                  <LifeBuoy size={16} />
                  <span>Help-desk booster</span>
                </div>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                  Support command center
                </h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block min-w-72">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search tickets, customers, error codes"
                    value={query}
                  />
                </label>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  title="Review escalations"
                  type="button"
                >
                  <Bell size={16} />
                  <span>Review</span>
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-5 px-4 py-5 md:px-6">
            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <MetricCard
                icon={Inbox}
                label="Open queue"
                sub={`${queueCount("Escalated")} escalated, ${queueCount("Waiting")} waiting`}
                tone="teal"
                value={numberFormat.format(kpiSummary.openTickets)}
              />
              <MetricCard
                icon={ShieldAlert}
                label="P0/P1 load"
                sub="Highest-severity tickets currently visible"
                tone="red"
                value={numberFormat.format(kpiSummary.p0P1)}
              />
              <MetricCard
                icon={Clock3}
                label="SLA breaches"
                sub={`${kpiSummary.avgResponseMinutes}m average first response`}
                tone="amber"
                value={numberFormat.format(kpiSummary.breachedSla)}
              />
              <MetricCard
                icon={Gauge}
                label="ARR exposed"
                sub="Tickets within one hour of SLA risk"
                tone="slate"
                value={currency.format(kpiSummary.exposedArr)}
              />
            </section>

            <section className="grid gap-5 2xl:grid-cols-[1.35fr_0.9fr]">
              <div className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Queue operations</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      Ticket intake and resolution
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((item) => (
                      <FilterButton
                        active={status === item}
                        key={item}
                        label={item}
                        onClick={() => setStatus(item)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 h-72">
                  <ResponsiveContainer height="100%" width="100%">
                    <AreaChart data={volumeTrend}>
                      <defs>
                        <linearGradient id="newTickets" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.26} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} width={32} />
                      <Tooltip />
                      <Area
                        dataKey="new"
                        fill="url(#newTickets)"
                        stroke="#0d9488"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Area
                        dataKey="resolved"
                        fill="transparent"
                        stroke="#475569"
                        strokeWidth={2}
                        type="monotone"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-1">
                <div className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">SLA by area</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-950">Risk density</h2>
                    </div>
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={slaRiskByArea} layout="vertical" margin={{ left: 12 }}>
                        <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis hide type="number" />
                        <YAxis
                          dataKey="area"
                          stroke="#64748b"
                          tickLine={false}
                          type="category"
                          width={92}
                        />
                        <Tooltip />
                        <Bar dataKey="risk" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Sentiment</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-950">Customer tone</h2>
                    </div>
                    <MessageSquareText size={20} className="text-teal-700" />
                  </div>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer height="100%" width="100%">
                      <PieChart>
                        <Pie
                          cx="50%"
                          cy="50%"
                          data={sentimentMix}
                          dataKey="count"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={3}
                        >
                          {sentimentMix.map((entry) => (
                            <Cell
                              fill={sentimentColors[entry.sentiment]}
                              key={entry.sentiment}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sentimentMix.map((entry) => (
                      <div className="flex items-center gap-2 text-sm text-slate-600" key={entry.sentiment}>
                        <span
                          className="size-2 rounded-full"
                          style={{ background: sentimentColors[entry.sentiment] }}
                        />
                        <span>{entry.sentiment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 2xl:grid-cols-[1fr_360px]">
              <div className="contain-panel overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Prioritized queue</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      {filteredTickets.length} matching tickets
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <ListFilter size={17} className="text-slate-400" />
                    <select
                      className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                      onChange={(event) => setSeverity(event.target.value as SeverityFilter)}
                      value={severity}
                    >
                      {severityFilters.map((item) => (
                        <option key={item} value={item}>
                          {item === "All" ? "All severities" : item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ticket</th>
                        <th className="px-4 py-3 font-semibold">Case</th>
                        <th className="px-4 py-3 font-semibold">Severity</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">SLA</th>
                        <th className="px-4 py-3 font-semibold">Owner</th>
                        <th className="px-4 py-3 text-right font-semibold">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.slice(0, 14).map((ticket) => (
                        <TicketRow
                          active={ticket.id === selectedTicket.id}
                          key={ticket.id}
                          onSelect={() => setSelectedTicketId(ticket.id)}
                          ticket={ticket}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <SelectedTicketPanel ticket={selectedTicket} />
            </section>

            <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <KnowledgePanel />

              <section className="contain-panel rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Ops timeline</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">Live activity</h2>
                  </div>
                  <CircleHelp size={20} className="text-slate-500" />
                </div>
                <div className="mt-4 space-y-4">
                  {activityFeed.map((item) => (
                    <div className="grid grid-cols-[64px_1fr] gap-3" key={`${item.time}-${item.title}`}>
                      <div className="font-mono text-xs font-semibold text-slate-500">{item.time}</div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                          <CheckCircle2 size={16} className="text-teal-700" />
                          <span>{item.title}</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Bot size={17} />
                    <span>Copilot prompt starter</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Ask: “Which P1 tickets should I handle first and what runbook source should I cite?”
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-teal-200">
                    <ArrowUpRight size={14} />
                    <span>Uses current dashboard state and server-side RAG tools</span>
                  </div>
                </div>
              </section>
            </section>

            <footer className="pb-6 text-xs text-slate-500">
              Last seeded activity: {dateTimeLabel(selectedTicket.lastActivityAt)}. All demo people names include Test.
            </footer>
          </div>
        </main>
      </div>

      <CopilotSidebar
        agentId="default"
        defaultOpen
        labels={{
          chatInputPlaceholder: "Ask about tickets, SLA risk, or error-code docs...",
          modalHeaderTitle: "AtlasDesk Copilot",
          welcomeMessageText:
            "Ask me to triage the visible queue, explain E-4312 or E-9207, draft a customer update, or search the generated runbooks.",
        }}
        width={420}
      />
    </div>
  );
}
