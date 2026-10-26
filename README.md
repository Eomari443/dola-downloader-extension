# Eomari443 Dola Downloader — Chrome Extension for Dola and Doubao Videos

> A free Manifest V3 Chromium extension for detecting and saving supported Dola AI and Doubao video media from your browser.

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Eomari443%2Fdola--downloader--extension-181717?logo=github)](https://github.com/Eomari443/dola-downloader-extension)

**Eomari443 Dola Downloader** is a browser-based Dola video downloader and Doubao video downloader for Chromium browsers. It adds download controls to supported video cards, detects available media streams, and lets you save individual videos or download a complete detected list.

> This is an unofficial community project. It is not affiliated with Dola, Doubao, ByteDance, or any other service provider.

## Table of contents

- [Features](#features)
- [Supported browsers](#supported-browsers)
- [Download the extension](#download-the-extension)
- [Install in Chrome](#install-in-chrome)
- [Use the extension](#use-the-extension)
- [Troubleshooting](#troubleshooting)
- [Permissions and privacy](#permissions-and-privacy)
- [Responsible use](#responsible-use)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- Detects video streams exposed by supported Dola and Doubao pages.
- Attempts to resolve the highest-quality available video stream.
- Adds an in-page **1080P Master** download button to detected video cards.
- Includes a popup for video previews, individual saves, and **Download All**.
- Supports optional automatic downloads for newly detected videos.
- Saves downloads into an `Eomari443_Dola_Videos` folder through the browser download manager.
- Uses local browser storage for preferences and the download counter.
- Requires no separate desktop application, API key, account credential, or remote backend.

## Supported browsers

The extension uses Chrome Manifest V3 and is intended for Chromium-based browsers that support unpacked extensions:

- Google Chrome
- Microsoft Edge
- Brave
- Other Chromium-based browsers with Developer mode

Firefox support is not currently tested.

## Download the extension

### Option 1: Download from GitHub — easiest method

1. Open this repository on GitHub: [Eomari443/dola-downloader-extension](https://github.com/Eomari443/dola-downloader-extension).
2. Select **Code**.
3. Select **Download ZIP**.
4. Extract the ZIP file somewhere on your computer.
5. Continue with the [Chrome installation steps](#install-in-chrome).

The downloaded folder must contain `manifest.json` directly inside it. Do not select the ZIP file itself in Chrome.

### Option 2: Download with a command — macOS or Linux

Copy and run these commands in Terminal:

```bash
curl -L https://github.com/Eomari443/dola-downloader-extension/archive/refs/heads/main.zip \
  -o dola-downloader-extension.zip
unzip -q dola-downloader-extension.zip
cd dola-downloader-extension-main
```

The extension files are now on your computer in the `dola-downloader-extension-main` folder.

### Option 3: Download with PowerShell — Windows

Open PowerShell and run:

```powershell
Invoke-WebRequest `
  -Uri "https://github.com/Eomari443/dola-downloader-extension/archive/refs/heads/main.zip" `
  -OutFile "dola-downloader-extension.zip"

Expand-Archive `
  -Path "dola-downloader-extension.zip" `
  -DestinationPath "."

Set-Location "dola-downloader-extension-main"
```

### Option 4: Clone with Git

If Git is installed on your computer:

```bash
git clone https://github.com/Eomari443/dola-downloader-extension.git
cd dola-downloader-extension
```

No `npm install`, build tool, or package manager is required to use the extension.

## Install in Chrome

Chrome extensions downloaded from GitHub are installed as **unpacked extensions**. This is normal for open-source extensions that are not distributed through the Chrome Web Store.

1. Open Google Chrome.
2. Visit [`chrome://extensions`](chrome://extensions).
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the extracted `dola-downloader-extension-main` or `dola-downloader-extension` folder.
6. Confirm that the selected folder contains `manifest.json`.
7. Pin **Eomari443 Dola Downloader** from the Extensions menu if desired.
8. Open a supported Dola or Doubao chat and reload the page.

After installation, the extension icon appears in the Chrome toolbar. You can also open the extension popup from the toolbar to view detected videos.

### Updating the extension

When a newer version is published:

1. Download the latest ZIP or run `git pull` if you cloned the repository.
2. Extract the new files if you downloaded a ZIP.
3. Open [`chrome://extensions`](chrome://extensions).
4. Find **Eomari443 Dola Downloader**.
5. Click **Reload**.

If Chrome does not update the files, remove the old unpacked extension and select the new folder with **Load unpacked**.

## Use the extension

1. Open a supported Dola or Doubao conversation containing generated videos.
2. Wait for the video cards to load.
3. Click **1080P Master** on an individual video card, or open the extension popup.
4. In the popup, select **Save** for one video or **Download All** for every detected video.
5. Enable **Auto-Download New Videos** only when you want new detected videos to download automatically.

Downloaded files are saved by the browser into:

```text
Downloads/Eomari443_Dola_Videos/
```

The exact location can vary if your browser uses a custom Downloads folder.

## Troubleshooting

### No videos are detected

- Make sure you loaded the folder that contains `manifest.json`.
- Reload the Dola or Doubao page after installing or reloading the extension.
- Play the video or wait for the video card to finish loading.
- Open the extension popup and check again.
- Confirm that you are using a supported Chromium browser.

### The button says “Click Video to Load”

Play the video card once, wait a moment, and try again. Detection depends on the media information exposed by the current version of the website.

### Downloads fail

Media URLs may expire quickly or the service may have changed its delivery format. Reload the chat, let the video load again, and retry. Also confirm that the browser allows downloads and that you have enough disk space.

### Chrome shows a developer-mode warning

This is expected when loading an unpacked extension from source. The warning does not mean the project is broken. Only install source code you trust, and review the repository before use.

## Permissions and privacy

The extension requests the following permissions:

- `downloads` — saves media through the browser download manager.
- `storage` — stores preferences and the local download counter.
- `notifications` — shows download completion notifications.
- HTTPS host access — resolves signed media/API URLs that supported Dola and Doubao pages may move between delivery hosts. Content scripts still run only on supported Dola and Doubao pages.

The project does not include an API key, login credential, analytics service, or remote backend. Preferences and the download counter are stored locally in the browser's extension storage. The extension inspects supported pages only because that access is required to detect media.

## Responsible use

- Download only videos you created or are authorized to save.
- Follow the applicable service terms, copyright rules, and privacy requirements.
- Do not use the extension to bypass access controls or download content you do not have permission to save.
- Site HTML, APIs, media URL formats, and access rules can change without notice.
- This project is provided as-is and may stop working when the supported services change.

## Development

This is a plain browser extension. Node.js is only needed for the repository validation scripts; no dependency installation is required.

Run the validation checks:

```bash
node scripts/validate-extension.mjs
```

Create a clean distributable ZIP:

```bash
bash scripts/package-extension.sh
```

The generated file is written to `dist/dola-downloader-extension.zip` and is ignored by Git. During development, load the repository root directly through **Load unpacked** and click **Reload** after code changes.

## Project structure

```text
.
├── manifest.json                     # Chrome Manifest V3 configuration
├── background.js                     # Service worker and download handling
├── content.js                        # Page integration and download buttons
├── page-interceptor.js               # Page-world media/API interception
├── popup.html                        # Extension popup markup
├── popup.js                          # Popup behavior
├── popup.css                         # Popup styles
├── content.css                       # In-page button styles
├── icon*.png / icon.jpg              # Extension icons
├── scripts/validate-extension.mjs    # Manifest and JavaScript checks
└── scripts/package-extension.sh      # Creates a distributable ZIP
```

## Contributing

Bug reports, compatibility feedback, documentation improvements, and focused pull requests are welcome. Please read the [contributor guide](CONTRIBUTING.md) before opening an issue or pull request.

## License

Released under the MIT License. See [LICENSE](LICENSE).
