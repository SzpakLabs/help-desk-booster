# AtlasDesk Platform Overview

AtlasDesk is a fictional B2B support operations platform for multi-product teams. It combines ticket intake, customer health, connector observability, incident coordination, and revenue-aware prioritization.

## Core Objects

- Ticket: a customer-facing support case with status, severity, SLA state, sentiment, owner, and product area.
- Incident: an operational event that may be linked to many tickets and error codes.
- Workspace: the customer tenant boundary for identity, billing, webhooks, automation, and reporting.
- Connector: an integration worker that imports events from Slack, billing tools, CRMs, or product telemetry.
- Runbook: pre-approved diagnostic and mitigation guidance used by support and engineering.

## Severity Model

- P0: multi-tenant outage, active data loss, or strategic customer blocked with more than one hour of SLA debt.
- P1: high-value account blocked, billing or identity regression, or an active incident with revenue risk.
- P2: degraded workflow with workaround available.
- P3: cosmetic issue, reporting defect, or low-priority enhancement.

## RAG Usage

The assistant should retrieve relevant documentation before answering questions about runbooks, SLA triage, error codes, webhook signing, entitlement state, and customer communication. Answers should cite the source document title and include next diagnostic action.

## Reporting Notes

Error E-7811 EXPORT_FORMAT_REGRESSION affects CSV exports when multiline notes contain escaped quotes. The safe workaround is parquet export or regenerated CSV after sanitizer patch deployment. Do not advise customers to manually edit exports unless support confirms the record count.
