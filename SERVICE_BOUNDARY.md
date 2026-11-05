# Private service boundary

People Organised owns canonical accounts, email codes, code attempt limits, session issuance/revocation and operator permissions in a separately deployed private repository. Guardian stores service preferences and checks keyed by a canonical subject, not a second login account.

worker/people-auth.js is only a server-side integration client. worker/admin-service.js is a bounded, credential-protected data API consumed by the separate private operator service; it contains no operator screens or canonical account implementation. Both bridge credentials come from runtime configuration.

Never add private account/admin implementation, production data or runtime secrets to this package or its Git history. Judges need separately provisioned service access or synthetic fixtures, never production administrator credentials.
