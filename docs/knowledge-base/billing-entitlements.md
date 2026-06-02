# Billing And Entitlements

## E-6730 BILLING_ENTITLEMENT_DRIFT

Signal: a paid account loses access to plan features after invoice retry, manual contract update, or plan migration.

Symptoms:

- Customer sees downgrade messaging despite active contract.
- Audit log shows invoice retry or manual plan override.
- Entitlement snapshot timestamp is older than invoice paid timestamp.

Mitigation:

1. Pull the latest billing account snapshot.
2. Compare invoice status, contract tier, and workspace entitlement flags.
3. Refresh entitlement cache for the workspace.
4. Apply temporary plan override only if the contract is active and cache refresh fails.

Escalate to Billing Engineering when a strategic customer has blocked users, when more than one workspace is affected, or when invoice state and entitlement state disagree after two cache refreshes.

## Support Guidance

Use direct, low-drama language. Tell customers that access is being reconciled against their active contract and that support is restoring the correct entitlement state. Do not mention internal billing provider names in customer-facing updates.
