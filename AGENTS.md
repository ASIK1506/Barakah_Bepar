# Barakah Bepaar – Agent Engineering Guidelines

## 1. Non-Negotiable UI Fidelity Rule
This project recreates the legacy **Vanigam 4.0 (GST Version)** supermarket retail desktop interface.
- **Do NOT** redesign forms into modern SaaS cards, rounded dashboard tiles, or airy spacing.
- Preserve exact Windows Classic chrome (`#ECE9D8`), 21px–22px grid rows, alternating `#FFF0F5` rows, active `#FFFF80` barcode focus, dual Tamil/English typography, and all shortcut bindings (`F1`–`F12`, `Ctrl+N`, `Ctrl+S`, `Ctrl+X`, `Ctrl+I`, `Alt+P`, `Esc`).

## 2. Versioning Policy (Semantic Versioning: `MAJOR.MINOR.PATCH`)
The single source of truth for software version is `web/src/lib/version.ts` and `web/package.json`.
Whenever making commits or changes to the codebase, always bump the version in **both** files identically according to the change magnitude:
- **MAJOR (`X.0.0`)**: Drastic architectural overhauls or major redesigns.
- **MINOR (`1.X.0`)**: Core functionality updates, new features, or significant feature enhancements.
- **PATCH (`1.0.X`)**: Small updates, UI tweaks, bug fixes, or minor maintenance.

Do not include build numbers anywhere in the UI. Always consume `APP_VERSION` / `APP_VERSION_TAG` from `src/lib/version.ts` instead of hardcoding version strings.

## 3. Business Logic Guardrails
- **Estimate Mode (`[x] EST`)**: Must never deduct inventory until converted into an official tax invoice and confirmed.
- **Electron Thin-Shell & Local Bridge**: Keep Electron main process (`electron/main.cjs`) and preload (`electron/preload.cjs`) strictly isolated (`contextIsolation: true`, `nodeIntegration: false`) with all hardware/filesystem calls routed through `window.barakahFs` or the `127.0.0.1` loopback HTTP bridge.
