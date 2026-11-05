# ChopChop.ai — Agent Instructions

## 1. Project identity

ChopChop.ai is a video-content creation application intended to help users identify engaging video moments, generate hooks, create subtitles and export short-form videos.

Before making changes, inspect the existing implementation. Do not assume that documented or intended functionality is already implemented.

## 2. Repository architecture

The repository currently contains:
- React, TypeScript and Vite frontend files.
- Python application and media-processing code.
- Gemini AI integration.
- YouTube metadata and transcript functionality.

The canonical application architecture and frontend/backend integration boundaries still require verification.

Do not assume the React frontend and Python application are connected. Trace actual execution paths before proposing architectural changes.

Do not remove, replace or migrate application entry points without evidence and an approved implementation plan.

## 3. Branch and Git safety

- `main` is the Google AI Studio synchronization branch.
- `production` is the release integration branch.
- Never rename the default branch.
- Never disable or modify Google AI Studio synchronization.
- Never force-push, reset shared branches or delete permanent branches.
- Do not commit directly to `production`.
- Use an isolated working branch for agent changes.
- Propose changes through a pull request.
- Production changes must go through a pull request targeting `production`.

## 4. Engineering workflow

Before implementing an issue:

1. Read the complete issue and acceptance criteria.
2. Inspect relevant source files and dependencies.
3. Trace the existing execution flow.
4. Identify affected components and risks.
5. Present a concise implementation plan.
6. Make only changes within the approved scope.
7. Run relevant tests and verification commands.
8. Report actual results and remaining limitations.

Do not introduce unrelated refactoring.

## 5. Code quality

- Follow existing TypeScript, React and Python conventions.
- Prefer small, maintainable and testable functions.
- Validate user input at appropriate boundaries.
- Handle asynchronous operations and failures explicitly.
- Avoid duplicated business logic.
- Use meaningful names and appropriate error handling.
- Preserve existing functionality unless the issue requires changing it.

## 6. Security requirements

- Never hardcode API keys, tokens, passwords or credentials.
- Never expose secrets in logs, URLs, analytics or generated artifacts.
- Never introduce authentication bypasses or fixed user identities.
- Validate authentication and authorization at appropriate server boundaries.
- Treat external content and AI-generated output as untrusted input.
- Do not weaken secret scanning or push protection.
- Do not commit `.env` files or real credentials.

## 7. Gemini and AI behavior

- Never present fabricated AI output as a successful Gemini result.
- Handle missing, invalid and expired API credentials explicitly.
- Validate structured AI responses before using them.
- Do not invent video hooks, transcript content or timestamps.
- Preserve source references where generated content depends on a transcript.

## 8. Media-processing requirements

- Use real processing results rather than simulated success.
- Preserve source-aligned timestamps.
- Validate generated media with FFprobe where appropriate.
- Handle FFmpeg failures and missing dependencies explicitly.
- Use deterministic synthetic media fixtures for automated tests.
- Avoid depending on live YouTube downloads in routine CI tests.
- Clean up temporary files safely.

## 9. Testing and verification

Before running commands, inspect the current package scripts, Python dependencies and test structure.

- Never invent test commands.
- Never claim a test passed without actual execution evidence.
- Report skipped tests and environmental limitations.
- Add regression tests for bug fixes.
- Test important failure paths, not only successful execution.
- Verify frontend builds and applicable Python checks.
- Keep secrets and live external API credentials out of automated tests.

## 10. Documentation

Update documentation when architecture, setup, configuration, API behavior or operational commands change.

Keep README instructions consistent with the verified implementation.

Do not document proposed functionality as already implemented.

## 11. Pull request requirements

Every agent-generated pull request must:

- Reference the relevant GitHub issue.
- Explain the problem and implementation.
- Describe changed files and architectural decisions.
- Provide exact verification commands and their actual results.
- Document known risks and limitations.
- Include screenshots for relevant UI changes.
- Explain rollback considerations.

Use the repository's `.github/pull_request_template.md`.

## 12. Deployment restrictions

Do not deploy, publish releases, modify production infrastructure or introduce deployment secrets without explicit approval.

## 13. Final reporting

At completion, report:

1. What changed.
2. Why it changed.
3. Files affected.
4. Tests executed and actual results.
5. Security implications.
6. Remaining risks.
7. Pull request URL, if created.

Never claim completion without supporting evidence.
