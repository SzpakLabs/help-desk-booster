import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent, defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import {
  errorCodes,
  getHighRiskTickets,
  getTicketById,
  kpiSummary,
  tickets,
} from "@/lib/demo-data";
import { searchKnowledgeBase } from "@/lib/rag";

const supportTools = [
  defineTool({
    name: "searchKnowledgeBase",
    description:
      "Search AtlasDesk runbooks, error-code docs, SLA triage docs, billing guidance, and communication macros before answering support questions.",
    parameters: z.object({
      query: z.string().describe("The support, runbook, or error-code question to retrieve documentation for."),
      limit: z.number().min(1).max(6).optional().describe("Maximum number of documentation snippets."),
    }),
    execute: async ({ query, limit }) => searchKnowledgeBase(query, limit ?? 4),
  }),
  defineTool({
    name: "getTicketDetails",
    description: "Fetch a seeded AtlasDesk ticket by ID, including customer tier, SLA state, sentiment, and error code.",
    parameters: z.object({
      ticketId: z.string().describe("Ticket ID, for example ATD-2479."),
    }),
    execute: async ({ ticketId }) => {
      const ticket = getTicketById(ticketId.toUpperCase());
      return ticket ?? { error: "Ticket not found", ticketId };
    },
  }),
  defineTool({
    name: "listHighRiskTickets",
    description: "List the highest-risk seeded tickets by priority score for triage and portfolio-demo workflows.",
    parameters: z.object({
      limit: z.number().min(1).max(12).optional(),
    }),
    execute: async ({ limit }) => getHighRiskTickets(limit ?? 6),
  }),
  defineTool({
    name: "getOperationalSummary",
    description: "Return current demo dashboard KPIs, queue counts, exposed ARR, and known error codes.",
    parameters: z.object({}),
    execute: async () => ({
      kpis: kpiSummary,
      queue: {
        total: tickets.length,
        escalated: tickets.filter((ticket) => ticket.status === "Escalated").length,
        waiting: tickets.filter((ticket) => ticket.status === "Waiting").length,
        breachedSla: tickets.filter((ticket) => ticket.slaMinutesRemaining < 0).length,
      },
      errorCodes,
    }),
  }),
];

const builtInAgent = new BuiltInAgent({
  model: process.env.COPILOT_MODEL ?? "openai:gpt-5.4-mini",
  maxSteps: 4,
  prompt: [
    "You are AtlasDesk Copilot, an embedded help-desk operations assistant for a fictional SaaS dashboard demo.",
    "Use the provided tools for ticket lookup, queue summaries, and knowledge-base retrieval.",
    "For error-code, runbook, SLA, billing, webhook, or macro questions, call searchKnowledgeBase before answering.",
    "Keep answers concise, cite source document titles when documentation is retrieved, and propose the next operational action.",
    "All customer and agent names in examples must include Test.",
  ].join("\n"),
  tools: supportTools,
});

const runtime = new CopilotRuntime({
  agents: {
    default: builtInAgent,
  },
});

export async function handleCopilotRequest(req: Request) {
  const url = new URL(req.url);

  if (req.method === "GET" && url.pathname.endsWith("/api/copilotkit/threads")) {
    return Response.json({
      threads: [],
      joinCode: "",
      nextCursor: null,
    });
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
}
