# Customer Communication Macros

## SLA Recovery Update

Use when a ticket is in breach debt or under 30 minutes from breach.

Template:

We found the operational signal behind this case and have moved it into the priority recovery queue. The current focus is restoring the affected workflow first, then confirming the backlog is drained. We will send the next update on the agreed incident cadence.

## Error Code Explanation

Use when a customer asks what an AtlasDesk error code means.

Template:

This error code points to a specific platform subsystem and gives our support team the fastest route to the right runbook. We are checking the matching operational signal, linked incidents, and the safest mitigation before asking you to retry anything.

## Billing Entitlement Update

Use for E-6730 or plan-access regressions.

Template:

Your account is being reconciled against the active contract. We are refreshing the entitlement state and will confirm once the expected access is visible again. No action is needed from your team unless we ask for a validation screenshot.

## Macro Rules

- Always include a concrete next update time for P0 and P1 cases.
- Do not blame customer configuration before confirming logs.
- Do not expose internal queue names, vendor names, or unreleased feature flags.
- Link the ticket to an incident before sending incident cadence language.
