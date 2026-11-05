# Security Policy

## Supported Versions

ChopChop.ai is currently under active development.

Security fixes should target the current development branch, `main`. Production fixes should be promoted through the protected `production` branch after review and verification.

No formal version support or maintenance window is currently promised.

## Reporting a Vulnerability

Please do not disclose exploitable security vulnerabilities through public GitHub issues, pull requests or discussions.

Use GitHub's private vulnerability reporting feature for this repository if it is enabled.

When reporting a vulnerability, include:

- A clear description of the issue.
- Affected components and files, when known.
- Steps to reproduce the issue.
- Potential impact.
- Relevant sanitized logs or screenshots.
- Suggested mitigation, if known.

Never include real credentials, API keys, access tokens, personal information or private user data in a report.

## Scope of Security Concerns

Security reports may include:

- Authentication and authorization bypasses.
- Credential or API key exposure.
- Insecure Gemini API key handling.
- Server-side request forgery (SSRF).
- Unsafe YouTube URL or external input handling.
- Command injection or unsafe subprocess execution.
- Insecure file uploads and temporary-file handling.
- Arbitrary file access or path traversal.
- Sensitive data exposure through logs or generated artifacts.
- Dependency vulnerabilities affecting the application.
- Unsafe media-processing behavior.

## Response and Disclosure

The project is actively evolving and does not currently promise a formal response or remediation SLA.

Reports will be assessed based on severity, reproducibility and practical impact.

Please allow the maintainer to investigate and prepare a fix before any public disclosure.

Do not access, modify, delete or exfiltrate data belonging to other users while investigating a vulnerability.

## Security Practices

The project aims to:

- Keep secrets out of source code and public builds.
- Maintain GitHub secret scanning and push protection.
- Validate external input and AI-generated output.
- Avoid logging sensitive credentials.
- Use least-privilege permissions.
- Test failure paths and security-sensitive functionality.
- Review dependency vulnerabilities.
- Validate media-processing inputs and outputs.

## Limitations

ChopChop.ai is under active development. The presence of this policy does not imply that every listed security control is already implemented.

Report only verified vulnerabilities and avoid testing against systems or data without authorization.
