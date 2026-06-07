# AtlasDesk Help Desk Booster

Portfolio-ready demo of an imaginary unicorn help-desk dashboard with seeded ticket data, generated knowledge-base docs, CopilotKit agent UI, and LangChain-backed RAG retrieval.

## Stack

- Next.js App Router, TypeScript strict mode, Tailwind CSS
- CopilotKit v2 runtime and sidebar UI
- LangChain `MemoryVectorStore` with OpenAI embeddings for RAG
- MiniSearch fallback when `OPENAI_API_KEY` is not configured
- Recharts, lucide-react, deterministic seeded demo data

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The dashboard renders without credentials. Copilot responses and vector retrieval need `OPENAI_API_KEY`. Without the key, `/api/knowledge-search` uses MiniSearch fallback so the generated docs remain searchable.

## Demo Prompts

- Which P1 tickets should I handle first?
- Explain E-4312 and cite the runbook source.
- Draft a concise customer update for the selected breached SLA ticket.
- Search the knowledge base for webhook signature mismatch.
- Summarize exposed ARR and the top error-code patterns.

## GSD + Codex Workflow

Install GSD locally for this repo:

```bash
npx get-shit-done-cc@latest --codex --local
```

Start Codex from the repo with explicit approval and sandbox settings:

```bash
codex --cd . --sandbox danger-full-access --ask-for-approval never
```

Then use the GSD commands from the agent session:

```text
/gsd:new-project
/gsd:discuss-phase 1
/gsd:plan-phase 1
/gsd:execute-phase 1
/gsd:verify-work 1
/gsd:progress
```

For full unattended automation in an externally sandboxed environment, Codex also exposes:

```bash
codex --cd . --dangerously-bypass-approvals-and-sandbox
```

## Key Files

- `src/components/dashboard.tsx` - operational dashboard and Copilot sidebar
- `src/app/api/copilotkit/route.ts` - CopilotKit runtime and server tools
- `src/lib/rag.ts` - LangChain vector retrieval and MiniSearch fallback
- `src/lib/demo-data.ts` - deterministic seeded tickets, agents, customers, and KPIs
- `docs/knowledge-base/*.md` - generated documentation corpus for RAG

## Deployment Notes

Set `OPENAI_API_KEY` in the hosting environment before publishing the live Copilot demo. For Vercel CLI compatibility, upgrade the local CLI when possible:

```bash
npm i -g vercel@latest
```

or:

```bash
pnpm add -g vercel@latest
```
