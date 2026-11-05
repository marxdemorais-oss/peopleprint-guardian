# Wolfgang | Peopleprint Guardian

A personal fraud and scam Guardian by People Organised. Wolfgang compares a request with its surrounding evidence and the relevant records a person chooses to share. He focuses on the situation, not profiling the person.

**Live application:** https://guardian.peopleorganised.com

## What is included

- One conversation for questions, message checks and follow-ups.
- PDF, image, bank CSV, DOCX, email and message-export imports, with local text extraction and selected-record review.
- Account-scoped context retrieval and comparisons with earlier records.
- Conditional company-registration checks, known-contact comparison, independent public references and optional link-reputation providers.
- Meta model integration and server-side model selection, with configurable provider adapters.
- Gmail/Outlook integration clients, verified email/WhatsApp sender linking and authenticated messaging adapters. Provider approval and credentials are separate.
- An inspector showing recorded server actions, evidence, requests, results and errors. It does not expose private model reasoning.
- The animated Wolfgang interface, authored controller source, database migrations, synthetic fixtures and regression tests.

## Quick local start

Install Node.js 22.13 or later and pnpm. From this repository:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

Open **http://localhost:3000**. The fictional demonstration is at **/demo** and the guided invoice example is at **/tour**. They provide a way to inspect the product without customer records. Live model choices require provider configuration.

To inspect the workspace locally, open **http://localhost:3000/__qa/start?to=/workspace**. This development-only identity does not bypass the live application's account verification, and it cannot submit a new personal assessment. Automated tests exercise those private assessment flows with isolated synthetic accounts and mocked providers.

```sh
pnpm test
pnpm evaluate:context
```

## Optional live services

Copy `.env.example` to `.env`, fill in only the services you intend to configure, and keep it private. Node can load it with:

```sh
node --env-file=.env scripts/dev.mjs
```

For Meta, select `GUARDIAN_PROVIDER=meta` and configure your own model access and API key. See the settings comments and `worker/model-provider.js`. Personal checks also require a compatible identity-service integration. Never use production credentials in tests, browser code or a public repository.

## Architecture

`web/` contains the interface and browser-side import readers. `worker/` contains the server routes, assessment orchestration, model adapters, context retrieval and verification logic. `drizzle/` contains the SQL migrations. `model/` contains Wolfgang's controller and authored motion inputs. `tests/` and `evaluation/` use synthetic cases.

The build embeds the interface in `worker/index.js`, an ESM Worker exposing `fetch`. It uses a D1-compatible `DB` binding. The local development server supplies a SQLite adapter. Production hosting configuration and provider accounts must be supplied independently.

## Public distribution boundary

This is the Guardian application source export of live version 120, source commit `2bf1718e21b959440744e434c22121d78531e601`.

It intentionally excludes runtime secrets, the jury passcode, personal/customer records, production databases, Git history, the separate private People Organised identity/operator implementation and the maintained production UK directory. Public directory fixtures and selected reference examples support local tests. See [SERVICE_BOUNDARY.md](SERVICE_BOUNDARY.md).

The public package adds this documentation and licensing, blank example settings and a public KaDeWe reference fixture used by the regression tests. Synthetic test keys are represented as clearly generated test values. No customer data is used by the test suite. Tests do not measure live-provider answer accuracy.

## Verification of this export

The public package build passed. Its test run completed with 1,014 passed, one skipped and no failures. The secret scan and directory-fixture checks passed. Production-only catalogue tests are outside this export.

## Licence

Original application code and documentation are available under the [MIT licence](LICENSE). Third-party components retain their own licences. Character and branding assets are separate; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
