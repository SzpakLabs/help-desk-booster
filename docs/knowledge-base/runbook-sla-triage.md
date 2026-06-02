# SLA Triage Runbook

## Goal

Recover high-risk accounts before breach, prioritize by customer value and operational blast radius, and make escalation decisions reproducible.

## Risk Score Inputs

- Severity: P0 and P1 always outrank P2 and P3 unless the lower-severity ticket has active revenue loss.
- SLA minutes remaining: negative values mean breach debt and should be visible in the escalation summary.
- Customer tier: Strategic and Enterprise tickets need proactive communication when risk is above 80.
- Error code: E-9207, E-4312, and E-6730 are escalation-prone because they affect data freshness, identity, or paid entitlement.
- Sentiment: Blocked or Frustrated customers require a public update macro even when engineering mitigation is still running.

## E-2049 WORKFLOW_TIMEOUT

Signal: workflow execution exceeds the tenant timeout policy after a ruleset publish, usually because a branch added an unbounded wait or external connector dependency.

Mitigation:

1. Identify the latest ruleset version.
2. Roll back to the last stable policy.
3. Restart stuck executions for affected customers.
4. Pin the tenant to stable policy until Automation Engineering clears the release.

## Communication Cadence

- P0: acknowledge within 5 minutes, update every 15 minutes.
- P1: acknowledge within 15 minutes, update every 30 minutes.
- P2: acknowledge within 4 business hours.
- P3: acknowledge within 1 business day.

Use the customer communication macro only after verifying the incident state. Never promise root cause before engineering confirms it.
