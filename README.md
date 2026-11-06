# MediCentrix Desktop — Windows EXE installer source

This repository wraps the existing MediCentrix medication-list PWA in Electron, and packages it with **electron-builder/NSIS** as a conventional `MediCentrix-Desktop-Setup-0.1.0.exe` installer for **64-bit Windows**.

## Build from GitHub — no programming required

1. Create a **private** GitHub repository named `medicentrix-desktop`.
2. Unzip this package, then upload **all contents**, including the hidden `.github/` folder, to the **root** of the repository. GitHub's web upload interface may not handle hidden folders in some workflows; check that `.github/workflows/build-windows.yml` is present in GitHub after uploading.
3. Open the repository's **Actions** tab. If prompted, enable Actions for this repository.
4. Select **Build Windows Installer**, then click **Run workflow** (choose `main`).
5. After the workflow completes successfully, open its run and download the artifact **MediCentrix-Desktop-Windows-Installer**.
6. Unzip the artifact to get `MediCentrix-Desktop-Setup-0.1.0.exe`. Install it on a Windows PC and test using fictional medication entries.

A Windows machine with Node.js can build it locally:

```powershell
npm install
npm run build:win
```

The resulting `.exe` appears in `dist/`. Do not upload `node_modules` or `dist` to the source repository.

## Installer and uninstall

- NSIS creates Start Menu and desktop shortcuts and registers the application with **Settings > Apps > Installed apps** (Uninstall).
- Installation is set per-user, without requiring administrator access under normal conditions.
- **Uninstall is configured to delete the app's local data.** Export any wanted medication list first.
- This is an **unsigned test installer**. Windows SmartScreen may display a warning for unrecognized downloads. For public distribution, obtain appropriate code signing and test on clean Windows machines.
- No patient database, cloud sync, medical reminders, professional health advice, or encryption is provided. **Use fictional test entries only.**

## Website vs EXE

The `web/` folder is the browser/PWA version; the Electron wrapper gives the same functionality as a Windows executable. In future, the main website's **Download for Windows** button can link to the published, verified installer. Do not link to GitHub Actions artifacts (those are intended for logged-in development access and may expire). Host release installers at a controlled public URL with integrity and versioning.

## Status

The source and GitHub build configuration are prepared and checked for basic structure and JavaScript syntax. **A Windows installer has not been compiled or installed/tested in this environment.** The GitHub Windows runner must produce the EXE. The publisher should confirm operation, installation, uninstall behavior, and any trademark specimen requirements before relying on it.
