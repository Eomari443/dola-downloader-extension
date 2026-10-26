# Contributing to Eomari443 Dola Downloader

Thank you for your interest in improving **Eomari443 Dola Downloader**. Bug reports, compatibility feedback, documentation improvements, and focused pull requests are welcome.

This project is an unofficial, open-source Chrome Manifest V3 extension for detecting and saving supported Dola AI and Doubao video media in Chromium-based browsers.

## Before you start

- Search existing issues and pull requests before opening a new one.
- For larger changes, open an issue first so the scope and approach can be discussed.
- Keep changes focused. Avoid unrelated refactors, dependency additions, or UI redesigns in the same pull request.
- Never include account credentials, private chat content, access tokens, signed media URLs, or other sensitive data in issues, pull requests, screenshots, logs, or commits.
- Only test with videos and pages you are authorized to access and save.

## Development setup

The extension is a plain browser extension and does not require a package manager or dependency installation.

### Requirements

- Git
- Node.js 22 or a compatible current Node.js release
- Google Chrome, Microsoft Edge, Brave, or another Chromium-based browser

### Clone the repository

```bash
git clone https://github.com/Eomari443/dola-downloader-extension.git
cd dola-downloader-extension
```

### Load the extension locally

1. Open `chrome://extensions` in a Chromium browser.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the repository root, the folder containing `manifest.json`.
5. Reload the extension after source changes.
6. Reload the supported Dola or Doubao page before testing page integration changes.

## Validation and packaging

Run the repository validation script before opening a pull request:

```bash
node scripts/validate-extension.mjs
```

Create and inspect a distributable ZIP when packaging-related files change:

```bash
bash scripts/package-extension.sh dist/dola-downloader-extension.zip
unzip -tq dist/dola-downloader-extension.zip
```

The generated `dist/` directory and ZIP files are ignored by Git and should not be committed.

## Manual testing checklist

Test the user-visible behavior in a Chromium browser when changing extension behavior:

- [ ] The extension loads without errors from `chrome://extensions`.
- [ ] Supported Dola or Doubao pages can be reloaded without console errors caused by the extension.
- [ ] Detected video cards show the expected download control.
- [ ] Individual video downloads work from the page.
- [ ] The popup displays videos from the active tab only.
- [ ] Preview, **Save**, and **Download All** work as expected.
- [ ] Automatic downloads work when enabled and remain disabled by default.
- [ ] Failed or unavailable downloads show a failure state instead of a false success state.
- [ ] Reloading or closing a tab does not leak its captured videos into another tab.
- [ ] The black-and-white UI remains readable and usable with keyboard navigation.

If the change affects media detection or fallback APIs, test more than one supported page state and note the browser version and service page used.

## Code and design guidelines

- Keep the extension compatible with Manifest V3.
- Prefer the existing vanilla JavaScript and CSS structure; do not add a framework for a small change.
- Keep the interface monochrome, clear, compact, and consistent with the existing popup and in-page controls.
- Preserve accessible labels, keyboard focus, readable contrast, and useful status messages.
- Validate URLs and untrusted page data before using them for downloads, navigation, or API requests.
- Do not log credentials, private content, signed media URLs, or complete response payloads.
- Request the minimum permissions needed for the feature.
- Keep tab state isolated and avoid broadcasting page-specific data to unrelated tabs.
- Use clear names and short comments for behavior that depends on browser-extension APIs or service-specific response formats.
- Keep user-visible behavior and responsible-use protections intact unless the change explicitly addresses them.

## Issues and bug reports

When reporting a bug, include:

- Browser name and exact version
- Operating system
- Extension version or commit hash
- Dola or Doubao page type where the issue occurred
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Relevant console error text with private data removed

Do not include private chat content, account credentials, access tokens, or signed media URLs. Redact or replace sensitive values before posting logs or screenshots.

## Pull requests

Use a focused branch, for example:

```text
fix/download-retry
feat/popup-filter
docs/contributing-guide
```

Use a concise conventional commit style when possible:

```text
fix: handle expired media URLs
feat: add active-tab filtering
docs: improve installation guidance
```

A pull request should:

1. Explain the user problem and the proposed solution.
2. Identify the files or extension flows affected.
3. Include testing steps and the results of the validation commands.
4. Mention any browser, service-page, or permission limitations.
5. Include screenshots or a short recording for visible UI changes when useful.
6. Keep unrelated generated files, editor files, ZIP archives, and macOS metadata out of the pull request.

Before submitting, confirm:

- [ ] `node scripts/validate-extension.mjs` passes.
- [ ] Packaging succeeds if packaging files changed.
- [ ] Manual browser testing is complete for affected flows.
- [ ] No secrets or private user data are included.
- [ ] Documentation is updated when behavior, permissions, setup, or troubleshooting changes.

## Security reports

Please do not open a public issue for an exploitable security vulnerability. Contact the repository owner privately through GitHub and provide a concise description, affected files or flows, reproduction steps, and a safe disclosure contact. Do not send credentials, private media, or live signed URLs.

## License and responsible use

By contributing, you agree that your contributions are provided under the repository's [MIT License](LICENSE).

Contributors must respect applicable laws, copyright requirements, privacy obligations, and the terms of the supported services. The extension should only be used to save content the user created or is authorized to download.
