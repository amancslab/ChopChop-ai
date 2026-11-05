# ChopChop.ai — GitHub Copilot Instructions

## Project context
ChopChop.ai is a video-content creation application involving React, TypeScript, Vite, Python, Gemini AI, YouTube integration and media processing.

The canonical application architecture and actual frontend/backend integration are still under investigation. Never assume intended functionality is already implemented.

## Mandatory engineering instructions
Before modifying code, read `engineering/AGENT_INSTRUCTIONS.md`. Treat it as the detailed engineering and safety guide for this repository.

If instructions conflict or architecture is unclear, stop and explain the conflict rather than guessing.

## Branch safety
- `main` remains connected to Google AI Studio synchronization.
- `production` is the release integration branch.
- Never rename the default branch or modify Google AI Studio integration.
- Never force-push, reset shared branches or delete permanent branches.
- Work on an isolated task branch.
- Submit changes through a pull request.
- Never bypass the production branch ruleset.

## Implementation workflow
1. Read the complete GitHub issue and acceptance criteria.
2. Inspect relevant files, dependencies and execution paths.
3. Determine the actual architecture before proposing changes.
4. Present an implementation plan.
5. Modify only files necessary for the approved scope.
6. Add regression tests where appropriate.
7. Execute real verification commands and report their results.
8. Explain risks, limitations and rollback considerations.

Do not introduce unrelated refactoring.

## Security
- Never hardcode API keys, credentials or tokens.
- Never expose secrets in code, logs, URLs or generated files.
- Never implement authentication bypasses or fixed user identities.
- Validate user input and AI-generated output.
- Preserve secret scanning and push protection.
- Do not weaken security settings.

## AI and media accuracy
- Never fabricate Gemini results, transcripts, hooks or timestamps.
- Use source-aligned transcript timing.
- Do not report simulated media processing as successful.
- Validate generated media with FFprobe where appropriate.
- Test failure paths as well as successful paths.
- Use deterministic synthetic fixtures in automated tests.

## Testing
Inspect existing package scripts, dependencies and test directories before choosing commands.

Never invent commands or claim tests passed without execution evidence.

Report:
- Commands executed.
- Actual results.
- Tests skipped and why.
- Remaining failures and limitations.

## Pull requests
Use `.github/pull_request_template.md`.

Every PR must reference its issue and describe the implementation, changed files, actual test evidence, security impact and known risks.

Do not deploy, publish releases or modify production infrastructure without explicit approval.

## Final report
At completion, summarize:
1. Changes made.
2. Files modified.
3. Tests executed and results.
4. Security implications.
5. Remaining risks.
6. Pull request URL, if created.
