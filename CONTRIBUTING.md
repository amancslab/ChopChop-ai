# Contributing to ChopChop.ai

Thank you for your interest in contributing to ChopChop.ai.

This project is actively evolving. Contributions should prioritize correctness, security, maintainability and clear engineering evidence.

## 1. Before contributing

- Read the project README.
- Read `engineering/AGENT_INSTRUCTIONS.md`.
- Read `.github/copilot-instructions.md` when using GitHub Copilot.
- Check existing GitHub issues and pull requests before starting work.
- For substantial changes, open or discuss a GitHub issue first to avoid duplicated work.
- Do not assume planned functionality is already implemented.

## 2. Reporting bugs

When reporting a bug, include:

- A clear description of the problem.
- Steps to reproduce it.
- Expected behavior.
- Actual behavior.
- Relevant environment information.
- Error messages or logs with credentials and personal data removed.

## 3. Proposing features

Feature requests should explain:

- The problem being solved.
- Who benefits from the change.
- Proposed behavior.
- Acceptance criteria.
- Important constraints or risks.

Avoid proposing implementation changes without explaining the underlying problem.

## 4. Branch workflow

- `main` is the default development branch and is connected to Google AI Studio synchronization.
- Do not rename `main` or alter its AI Studio integration.
- Contributors and coding agents should use isolated branches rather than pushing directly to shared branches.
- Suggested branch names:
  - `feat/short-description`
  - `fix/short-description`
  - `docs/short-description`
  - `test/short-description`
- Google AI Studio-managed synchronization to `main` remains an established project workflow.
- `production` is the release integration branch.
- Never push directly to `production`.
- Production updates must use a pull request and comply with the active production ruleset.

## 5. Development guidelines

- Inspect the existing architecture before changing code.
- Keep changes focused on the related issue.
- Follow the existing TypeScript, React and Python conventions.
- Avoid unnecessary dependencies.
- Validate external inputs and handle failure paths.
- Never hardcode credentials or API keys.
- Never commit `.env` files or real secrets.
- Do not fabricate AI results, transcripts, timestamps or media-processing success.

## 6. Testing and verification

Before selecting verification commands:

1. Inspect `package.json`, Python dependencies and the existing test structure.
2. Identify the checks applicable to the changed code.
3. Run relevant checks where the environment permits.
4. Report actual command output and failures.

Do not invent test commands or claim a test passed without executing it.

If automated test infrastructure is not yet available, clearly state that limitation and include appropriate manual verification evidence.

## 7. Pull request guidelines

Every contribution PR should:

- Reference the relevant GitHub issue.
- Explain the problem and proposed solution.
- Describe affected files and components.
- Include actual test and verification evidence.
- Document security impact and potential regressions.
- Include screenshots for relevant UI changes.
- Explain known limitations and rollback considerations.

Use `.github/pull_request_template.md`.

Only use closing keywords such as `Closes #123` when the PR genuinely completes that issue.

## 8. Review and release

- Address review feedback before merging.
- Resolve review conversations.
- Do not bypass repository rulesets.
- Do not deploy or publish releases without explicit maintainer approval.
- Production releases must be promoted through a reviewed pull request from `main` to `production`.

## 9. Security and responsible disclosure

Do not report security vulnerabilities in public issues with exploitable details.

Follow the repository's `SECURITY.md` once the security reporting policy is published.

Never include real credentials, private user information or sensitive logs in issues or pull requests.

## 10. Questions

Use GitHub Issues for project questions and engineering discussions.

Please keep discussions respectful, specific and focused on improving ChopChop.ai.

---

Thank you for helping improve ChopChop.ai.
