# Auth And Sync Error Codes

## E-4312 AUTH_TOKEN_STALE

Signal: OAuth refresh token returns 401 after workspace ownership transfer, security policy update, or identity cache migration.

Common symptoms:

- Customer can log in but connector refresh fails.
- Sync jobs show repeated 401 responses with unchanged refresh token ID.
- Workspace audit log shows admin transfer or SSO policy update within the last 24 hours.

Recommended mitigation:

1. Confirm the workspace owner and SSO policy changed.
2. Invalidate the identity cache for the workspace.
3. Ask the customer to reconnect the affected integration.
4. Replay queued sync jobs after the new token is confirmed.

Escalate to Identity Engineering when the same workspace fails two reconnect attempts or the error affects more than five workspaces.

## E-9207 SYNC_BACKPRESSURE

Signal: connector lag exceeds 15 minutes while worker CPU remains saturated or dead-letter queues grow faster than replay throughput.

Common symptoms:

- Customer dashboard shows stale imported events.
- Queue telemetry shows sustained retry loops.
- New events import after a long delay, but historical replay remains blocked.

Recommended mitigation:

1. Move strategic or enterprise tenants to the priority queue.
2. Pause nonessential historical replays.
3. Drain dead-letter jobs by connector type.
4. Attach the ticket to the active incident if lag affects multiple tenants.

Escalate to Data Sync when connector lag exceeds 30 minutes, customer ARR exposure is above $250,000, or the same connector reports E-9207 across three regions.
