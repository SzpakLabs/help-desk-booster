# Integrations And Webhooks

## E-1184 WEBHOOK_SIGNATURE_MISMATCH

Signal: inbound webhook fails HMAC validation after endpoint rotation, signing secret version mismatch, or customer-side proxy modification.

Symptoms:

- Payload arrives at the expected endpoint but verification fails.
- Secret version in AtlasDesk is older than the customer's configured endpoint secret.
- Proxy or gateway rewrites request body, timestamp header, or signature header.

Mitigation:

1. Confirm endpoint URL and secret version.
2. Ask the customer to send a fresh test event from their integration settings.
3. Compare received timestamp and body hash with the event source.
4. Regenerate the signing secret if version mismatch is confirmed.
5. Replay the last valid payload after verification passes.

Escalate to Integrations Engineering when verification fails with a newly generated secret, when multiple customers on the same connector are affected, or when payload body mutations are visible in edge logs.

## Webhook Replay

Webhook replay should preserve event order per workspace. Do not replay failed webhooks out of order for billing, entitlement, or identity connectors.
